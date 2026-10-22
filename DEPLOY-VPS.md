# NODE.47 — Déploiement VPS avec Docker

Guide complet pour publier NODE.47 sur un VPS (Ubuntu 22.04 / 24.04 ou Debian 12)
avec Docker. C'est l'option **recommandée** pour ce projet : la base SQLite reste
un simple fichier persistant, sans service externe ni coût supplémentaire.

Un VPS d'entrée de gamme suffit (1 vCPU, 1–2 Go RAM, 20 Go disque) : le site est
statiquement rendu à la demande, la base ne contient que des analyses.

---

## 1. Prérequis sur le VPS

Se connecter au serveur puis installer Docker Engine et le plugin compose :

```bash
ssh root@VOTRE_IP

# Mise à jour + paquets de base
apt update && apt upgrade -y
apt install -y ca-certificates curl git

# Dépôt officiel Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  > /etc/apt/sources.list.d/docker.list
apt update && apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

Vérification :

```bash
docker --version && docker compose version
```

---

## 2. Récupérer le code source

Deux possibilités — utiliser **celle qui correspond à votre situation** :

**Option A — dépôt Git** (recommandée pour les mises à jour) :

```bash
adduser --disabled-password --gecos "" node47
su - node47
git clone VOTRE_DEPOT_GIT node47 && cd node47
```

**Option B — archive zip** (celle déjà sauvegardée) :

```bash
adduser --disabled-password --gecos "" node47
su - node47
# Envoyer depuis votre machine : scp node47-src.zip node47@VOTRE_IP:~/
unzip node47-src.zip -d node47 && cd node47
```

---

## 3. Configurer puis lancer

```bash
# 1. Variables d'environnement
cp .env.example .env
nano .env
```

Renseigner **obligatoirement** :

| Variable | Valeur | Génération |
|---|---|---|
| `ADMIN_PASSWORD` | mot de passe analyste fort | à inventer |
| `ADMIN_SECRET` | clé HMAC ≥ 32 caractères | `openssl rand -hex 32` |
| `NEXT_PUBLIC_SITE_URL` | URL publique finale, sans slash final | ex. `https://node47.com` |

`DATABASE_URL` peut rester tel quel : compose force `file:/app/db/custom.db`
dans le conteneur.

```bash
# 2. Base de données locale (volume ./db) — amorcée une seule fois
mkdir -p db
docker compose run --rm --no-deps node47 sh -c \
  "npx prisma db push --skip-generate --schema prisma/schema.prisma" || true
# → si ./db/custom.db n'existe pas encore, il est créé avec le bon schéma

# 3. Construire et démarrer
docker compose up -d --build

# 4. Vérifier
docker compose ps          # état healthy attendu
docker compose logs -f     # Ctrl+C pour sortir
curl http://127.0.0.1:3000/api/health
# → {"status":"ok","database":"ok",...}
```

> **Données initiales** : si votre base de développement contient déjà des
> analyses validées, copiez-la simplement sur le serveur avant l'étape 2 :
> `scp db/custom.db node47@VOTRE_IP:~/node47/db/` — le conteneur l'utilisera
> directement, aucune opération supplémentaire nécessaire.

---

## 4. Persistance et sauvegardes

La base vit dans `./db/custom.db` **sur l'hôte** : reconstruire ou recréer le
conteneur ne l'efface jamais.

Sauvegarde quotidienne (cron à 04:00, copie horodatée de 30 jours) :

```bash
crontab -e
# ajouter :
0 4 * * * cd /home/node47/node47 && docker compose exec -T node47 \
  node -e "require('fs').copyFileSync('/app/db/custom.db','/app/db/backup-'+new Date().toISOString().slice(0,10)+'.db')" \
  && find db -name 'backup-*.db' -mtime +30 -delete
```

Restauration :

```bash
docker compose down
cp db/backup-2026-10-21.db db/custom.db
docker compose up -d
```

---

## 5. Mettre à jour le site

```bash
cd ~/node47
git pull            # ou : remplacer les fichiers (nouvelle archive zip)
docker compose up -d --build   # reconstruit et relance sans coupure de données
```

Le schéma évolue-t-il ? Ajouter avant le redémarrage :

```bash
docker compose run --rm --no-deps node47 \
  npx prisma db push --skip-generate --schema prisma/schema.prisma
```

---

## 6. HTTPS avec Caddy (le plus simple)

Caddy obtient et renouvelle le certificat SSL automatiquement.

```bash
apt install -y caddy
```

`/etc/caddy/Caddyfile` :

```
votre-domaine.com {
    reverse_proxy 127.0.0.1:3000
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
}
```

```bash
systemctl reload caddy
```

Pointez l'enregistrement DNS A du domaine vers l'IP du VPS avant, puis
renseignez `NEXT_PUBLIC_SITE_URL=https://votre-domaine.com` dans `.env` et
relancez (`docker compose up -d --build`) pour que les balises Open Graph,
le sitemap et les canonicals utilisent l'URL définitive.

> Alternative nginx : `server_name votre-domaine.com; location / { proxy_pass
> http://127.0.0.1:3000; proxy_set_header Host $host; proxy_set_header
> X-Forwarded-Proto $scheme; }` puis `certbot --nginx`.

---

## 7. Pare-feu

```bash
ufw allow OpenSSH
ufw allow 80/tcp && ufw allow 443/tcp
ufw enable
```

Le port 3000 n'est **pas** ouvert : le conteneur n'écoute que sur
`127.0.0.1`, seul le proxy HTTPS est exposé.

---

## 8. Dépannage

| Symptôme | Commande | Cause probable |
|---|---|---|
| Conteneur `unhealthy` | `docker compose logs --tail 100` | base absente → refaire l'étape 2 du §3 |
| `database: "unreachable"` | `curl 127.0.0.1:3000/api/health` | `./db` non monté ou droits : `chown -R 1000:1000 db` |
| Connexion admin refusée | vérifier `.env` | `ADMIN_PASSWORD` modifié → `docker compose up -d` pour recharger |
| Partage OG sans image | vérifier `.env` | `NEXT_PUBLIC_SITE_URL` encore en localhost → corriger + rebuild |
| Disque plein | `docker system df` | purger les vieilles images : `docker image prune -a` |

---

## 9. Checklist de mise en production

- [ ] `.env` : `ADMIN_PASSWORD` et `ADMIN_SECRET` personnalisés (plus les valeurs d'exemple)
- [ ] `.env` : `NEXT_PUBLIC_SITE_URL` = URL publique finale **avant** le build
- [ ] Base présente dans `./db/custom.db` (copiée ou créée par `prisma db push`)
- [ ] `docker compose ps` → `healthy`
- [ ] `/api/health` répond `database: "ok"`
- [ ] HTTPS actif (Caddy ou nginx + certbot)
- [ ] Partage d'une fiche testé sur WhatsApp / X : titre, description et image corrects
- [ ] Cron de sauvegarde quotidien actif
- [ ] `/admin` inaccessible au public (liens absents du site, `Disallow` dans robots.txt)
