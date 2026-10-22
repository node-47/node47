#!/usr/bin/env bash
# =============================================================
#  VEILLEUR NODE.47 — relance automatique du serveur
#  Vérifie toutes les ~20 s ; si le site ne répond pas 2 fois
#  de suite, il redémarre le serveur tout seul.
# =============================================================
LOCK="/tmp/node47-watchdog.lock"
LOG="/tmp/my-project/watchdog.log"

# un seul veilleur à la fois
if [ -f "$LOCK" ] && kill -0 "$(cat "$LOCK" 2>/dev/null)" 2>/dev/null; then
  exit 0
fi
echo $$ > "$LOCK"
trap 'rm -f "$LOCK"' EXIT

log() { echo "[$(date '+%d/%m %H:%M:%S')] $*" >> "$LOG"; }
check() { curl -s -o /dev/null -w "%{http_code}" -m 20 http://127.0.0.1:3000/ 2>/dev/null; }

log "Veilleur démarré (PID $$)"
fails=0
while true; do
  code=$(check)
  if [ "$code" = "200" ]; then
    fails=0
  else
    fails=$((fails + 1))
    log "Site injoignable (code=$code, essai $fails/2)"
    if [ "$fails" -ge 2 ]; then
      log "→ Redémarrage automatique du serveur…"
      pkill -f "bun run dev" 2>/dev/null
      pkill -f "next dev" 2>/dev/null
      pkill -f "next-server" 2>/dev/null
      sleep 2
      cd /tmp/my-project || { log "ERREUR : dossier du projet introuvable"; exit 1; }
      DATABASE_URL=file:/tmp/my-project/db/custom.db \
        nohup bun run dev >> /tmp/my-project/dev-server.log 2>&1 &
      log "→ Serveur relancé, attente du retour…"
      ok=0
      for i in $(seq 1 24); do
        sleep 5
        c=$(check)
        if [ "$c" = "200" ]; then
          log "✓ Serveur de nouveau en ligne (après $((i * 5)) s)"
          ok=1
          break
        fi
      done
      [ "$ok" = "0" ] && log "✗ ÉCHEC du redémarrage automatique — intervention humaine requise"
      fails=0
    fi
  fi
  sleep 20
done
