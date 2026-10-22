# Worklog — Projet NODE.47

---
Task ID: 1
Agent: Z.ai (agent principal)
Task: Créer un site web interactif et élégant pour publier les résultats d'analyses sportives (NODE.47 TRADER INTELLIGENCE) sur 3 sports (Football, Basketball, Tennis), sans exposer le processus d'analyse — uniquement les marchés retenus, les stats et les résumés.

Work Log:
- Chargé le skill fullstack-dev et initialisé l'environnement Next.js 16 (App Router, TypeScript, Tailwind 4, shadcn/ui, Prisma/SQLite)
- Défini le schéma Prisma `Pick` (sport, compétition, affiche, date, scénario, keyPoints JSON, keyStats JSON, marché/sélection/ligne/cote, verdict, confiance, condition, synthèse, statut DRAFT/PUBLISHED, résultat PENDING/WON/LOST/PUSH/VOID) + `bun run db:push`
- Design system sombre premium : charbon chaud + accents or (oklch), polices Space Grotesk / Inter / JetBrains Mono, utilitaires custom (hero-grid, text-gold-gradient, card-glow, animate-rise) — corrigé le problème Tailwind v4 qui ignore les classes statiques dans `@layer utilities` (déplacées hors couche)
- Librairies : `src/lib/auth.ts` (cookie signé HMAC, mot de passe ADMIN_PASSWORD, session 30 j), `src/lib/picks.ts` (types, libellés FR, styles verdicts/résultats, calculs de performance en unités, formatage fr-FR)
- Composants : logo NODE.47 SVG, icônes sports SVG custom (football/basketball/tennis), header sticky avec menu mobile, footer sticky avec avertissement 18+, badges verdict/résultat/confiance, carte PickCard, graphique recharts (courbe d'unités)
- Pages publiques (route group `(site)`) : accueil (hero, chiffres clés, dernières sélections, couverture par sport, philosophie sans révéler la méthode, légende des verdicts, CTA), /analyses (filtres serveur par sport/verdict/résultat), /analyses/[id] (marché retenu, condition d'exécution, scénario, stats clés, points de décision, synthèse, bandeau de résultat, analyses liées), /performance (stats globales, courbe cumulative, détail par sport, historique), 404 élégante
- API admin sécurisée : /api/admin/login, /api/admin/logout, /api/admin/picks (GET/POST), /api/admin/picks/[id] (PATCH/DELETE) avec validation zod et vérification de session HMAC
- Console analyste (route group `admin/(protected)` protégé par layout serveur) : login, dashboard (stats, actions rapides publier/dépublier/régler/supprimer via dropdown + AlertDialog), formulaire création/édition complet (stats dynamiques, condition conditionnelle selon verdict, switch publication, règlement résultat)
- Seed : 10 analyses de démonstration (3 football, 3 basketball, 3 tennis + 1 brouillon privé) — contenus d'exemple à remplacer
- Auto-vérification Agent Browser complète : toutes les pages testées, flux admin de bout en bout (login KO puis OK, création+publication, règlement Gagné, suppression avec confirmation, déconnexion + re-protection), responsive mobile (390px, menu hamburger), brouillons correctement masqués du public
- Corrections pendant la vérification : import icône lucide inexistante, dégradation `running` → `reduce` (règle ESLint), stats dashboard avec icône manquante, `EmptyPickForm` appelé depuis un composant serveur (initial optionnel)
- Lint final propre, 0 erreur console/serveur en session fraîche

Stage Summary:
- Site livré : plateforme NODE.47 complète (Next.js 16 + Prisma/SQLite) avec site public élégant et console analyste privée
- Accès console : /admin — mot de passe par défaut `NODE47-admin2024` (configurable via ADMIN_PASSWORD dans .env)
- Cloisonnement garanti : brouillons invisibles, seuls les résumés/marchés/stats/verdicts sont publics ; le framework NODE.47 détaillé n'est jamais exposé
- Données de démo à remplacer : 10 analyses d'exemple (dont 1 brouillon) créées par scripts/seed.ts
- Scripts persistés : scripts/seed.ts (ré-exécutable, idempotent)

---
Task ID: 2
Agent: Z.ai (agent principal)
Task: (a) Supprimer intégralement les décisions « Je ne joue pas » du site (l'utilisateur ne les publie pas) ; (b) Ajouter une page « À propos ».

Work Log:
- src/lib/picks.ts : type Verdict réduit à JE_JOUE | JE_JOUE_SOUS_CONDITION ; suppression de JE_NE_JOUE_PAS dans VERDICT_LABELS/DESCRIPTIONS/OPTIONS/verdictStyles ; suppression de isPlayed() ; unitsProfit simplifié ; summarize : played = published (toute publication engage une sélection)
- badges.tsx : fallback VerdictBadge -> JE_JOUE ; pick-card.tsx : bloc marché toujours affiché (plus de branche « Aucune position retenue »)
- Accueil : pilier « Décision assumée » rewordé ; légende verdicts en 2 colonnes sans « Je ne joue pas » ; cartes sports « X sélections publiées »
- /analyses : filtre verdict à 2 options ; détail /analyses/[id] : suppression isNoPlay, marché retenu toujours en grille 3 colonnes, bannière résultat conditionnée au seul règlement
- /performance : suppression isPlayed, colonne sélection sans condition verdict ; console admin : compteur « À régler » sans filtre verdict
- API : zod verdict = JE_JOUE | JE_JOUE_SOUS_CONDITION (POST + PATCH) ; handlers annotés NextRequest (correction typage tsc) ; schéma Prisma : verdict default JE_JOUE + db:push
- seed.ts : les 4 démos « Je ne joue pas » remplacées par de vraies sélections (Real Madrid Over 168,5 ; Denver -5,5 sous condition ; Swiatek Over 21,5 gagnée ; Fritz vainqueur perdue) ; seed relancé -> 10 analyses (9 publiées + 1 brouillon), bilan démo 4V-2D, +1,43 u
- pick-form.tsx : correction tsc (initial?.id) ; seed interface odds?: number | null
- Nouvelle page /a-propos (route group site) : hero, raison d'être, chiffres clés dynamiques (db), « ce que chaque publication contient » (3 cartes), « ce que vous ne verrez jamais » (processus privé), mode d'emploi (2 verdicts, jauge confiance, unités), 4 principes, FAQ accordéon (5 questions, shadcn Accordion), encart jeu responsable ; metadata SEO
- Navigation : « À propos » ajouté au header desktop/mobile et au footer
- Vérifications : lint propre, tsc src/ propre, Agent Browser (1440px + 390px) : /a-propos complète + FAQ interactive, accueil (légende 2 verdicts), /analyses (filtres + 9 cartes avec marché), détail Swiatek (bannière Gagné +0,74 u), /performance (historique +1,43 u), console admin (select verdict à 2 options, login OK) ; API testée : POST verdict JE_NE_JOUE_PAS -> 400 rejeté, création+suppression valides OK ; 0 erreur console ; 0 occurrence « Je ne joue pas » sur le site ; pas de scroll horizontal mobile

Stage Summary:
- Le verdict « Je ne joue pas » n'existe plus nulle part sur le site (UI, filtres, légende, API, seed) : seules des sélections engageables sont publiées
- Page « À propos » livrée sur /a-propos, reliée au header et au footer
- Données de démo actualisées : 9 sélections publiées toutes avec marché retenu, 4V-2D, +1,43 u

---
Task ID: 3
Agent: Z.ai (agent principal)
Task: (a) Appliquer l'échelle des mises par niveau de confiance (FAIBLE 0 U, MODÉRÉ 1 U, ÉLEVÉ 1,5 U, TRÈS ÉLEVÉ 2 U) ; (b) Ajouter la bascule thème sombre ↔ thème clair.

Work Log:
- src/lib/picks.ts : STAKE_UNITS/STAKE_LABELS par confiance (0/1/1,5/2), stakeOf(), stakeLabelOf(), formatStake(), CONFIDENCE_STAKE_LEGEND ; unitsProfit() désormais pondéré par la mise (WON: (cote-1)×mise, LOST: -mise, FAIBLE=0 toujours) ; summarize() ajoute `staked` (unités engagées sur réglées) et ROI recalculé = unités/staked ; verdictStyles/resultStyles migrés vers jetons sémantiques (success/warning/destructive/foreground) valables dans les deux thèmes
- badges.tsx : ConfidenceMeter avec option showStake (« Confiance Élevé · Mise 1,5 u »), nouveau StakeBadge (pastille dorée mono), segment inactif bg-foreground/12 thématisé
- pick-card.tsx : badge de mise sur chaque carte ; détail /analyses/[id] : panneau marché en 4 colonnes avec « Mise appliquée », bannière résultat gère le cas mise nulle (« Mise nulle — 0 u »), en-tête avec jauge+mise, disclaimer mis à jour
- /performance : colonne « Mise » dans l'historique, textes d'échelle, couleurs thématisées ; home : bloc « Échelle des mises appliquées » (4 cartes 0 u/1 u/1,5 u/2 u) sous la légende des verdicts
- /a-propos : principe « Mise calibrée par la confiance », carte « L'échelle des mises » (tableau complet + exemple chiffré), jauges avec mises, nouvelle FAQ « Comment la mise est-elle fixée ? », FAQ unités rewordée
- Console admin : select confiance affiche « Modéré — 1 u » + hint dynamique d'échelle ; pick-form/pick-actions/login migrés aux jetons
- Thème clair complet : globals.css réorganisé (jetons clair dans :root, sombre dans .dark) + nouveaux tokens surface-alt/grid-line/hero-halo/card-shadow/scrollbar-thumb ; dégradé or texte en bronze en clair ; hero-grid, card-glow, scrollbar, ::selection adaptatifs
- next-themes (attribute="class", defaultTheme="dark") via ThemeProvider root ; ThemeToggle (icônes Sun/Moon inversées par CSS dark:, zéro hydration mismatch) dans header desktop + mobile ; layout.tsx sans classe dark codée en dur + data-scroll-behavior="smooth"
- units-chart.tsx en variables CSS (var(--primary), var(--border), var(--popover)…) ; logo et accents sportifs en variantes dark: (bronze clair / or sombre) ; header/footer/layout admin sur bg-background & bg-surface-alt
- seed.ts : Atalanta → FAIBLE (0 u), Real Madrid Over 168,5 → TRES_ELEVE (2 u) pour couvrir toute l'échelle ; seed relancé (10 analyses)
- Vérifications Agent Browser (1440 px + 390 px, les deux thèmes) : bascule dark↔light OK et persistée (localStorage theme), rechargement conserve le thème ; bilan recalculé +2,78 u, ROI +37 % (2,775/7,5) ; historique avec mises (2 u EN ATTENTE « — », 1,5 u GAGNÉ +1,35 u…) ; fiche Atalanta « Mise appliquée : 0 u » + jauge 1/4 ; échelle visible sur home et À propos ; formulaire admin select + hint ; pas d'erreur console, pas de scroll horizontal mobile ; lint et tsc src/ propres

Stage Summary:
- Échelle des mises appliquée de bout en bout : affichage public (cartes, fiches, performance, légende, À propos), calculs de performance pondérés, console analyste alignée
- Bascule thème sombre/clair opérationnelle avec persistance ; site entièrement lisible dans les deux thèmes (identité or/charbon en sombre, bronze/papier chaud en clair)
- Données de démo couvrant les 4 niveaux de confiance ; bilan démo : +2,78 u, ROI +37 %, 67 % de réussite

---
Task ID: 4
Agent: Z.ai (agent principal)
Task: Correction de l'aperçu bloqué sur le « gros Z » (serveur de développement arrêté).

Work Log:
- Diagnostic : aucun processus next/bun actif, port 3000 non à l'écoute — l'aperçu restait sur l'écran de chargement Z.ai
- Redémarrage du serveur via setsid bun run dev (nohup simple tué à la fin du shell, setsid persistant) — Ready in 2,1 s
- Vérification HTTP : / 200, /analyses 200, /performance 200, /a-propos 200, /analyses/[id valide] 200, /admin 307 (redirection login attendue)
- Base de données intacte : 10 analyses (9 publiées + 1 brouillon masqué), thème et échelle des mises en place

Stage Summary:
- Cause identifiée : arrêt du serveur dev (redémarrage d'environnement), pas de bug applicatif
- Site de nouveau accessible : toutes les pages répondent 200, données intactes

---
Task ID: 5
Agent: Z.ai (agent principal)
Task: (a) Cycle de publication ancré à 8 h UTC + fil public limité aux 3 dernières éditions (aujourd'hui / hier / avant-hier) ; (b) Suivi de performance recalculé sur les 30 derniers jours, affichage restructuré.

Work Log:
- picks.ts : EDITION_HOUR_UTC=8, EDITION_WINDOW_DAYS=3, TRACKING_WINDOW_DAYS=30 ; helpers editionDayOf (publication entre 8 h UTC (J) et 7 h 59 UTC (J+1) => édition J), editionWindow, editionCalendarDays, editionDayLabel (Aujourd'hui/Hier/Avant-hier + date FR), trackingWindowStart, formatTrackingPeriod, isInTrackingWindow (réglées dans la fenêtre ou en attente publiées dans la fenêtre)
- /analyses : requête bornée à publishedAt >= 8 h UTC (J-2), regroupement en 3 sections éditées avec compteurs, programme du jour trié chronologiquement, état vide spécifique « édition du jour en préparation — publication à partir de 8 h UTC », chips d'en-tête (3 jours affichés / publication dès 8 h UTC), note de sortie de fil vers le suivi 30 j ; filtres sport/verdict/résultat conservés
- /performance : période affichée (puce « 30 derniers jours · du 21/09/2026 au 20/10/2026 »), 6 KPI (publiées, réglées + n en attente, taux, unités engagées, bilan net, ROI), courbe « 30 jours », détail par sport, section « En attente de règlement » (cartes cliquables), historique fenêtré, notes mises à jour
- Accueil : chiffres clés fenêtrés 30 j (Sélections/Réussite/Unités nettes 30 j) + légende « fenêtre glissante 30 jours · publication quotidienne dès 8 h UTC », note sous « sélections récentes »
- À propos : bloc « En chiffres · 30 jours » fenêtré, principe « résultats réglés » rewordé (suivi glissant 30 j), 2 nouvelles FAQ (rythme 8 h UTC ; durée d'affichage 3 jours puis suivi 30 j)
- seed.ts : helpers utcAt/pubForToday (UTC, repli veille si l'heure du jour n'est pas encore passée) ; démos réparties : édition 20/10 (3 PENDING : Atalanta, Denver, Real Madrid), 19/10 (Swiatek W, Fritz L, Sociedad L), 18/10 (Arsenal W, Sinner W, Boston W) ; seed relancé (10 analyses)
- Vérifications : lint OK, tsc src/ OK ; Agent Browser 1440 px + 390 px, thèmes sombre/clair (toggle + persistance localStorage) : 3 sections éditions confirmées (20/10, 19/10, 18/10 — 3 sélections chacune), performance 9 publiées / 6 réglées / 67 % / 7,5 u / +2,78 u / ROI +37 %, section en attente (3), historique complet avec mises, pas de scroll horizontal mobile, 0 erreur console, toutes pages 200

Stage Summary:
- Le site applique le cycle de publication 8 h UTC : une édition J couvre les publications de 8 h UTC (J) à 7 h 59 UTC (J+1)
- Fil public /analyses = 3 dernières éditions (aujourd'hui, hier, avant-hier) ; les plus anciennes sortent du fil
- Suivi de performance = fenêtre glissante 30 jours, affichage structuré (période, 6 KPI, courbe, par sport, en attente, historique)
- Données de démo alignées sur les 3 éditions ; bilan 4V-2D, +2,78 u, ROI +37 %

---
Task ID: 6
Agent: Z.ai (agent principal)
Task: (a) Nouvelle échelle des mises — FAIBLE 0,5 U (au lieu de 0 U), MODÉRÉ 1 U, ÉLEVÉ 1,5 U, TRÈS ÉLEVÉ 2 U ; (b) Page « À propos » : « Le niveau de confiance » + « L'échelle des mises » dans un même cadre, « Jeu responsable » + « Avertissement » dans un même cadre.

Work Log:
- src/lib/picks.ts : STAKE_UNITS FAIBLE 0 → 0,5 ; STAKE_LABELS FAIBLE « 0 u » → « 0,5 u » ; commentaires (unitsProfit, formatStake, CONFIDENCE_STAKE_LEGEND) alignés — tous les affichages (badges, cartes, fiches, performance, admin) dérivent automatiquement de ces constantes
- Textes d'échelle mis à jour : pick-form.tsx (hint admin « Faible 0,5 u · … »), accueil (« engage la mise minimale (0,5 u) »), performance (2 occurrences), fiche analyse (disclaimer « 0,5 u à 2 u »)
- a-propos/page.tsx : PRINCIPLES et FAQ rewordés (confiance faible = 0,5 u, mise minimale — plus de « sélection publiée sans engagement ») ; exemple chiffré de l'échelle mis à jour
- Fusion cadre 1 : « Le niveau de confiance » (4 jauges avec mises) + séparateur + « L'échelle des mises » (tableau dl + exemple) dans une seule carte border bg-card p-6
- Fusion cadre 2 : « Jeu responsable » (risques, règle d'or, numéro d'aide 09 74 75 13 13) + « Avertissement » (titre + caractère informatif, absence de garantie, cotes non garanties, performances passées, 18+) dans une seule carte avec séparateur ; aucun contenu perdu, pas de doublon avec le footer
- Vérifications : eslint OK ; tsc 0 erreur sur src/ ; Agent Browser 1440 px + 390 px — cadre unique confirmé (le card du h3 « Le niveau de confiance » contient « l'échelle des mises » ; le card du h2 « Jeu responsable » contient « Avertissement »), 0 erreur console, pas de scroll horizontal mobile, aucun texte résiduel « sans engagement / Faible 0 u »
- Base de données vérifiée : 10 picks publiés = 9 du seed + 1 réel créé via la console admin (Marseille vs Lyon, MODÉRÉ 1 u) — aucun doublon ; Atalanta (FAIBLE) affiche désormais 0,5 u automatiquement

Stage Summary:
- Échelle finale appliquée partout : FAIBLE 0,5 u · MODÉRÉ 1 u · ÉLEVÉ 1,5 u · TRÈS ÉLEVÉ 2 u (calculs pondérés inclus)
- Page À propos réorganisée en cadres uniques : confiance + échelle des mises ensemble ; jeu responsable + avertissement ensemble
- Toutes les pages 200, rendu vérifié en sombre/clair desktop et mobile

---
Task ID: 7
Agent: Z.ai (agent principal)
Task: Supprimer le doublon du texte « Avertissement » sur la page « À propos » (cadre dédié + mention du pied de page affichées deux fois).

Work Log:
- Diagnostic : le texte cité par l'utilisateur (« Avertissement — Les paris sportifs comportent des risques… ») provient du pied de page (site-footer.tsx), affiché sous le cadre « Jeu responsable & Avertissement » de /a-propos → doublon
- Nouveau composant src/components/footer-disclaimer.tsx (« use client », usePathname) : rend null sur /a-propos, sinon la mention légale complète
- site-footer.tsx : la mention est déléguée à <FooterDisclaimer /> (composant serveur conservé, import du composant client)
- Vérifications : eslint OK, tsc 0 erreur src/ ; Agent Browser — /a-propos : « Avertissement » 1× (cadre), doublon footer 0×, ligne d'aide 09 74 75 13 13 présente 1× ; /performance et / : mention footer intacte (1×) ; capture d'écran du bas de page validée (cadre unique + footer allégé avec copyright)

Stage Summary:
- Sur /a-propos, l'avertissement figure une seule fois, dans le cadre fusionné « Jeu responsable + Avertissement »
- La mention légale reste affichée dans le pied de page de toutes les autres pages

---
Task ID: 8
Agent: Z.ai (agent principal)
Task: Supprimer la redondance dans le cadre « Le niveau de confiance » + « L'échelle des mises » de /a-propos.

Work Log:
- Diagnostic : les jauges ConfidenceMeter avec showStake affichaient déjà la mise de chaque niveau (« Confiance Faible · Mise 0,5 u »), et le tableau de l'échelle juste en dessous répétait les mêmes 4 correspondances
- a-propos/page.tsx : retrait de showStake sur les 4 jauges (jauge = confiance pure) ; phrase d'intro de l'échelle rewordée (« À chaque niveau de confiance correspond une mise fixe, appliquée à toutes les sélections : ») ; note d'exemple épurée (suppression de la phrase répétant min/max déjà visibles dans le tableau)
- Vérifications : eslint OK, tsc 0 erreur src/ ; capture d'écran validée — la correspondance niveau → mise n'apparaît plus qu'une seule fois (tableau), structure jauge / séparateur / échelle conservée

Stage Summary:
- Cadre « À propos » dédoublonné : section confiance (4 jauges) puis section échelle (tableau 0,5 u / 1 u / 1,5 u / 2 u + exemple), sans répétition
- Les jauges avec mise restent utilisées là où elles sont utiles (fiches analyses, console admin)

---
Task ID: 9
Agent: Z.ai (agent principal)
Task: Chasse aux redondances et répétitions sur toutes les pages publiques (accueil, analyses, fiche, performance, à propos).

Work Log:
- Accueil : « 8 h UTC » ×2 (note hero tronquée à « Fenêtre glissante de 30 jours, recalculée en continu ») ; intro Philosophie rewordée (répétait le hero « publie le résultat final d'un travail mené en privé » → focus sur ce qui reste en coulisses) ; suppression du paragraphe sous l'échelle (répétait min 0,5 u / max 2 u des cartes) et de la note finale (répétait convergence/confiance des Piliers) ; KPI « Sports couverts 3 » (3e mention des sports) remplacé par « En attente de règlement » (compte réel)
- Performance : énumération complète de l'échelle ×2 → conservée uniquement dans la note de bas (intro : « l'échelle des mises appliquée selon le niveau de confiance »)
- Analyses : intro réduite à la phrase d'objet (le « 8 h UTC » restait dans la puce, le « suivi 30 jours » restait dans la note de sortie — plus de doublon intro/puces/note)
- Fiche analyse : suppression du chip « Mise appliquée : X » du panneau marché (doublait la colonne) ; barre de bas réduite au disclaimer (verdict et sport déjà en badges en tête) ; imports nettoyés (VERDICT_LABELS, Verdict, summarize inutilisés)
- À propos : principe « Mise calibrée par la confiance » rewordé sans réénumérer les 4 valeurs (le tableau du cadre fait foi)
- Vérifications : eslint OK, tsc 0 erreur src/ ; navigateur (innerText) — accueil : 8 h UTC ×1, « mené en privé » ×1, KPI En attente présent, notes résiduelles absentes ; analyses : 8 h UTC ×1, « 30 jours » ×1 ; performance : énumération échelle ×1 ; fiche : « Mise appliquée » ×2 (colonne + disclaimer, rôles distincts), chip supprimé, verdict non répété ; toutes pages 200 ; captures d'écran validées (fiche marché, légende accueil)

Stage Summary:
- Toutes les pages publiques dédoublonnées : chaque information (8 h UTC, fenêtre 3 jours, suivi 30 jours, échelle des mises, mise d'une sélection, verdict/sport) n'apparaît qu'une fois par page, à l'endroit le plus pertinent
- KPI accueil enrichi (En attente de règlement remplace Sports couverts, redondant avec le badge hero et la section Couverture)

---
Task ID: 10
Agent: Z.ai (agent principal)
Task: Rendre « Accès analyste » invisible pour le public avant publication du site.

Work Log:
- État des lieux : le lien « Accès analyste » apparaissait à 3 endroits publics (nav desktop, menu mobile dans site-header.tsx, footer) ; la console est déjà protégée (layout admin/(protected) vérifie le cookie de session côté serveur + redirect /admin/login ; toutes les routes API admin — GET/POST picks, PATCH/DELETE picks/[id] — vérifient isAdmin)
- site-header.tsx : suppression des 2 liens (desktop + mobile) et de l'import ShieldCheck devenu inutilisé
- site-footer.tsx : suppression du lien de pied de page (nav réduite à 4 liens, grille 2×2)
- robots.txt : le fichier static public/robots.txt autorisait tout ; ajout de Disallow: /admin et /api pour tous les user-agents (Googlebot, Bingbot, Twitterbot, facebookexternalhit, *) ; robots.ts via App Router abandonné (conflit « conflicting public file and page » avec le fichier statique)
- Vérifications : eslint OK, tsc 0 erreur src/ ; curl — 0 occurrence de « Accès analyste » sur /, /analyses, /performance, /a-propos, /admin/login ; /admin renvoie 307 vers /admin/login ; /robots.txt servi correctement ; navigateur (1440px + 390px) — nav et footer = 4 liens publics uniquement, menu mobile propre, capture d'écran validée

Stage Summary:
- Plus aucun lien admin visible depuis le site public ; accès conservé via URL directe /admin (redirigé vers /admin/login si non authentifié)
- /admin et /api exclus de l'indexation des moteurs de recherche (public/robots.txt)

---
Task ID: 11
Agent: Z.ai (agent principal)
Task: Redémarrage du serveur après panne (page bloquée sur le logo).

Work Log:
- Diagnostic : workspace /home/z/my-project réinitialisé par le sandbox ; projet survivant dans /tmp/my-project (src, db, worklog intacts) ; serveur arrêté, node_modules absent
- bun install complet (772 paquets, ~26 min, I/O sandbox ~110 fichiers/s) mais paquet next corrompu par une 1ère installation interrompue → réparé par copie depuis le cache bun (tar détaché, ~8 min) ; liens symboliques interdits dans le sandbox ; @next/env + @next/swc-linux-x64-{gnu,musl} + eslint-plugin-next restaurés depuis le cache (rapide, gros fichiers)
- Erreur persistante « Error code 14: Unable to open the database file » : cause racine = variable DATABASE_URL exportée globalement par le sandbox (file:/home/z/my-project/db/custom.db, ancien chemin), prime sur .env ; test direct Prisma OK (10 picks intacts)
- Ancien worker « next-server » survivant occupait le port 3000 (pkill -f « next dev » ne le matche pas car renommé) → kill par PID via ss -tlnp
- Purge cache .next (turbopack) puis démarrage avec surcharge explicite : DATABASE_URL=file:/tmp/my-project/db/custom.db bun run dev
- Vérifications : / /analyses /performance /a-propos = 200 ; /admin = 307 → /admin/login ; 10 picks en base ; protection admin et robots.txt intacts

Stage Summary:
- Site de nouveau en ligne depuis /tmp/my-project ; commande de démarrage fiable : cd /tmp/my-project && DATABASE_URL=file:/tmp/my-project/db/custom.db bun run dev
- Le .env corrigé (file:/tmp/my-project/db/custom.db) ne suffit pas : la variable d'environnement globale du sandbox prime — toujours surcharger au lancement

---
Task ID: 12
Agent: Z.ai (agent principal)
Task: Fournir le code source complet téléchargeable.

Work Log:
- Création de INSTALL.txt (démarrage rapide, console analyste, variables d'environnement à définir avant publication, commandes Prisma/seed)
- Archive zip du projet depuis /tmp/my-project, exclusions : node_modules, .next, logs, worklog.md, captures d'écran de session, examples/, mini-services/, .config (fichier protégé sandbox)
- Archive vérifiée : 147 fichiers, 255 Ko, intégrité OK ; contient src/ (109 fichiers), prisma/, db/custom.db (10 picks), public/, bun.lock, configs, scripts/seed.ts
- Livrée dans /home/z/my-project/download/NODE47-source-code.zip

Stage Summary:
- Code source complet + base de données + guide d'installation disponibles au téléchargement

---
Task ID: 13
Agent: Z.ai (agent principal)
Task: Import d'une analyse collée (sections A–F) dans le formulaire admin avec pré-remplissage automatique.

Work Log:
- Nouveau src/lib/analyze-import.ts : parseur 100 % client (aucune API/DB) — découpe en sections A à F, extraction des puces « • Label : corps », mapping vers les champs du formulaire ; date FR (mois français, 21h00, fuseaux UTC/GMT/CET/CEST/WET/WEST/EET/EEST → Date UTC puis datetime-local navigateur), détection sport par mots-clés, statistiques parsées en KeyStatItem (protection décimales 2,33 avant découpe), verdict JE JOUE / SOUS CONDITION, confiance (stripAccents), ligne normalisée (-1), cote 1.825 → "1.825" ; limites API respectées (summary/synthèse 3900 car., 12 points, troncature + warning)
- pick-form.tsx : bloc repliable « Importer depuis un texte » en tête de formulaire (textarea mono + Analyser et remplir + Effacer) ; Field enrichi d'un prop warn → pastille ambre « à vérifier » (date + cote après import, effacée dès modification manuelle) ; toast de bilan (n champs remplis · avertissements) ; fix : entité HTML dans placeholder JS, contextLine déclaré avant usage, filtrage par segments du contexte (jour de semaine / date / heure retirés, stade+arbitre conservés)
- Tests : unitaire bun run scripts/test-import.ts (16 champs remplis, 2 warnings attendus) ; E2E navigateur — connexion admin, collage du texte Porto–PSV réel (4 331 car.), champs vérifiés par eval (affiche, compétition, date 20:00 UTC, marché, sélection, ligne, cote, 2 badges) + combos (Football, Je joue, Élevé 1,5 u) + textareas (1780/763/139/644 car.) ; capture import-e2e-top.png validée
- eslint OK, tsc 0 erreur src/ ; fichiers maintenus en miroir dans /home/z/my-project/scripts/feature-src/ (sandbox : écriture directe /tmp impossible via Write) puis copiés vers /tmp/my-project

Stage Summary:
- L'analyste peut coller une analyse complète structurée A–F : le formulaire se pré-remplit et signale date/cote « à vérifier » ; la saisie manuelle reste intégrale
- Prochaine étape planifiée : lot SEO & partage (metadataBase, OG/Twitter, generateMetadata fiche, sitemap.xml, image OG), badge NOUVEAU, navigation fiches, compte 8 h UTC
---
Task ID: 14
Agent: Z.ai (agent principal)
Task: Lot SEO & partage validé — metadata Open Graph/Twitter, sitemap.xml, images OG (marque + fiche dynamique).

Work Log:
- src/lib/site.ts (nouveau) : SITE_NAME, getSiteUrl() (NEXT_PUBLIC_SITE_URL sans slash final, repli localhost:3000), truncateForMeta() (~155 car., coupure de mot)
- layout racine : metadataBase, applicationName, openGraph complet (locale fr_FR, siteName), twitter card summary_large_image ; title/description/keywords conservés
- File conventions OG : src/app/opengraph-image.tsx (marque 1200×630, filigrane « 47 », satori/next-og) héritée par toutes les pages ; src/app/(site)/analyses/[id]/opengraph-image.tsx (fiche dynamique : affiche, marché @cote, chips verdict + confiance, LALIGA, CTA « Lire l'analyse complète ») — brouillons/inconnus → visuel neutre, aucune fuite
- Fiche /analyses/[id] : generateMetadata (title « Match — Marché · Sélection », description ~155 car. avec confiance accordée au féminin, canonical /analyses/[id], og:type article + publishedTime, twitter card) ; brouillon/introuvable → « Analyse introuvable » + noindex
- Canonicals relatifs sur toutes les pages publiques : / , /analyses, /performance, /a-propos, fiches
- public/robots.txt supprimé (conflit) → src/app/robots.ts : Allow / + Disallow /admin,/api + ligne Sitemap (URL canonique)
- src/app/sitemap.ts (force-dynamic, DB jamais interrogée au build, try/catch repli statique) : 4 pages statiques + 10 fiches publiées (lastmod updatedAt) — 14 URLs vérifiées
- Noindex défensif : metadata robots sur admin/(protected)/layout.tsx + nouveau admin/login/layout.tsx
- INSTALL.txt : NEXT_PUBLIC_SITE_URL (avant build) + section « SEO & PARTAGE »
- Correctif lint : countdown migré de useEffect/setState vers useSyncExternalStore (règle react-hooks/set-state-in-effect)

Stage Summary:
- curl : og:image 1200×630 sur accueil + fiches (PNG vérifiés, 108-116 Ko), canonicals sur 5 types de pages, robots.txt avec Sitemap, sitemap 14 URLs
- Fiche : title/description/canonical/article OK ; 404 → noindex auto ; images OG servies avec hash de cache
- eslint 0 erreur, tsc src/ 0 erreur, console navigateur propre, dev.log sans erreur

---
Task ID: 15
Agent: Z.ai (agent principal)
Task: 3 améliorations secondaires validées — badge « Nouveau », navigation fiches, compte à rebours 8 h UTC.

Work Log:
- src/lib/picks.ts : isFromTodayEdition(publishedAt, now) — même jour d'édition que now (bascule automatique à 8 h UTC via editionDayOf)
- pick-card.tsx : pastille or « ● Nouveau » (border-primary/40, point bg-primary) dans l'en-tête droit des cartes, avant le badge de résultat — visible accueil, /analyses, analyses liées ; titre explicatif au survol
- Fiche : nav « ← Analyse précédente / Analyse suivante → » en bas (grille 2 col., voisins dans l'ordre de publication asc, toutes éditions ; côtés vides masqués) ; test de clic : Real Sociedad → Atalanta (édition suivante) OK
- src/components/next-edition-countdown.tsx (client) : « Prochaines analyses à 8 h UTC — dans X h YY min (HH:MM, heure locale) », horloge useSyncExternalStore (tick 30 s, snapshot stable), rendu serveur neutre puis hydratation sans mismatch ; inséré sous le disclaimer de chaque fiche (avant « Autres analyses »)
- Vérifications navigateur (1440 px + 390 px) : 4 badges sur /analyses (édition 20/10 en cours), 3 sur l'accueil (3 dernières), Arsenal (19/10) sans badge — logique d'édition exacte ; countdown hydraté « dans 1 h 28 min (08:00, heure locale) » ; pas de scroll horizontal mobile ; captures seo-home-badge.png, seo-analyses-mobile.png, seo-fiche-nav-countdown.png, seo-fiche-countdown.png, og-marque.png, og-fiche.png

Stage Summary:
- Badge « Nouveau » : marque visuellement les sélections de l'édition en cours, bascule seule à 8 h UTC
- Navigation précédente/suivante en bas de chaque fiche, dans l'ordre de publication
- Compte à rebours de la prochaine édition sous chaque fiche, heure locale du visiteur
- Lot SEO (Task 14) + secondaires (Task 15) livrés et vérifiés de bout en bout ; prochaine étape planifiée : Task 16 déploiement (Docker + Vercel)

---
Task ID: 17
Agent: Z.ai (agent principal)
Task: Retours utilisateur — (1) remplacer le badge « ● Nouveau » par une pastille de compétition bien alignée (Ligue 1, NBA, EuroLeague, WTA 1000, ATP Masters 1000…), (2) rendre l'import collé/chargé vraiment intelligent quel que soit le format d'analyse.

Work Log:
- src/components/badges.tsx : nouveau CompetitionChip (même gabarit px-2.5 py-1 text-[11px] que SportChip, truncate max-w-[180px], title au survol, null si compétition vide)
- src/components/pick-card.tsx : en-tête restructuré — gauche : SportChip + CompetitionChip (flex-wrap, items-start, min-w-0) ; droite : ResultBadge seul ; badge « Nouveau » supprimé (isFromTodayEdition reste dispo dans picks.ts) ; les 10 picks en base ont déjà leur compétition (Ligue 1, EuroLeague, NBA, Serie A, LaLiga, ATP 250, WTA 1000, ATP Masters 1000, Premier League)
- src/lib/analyze-import.ts réécrit : stripInline (gras **…**, titres #, espaces insécables) appliqué ligne à ligne AVANT la détection de sections A–H (accepte lettres minuscules + mots-clés d'intitulés en casse libre) ; parseBullets tolère • ‣ ▪ ◦ * - – — avec lignes de continuation rattachées à la puce précédente (sous-listes Porto OK) ; dictionnaire ~60 compétitions connues (labels canoniques : LaLiga, ATP Masters 1000, WTA 1000, Ligue des Champions, Betclic Élite…) + repli séparateurs « / » « – » « — » + nettoyage parenthèses/Journée ; splitReasons (sous-puces, lignes numérotées ou phrases ≥ 24 car.) ; section G = synthèse finale prioritaire (repli blocs E/F) ; marché coupé au second choix « (ou …) », sélection sans point final ; cote = décimale prioritaire (1,70-1,85 → 1.70 ; environ 1.25–1.29 → 1.25) ; confiance « MODÉRÉ à ÉLEVÉ » → premier niveau + warning ambiguïté ; fuseaux ajoutés EST/EDT/CST/CDT/MST/MDT/PST/PDT ; parenthèses horaires retirées du contexte (autour de 08:30–10:30…) ; parseKeyStats avec garde-fou qualité (étiquette ≤ 48 car. sans parenthèse ou étiquette « : », années 1900-2099 sans unité rejetées, prépositions finales nettoyées) → stats propres uniquement, sinon prose conservée dans le scénario + warning
- src/components/pick-form.tsx : bouton « Charger un fichier » (.txt/.md, FileReader 100 % client, max 200 Ko) + input file caché ; textes mis à jour « Coller ou charger une analyse complète (A à G) » ; placeholder et note d'aide mentionnent la mise en forme libre
- Tests : scripts/test-import-v2.ts — 40 assertions sur 3 formats réels (Valencia vs Athletic : tirets + gras + La Liga (Journée 9) → LaLiga + cote 1,70-1,85 → 1.70 + section G ; Zverev : Tennis – ATP Masters 1000 Rolex Shanghai Masters → ATP Masters 1000 + marché « Vainqueur du match » + confiance ambiguë MODÉRÉ à ÉLEVÉ → MODERE + warning ; Porto style historique imbriqué : • + sous-listes + 1.825 + ligne -0,5 + synthèse par blocs F) — 40/40 OK ; stats propres vérifiées (Valencia « Valencia a échoué à marquer = 50 % », Porto Porto/xG/PSV, Zverev 0 stat bruitée → prose en scénario)
- E2E navigateur : /analyses 7 pastilles compétition + 0 « Nouveau » ; accueil 3 pastilles (Ligue 1 en tête) ; import admin Valencia → Football / LaLiga / Valencia vs Athletic Bilbao / 2026-10-17T18:00 / Under (total de buts) · Under 2,5 / 1.70 / Je joue / Modéré — 1 u / 6 points clés / 1 stat propre / 2 pastilles « à vérifier » (date+cote) ; Zverev → Tennis / ATP Masters 1000 / Vainqueur du match / 1.25 ; mobile 390 px sans scroll horizontal ; captures badges-competitions-analyses.png, badges-competitions-accueil.png, badges-mobile.png, import-valencia-rempli.png
- Vérifications : bun test parseur 40/40, eslint 0 erreur, tsc 0 erreur src/ ; sources miroir maintenues dans /home/z/my-project/scripts/feature-src/ puis copiées vers /tmp/my-project

Stage Summary:
- Les cartes affichent désormais la compétition de l'analyse comme badge principal (identique au style des autres pastilles, parfaitement aligné) ; le badge « Nouveau » a disparu
- L'import accepte indifféremment coller ou charger un fichier, avec gras/tirets/puces/sections A-G, détecte ~60 compétitions, extrait marché/sélection/cote/confiance (même ambiguë), synthèse G, et ne produit que des statistiques propres (le reste reste lisible dans le scénario)
- Task 16 (déploiement Docker + Vercel) toujours en attente

---
Task ID: 16
Agent: Z.ai (agent principal)
Task: Déploiement — double option (VPS Docker + Vercel), hébergement non tranché, les deux voies préparées.

Work Log:
- src/app/api/health/route.ts (nouveau) : healthcheck JSON {status, database, timestamp} — ping db en try/catch, ne fait jamais tomber le conteneur ; hello-world api/route.ts supprimé ; correctif export `db` (pas `prisma`) de src/lib/db.ts ; tsc/eslint propres, endpoint vérifié {"status":"ok","database":"ok"}
- Dockerfile (nouveau, 3 étapes) : deps oven/bun:1.3-slim (bun install --frozen-lockfile, couche cacheée sur bun.lock) → builder (prisma generate + bun run build = next build standalone + copie static/public, ARG NEXT_PUBLIC_SITE_URL inliné au build) → runner node:24-bookworm-slim (glibc compatible moteurs Prisma linux-gnu, USER node, volume /app/db, HEALTHCHECK via fetch node natif — pas de curl requis)
- .dockerignore : node_modules/.next/db (jamais la base de dev dans l'image)/.env/logs/scripts exclus
- docker-compose.yml : service node47, ports 127.0.0.1:3000:3000 (reverse proxy only), env_file .env + DATABASE_URL forcé file:/app/db/custom.db, volume ./db:/app/db, healthcheck 30 s, logs rotatifs 10 Mo ×5
- .env.example : ADMIN_PASSWORD, ADMIN_SECRET (openssl rand -hex 32), DATABASE_URL, NEXT_PUBLIC_SITE_URL — chaque variable commentée
- DEPLOY-VPS.md (guide complet FR) : install Docker Ubuntu, récupération code (git ou zip), config .env, amorçage base (prisma db push ou copie directe de custom.db), persistance ./db, cron sauvegarde quotidienne 30 j, restauration, mises à jour (pull + rebuild), HTTPS Caddy (6 lignes) ou nginx+certbot, pare-feu ufw (3000 non exposé), tableau dépannage, checklist mise en production
- DEPLOY-VERCEL.md (guide complet FR) : avertissement SQLite éphémère sur Vercel → migration Turso/libSQL recommandée (3 fichiers : schema provider libsql, @prisma/adapter-libsql, db.ts adapté), import des 10 analyses, déploiement Vercel pas à pas + variables, domaine custom, tableau de compatibilité (8 h UTC, sitemap, OG images OK sans cron), limites, checklist
- INSTALL.txt : section import intelligent ajoutée, badge compétition (remplace badge « Nouveau »), /api/health documentée, nouvelle section DÉPLOIEMENT pointant vers les deux guides + .env.example
- Validation build production : bun run build (commande identique au Dockerfile) — 0 erreur, toutes routes compilées (ƒ dynamiques, /api/health présente), standalone complet (server.js + static)
- Smoke test production : node .next/standalone/server.js (runtime exact du conteneur) — /api/health database ok, accueil 200, /analyses badges compétition rendus (NBA, EuroLeague…) ; serveur de test arrêté, dev:3000 intact
- Mirroirs maintenus dans /home/z/my-project/scripts/feature-src/deploy/ (Dockerfile, compose, dockerignore, env.example, DEPLOY-VPS.md, DEPLOY-VERCEL.md, api-health-route.ts, INSTALL.txt)

Stage Summary:
- Double voie de déploiement prête : VPS Docker (recommandée, zéro migration, SQLite persistant sur volume ./db) et Vercel (procédure Turso incluse, hébergement à décider)
- Build production validé de bout en bout (même commande que Docker) + smoke test du serveur standalone réussi
- Task 13 (import intelligent) et retour badge compétition déjà livrés et vérifiés (Task 17) ; reste uniquement le choix de l'hébergement par l'utilisateur

---
Task ID: 18
Agent: Z.ai (agent principal)
Task: Retour utilisateur « le remplissage n'est pas intelligent, les champs ne se remplissent pas correctement » — durcissement majeur du parseur d'import (v3).

Work Log:
- Diagnostic : tests unitaires v2 verts (40/40) mais formats réels non couverts — collages aplatis sans sections, sections numérotées sans lettres, étiquettes accentuées, dates numériques, libellés alternatifs (Pronostic/Pari/Confiance sans préfixe), « Compétition » sans ligne « Sport »
- splitSections v3 : en-têtes reconnus même SANS lettres — titres nus (« MATCH ET CONTEXTE ») ou numérotés (« 1. », « IV. ») mappés via ORDER_KEYWORDS (ordre canonique A→G : match/scenario/convergence/comparaison/marche/verdict/synthese) ; garde-fous : ligne < 80 car., sans puce ni « : »
- parseBullets v3 : lignes « Label : valeur » SANS puce désormais traitées comme puces étiquetées (avant : prose perdue en continuation)
- Correspondance d'étiquettes insensible aux accents : accentPat (« marché » ≡ « marche ») — FLAT_LABELS (32 étiquettes) + LABEL_LINE_RE + STOP_LABEL_RE au niveau module
- parseMatchDate v3 : dates numériques 17/10/2026, 17-10-2026, 17.10.2026, 2026-10-17 (+ ambiguïté jour/mois résolue par la valeur > 12) en plus du format « 17 octobre 2026 »
- Confiance : préfixe « niveau de » OPTIONNEL (accepte « Confiance : Élevé », « Indice de confiance : … »)
- Section A réécrite : ligne « Compétition » prioritaire sur la ligne « Sport », sport déduit de la compétition (dictionnaire), match/rencontre/affiche/événement
- Marché/Sélection : libellés étendus (marche/market/pari retenu ; selection/pronostic/pari/choix/pick) ; sélection déduite du marché si absente (warning dédié)
- NOUVEAU repli global par étiquettes : chaque champ encore vide cherché dans le texte ENTIER (labeled[] sur toutes les lignes, valeurs stoppées au prochain label) — sport/compétition/date/marché/sélection/ligne/cote/verdict/confiance
- Aucun échec silencieux : champs critiques manquants (affiche/date/marché/sélection/cote) explicités dans les warnings dès que ≥ 2 champs remplis ; cote introuvable signalée
- Résumé v3 : en collage plat, scénario = narration PURE (lignes de champs et ligne d'affiche exclues) ; points clés purgés de la ligne « X vs Y » ; BUG CORRIGÉ : sec("G") ne renvoie plus le texte entier en mode sans sections (la « Synthèse finale » n'est plus polluée)
- pick-form.tsx : panneau d'import OUVERT par défaut en création (mode === "create") ; toast enrichi listant les champs remplis (« Rempli : affiche · sport · compétition · … »)
- Tests : scripts/test-import-v3.ts (nouveau) — 42 assertions sur 8 cas : 3 formats réels (régression portée v2) + date numérique/Confiance sans préfixe + sections numérotées 1..7 + collage plat + Pronostic sans Sport + sélection déduite — 42/42 OK ; v2 (40) et v1 toujours verts ; eslint 0 erreur ; tsc 0 erreur
- E2E navigateur (admin/nouveau) : Valencia → 14 champs (LaLiga, 2026-10-17T18:00, Under (total de buts), Under 2,5, 1.70, synthèse G) ; Zverev → Tennis/ATP Masters 1000/Vainqueur du match/1.25 ; collage plat Marseille vs PSG → Ligue 1/2026-10-25T19:45/Total de buts/Over 2,5/1.72 + scénario narratif propre + synthèse vide ; captures import-v3-*.png

Stage Summary:
- Le parseur accepte désormais : lettres A-G, numérotation libre, titres nus, collage plat, étiquettes avec/sans accents, dates littérales ou numériques, libellés alternatifs — et ne remplit jamais la synthèse avec le texte brut
- Le panneau d'import est visible d'emblée à la création ; le toast détaille chaque champ rempli et chaque « à vérifier »
- Si l'utilisateur rencontre encore un cas récalcitrant, lui demander de coller l'analyse exacte pour l'ajouter aux tests

---
Task ID: 18
Agent: main (Z.ai)
Task: Bug « le remplissage n'est pas intelligent, les champs ne se remplissent pas correctement » — diagnostic et correction du remplissage automatique

Work Log:
- Diagnostic navigateur (agent-browser, /admin/nouveau) sur les 3 analyses réelles : Porto/Valencia/Zverev OK mais défauts visibles — résidu d'horaire « 21h00 CET (Estádio do Dragão) » en tête du scénario, ligne vide malgré « Ligne si disponible : Under 2,5 », stats vides pour Zverev
- Création scripts/test-import-real.ts (variantes monde réel) : 2 familles de pannes RÉELLES reproduites — (1) émojis d'ornement (📌⚽🎯 collages ChatGPT) devant les titres → sections A-G non repérées → synthèse perdue ; (2) étiquettes qualifiées (« Sport / compétition : », « Cote observée : », « Ligne si disponible : ») non reconnues → VALEURS COLLÉES entre elles (affiche corrompue « Bayern Munich vs Borussia Dortmund Sport / compétition : … », cote jamais extraite)
- Corrections src/lib/analyze-import.ts :
  * stripInline : strip des émojis/ornements en tête/fin de ligne (⚽📌🎯📊💰🏆📝 ✅⭐ FE0F/ZWJ/keycaps) SANS toucher aux puces (•-–—*‣▪◦) ; DECOR_LINE_RE pour ignorer les séparateurs ═ ─ --- (splitSections, parseBullets, repli global)
  * LABEL_LINE_RE/STOP_LABEL_RE : qualificatifs intercalaires tolérés entre label et « : » jusqu'à 48 chars (Sport / compétition, Cote observée, Ligne si disponible, Marché conseillé…) ; garde de fin anti-lettres ACCENT-COMPATIBLE (LABEL_TAIL « (?:s)?(?![A-Za-zÀ-ÿ]) ») — le \b initial cassait sur « Marché : » (é non-\w) ; pluriel géré
  * FLAT_LABELS étendus : heure du match, joueur supérieur, type de pari, pronostic final, état des informations, sources, bookmaker(s), note(s), remarque(s)
  * ORDER_KEYWORDS : articles optionnels (le/la/les/notre/nos) devant tous les mots-clés ; nouveaux titres (Scénario, Conclusion, Marché choisi/conseillé) ; CORRECTION CRITIQUE du ^ perdu (ARTICLE_PREFIX.slice(1) rendait la regex A non ancrée → « JE JOUE — Alexander Zverev — Match Winner » et « Vainqueur du match » repartaient en section A, F restait vide, confiance perdue) ; limite 45 chars pour les titres NUMÉROTÉS (une raison « 2. Convergence classements… » n'est plus prise pour un en-tête)
  * contextLine : résidus d'horaire/fuseau (21h00, CEST, « autour de », « locale ») systématiquement écartés du scénario ; seul un libellé sans chiffre ≥ 4 lettres est conservé (stade)
  * Ligne : extraction d'un nombre au milieu de la valeur (« Under 2,5 (ou Under 2,25…) » → 2,5) + dérivation depuis la sélection (« FC Porto -0,5 » → -0,5 ; « Over 2,5 » → 2,5) avec warning dédié
  * parseKeyStats : motif score « N-N » (H2H 6-1, bilan 3-1) avec gardes anti-plages décimales (0,98-1,13 non capté) et détail tronqué à la parenthèse
  * splitReasons : découpe additionnelle sur « ; » (raisons compactes → 2+ points clés)
- Tests : test-import-v2.ts 40/40 (attente stats Zverev mise à jour volontairement : H2H 6-1 désormais extrait), test-import-v3.ts 42/42, test-import-real.ts ✅ émojis + romains ; eslint 0 erreur ; tsc 0 erreur src/
- E2E navigateur final : émojis Real Madrid → 16 champs remplis (LaLiga, 3 stats dont H2H 3-1, ligne 2,5 dérivée, synthèse G, scénario propre) ; Valencia → ligne 2,5 + scénario sans bruit ; Zverev → stat H2H 6-1, confiance Modéré (1er niveau) ; capture /home/z/my-project/download/import-intelligent-verif.png

Stage Summary:
- Cause racine du bug : contenus réels (émojis + étiquettes qualifiées + regex non ancrée) contournaient la détection de sections/labels — le remplissage « bête » passait par le repli dégradé
- Le parseur est désormais robuste aux collages ChatGPT/WhatsApp/Word (émojis, séparateurs, libellés qualifiés, articles, pluriels) et extrait plus de champs utiles (scores, lignes dérivées)
- Tous les correctifs sont rétrocompatibles : saisie manuelle inchangée, aucune régression v1/v2/v3

---
Task ID: 19
Agent: Z.ai (main)
Task: Restylisation complète du site selon le HTML de référence NODE47.html (« Trader Intelligence ») — fusion design + conservation de la logique métier (cycle 8h UTC, fenêtre 3 éditions, échelle de mises 0,5/1/1,5/2 u, admin caché).

Work Log:
- Analyse complète de /home/z/my-project/upload/NODE47.html (design system, pages, composants, animations)
- Lecture de tout le code existant (pages, composants, lib, admin, prisma)
- globals.css réécrit : palette dark #0A0E14/#121A24/#00C878 + light #F1F5F2/#FFFFFF/#00834F, couleurs sports (FOOTBALL #22B573/#0E7A47, BASKETBALL #F97316/#C2410C, TENNIS #B8CE24/#55700A), classes design (hero-fx, card-hover, gauge, ticker, live-dot, synthese, cond-panel, nots, text-glow)
- src/app/icon.svg : favicon losange vert
- lib/picks.ts : + SPORT_ABBREVIATIONS (FT/BK/TN), SPORT_TAGLINES, VERDICT_LABELS_SHORT, formatSignedUnits (−/+), formatMatchShort (jj.mm · hh:mm), timeAgoFr, inWordsFr
- Composants : logo losange vert lumineux, sport-icon (icônes du HTML), badges (SportTag coloré, VerdictBadge JE JOUE/SOUS CONDITION, ResultBadge, UpcomingBadge À VENIR, ConfidenceGauge 4 segments lueur, StakeBadge u-chip, CompetitionChip discret), PickCard style tableau de bord (tag sport + comp + date mono, match avec vs atténué, panneau Marché retenu, badges, jauge+confiance+mise, « Publié il y a… »)
- Header glass + nav (Accueil, Football, Basketball, Tennis, Analyses, Performances, À propos) + toggle thème + burger mobile
- Nouveau Ticker « DERNIERS VERDICTS » (8 dernières publications, marquee CSS, pause hover) monté dans (site)/layout.tsx
- Footer : marque + chip 18+ + avertissement + copyright (lien admin volontairement non ajouté — caché du public)
- Accueil : hero aligné à gauche (eyebrow, titre glow, CTA), stats band 5 col (sélections/réussite/en attente/unités nettes/yield sur 30 j), 6 dernières analyses, tuiles Explorer par sport, newsletter (bordure verte + dégradé), Notre approche (quote + 3 étapes), Lire un verdict (v-cards + échelle des mises avec jauges)
- Pages /football /basketball /tennis créées (composant partagé SportPageView : page-hero icône sport colorée + stats, pills filtre verdict, fenêtre publique 3 éditions conservée)
- /analyses restylée (page-hero + pills, logique éditions/filtres inchangée)
- /performance restylée (page-hero + stats band + pnote yield + courbe + tableau historique avec P&L signé)
- Fiche /analyses/[id] : design « modal » (panneau marché 2 col bordure verte, cond-panel ambre, jauge big + mise, Lecture du match, stats en grille valeurs vertes, synthèse panneau vert, note bas de fiche, À VENIR relatif)
- À propos : page-hero + « La thèse » (fusion textes HTML + existants) + « Nos engagements » (4 items .nots du HTML) + tout le contenu existant conservé (publications, privé, comment lire, principes, FAQ, jeu responsable)
- Newsletter fonctionnelle : modèle Prisma NewsletterSubscriber (db push OK), POST /api/newsletter (validation + dédoublonnage, testé : invalide/valide/doublon), NewsletterForm client sur l'accueil, export admin (copier/télécharger .txt)
- Admin : login « Espace rédaction » style gate HTML (losange, cadenas, shake sur erreur), dashboard avec section newsletter ; pick-form et console héritent du nouveau thème via tokens
- layout.tsx : titre « NODE.47 — Trader Intelligence · Analyses sportives & décisions de marché », description du HTML
- Déploiement via miroir /home/z/my-project/scripts/feature-src/restyle/ → cp vers /tmp/my-project (Write/Edit bloqués hors /home/z)
- Contournement ENOTDIR prisma : db push exécuté depuis /home/z avec --schema absolu
- Serveur dev redémarré (setsid, DATABASE_URL file:/tmp/my-project/db/custom.db)
- Vérifications : eslint 0 erreur, tsc 0 erreur, 8 routes 200, API newsletter 3 cas OK, aucune erreur runtime dans dev.log, captures agent-browser dark+light (accueil, cartes, tuiles, newsletter, football, fiche, performance, à-propos, engagements, FAQ, analyses, admin login) dans /home/z/my-project/download/screens-restyle/

Stage Summary:
- Site entièrement restylé « Trader Intelligence » (thème sombre par défaut + thème clair persistant), fidèle au HTML de référence
- Toute la logique métier conservée : 8h UTC, 3 éditions, mises 0,5/1/1,5/2 u, suivi 30 j, admin caché, SEO
- Nouveautés fonctionnelles : pages sport dédiées, ticker, newsletter persistée (SQLite) avec export admin
- Décisions : lien « Espace rédaction » non ajouté au footer public (consigne Task 10) ; pages sport limitées à la fenêtre 3 éditions (cohérence avec la règle du fil public)

---
Task ID: 18
Agent: main
Task: Générer l'archive ZIP du code source téléchargeable (à jour)

Work Log:
- Audit du projet /tmp/my-project (1,6 Go avec node_modules)
- Création du ZIP avec exclusions : node_modules, .next, logs, download interne, screenshots, tool-results, examples, mini-services, .env (secret), miroirs scripts
- Inclusions clés : src/ complet, prisma/schema.prisma, db/, tests/, Dockerfile, docker-compose.yml, .env.example, DEPLOY-VPS.md, DEPLOY-VERCEL.md, INSTALL.txt, scripts/samples
- Vérification : 190 fichiers, 456 Ko, éléments récents présents (analyze-import.ts v2, api/health, guides déploiement)

Stage Summary:
- Archive livrée : /home/z/my-project/download/NODE47-source-code.zip (456 Ko, 190 fichiers)
- Code à jour de toutes les tâches 1 à 17 (import intelligent, badges, SEO, déploiement, /api/health)

---
Task ID: 19
Agent: main
Task: Dédoublonnage des pages + ajout des contacts (email + Telegram avec logos)

Work Log:
- Audit complet des pages publiques (accueil, analyses, performance, sports, à propos, footer) : pages sport déjà factorisées via SportPageView, pas de doublon côté code
- Supprimé section 04 « Lire un verdict NODE.47 » de l'accueil (copie exacte du « Comment lire une sélection » d'À propos) ; remplacée par un lien « Comment lire un verdict NODE.47 » dans la section Notre approche → /a-propos#comment-lire (ancre + scroll-mt-24 ajoutés)
- Supprimé section « Nos engagements » d'À propos (doublon condensé des « Quatre principes non négociables » + bloc Jeu responsable)
- Corrigé le disclaimer footer : les risques étaient cités 2 fois dans le même paragraphe ; réécrit en mention unique
- Nouveau composant src/components/contact-links.tsx : constantes CONTACT_EMAIL / CONTACT_TELEGRAM_URL, GmailIcon (logo officiel multicolore SVG), TelegramIcon (cercle bleu #229ED9 SVG), ContactPills
- Footer (toutes les pages) : rangée « Contact » avec pastilles email + Telegram
- Page À propos : nouvelle section « Une question ? Parlons-en » avec 2 cartes (Email / Telegram) placée entre la FAQ et le Jeu responsable
- Vérifications : eslint 0 erreur, tsc --noEmit 0 erreur, curl HTML OK (accueil sans section 04, à propos sans « Nos engagements », contacts présents), ancre #comment-lire OK, screenshots desktop + mobile (a-propos-contact.png, footer-contacts.png, footer-mobile.png)

Stage Summary:
- Contacts ajoutés partout : node47tradingsportif@gmail.com (mailto:) + t.me/node_47 (target _blank)
- Site dédoublonné : verdicts + échelle des mises documentés à UN seul endroit (À propos), engagements fusionnés dans les principes, disclaimer allégé
- Miroirs sources : /home/z/my-project/scripts/feature-src/redundance/

---
Task ID: 20
Agent: main
Task: Intégration du logo officiel NODE.47 (fourni par l'utilisateur)

Work Log:
- Source : /home/z/my-project/upload/« Logo réseau néon NODE.47.png » (1254x1254, fond marine #030F31, vert #4AFB4A)
- Script /home/z/my-project/scripts/process-logo.py : détection automatique du symbole « 47 » (exclusion du texte), alpha par distance au fond + smoothstep, aplatissement sur le vert de marque
- Généré : public/mark.png (symbole transparent 240px) + src/app/icon.png (favicon 512, fond marine arrondi + liseré vert)
- src/app/icon.svg (ancien losange) supprimé → favicon = icon.png (vérifié : <link rel="icon"> servi 200)
- src/components/logo.tsx : Logo → next/image /mark.png 38px + halo drop-shadow var(--gauge-glow), texte NODE.47 / TRADER INTELLIGENCE conservé ; LogoMark → symbole dans le badge arrondi (admin, taille paramétrable)
- Vérifications : eslint 0, tsc 0, mark.png 200, icon.png 200, captures header sombre + clair + admin login (logo-header-dark.png, logo-header-clair.png, logo-admin.png) — symbole net et lisible sur les deux thèmes
- Miroirs : /home/z/my-project/scripts/logo-out/ (aperçus, logo.tsx, icon-512.png)

Stage Summary:
- Le vrai logo « 47 » en nœuds de réseau est désormais sur : header (toutes pages), footer, console admin, favicon navigateur
- Fichiers à sauvegarder avec le code : public/mark.png, src/app/icon.png, src/components/logo.tsx

---
Task ID: 21
Agent: main
Task: Régénération de l'archive ZIP du code source (avec logo + contacts)

Work Log:
- ZIP régénéré avec les nouveautés Tasks 19-20 : contact-links.tsx, logo.tsx (mark 47), public/mark.png, src/app/icon.png, pages dédoublonnées
- Exclusion supplémentaire : scripts/logo-out/
- Vérifié : 194 fichiers, 1,5 Mo, horodatages des derniers fichiers présents

Stage Summary:
- Archive livrée : /home/z/my-project/download/NODE47-source-code.zip (1,5 Mo, 194 fichiers) — état du site au 22/10 01h32
