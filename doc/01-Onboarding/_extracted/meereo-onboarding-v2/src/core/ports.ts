/**
 * PORTS — tout ce que le noyau attend du monde extérieur.
 * Aucune dépendance à Prisma, Express, React ni à un fournisseur d'identité.
 *
 * C'est ce qui permet de tester le parcours complet sans base de données, et de
 * changer d'authentification ou d'hébergeur de fichiers sans toucher au métier.
 */
import type { Role } from './schemas.ts';

export interface AccountRecord {
  id: string; role: Role; email: string; companyId: string | null;
  emailVerifiedAt: Date | null; suspendedAt: Date | null; deletedAt: Date | null;
}
export interface CompanyRecord { id: string; legalName: string; rccm: string; taxId: string }

/** INS-09 + AVS-03 : l'unicité porte sur les comptes ACTIFS.
 *  Décision 27/07 : une adresse peut porter deux comptes de RÔLES DIFFÉRENTS. */
export interface AccountsPort {
  findActiveByEmailAndRole(email: string, role: Role): Promise<AccountRecord | null>;
  listActiveByEmail(email: string): Promise<AccountRecord[]>;
  emailAvailableForRole(email: string, role: Role): Promise<boolean>;
}

/** INS-01 / INS-20 : l'identité légale est portée par l'entreprise. */
export interface CompaniesPort {
  findByRccm(rccm: string): Promise<CompanyRecord | null>;
  findByTaxId(taxId: string): Promise<CompanyRecord | null>;
  hasAccountForRole(companyId: string, role: Role): Promise<boolean>;
}

export interface DraftRecord { id: string; role: Role | null; step: string; data: unknown; email: string | null; expiresAt: Date }

/** INS-13 : brouillon SERVEUR — le localStorage ne permet aucune reprise
 *  sur un autre appareil, et n'expire jamais. */
export interface DraftsPort {
  get(id: string): Promise<DraftRecord | null>;
  findByEmail(email: string): Promise<DraftRecord | null>;
  save(d: Omit<DraftRecord, 'id'> & { id?: string }): Promise<DraftRecord>;
  delete(id: string): Promise<void>;
  purgeExpired(now: Date): Promise<number>;
}

export interface CreateAccountCommand {
  role: Role;
  account: { firstName: string; lastName: string; email: string; phone: string; city?: string; passwordHash: string; termsVersion: string; marketingOptIn: boolean };
  company?: { legalName: string; rccm: string; taxId: string } | null;
  /** Rattachement à une entreprise existante : cumul de rôles (INS-14). */
  attachToCompanyId?: string | null;
  proProfile?: { sectors: string[]; logoAssetId: string | null } | null;
  supplierProfile?: { servedCategories: string[]; deliveryModes: string[]; deliveryZones: string[]; deliveryLeadTimeDays: number | null; logoAssetId: string | null } | null;
  payoutMethod?: { provider: string; phone: string; accountHolder: string; isDefault: boolean } | null;
  firstProduct?: { name: string; categoryId: string; unitId: string; stock: number; pricingMode: 'FIXED' | 'ON_QUOTE'; priceFcfa: number | null; description?: string; photoUrl?: string } | null;
  draftId?: string | null;
}

/** ⚠️ La suppression du brouillon DOIT être dans la même transaction que la
 *  création du compte (INS-13). Sinon un échec partiel laisse un brouillon
 *  orphelin qui reproposera une inscription déjà faite. */
export interface OnboardingTxPort {
  createAccountWithProfile(cmd: CreateAccountCommand): Promise<{ accountId: string; companyId: string | null }>;
}

export interface PasswordPort { hash(plain: string): Promise<string> }

export interface MailPort {
  sendVerificationLink(to: string, token: string, expiresAt: Date): Promise<void>;
  sendSuspensionNotice(to: string, reason: string): Promise<void>;
}

/** L'authentification n'est pas encore arrêtée côté MEEREO.
 *  Ce port est volontairement minimal : c'est le seul endroit à écrire le jour
 *  où la décision sera prise. Réf. NAV-07 — la session ne doit PAS se rompre. */
export interface SessionPort {
  issue(accountId: string): Promise<{ token: string; expiresAt: Date }>;
}

export interface StoragePort {
  put(input: { filename: string; mime: string; bytes: Uint8Array }): Promise<{ assetId: string; url: string }>;
  remove(assetId: string): Promise<void>;
}

/** Anti-énumération d'adresses. En mémoire par défaut ; à remplacer par un
 *  compteur partagé dès qu'il y a plus d'un processus. */
export interface RateLimitPort { hit(key: string, limit: number, windowMs: number): Promise<boolean> }

export interface Clock { now(): Date }

export interface OnboardingDeps {
  accounts: AccountsPort; companies: CompaniesPort; drafts: DraftsPort;
  tx: OnboardingTxPort; password: PasswordPort; mail: MailPort;
  session: SessionPort; rateLimit: RateLimitPort; clock: Clock;
  termsVersion: string;
  draftTtlDays: number;
}
