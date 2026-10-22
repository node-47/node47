# NODE.47 — Déploiement Vercel

Vercel est la voie la plus rapide pour publier un site Next.js, mais elle a
**une conséquence majeure pour NODE.47 : SQLite ne fonctionne pas**.

Sur Vercel, les fonctions serverless ont un système de fichiers **éphémère et
non persistant** : le fichier `db/custom.db` serait recréé vide à chaque
déploiement, et les écritures de l'espace analyste disparaîtraient. Il faut
donc migrer la base avant de déployer sur Vercel.

**Si vous préférez garder SQLite tel quel, utilisez le guide VPS Docker
(`DEPLOY-VPS.md`) — c'est l'option zéro migration.**

---

## 1. Choisir la base de remplacement

| Service | Compatibilité Prisma | Plan gratuit | Effort de migration |
|---|---|---|---|
| **Turso** (libSQL, fork SQLite) | `provider = "libsql"` + driver adapter | généreux (9 Go) | **minimal** — SQL identique |
| Neon (PostgreSQL) | `provider = "postgresql"` | généreux | moyen — types légèrement différents |

**Recommandation : Turso.** C'est du SQLite managé : le schéma, les requêtes
Prisma et le code de l'application restent inchangés à un détail près
(l'adaptateur de driver).

Créer la base :

```bash
# Sur votre machine locale
curl -sSfL https://get.tur.so/install.sh | bash
turso db create node47
turso db show node47 --url            # → libsql://node47-<org>.turso.io
turso db tokens create node47         # → jeton d'accès (secret)
```

---

## 2. Adapter le code (3 fichiers)

**2.1. `prisma/schema.prisma`** — changer le provider :

```prisma
datasource db {
  provider = "libsql"
  url      = env("DATABASE_URL")
}
```

**2.2. Installer l'adaptateur** :

```bash
bun add @libsql/client @prisma/adapter-libsql
```

**2.3. `src/lib/db.ts`** — instancier Prisma avec l'adaptateur :

```ts
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const libsql = createClient({
  url: process.env.DATABASE_URL!,       // libsql://node47-xxx.turso.io
  authToken: process.env.DATABASE_AUTH_TOKEN!,
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: new PrismaLibSQL(libsql) });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

Vérifier en local : `DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... bun run dev`
— tout doit fonctionner à l'identique (accueil, fiches, admin).

---

## 3. Transférer vos analyses vers Turso

```bash
# Pousser le schéma
DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... \
  bunx prisma db push --skip-generate --schema prisma/schema.prisma

# Importer les picks existants depuis le SQLite local (one-shot)
bun scripts/export-to-turso.ts   # voir note ci-dessous
```

> **Note** : un petit script d'export (lecture du `db/custom.db` local, écriture
> via `prisma.pick.createMany`) suffit — les 10 analyses actives tiennent dans
> une seule requête. Demandez-le si besoin, il sera ajouté à `scripts/`.

---

## 4. Déployer sur Vercel

1. Pousser le code adapté sur GitHub (dépôt privé recommandé)
2. Sur https://vercel.com → **Add New → Project** → importer le dépôt
3. Vercel détecte Next.js automatiquement — laisser les réglages par défaut
4. **Environment Variables** (Production) :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | `libsql://node47-xxx.turso.io` |
| `DATABASE_AUTH_TOKEN` | jeton créé au §1 |
| `ADMIN_PASSWORD` | mot de passe analyste fort |
| `ADMIN_SECRET` | `openssl rand -hex 32` (nouvelle valeur, pas celle du VPS) |
| `NEXT_PUBLIC_SITE_URL` | `https://votre-projet.vercel.app` (ou domaine custom) |

5. **Deploy** — première mise en ligne ≈ 2 minutes

**Domaine personnalisé** : Settings → Domains → ajouter, puis pointer le DNS
(A ou CNAME selon les instructions Vercel). Mettre ensuite
`NEXT_PUBLIC_SITE_URL=https://votre-domaine.com` à jour et redéployer pour que
sitemap, canonicals et Open Graph utilisent l'URL définitive. HTTPS est géré
par Vercel sans configuration.

---

## 5. Ce qui fonctionne sans changement

| Fonction | Statut sur Vercel |
|---|---|
| Cycle d'édition 8 h UTC | ✅ calculé à la volée (`editionDayOf`), aucun cron nécessaire |
| Fenêtre 3 jours / tracking 30 jours | ✅ logique de calcul pur |
| `sitemap.xml` (force-dynamic) | ✅ généré à chaque requête |
| `robots.ts` | ✅ servi dynamiquement |
| Images Open Graph (satori) | ✅ rendues à la demande, mises en cache CDN |
| Pages force-dynamic (accueil, /analyses, fiches) | ✅ rendues à chaque requête |
| `/admin` caché + robots Disallow | ✅ inchangé |

## 6. Limites à connaître

- **Écritures via l'admin** : parfaitement fonctionnelles (Turso est distant),
  mais chaque action de l'analyste consomme une requête serverless — sans
  impact réel à cette échelle de trafic.
- **Sauvegardes** : Turso propose des snapshots automatiques (turso db
  recoverable-backups sur les plans payants) ; en complément, un export
  périodique local (`turso db shell node47 .dump > backup.sql`) est prudent.
- **Coût** : le plan Hobby Vercel + plan gratuit Turso suffisent largement
  pour un site de publication comme NODE.47, sous réserve d'un trafic classique.

---

## 7. Checklist de mise en production

- [ ] Base Turso créée, schéma poussé, analyses importées
- [ ] `src/lib/db.ts` adapté (adapter libsql) et testé en local
- [ ] Variables d'environnement saisies sur Vercel (Production)
- [ ] `NEXT_PUBLIC_SITE_URL` = URL finale, redéploiement effectué
- [ ] `/api/health` répond `database: "ok"` sur l'URL de production
- [ ] Partage d'une fiche testé sur WhatsApp / X : titre, description et image corrects
- [ ] Connexion `/admin` testée avec le `ADMIN_PASSWORD` de production
