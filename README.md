# Morphindex

Landing page pour une web app de lookmaxing.

## Aperçu local

Ouvre `index.html` directement dans ton navigateur — aucune dépendance requise.

```bash
python3 -m http.server 8080
# Puis ouvrir http://localhost:8080
```

## Déploiement & domaine personnalisé

Le site est déployé automatiquement sur **GitHub Pages** à chaque push sur `main`.

### 1. Activer GitHub Pages

1. Va dans **Settings → Pages** du repo GitHub
2. Source : **GitHub Actions**
3. Merge la PR sur `main` pour lancer le premier déploiement

### 2. Configurer ton domaine

Le fichier `CNAME` contient le domaine : **morphindex.com**

Guide détaillé OVH : [docs/dns-ovh.md](docs/dns-ovh.md)

Ensuite, chez ton registrar (OVH, Namecheap, Cloudflare, etc.) :

#### Option A — Sous-domaine `www` (recommandé)

| Type  | Nom | Valeur                          |
|-------|-----|---------------------------------|
| CNAME | www | `jeantondutytb-prog.github.io`  |

Puis dans **Settings → Pages → Custom domain**, entre `www.tondomaine.fr`.

#### Option B — Domaine racine (`tondomaine.fr`)

| Type | Nom | Valeur           |
|------|-----|------------------|
| A    | @   | 185.199.108.153  |
| A    | @   | 185.199.109.153  |
| A    | @   | 185.199.110.153  |
| A    | @   | 185.199.111.153  |

Si ton registrar supporte **ALIAS/ANAME** (Cloudflare, etc.), pointe `@` vers `jeantondutytb-prog.github.io`.

### 3. HTTPS

GitHub active automatiquement le certificat SSL une fois le DNS propagé (quelques minutes à 48h). Coche **Enforce HTTPS** dans les settings Pages.

### 4. Redirection www ↔ racine (optionnel)

Pour rediriger `tondomaine.fr` → `www.tondomaine.fr`, configure la redirection chez ton registrar ou via Cloudflare.

## Changer le domaine

1. Modifie le fichier `CNAME` avec ton nouveau domaine
2. Push sur `main`
3. Mets à jour les enregistrements DNS
4. Change le custom domain dans Settings → Pages
