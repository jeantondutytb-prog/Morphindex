# Compte admin + espace app

## 1. Migration Supabase

Appliquer **`0005_admin.sql`** (colonne `profiles.is_admin`).

Supabase → SQL Editor → coller le contenu du fichier, ou `supabase db push`.

## 2. Créer le compte admin

### Option A — API bootstrap (prod)

1. Génère un secret : `openssl rand -hex 32`
2. Vercel → `ADMIN_BOOTSTRAP_SECRET` = ce secret → **Redeploy**
3. Une fois :

```bash
curl -X POST https://www.morphindex.com/api/admin/bootstrap \
  -H "Authorization: Bearer TON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"email":"jeantondut.ytb@gmail.com","password":"TON_MOT_DE_PASSE"}'
```

4. Connexion : **https://www.morphindex.com/connexion**
5. Admin : **https://www.morphindex.com/app/admin**

> Le compte a l’onboarding déjà complété → tu peux lancer une analyse directement.

### Option B — Script local

```bash
ADMIN_EMAIL=jeantondut.ytb@gmail.com \
ADMIN_PASSWORD='ton_mot_de_passe' \
NEXT_PUBLIC_SUPABASE_URL=... \
SUPABASE_SERVICE_ROLE_KEY=... \
node scripts/create-admin.mjs
```

## 3. Intérieur app (MVP)

| URL | Contenu |
|-----|---------|
| `/app` | Liste des analyses |
| `/app/compte` | Email, abo, quota |
| `/app/admin` | Stats (admin uniquement) |
| `/app/rapport/[id]` | Rapport flouté ou complet |

Navigation : header **Mes analyses · Mon compte · Admin** + déconnexion en bas.

## 4. Sécurité

- Retire ou rotate `ADMIN_BOOTSTRAP_SECRET` après création du compte (optionnel).
- Ne commite jamais de mot de passe.
