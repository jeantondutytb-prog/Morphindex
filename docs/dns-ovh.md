# Corriger morphindex.com → GitHub Pages (OVH)

## État actuel

Le site **fonctionne déjà** sur https://morphindex.com (certificat SSL actif).
Si GitHub affiche encore une erreur, c'est un problème de **check DNS incomplet**, pas de site cassé.

### Ce qui manque encore chez OVH

```
❌ A     185.199.108.153        (1 des 4 A manquant)
❌ AAAA  2606:50c0:8000::153    (GitHub les exige aussi depuis 2024)
❌ AAAA  2606:50c0:8001::153
❌ AAAA  2606:50c0:8002::153
❌ AAAA  2606:50c0:8003::153
✅ CNAME www → jeantondutytb-prog.github.io
```

---

## Étape 1 — Compléter la Zone DNS OVH

OVH Manager → **Noms de domaine** → `morphindex.com` → **Zone DNS**

### Ajouter l'A manquant

| Sous-domaine | Type | Cible |
|--------------|------|-------|
| `@` (vide) | A | `185.199.108.153` |

### Ajouter les 4 AAAA (obligatoire pour le check GitHub)

| Sous-domaine | Type | Cible |
|--------------|------|-------|
| `@` (vide) | AAAA | `2606:50c0:8000::153` |
| `@` (vide) | AAAA | `2606:50c0:8001::153` |
| `@` (vide) | AAAA | `2606:50c0:8002::153` |
| `@` (vide) | AAAA | `2606:50c0:8003::153` |

> Chez OVH, le type AAAA apparaît parfois sous **Champs AAAA** dans « Ajouter une entrée ».

---

## Étape 2 — Forcer le recheck GitHub

1. Repo **Morphindex** → **Settings → Pages**
2. Custom domain → **Remove** (supprime le domaine)
3. Attends **2–3 minutes**
4. Re-saisis `morphindex.com` → **Save**
5. Attends le check vert (5 min à 24 h)
6. Coche **Enforce HTTPS** (le certificat est déjà émis — tu peux essayer même si le check est encore orange)

---

## Étape 3 — Vérifier

```bash
# Doit afficher les 4 IPs
dig morphindex.com A +short

# Doit afficher les 4 IPv6
dig morphindex.com AAAA +short
```

Résultat attendu :

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153

2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

---

## Zone DNS finale complète

```
@    A      185.199.108.153
@    A      185.199.109.153
@    A      185.199.110.153
@    A      185.199.111.153
@    AAAA   2606:50c0:8000::153
@    AAAA   2606:50c0:8001::153
@    AAAA   2606:50c0:8002::153
@    AAAA   2606:50c0:8003::153
www  CNAME  jeantondutytb-prog.github.io.
@    MX     mx1.mail.ovh.net.     (priorité 1 — ne pas toucher)
@    MX     mx2.mail.ovh.net.     (priorité 5)
@    MX     mx3.mail.ovh.net.     (priorité 100)
```

---

## Si le check GitHub reste rouge après 24 h

Le site est en ligne — l'erreur est **cosmétique** dans l'interface GitHub.
Tu peux quand même activer **Enforce HTTPS** si l'option est disponible.

Pour aller plus loin : **Settings → Pages → Verify domain** avec un enregistrement TXT
(voir [doc GitHub](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)).
