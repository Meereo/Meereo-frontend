-- ════════════════════════════════════════════════════════════════════
-- MEEREO — migrations manuelles. Prisma ne sait exprimer aucune des trois.
-- PostgreSQL. À exécuter APRÈS `prisma migrate deploy`.
-- ════════════════════════════════════════════════════════════════════

-- 1) INS-09 + AVS-03 + décision 27/07 : l'unicité de l'adresse porte sur le
--    couple (e-mail, rôle) et SEULEMENT sur les comptes actifs.
--    • partiel  : sinon la réutilisation d'adresse après suppression, autorisée
--                 par AVS-03, deviendrait impossible ;
--    • par rôle : une même adresse peut porter un compte PRO ET un compte
--                 FOURNISSEUR (comptes liés), jamais deux du même rôle.
CREATE UNIQUE INDEX IF NOT EXISTS account_email_role_active_key
  ON "Account"(lower(email), role)
  WHERE "deletedAt" IS NULL;

-- 2) FIN-04 + MKT-01 : un produit a SOIT un prix ferme strictement positif,
--    SOIT le mode « sur devis » et AUCUN prix. Jamais les deux, jamais ni l'un
--    ni l'autre. La validation applicative ne protège ni un import, ni un
--    script de reprise, ni une écriture directe.
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS product_pricing_coherent;
ALTER TABLE "Product" ADD  CONSTRAINT product_pricing_coherent CHECK (
     ("pricingMode" = 'FIXED'    AND "priceFcfa" IS NOT NULL AND "priceFcfa" > 0)
  OR ("pricingMode" = 'ON_QUOTE' AND "priceFcfa" IS NULL)
);

-- 3) Un compte suspendu n'est pas un compte supprimé : les deux dates ne
--    peuvent pas être posées ensemble sans rendre l'état illisible.
ALTER TABLE "Account" DROP CONSTRAINT IF EXISTS account_suspension_reason_required;
ALTER TABLE "Account" ADD  CONSTRAINT account_suspension_reason_required CHECK (
  ("suspendedAt" IS NULL) OR ("suspensionReason" IS NOT NULL)
);
