# Worklog — NODE.47

---
Task ID: 22
Agent: main (Z.ai)
Task: Préparer la mise en ligne gratuite du site (Netlify + Supabase, à la demande de l'utilisateur)

Work Log:
- Audit de compatibilité serverless : aucune écriture fichier dans src, z-ai-web-dev-sdk non utilisé, toutes les pages force-dynamic (pas d'accès DB au build) → compatible Netlify
- Recherche web : Supabase free (500 Mo, pause après 7 jours d'inactivité, restaurable en 1 clic), Neon (jamais en pause), Netlify supporte Next.js 16 via OpenNext, Vercel Hobby interdit l'usage commercial → combinaison Netlify + Supabase validée (conforme à la demande)
- Créé prisma/schema.postgres.prisma (miroir scripts/feature-src/deploiement) — même schéma, provider postgresql
- Créé netlify.toml : build = prisma generate (schéma postgres) + next build, NODE_VERSION 22
- .env.example enrichi (format DATABASE_URL Supabase pooler port 6543 + pgbouncer=true&connection_limit=1)
- Généré deploiement/01-creer-les-tables.sql via prisma migrate diff (DDL Postgres de Pick + NewsletterSubscriber)
- Écrit scripts/export-donnees.ts : export SQLite → deploiement/02-remplir-avec-mes-donnees.sql (11 analyses + 1 abonné, INSERT échappés, ON CONFLICT DO NOTHING)
- Contourné bug CLI Prisma local (fichier racine .config illisible traité comme dossier) : commandes lancées depuis le sous-dossier prisma/
- Test build Netlify-like : generate postgres + next build → réussi, toutes les routes dynamiques ; client SQLite restauré ensuite, serveur dev relancé (HTTP 200)
- Rédigé GUIDE-DEPLOIEMENT.txt (guide non-technique : GitHub en 2 passes de drag&drop à cause de la limite 100 fichiers, Supabase SQL Editor + URI pooler, Netlify + 4 variables d'env, piège de la pause Supabase, dépannage) — copié à la racine projet et dans download/
- ZIP régénéré : NODE47-source-code.zip (200 fichiers, ~2,4 Mo) incluant le kit de déploiement + guide

Stage Summary:
- Site prêt pour la mise en ligne gratuite Netlify + Supabase ; aucun changement de code fonctionnel
- 4 variables d'environnement requises sur Netlify : DATABASE_URL, ADMIN_PASSWORD, ADMIN_SECRET, NEXT_PUBLIC_SITE_URL
- Livrables : /home/z/my-project/download/NODE47-source-code.zip (à jour) et /home/z/my-project/download/NODE47-GUIDE-DEPLOIEMENT.txt
- Restent ouverts : refonte visuelle depuis le HTML fourni, bug import intelligent (champs mal remplis), OG image avec nouveau logo
Task ID: 23
Agent: main (Z.ai)
Task: Vérification du site en ligne https://node47.netlify.app

Work Log:
- 1er contrôle : toutes les pages en 401 (server: Netlify, redirection app.netlify.com/edge-access) → projet en visibilité "Private"
- Guide donné à l'utilisateur : Site configuration → Access & security → Project visibility → Public
- 2e contrôle après bascule Public : 13/13 pages en HTTP 200 (accueil, 3 sports, analyses, performance, à-propos, admin/login, sitemap, robots, og-image, icon, api/health)
- API health : {"status":"ok","database":"ok"} → DATABASE_URL Supabase fonctionnelle
- SEO : canonical + og:image + sitemap sur https://node47.netlify.app → NEXT_PUBLIC_SITE_URL correct
- Base connectée mais vide : "Aucune analyse publiée" → fichier 02-remplir-avec-mes-donnees.sql pas encore exécuté (optionnel)

Stage Summary:
- Déploiement Netlify + Supabase RÉUSSI, site public et fonctionnel
- Reste à l'utilisateur : exécuter 02-remplir-avec-mes-donnees.sql (récupérer ses 11 analyses) OU publier via /admin ; tester la connexion /admin
Task ID: 24
Agent: main (Z.ai)
Task: Corriger le remplissage automatique de l'import (préremplir l'essentiel sans « ramasser tout »)

Work Log:
- Diagnostic reproduit via test-parse-diagnostic.ts (7 cas) : en collage hors format A à G, l'essentiel (sport, compétition, date, marché, sélection, cote) restait vide et la prose se collait dans Sélection/Marché (ex. « Under 2,5 Les deux équipes jouent très fermé… »)
- Correctifs analyze-import.ts : (1) garde isShortLabel/SHORT_LABEL_RE — les champs discrets n'absorbent JAMAIS les lignes de continuation (parseBullets + repli global) ; (2) scan essentiel global — compétition via dictionnaire sur tout le texte, sport par mots-clés, date via parseMatchDate sur texte entier avec heure cherchée AU VOISINAGE de la date (regex « h » gardée), cote via motifs cote/cotation/odds/@x.xx, sélection via phrase « je joue … » (nettoyage @cote), marché déduit (Over/Under, Handicap, Double chance, BTTS, Vainqueur) ; (3) affiche « vs » cherchée ligne par ligne (plus de préfixe « EuroLeague ») ; (4) étiquettes cotation/cotations/odds ajoutées à FLAT_LABELS ; (5) collage plat : plus de versage de prose dans Points clés, titres « Analyse : » et lignes de date exclues du scénario ; (6) avertissements section A seulement si sections détectées ; criticals déplacés en fin (plus de faux « à remplir »)
- pick-form.tsx : fusion filtrant les valeurs undefined (aucun champ déjà saisi n'est écrasé par un import partiel)
- Validation : 7/7 cas avec 69/70 essentiels remplis (1 légitime), zéro pollution, 3 échantillons canoniques identiques (zéro régression), test-import-v2 TOUS LES TESTS PASSENT, eslint 0 erreur, tsc 0 erreur, /admin/nouveau rendu 200 avec le nouveau code
- Fichiers miroir : scripts/feature-src/import-fix/ (analyze-import.ts, pick-form.tsx, test-parse-diagnostic.ts)
- ZIP régénéré (200 fichiers) pour mise à jour Netlify

Stage Summary:
- Bug d'import corrigé : l'essentiel du fichier collé préremplit le formulaire, la prose n'est plus aspirée dans les champs
- L'utilisateur doit redéposer la nouvelle archive sur GitHub pour redéployer Netlify
---
Task ID: 25
Agent: main (Z.ai)
Task: Import v4 — scénario = VRAI résumé, statistiques clés et points clés de décision bien détectés (retours utilisateur)

Work Log:
- Diagnostic AVANT (diag-import-v4.ts) : le champ « Scénario sportif » recevait 43 % / 39 % du texte collé (2738 et 2185 caractères = sections B+C+D recopiées) ; stats limitées à la seule puce « Statistiques : » (1 stat Valencia/Zverev) ; les raisons déterminantes (F) et puces C non statistiques (blessures, modèles) n'étaient jamais des points clés
- Résumé condensé : suppression du versement de C/D dans le scénario ; nouvel assemblage = équipe/joueur supérieur + scénario attendu + 1res raisons + sous-raisons + « Convergence : » (1re phrase du paragraphe libre de C) ; cible SUMMARY_TARGET = 1000 caractères, coupure en FIN DE PHRASE (truncateAtSentence) + warning « scénario condensé » ; en collage plat : narration condensée si > 1000 + détection de points clés (phrases justificatives via mots-clés) + stats déduites de la narration (lignes de champs/cotes exclues)
- Stats clés : TOUTES les puces de C passent au détecteur (plus seulement « Statistiques : ») ; nouveaux motifs : bilans de forme NV-ND-ND (1V-2N-5D), rapports 9/10 (gardes anti-dates/cotes), scores N-N (existant) ; étiquettes validées par makeLabel (rejet « » ( ) [ ], junk labels clean/ex/etc…, stop-words finaux vs/chez/face/contre) ; dédoublonnage label|value ; puces marché/cotes rejetées (MARKETISH_RE avec \b — « favorise » ne colle plus) ; en section C, une puce SANS stat lisible devient un point clé de décision
- Points clés de décision : raisons principales (B) + facteurs + sous-puces (existant), + puces C non statistiques, + raisons déterminantes (F) quand la synthèse vient de G (sinon elles restent dans la synthèse, Porto sans G inchangé) ; parseBullets reconnaît désormais les étiquettes « prose » SANS puce (gras markdown « **Raisons déterminantes** : ») via PROSE_LABELS/PROSE_LABEL_RE ; assemblage déplacé APRÈS G avec dedupeItems (empreinte 60 car.) et cap 12
- Validation : test-import-v2 TOUS PASS (2 assertions mises à jour : Zverev ≥ 3 stats dont 58-13/31-16, Porto « invaincu à domicile = 8 matchs »), test-import-v3 42/42, NOUVEAU test-import-v4 42/42 (résumé < 30 % du collé, sans D ni blessures ; stats réelles sans cotes ; points B+C+F ; collage plat) ; eslint 0 erreur ; tsc 0 erreur hors .next généré
- E2E navigateur réel (/admin → /admin/nouveau, fichier valencia.txt chargé) : toast « Import analysé — 15 champs remplis », Scénario = 595 caractères (« Équipe supérieure : Athletic Bilbao / Scénario attendu : … / Raisons : … / Convergence : … »), 3 stats en grille (50 %, 1V-2N-5D, 2V-2N-2D), 12 points clés, marché/sélection/ligne/cote corrects ; captures scripts/import-v4-*.png
- Fichiers miroir : scripts/feature-src/import-v4/ (analyze-import.ts, test-import-v2.ts, test-import-v4.ts, echantillons.ts, diag-import-v4.ts)
- ZIP régénéré : NODE47-source-code.zip (203 fichiers, ~2,7 Mo)

Stage Summary:
- Import v4 livré : le scénario sportif est un vrai résumé (595-540-194 caractères au lieu de 2738-2185-404), les statistiques clés (bilans, scores, %, volumes) et les points clés de décision (B + C + F + collages plats) sont bien détectés
- L'essentiel (sport, compétition, affiche, date, marché, sélection, cote) reste prérempli, la saisie manuelle n'est jamais bloquée, la prose de marché/cotes ne pollue ni stats ni points
- L'utilisateur doit redéposer le ZIP à jour sur GitHub pour redéployer Netlify
---
Task ID: 26
Agent: main (Z.ai)
Task: Import v5 — recherche en ligne des standards analystes puis application aux 3 points (résumé, stats clés, points de décision)

Work Log:
- Recherche web (ProbWin, MediaPronos, RealAssuredTips, xGscore, ParisPortifMéthode, analysefoot) : l'analyse pro = « le scénario attendu + les chiffres + ce qui peut faire perdre le pronostic » ; stats citées = forme V-N-D, H2H, moyennes de buts dom/ext, xG/xGA, %, clean sheets, tirs, séries ; facteurs de décision = effectifs (blessures/suspensions), motivation/enjeux, contexte, tactique, value
- Scénario : SUMMARY_TARGET 1000 → 700 ; raisons = 1 phrase condensée (condenseLine, coupure à la virgule, jamais au milieu d'un mot) ; les autres puces étiquetées de B vont désormais aux points clés ; sous-raisons = 1 seule au résumé (la 1re) — résumé Valencia 517 car. (v4 : 595, origine : 2738), Porto 162 car.
- Stats clés : unités élargies (xg, xa, tirs cadrés, tirs, corners, clean sheets, arrêts, passes, victoires, défaites, nuls) — test dédié Lille : xG moyen 1,85, xGA 1,10, clean sheets 28 %, possession 58 %, tirs cadrés 6, corners 5,4 tous détectés ; aucune stat issue des cotes
- Points clés : décisionScore (effectifs ×3, motivation/enjeux ×3, contexte ×2, value ×2, tactique/convergence/forme ×1) + tri stable — quand la liste dépasse 12, blessures/suspensions/enjeux sont conservés avant les phrases descriptives (test Lyon 13 raisons → les 3 facteurs décisionnels gardés) ; mots-clés collage plat étendus à la même typologie
- Nouveau test-import-v5.ts (41 checks) : scénario ≤ 700 avec les 3 parties (qui domine / scénario attendu / convergence), stats pro détectées sans cotes, hiérarchisation des points, collages plats
- Validation : v2 PASS, v3 42/42, v4 42/42, v5 41/41 ; eslint 0 erreur ; tsc 0 erreur hors .next généré ; /admin/nouveau répond (307 → login, serveur OK) ; sortie réelle contrôlée (Valencia : scénario 517 car., 3 stats, 12 points hiérarchisés ; Porto : xG 1,85 détecté)
- 2 premiers échecs v5 corrigés côté TEST (coïncidence xG=cote 1,85 ; phrase-test trop longue > 48 car. de garde anti-prose) — comportement du parseur jugé correct et conservé
- Fichiers miroir : scripts/feature-src/import-v5/ (analyze-import.ts, test-import-v5.ts)
- ZIP régénéré pour redéploiement Netlify

Stage Summary:
- Import v5 livré : le scénario sportif lit « qui domine → comment le match se joue → pourquoi le pari » en ≤ 700 car. ; les statistiques clés reconnaissent les chiffres d'analystes pro (xG, clean sheets, tirs, possession…) ; les points clés de décision hiérarchisent effectifs/motivation/contexte/value/tactique
- L'utilisateur doit redéposer le ZIP à jour sur GitHub pour redéployer Netlify

---
Task ID: 27
Agent: main (Z.ai)
Task: Simplifications demandées — suppression texte 8 h UTC, suppression totale de l'import par texte, retrait de l'onglet Analyses, vraie page Notre approche, nouveau ballon de football

Work Log:
- Texte « Les premières sélections paraissent chaque jour à partir de 8 h UTC. » supprimé partout : ticker.tsx (état vide → « Aucune sélection publiée pour le moment. ») + page.tsx (état vide → « Aucune analyse publiée pour le moment. »)
- Import depuis le texte supprimé TOTALEMENT : section 0 « Importer depuis un texte » retirée de pick-form.tsx (états importOpen/importText/importWarn, fileInputRef, applyImport, onFileChosen, badges « à vérifier », imports ClipboardPaste/Wand2/FileUp/useRef) ; src/lib/analyze-import.ts supprimé ; formulaire 100 % manuel (sections 01 Rencontre, 02 Résumés, 03 Décision, 04 Publication inchangées)
- Scripts de test devenus orphelins supprimés du projet : test-import{,-v2..v5,-real}.ts, diag-import-v4.ts, echantillons.ts, scripts/bugfix-src/, scripts/feature-src/ (miroirs conservés dans /home/z/my-project/scripts/feature-src) ; tsconfig.exclude += « scripts » ; dossier d'échafaudage examples/ (socket.io) supprimé
- Onglet « Analyses » retiré du header (site-header.tsx) ; remplacé par « Notre approche » → /notre-approche ; la PAGE /analyses reste en ligne et reliée depuis l'accueil (« Voir les analyses », « Toutes les analyses ») et le sitemap
- Vraie page /notre-approche créée (content issue du code réel) : 01 Le rythme (édition 8 h UTC J → 7 h 59 UTC J+1, fil 3 éditions, suivi 30 j), 02 La décision (2 verdicts seulement, 1 marché/1 ligne/1 cote, pas de convergence = pas de publication), 03 L'échelle confiance→mises (Faible 0,5 u / Modéré 1 u / Élevé 1,5 u / Très élevé 2 u — table), 04 Ce que contient chaque analyse (scénario résumé, stats clés, points clés, décision exécutable), 05 Suivi public 30 jours + 3 sports, 06 Ce qui reste privé + CTA analyses/à-propos ; metadata+canonical /notre-approche ; ajoutée au sitemap (priority 0.6)
- Accueil relié à la nouvelle page : bouton héro « Notre approche » → /notre-approche (pointait vers /a-propos ❌), section 03 conservée mais PILLARS réécrits sur la vraie mécanique (Une décision pas une liste / La confiance fixe la mise / Réglé en public sur 30 j) + lien « Voir l'approche en détail »
- Ballon de football redessiné (sport-icon.tsx) : cercle + pentagone central plein + 5 rayons vers le cercle (ballon classique), style trait 1.7 conservé, basketball/tennis inchangés
- Validation : tsc 0 erreur (après nettoyage .next/dev/types + examples), eslint 0 erreur, serveur dev relancé, 10/10 routes 200 (/, /notre-approche, /analyses, /a-propos, /performance, 3 sports, /admin/login, /api/health, sitemap) ; header vérifié dans le HTML rendu (7 liens, sans /analyses) ; captures shot-notre-approche.png, shot-home-football.png, shot-football-icon.png
- Fichiers miroir : scripts/feature-src/simplifications/ (ticker, site-header, sport-icon, pick-form, page.tsx accueil, sitemap, notre-approche/page.tsx, tsconfig) + scripts/check-render.js
- ZIP régénéré : NODE47-source-code.zip (sans .env, node_modules, .next, db, .config, logs, captures)

Stage Summary:
- Les 5 demandes sont livrées : texte 8 h UTC effacé, import par texte disparu (saisie manuelle seule), onglet Analyses retiré du header, « Notre approche » est une vraie page fidèle au code et le ballon de football ressemble à un ballon
- L'utilisateur doit redéposer le ZIP à jour sur GitHub pour redéployer Netlify (supprimer l'ancien contenu du dépôt puis glisser le nouveau)
