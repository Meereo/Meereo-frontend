/**
 * ADAPTATEURS EN MÉMOIRE — utilisés par les tests.
 * Ils prouvent que le noyau ne dépend d'aucune base : le parcours complet des
 * trois rôles se joue ici, sans PostgreSQL.
 */
import type {
  OnboardingDeps, AccountsPort, CompaniesPort, DraftsPort, OnboardingTxPort,
  PasswordPort, MailPort, SessionPort, StoragePort, RateLimitPort, Clock,
  AccountRecord, CompanyRecord, DraftRecord, CreateAccountCommand,
} from '../core/ports.ts';
import type { Role } from '../core/schemas.ts';

let seq = 0;
const uid = (p: string) => `${p}_${++seq}`;

export function createInMemory(now = new Date('2026-07-27T10:00:00Z')) {
  const accounts: AccountRecord[] = [];
  const companies: CompanyRecord[] = [];
  const drafts = new Map<string, DraftRecord>();
  const mails: { to: string; kind: string }[] = [];
  const files = new Map<string, Uint8Array>();
  const hits = new Map<string, number[]>();
  let clockNow = now;
  let failMail = false;

  const isActive = (a: AccountRecord) => a.deletedAt === null;

  const accountsPort: AccountsPort = {
    async findActiveByEmailAndRole(email, role) {
      return accounts.find(a => isActive(a) && a.email === email.toLowerCase() && a.role === role) ?? null;
    },
    async listActiveByEmail(email) {
      return accounts.filter(a => isActive(a) && a.email === email.toLowerCase());
    },
    async emailAvailableForRole(email, role) {
      return !accounts.some(a => isActive(a) && a.email === email.toLowerCase() && a.role === role);
    },
  };

  const companiesPort: CompaniesPort = {
    async findByRccm(rccm) { return companies.find(c => c.rccm === rccm) ?? null },
    async findByTaxId(taxId) { return companies.find(c => c.taxId === taxId) ?? null },
    async hasAccountForRole(companyId, role) {
      return accounts.some(a => isActive(a) && a.companyId === companyId && a.role === role);
    },
  };

  const draftsPort: DraftsPort = {
    async get(id) { return drafts.get(id) ?? null },
    async findByEmail(email) { return [...drafts.values()].find(d => d.email === email) ?? null },
    async save(d) {
      const id = d.id ?? uid('draft');
      const rec: DraftRecord = { id, role: d.role, step: d.step, data: d.data, email: d.email, expiresAt: d.expiresAt };
      drafts.set(id, rec); return rec;
    },
    async delete(id) { drafts.delete(id) },
    async purgeExpired(n) {
      let c = 0;
      for (const [k, v] of drafts) if (v.expiresAt.getTime() <= n.getTime()) { drafts.delete(k); c++ }
      return c;
    },
  };

  const tx: OnboardingTxPort = {
    async createAccountWithProfile(cmd: CreateAccountCommand) {
      let companyId: string | null = cmd.attachToCompanyId ?? null;
      if (!companyId && cmd.company) {
        // Défense en profondeur : la contrainte de base refuserait aussi.
        if (companies.some(c => c.rccm === cmd.company!.rccm)) throw new Error('UNIQUE_VIOLATION rccm');
        if (companies.some(c => c.taxId === cmd.company!.taxId)) throw new Error('UNIQUE_VIOLATION taxId');
        const c: CompanyRecord = { id: uid('co'), ...cmd.company };
        companies.push(c); companyId = c.id;
      }
      if (companyId && accounts.some(a => isActive(a) && a.companyId === companyId && a.role === cmd.role))
        throw new Error('UNIQUE_VIOLATION companyId_role');
      if (accounts.some(a => isActive(a) && a.email === cmd.account.email && a.role === cmd.role))
        throw new Error('UNIQUE_VIOLATION email_role');
      if (cmd.firstProduct) {
        const p = cmd.firstProduct;
        const bad = (p.pricingMode === 'FIXED' && (p.priceFcfa === null || p.priceFcfa <= 0))
                 || (p.pricingMode === 'ON_QUOTE' && p.priceFcfa !== null);
        if (bad) throw new Error('CHECK_VIOLATION product_pricing_coherent');
      }
      const a: AccountRecord = {
        id: uid('acc'), role: cmd.role, email: cmd.account.email, companyId,
        emailVerifiedAt: null, suspendedAt: null, deletedAt: null,
      };
      accounts.push(a);
      if (cmd.draftId) drafts.delete(cmd.draftId);   // MÊME transaction (INS-13)
      return { accountId: a.id, companyId };
    },
  };

  const deps: OnboardingDeps = {
    accounts: accountsPort, companies: companiesPort, drafts: draftsPort, tx,
    password: { async hash(p) { return `hashed:${p.length}` } } satisfies PasswordPort,
    mail: {
      async sendVerificationLink(to) { if (failMail) throw new Error('SMTP down'); mails.push({ to, kind: 'verify' }) },
      async sendSuspensionNotice(to) { mails.push({ to, kind: 'suspend' }) },
    } satisfies MailPort,
    session: { async issue(accountId) { return { token: `sess_${accountId}`, expiresAt: new Date(clockNow.getTime() + 7 * 24 * 3600_000) } } } satisfies SessionPort,
    rateLimit: {
      async hit(key, limit, windowMs) {
        const t = clockNow.getTime();
        const arr = (hits.get(key) ?? []).filter(x => t - x < windowMs);
        if (arr.length >= limit) { hits.set(key, arr); return false }
        arr.push(t); hits.set(key, arr); return true;
      },
    } satisfies RateLimitPort,
    clock: { now: () => clockNow } satisfies Clock,
    termsVersion: '2026-07-CI-v1',
    draftTtlDays: 30,
  };

  const storage: StoragePort = {
    async put({ filename, bytes }) { const id = uid('asset'); files.set(id, bytes); return { assetId: id, url: `/uploads/${id}-${filename}` } },
    async remove(id) { files.delete(id) },
  };

  return {
    deps, storage,
    db: { accounts, companies, drafts, mails, files },
    setNow: (d: Date) => { clockNow = d },
    breakMail: (b: boolean) => { failMail = b },
    suspend(accountId: string, reason: string) {
      const a = accounts.find(x => x.id === accountId); if (a) a.suspendedAt = clockNow;
      void reason;
    },
    softDelete(accountId: string) { const a = accounts.find(x => x.id === accountId); if (a) a.deletedAt = clockNow },
    seedCompany(c: Omit<CompanyRecord, 'id'>) { const rec = { id: uid('co'), ...c }; companies.push(rec); return rec },
    seedAccount(a: Partial<AccountRecord> & { email: string; role: Role }) {
      const rec: AccountRecord = { id: uid('acc'), companyId: null, emailVerifiedAt: null, suspendedAt: null, deletedAt: null, ...a };
      accounts.push(rec); return rec;
    },
  };
}
