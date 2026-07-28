-- Remove old onboarding fields from client_profiles (arbitrage 11)
-- situation: was "architecte trouvé | à trouver | clé en main" — step suppressed
-- architecteEmail: was collected during old project step — step suppressed

ALTER TABLE "client_profiles" DROP COLUMN IF EXISTS "situation";
ALTER TABLE "client_profiles" DROP COLUMN IF EXISTS "architecteEmail";
