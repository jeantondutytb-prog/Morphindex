# Compte admin + espace app

## 1. Migration Supabase

Appliquer **`0005_admin.sql`** dans Supabase → SQL Editor :

```sql
alter table public.profiles
  add column if not exists is_admin boolean not null default false;
```

## 2. Créer le compte admin

### Option A — Supabase direct (immédiat, sans attendre le déploiement)

1. **Supabase → Authentication → Users → Add user**
   - Email : `jeantondut.ytb@gmail.com`
   - Password : ton mot de passe
   - Cocher **Auto Confirm User**

2. **SQL Editor** :

```sql
update public.profiles set
  is_admin = true,
  onboarding_done_at = coalesce(onboarding_done_at, now()),
  age_confirmed_at = coalesce(age_confirmed_at, now()),
  terms_accepted_at = coalesce(terms_accepted_at, now()),
  objectif = coalesce(objectif, 'general'),
  tranche_age = coalesce(tranche_age, '25-34'),
  sexe = coalesce(sexe, 'homme'),
  phototype = coalesce(phototype, 3),
  type_cheveux = coalesce(type_cheveux, 'ondules'),
  sensibilite = coalesce(sensibilite, 'normale'),
  mode_prefere = 'soft'
where email = 'jeantondut.ytb@gmail.com';
```

3. Connexion : **https://www.morphindex.com/connexion**

> Si tu as déjà un compte avec cet email, saute l’étape 1 et fais seulement le SQL.

---

### Option B — API bootstrap (après merge + deploy PR admin)

1. Merge la PR **#6** et attends le redeploy Vercel
2. Génère un secret : `openssl rand -hex 32`
3. Vercel → `ADMIN_BOOTSTRAP_SECRET` = ce secret → **Redeploy**
4. Remplace `VOTRE_SECRET` et `VotreMotDePasse123` par tes vraies valeurs :

```bash
curl -sL -X POST 'https://www.morphindex.com/api/admin/bootstrap/' \
  -H "Authorization: Bearer VOTRE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"email":"jeantondut.ytb@gmail.com","password":"VotreMotDePasse123"}'
```

Réponse attendue : `{"ok":true,"email":"...","loginUrl":"/connexion"}`

> **`Redirecting...`** = mauvaise URL (slash final manquant) ou PR pas encore déployée (404).
> Ne pas laisser les placeholders `TON_SECRET` / `TON_MOT_DE_PASSE` tels quels.

---

### Option C — Script local

```bash
ADMIN_EMAIL=jeantondut.ytb@gmail.com \
ADMIN_PASSWORD='ton_mot_de_passe' \
NEXT_PUBLIC_SUPABASE_URL=... \
SUPABASE_SERVICE_ROLE_KEY=... \
npm run create-admin
```

## 3. Intérieur app (MVP — après deploy PR #6)

| URL | Contenu |
|-----|---------|
| `/app` | Liste des analyses |
| `/app/compte` | Email, abo, quota |
| `/app/admin` | Stats (admin uniquement) |
| `/app/rapport/[id]` | Rapport flouté ou complet |

## 4. Sécurité

- Rotate `ADMIN_BOOTSTRAP_SECRET` après création du compte (optionnel).
- Ne commite jamais de mot de passe.
