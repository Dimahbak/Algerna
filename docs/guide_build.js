/**
 * Génère le GUIDE D'UTILISATION ALGERNA en PDF via Puppeteer
 * Les captures sont encodées en base64 dans le HTML pour un rendu autonome
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUT_PDF = path.join(__dirname, 'GUIDE_UTILISATION_ALGERNA.pdf');
const CAP = path.join(__dirname, 'guide_captures');

function img(name) {
  const p = path.join(CAP, name);
  if (!fs.existsSync(p)) return '';
  const b64 = fs.readFileSync(p).toString('base64');
  return `data:image/png;base64,${b64}`;
}

function imgTag(name, caption, maxW) {
  const src = img(name);
  if (!src) return `<p class="caption" style="color:#999;">[Capture non disponible : ${name}]</p>`;
  const w = maxW || 680;
  return `<div class="screenshot"><img src="${src}" style="max-width:${w}px;width:100%;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.12);"/><p class="caption">${caption}</p></div>`;
}

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<style>
  @page { size: A4; margin: 25mm 20mm 25mm 20mm; }
  @page :first { margin-top: 0; }
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; line-height: 1.6; font-size: 11pt; }
  h1 { color: #063B5A; font-size: 22pt; border-bottom: 3px solid #0D9488; padding-bottom: 8px; page-break-before: always; margin-top: 40px; }
  h1:first-of-type { page-break-before: avoid; }
  h2 { color: #074A6E; font-size: 16pt; margin-top: 28px; border-left: 4px solid #0D9488; padding-left: 12px; }
  h3 { color: #0D9488; font-size: 13pt; margin-top: 20px; }
  .cover { page-break-after: always; text-align: center; padding-top: 120px; }
  .cover h1 { font-size: 32pt; border: none; page-break-before: avoid; color: #063B5A; }
  .cover .sub { font-size: 16pt; color: #666; margin-top: 12px; }
  .cover .date { font-size: 12pt; color: #999; margin-top: 40px; }
  .toc { page-break-after: always; }
  .toc h1 { page-break-before: avoid; }
  .toc ul { list-style: none; padding: 0; }
  .toc li { padding: 6px 0; border-bottom: 1px dotted #ccc; }
  .toc li a { text-decoration: none; color: #063B5A; font-weight: 600; }
  .toc li.sub { padding-left: 24px; font-weight: 400; }
  .toc li.sub a { font-weight: 400; color: #333; }
  .steps { background: #f0fdf4; border-radius: 10px; padding: 16px 20px; margin: 12px 0; border-left: 4px solid #0D9488; }
  .steps ol { margin: 0; padding-left: 20px; }
  .steps li { margin: 6px 0; }
  .screenshot { text-align: center; margin: 16px 0; }
  .caption { font-size: 9pt; color: #666; font-style: italic; margin-top: 6px; }
  .info { background: #EFF6FF; border-radius: 8px; padding: 12px 16px; margin: 12px 0; border-left: 4px solid #3B82F6; font-size: 10pt; }
  .warn { background: #FEF3C7; border-radius: 8px; padding: 12px 16px; margin: 12px 0; border-left: 4px solid #F59E0B; font-size: 10pt; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 10pt; }
  th { background: #063B5A; color: white; padding: 8px 12px; text-align: left; }
  td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
  tr:nth-child(even) { background: #f9fafb; }
  .role-header { background: linear-gradient(90deg, #063B5A, #0D9488); color: white; padding: 16px 24px; border-radius: 12px; margin: 20px 0 16px; }
  .role-header h1 { color: white; border: none; page-break-before: always; margin: 0; font-size: 20pt; }
  .role-header p { color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 11pt; }
  .footer { text-align: center; font-size: 9pt; color: #999; margin-top: 40px; padding-top: 12px; border-top: 1px solid #e5e7eb; }
</style>
</head>
<body>

<!-- ═══ COUVERTURE ═══ -->
<div class="cover">
  <h1>Guide d'utilisation<br/>ALGERNA</h1>
  <div class="sub">Plateforme citoyenne — Wilaya d'Alger</div>
  <p style="margin-top:60px;font-size:13pt;color:#555;">
    Ce guide explique pas à pas comment utiliser ALGERNA<br/>
    pour chaque type d'utilisateur.
  </p>
  <div class="date">Version 1.0 — Juillet 2026</div>
</div>

<!-- ═══ SOMMAIRE ═══ -->
<div class="toc">
  <h1 id="sommaire">Sommaire</h1>
  <ul>
    <li><a href="#partieA">A — Prise en main commune</a></li>
    <li class="sub"><a href="#a1">Qu'est-ce qu'ALGERNA ?</a></li>
    <li class="sub"><a href="#a2">Se connecter</a></li>
    <li class="sub"><a href="#a3">Mot de passe oublié</a></li>
    <li class="sub"><a href="#a4">Changer de langue (français / arabe)</a></li>
    <li class="sub"><a href="#a5">Naviguer dans l'application</a></li>
    <li><a href="#partieB">B — Chapitres par rôle</a></li>
    <li class="sub"><a href="#b1">B1 — Citoyen</a></li>
    <li class="sub"><a href="#b2">B2 — Agent de réception</a></li>
    <li class="sub"><a href="#b3">B3 — Superviseur Wilaya</a></li>
    <li class="sub"><a href="#b4">B4 — Superviseur Commune</a></li>
    <li class="sub"><a href="#b5">B5 — Agent CAP (Corps des Agents de Proximité)</a></li>
    <li class="sub"><a href="#b6">B6 — Services techniques (EPIC)</a></li>
    <li class="sub"><a href="#b7">B7 — Cabinet — CCOE (Coordination des Chantiers sur les Événements)</a></li>
  </ul>
</div>

<!-- ═══════════════════════════════════════════════════════════════ -->
<!-- PARTIE A — PRISE EN MAIN COMMUNE -->
<!-- ═══════════════════════════════════════════════════════════════ -->
<h1 id="partieA">A — Prise en main commune</h1>

<h2 id="a1">Qu'est-ce qu'ALGERNA ?</h2>
<p>ALGERNA est la plateforme numérique de la Wilaya d'Alger. Elle permet aux citoyens de signaler des problèmes dans leur quartier (route abîmée, éclairage en panne, propreté…) et aux services de la ville de traiter ces signalements.</p>
<p>Chaque utilisateur a un rôle précis :</p>
<table>
  <tr><th>Rôle</th><th>Ce qu'il fait</th></tr>
  <tr><td>Citoyen</td><td>Signale un problème, suit son dossier, consulte les infos de son quartier</td></tr>
  <tr><td>Agent de réception</td><td>Reçoit et qualifie les signalements entrants</td></tr>
  <tr><td>Superviseur</td><td>Pilote l'activité (dossiers, délais, performances) à l'échelle de la Wilaya ou d'une commune</td></tr>
  <tr><td>Agent CAP</td><td>Intervient sur le terrain pour constater ou résoudre un problème</td></tr>
  <tr><td>Service technique (EPIC)</td><td>Traite les dossiers dans son domaine : eau, propreté, voirie, éclairage, parkings, patrimoine</td></tr>
  <tr><td>Cabinet (CCOE)</td><td>Coordonne les chantiers lors d'événements officiels</td></tr>
</table>

<h2 id="a2">Se connecter</h2>
${imgTag('login_desktop.png', 'Écran de connexion sur ordinateur', 600)}
<div class="steps"><ol>
  <li>Ouvrez votre navigateur et allez sur l'adresse d'ALGERNA.</li>
  <li>Entrez votre <strong>numéro de téléphone</strong> (ou votre adresse email).</li>
  <li>Entrez votre <strong>mot de passe</strong>.</li>
  <li>Appuyez sur le bouton <strong>« Se connecter »</strong>.</li>
  <li>Vous arrivez sur votre écran d'accueil, adapté à votre rôle.</li>
</ol></div>
<div class="info">Sur téléphone, l'écran de connexion est identique. ALGERNA s'adapte automatiquement à la taille de votre écran.</div>
${imgTag('login_mobile.png', 'Écran de connexion sur téléphone', 280)}

<h2 id="a3">Mot de passe oublié</h2>
<div class="steps"><ol>
  <li>Sur l'écran de connexion, appuyez sur <strong>« Mot de passe oublié ? »</strong>.</li>
  <li>Entrez votre <strong>adresse email</strong> liée à votre compte.</li>
  <li>Appuyez sur <strong>« Envoyer le lien »</strong>.</li>
  <li>Consultez votre boîte email. Ouvrez le message d'ALGERNA et cliquez sur le lien.</li>
  <li>Choisissez un <strong>nouveau mot de passe</strong> (au moins 6 caractères).</li>
  <li>Validez. Vous pouvez maintenant vous connecter avec le nouveau mot de passe.</li>
</ol></div>
<div class="warn">Le lien de réinitialisation expire au bout d'une heure et ne peut être utilisé qu'une seule fois.</div>

<h2 id="a4">Changer de langue (français / arabe)</h2>
<div class="steps"><ol>
  <li>En haut à droite de l'écran, repérez les boutons <strong>FR</strong> et <strong>AR</strong>.</li>
  <li>Appuyez sur <strong>AR</strong> pour passer en arabe, ou sur <strong>FR</strong> pour revenir en français.</li>
  <li>Toute l'interface change immédiatement de langue et de sens de lecture.</li>
</ol></div>

<h2 id="a5">Naviguer dans l'application</h2>
<h3>Sur ordinateur</h3>
<p>Le <strong>menu latéral</strong> (à gauche) liste les modules accessibles selon votre rôle. Cliquez sur un élément pour ouvrir la page correspondante. Votre nom et avatar apparaissent en haut à droite : cliquez dessus pour accéder à votre profil, vos paramètres ou vous déconnecter.</p>
<h3>Sur téléphone</h3>
<p><strong>Citoyens :</strong> utilisez la <strong>barre de navigation en bas</strong> de l'écran (Démarches, Signaler, Houma, Suivi, Impact, Accueil).</p>
<p><strong>Agents et superviseurs :</strong> appuyez sur le bouton <strong>☰</strong> (trois lignes horizontales) en haut à gauche pour ouvrir le menu. Appuyez en dehors du menu pour le refermer.</p>
${imgTag('citoyen_accueil.png', 'Navigation citoyen sur téléphone — barre en bas', 280)}

<!-- ═══════════════════════════════════════════════════════════════ -->
<!-- PARTIE B — CHAPITRES PAR RÔLE -->
<!-- ═══════════════════════════════════════════════════════════════ -->

<!-- ─── B1. CITOYEN ─── -->
<div class="role-header"><h1 id="b1">B1 — Citoyen</h1><p>Signaler, suivre, participer à la vie de son quartier</p></div>

<h2>Votre accueil</h2>
<p>Après connexion, vous voyez votre page d'accueil avec un message de bienvenue, la météo du jour, et un raccourci « Je signale ». Plus bas, vous trouverez vos services et l'actualité de votre quartier.</p>
${imgTag('citoyen_home.png', 'Page d\'accueil citoyen (téléphone)', 280)}

<h2>Créer un signalement</h2>
<div class="steps"><ol>
  <li>Appuyez sur <strong>« Je signale »</strong> (sur l'accueil ou dans la barre du bas).</li>
  <li>Choisissez la <strong>catégorie</strong> du problème (voirie, propreté, éclairage, eau…).</li>
  <li>Choisissez la <strong>sous-catégorie</strong> précise.</li>
  <li>Décrivez le problème en quelques mots dans le champ <strong>description</strong>.</li>
  <li>Prenez une <strong>photo</strong> en appuyant sur « Ajouter une photo » (facultatif mais recommandé).</li>
  <li>Indiquez l'<strong>emplacement</strong> : la carte se positionne automatiquement sur votre position. Déplacez le point si nécessaire.</li>
  <li>Appuyez sur <strong>« Envoyer »</strong>.</li>
  <li>Votre signalement reçoit un <strong>numéro de référence</strong>. Conservez-le pour le suivi.</li>
</ol></div>
${imgTag('citoyen_signaler.png', 'Formulaire de signalement', 280)}

<h2>Suivre son dossier</h2>
<div class="steps"><ol>
  <li>Appuyez sur <strong>« Suivi »</strong> dans la barre du bas.</li>
  <li>La liste de vos signalements s'affiche, du plus récent au plus ancien.</li>
  <li>Chaque carte montre le <strong>statut</strong> (en attente, en cours, résolu) et la date.</li>
  <li>Appuyez sur un signalement pour voir les détails et l'historique des actions.</li>
</ol></div>
${imgTag('citoyen_mes-signalements.png', 'Suivi de mes signalements', 280)}

<h2>Consulter Ma Houma (mon quartier)</h2>
<p>Appuyez sur <strong>« Houma »</strong> dans la barre du bas. La carte affiche les signalements et les équipements publics autour de vous. Vous pouvez zoomer, filtrer par catégorie, et consulter les détails en appuyant sur un point.</p>
${imgTag('citoyen_carte.png', 'Carte Ma Houma', 280)}

<h2>Lire les communiqués</h2>
<p>Les communiqués officiels de la Wilaya sont accessibles depuis le menu. Ils contiennent les annonces importantes : travaux, événements, alertes.</p>
${imgTag('citoyen_communiques.png', 'Communiqués officiels', 280)}

<h2>Autres rubriques</h2>
<p><strong>Infos utiles :</strong> informations pratiques sur les services de la ville.</p>
<p><strong>Je participe :</strong> consultations citoyennes et sondages.</p>
<p><strong>Mon impact :</strong> votre score de participation citoyenne et vos badges.</p>
${imgTag('citoyen_sentinelle.png', 'Mon impact citoyen', 280)}

<!-- ─── B2. AGENT DE RÉCEPTION ─── -->
<div class="role-header"><h1 id="b2">B2 — Agent de réception</h1><p>Recevoir, qualifier et orienter les signalements</p></div>

<h2>Votre écran principal</h2>
<p>Après connexion, vous accédez à votre <strong>tableau de bord</strong>. Il affiche vos compteurs du jour (dossiers reçus, à qualifier, en suivi, en retard), vos actions rapides, et la carte des signalements de votre périmètre.</p>
${imgTag('agent_bo-agent.png', 'Tableau de bord de l\'agent de réception', 680)}

<h2>Traiter un signalement</h2>
<div class="steps"><ol>
  <li>Appuyez sur <strong>« Ouvrir le Board »</strong> pour voir la liste complète des signalements.</li>
  <li>Cliquez sur un signalement pour ouvrir sa <strong>fiche détaillée</strong> (volet à droite).</li>
  <li>Vérifiez les informations : photo, catégorie, localisation, description.</li>
  <li>Si le signalement est valide, appuyez sur <strong>« Qualifier »</strong> et choisissez la catégorie précise.</li>
  <li>Ajoutez une <strong>explication</strong> si nécessaire (ce que le citoyen verra).</li>
  <li>Le dossier est automatiquement transmis au service compétent.</li>
</ol></div>
<div class="info">Si un signalement n'est pas recevable, vous pouvez le <strong>classer sans suite</strong> en indiquant le motif. Le citoyen sera informé.</div>

<!-- ─── B3. SUPERVISEUR WILAYA ─── -->
<div class="role-header"><h1 id="b3">B3 — Superviseur Wilaya</h1><p>Piloter l'ensemble du territoire depuis la Salle de Commandement</p></div>

<h2>La Salle de Commandement (SdC)</h2>
<p>Votre écran principal est la <strong>Salle de Commandement</strong>. C'est le tableau de pilotage central qui regroupe toutes les informations clés du territoire.</p>
${imgTag('sup_wilaya_bo-executive.png', 'Salle de Commandement — Wilaya (haut de page)', 680)}
<p>Vous y trouvez :</p>
<ul>
  <li>L'<strong>ICUA</strong> (Indice Citoyen Urbain ALGERNA) : un score de 0 à 100 qui mesure la qualité globale des services publics.</li>
  <li>Les <strong>situations prioritaires</strong> : alertes urgentes et dossiers critiques.</li>
  <li>Les compteurs : dossiers ouverts, résolus, engagement de délai (SLA — engagement de traitement sous 48 h).</li>
  <li>La <strong>carte opérationnelle</strong> avec tous les signalements en temps réel.</li>
</ul>
${imgTag('sup_wilaya_bo-executive_scroll.png', 'Salle de Commandement — carte et EPIC', 680)}
<p>En bas de page, la section <strong>« Les EPIC en un coup d'œil »</strong> montre la performance de chaque service technique (EPIC — Établissement Public à caractère Industriel et Commercial) : eau, propreté, voirie, éclairage, parkings.</p>

<h2>Générer un rapport</h2>
<div class="steps"><ol>
  <li>Dans le menu latéral, appuyez sur <strong>« Rapports »</strong>.</li>
  <li>Choisissez la <strong>période</strong> (7 jours, 30 jours, trimestre, année).</li>
  <li>Si besoin, filtrez par <strong>commune</strong>.</li>
  <li>Choisissez la <strong>langue</strong> (FR ou AR).</li>
  <li>Appuyez sur <strong>« Générer le rapport »</strong>.</li>
  <li>Le rapport au format PDF se télécharge. Il contient 8 sections : synthèse, performances, zones récurrentes, catégories, satisfaction, tendances, situations notables.</li>
</ol></div>
${imgTag('sup_wilaya_rapports.png', 'Écran de génération des rapports', 680)}

<h2>Annuaire des organisations</h2>
<p>L'<strong>annuaire</strong> liste toutes les organisations actives sur le territoire : services communaux, EPIC, directions. Vous y trouvez les contacts et les périmètres de chacun.</p>
${imgTag('sup_wilaya_annuaire.png', 'Annuaire des organisations', 680)}

<h2>Communiqués</h2>
<p>En tant que superviseur Wilaya, vous pouvez <strong>rédiger et publier</strong> des communiqués officiels. Les superviseurs communaux peuvent soumettre des projets, mais seule la Wilaya publie.</p>
${imgTag('sup_wilaya_admin-communiques.png', 'Gestion des communiqués', 680)}

<!-- ─── B4. SUPERVISEUR COMMUNE ─── -->
<div class="role-header"><h1 id="b4">B4 — Superviseur Commune</h1><p>Piloter l'activité de sa commune (APC — Assemblée Populaire Communale)</p></div>

<h2>Votre Salle de Commandement</h2>
<p>Vous accédez à la même Salle de Commandement que le superviseur Wilaya, mais <strong>filtrée sur votre commune</strong>. Tous les chiffres, la carte et les alertes ne concernent que votre périmètre.</p>
${imgTag('sup_commune_bo-executive.png', 'SdC filtrée sur la commune', 680)}

<h2>Rapports et communiqués</h2>
<p>Vous pouvez générer des rapports pour votre commune et soumettre des projets de communiqués (la publication est réservée à la Wilaya).</p>
${imgTag('sup_commune_rapports.png', 'Rapports de la commune', 680)}

<!-- ─── B5. AGENT CAP ─── -->
<div class="role-header"><h1 id="b5">B5 — Agent CAP</h1><p>Corps des Agents de Proximité — interventions sur le terrain</p></div>

<h2>Votre écran de missions</h2>
<p>Après connexion, vous voyez vos <strong>missions du jour</strong> : les interventions qui vous sont assignées. Chaque mission précise le lieu, le type de problème et les consignes.</p>
${imgTag('cap_bo-cap.png', 'Écran d\'accueil de l\'agent CAP', 680)}

<h2>Réaliser une mission</h2>
<div class="steps"><ol>
  <li>Appuyez sur une mission pour ouvrir sa fiche.</li>
  <li>Rendez-vous sur place.</li>
  <li>Constatez la situation et prenez des <strong>photos</strong>.</li>
  <li>Remplissez le <strong>compte-rendu</strong> : ce que vous avez observé ou fait.</li>
  <li>Appuyez sur <strong>« Envoyer le rapport »</strong>.</li>
  <li>La mission passe au statut « terminée » et le superviseur est notifié.</li>
</ol></div>
${imgTag('cap_bo-cap_scroll.png', 'Carte des missions et détails', 680)}

<!-- ─── B6. SERVICES TECHNIQUES (EPIC) ─── -->
<div class="role-header"><h1 id="b6">B6 — Services techniques (EPIC)</h1><p>Traiter les dossiers dans son domaine d'expertise</p></div>

<p>Les <strong>EPIC</strong> (Établissements Publics à caractère Industriel et Commercial) sont les services de la ville spécialisés dans un domaine. Chaque agent EPIC voit uniquement les dossiers de son domaine.</p>

<table>
  <tr><th>Service</th><th>Domaine</th><th>Exemples de signalements traités</th></tr>
  <tr><td>Eau et assainissement</td><td>Réseau d'eau</td><td>Fuite d'eau, regard ouvert, canalisation bouchée</td></tr>
  <tr><td>Propreté et collecte</td><td>Déchets</td><td>Dépôt sauvage, poubelle débordante, nettoyage</td></tr>
  <tr><td>Voirie et transport</td><td>Routes</td><td>Nid-de-poule, trottoir cassé, signalisation</td></tr>
  <tr><td>Éclairage public</td><td>Lumières</td><td>Lampadaire en panne, câble apparent</td></tr>
  <tr><td>Stationnement</td><td>Parkings</td><td>Barrière bloquée, horodateur en panne</td></tr>
  <tr><td>Patrimoine et espaces verts</td><td>Parcs, bâtiments</td><td>Arbre dangereux, banc cassé, dégradation</td></tr>
</table>

<h2>Votre tableau de bord</h2>
<p>Le tableau de bord affiche les dossiers <strong>de votre domaine uniquement</strong>. Vous ne voyez pas les dossiers des autres services.</p>
${imgTag('epic_eau_bo-agent.png', 'Tableau de bord — Service Eau', 680)}
${imgTag('epic_proprete_bo-agent.png', 'Tableau de bord — Service Propreté', 680)}

<h2>Traiter un dossier</h2>
<div class="steps"><ol>
  <li>Ouvrez un dossier en cliquant dessus dans la liste.</li>
  <li>Consultez la fiche : description, photo, localisation.</li>
  <li>Planifiez l'intervention si nécessaire.</li>
  <li>Une fois le problème résolu, appuyez sur <strong>« Résoudre »</strong> et décrivez ce qui a été fait.</li>
  <li>Le citoyen est automatiquement notifié de la résolution.</li>
</ol></div>

<h3>Cas particulier : Stationnement (CiviPark)</h3>
<p>Le service Stationnement dispose d'un module dédié pour la gestion des parkings, des cartes d'abonnement et du registre des véhicules.</p>
${imgTag('epic_parkings_civipark.png', 'Module CiviPark — Stationnement', 680)}

<h3>Cas particulier : Patrimoine</h3>
<p>Le service Patrimoine dispose d'un module dédié pour le suivi des bâtiments, espaces verts et équipements publics.</p>
${imgTag('epic_patrimoine_patrimoine.png', 'Module Patrimoine', 680)}

<h2>Mes chantiers (CCOE)</h2>
<p>Si le Cabinet vous a transmis un <strong>ordre de mission</strong> lié à un événement, vous le retrouvez dans <strong>« Mes chantiers »</strong>. Vous pouvez y remplir la checklist, envoyer des photos et accuser réception. Ce point est détaillé dans le chapitre Cabinet/CCOE.</p>

<!-- ─── B7. CABINET — CCOE ─── -->
<div class="role-header"><h1 id="b7">B7 — Cabinet — CCOE</h1><p>Coordination des Chantiers sur les Événements officiels</p></div>

<p>Le <strong>CCOE</strong> (Coordination des Chantiers sur les Événements) est le module du Cabinet de la Wilaya. Il permet d'organiser la préparation d'événements officiels : visites ministérielles, fêtes nationales, inaugurations…</p>

<h2>Votre écran principal</h2>
${imgTag('cabinet_ccoe.png', 'Écran CCOE — liste des événements', 680)}
<p>Vous voyez la liste de tous les événements créés, avec leur type, leur date, et l'état d'avancement (nombre de chantiers transmis, accusés de réception reçus).</p>

<h2>Créer un événement</h2>
<div class="steps"><ol>
  <li>Appuyez sur <strong>« + Nouvel événement »</strong>.</li>
  <li>Choisissez le <strong>type</strong> (visite officielle, fête nationale, inauguration, salon, cérémonie, compétition sportive, conseil, ou autre).</li>
  <li>Entrez le <strong>titre</strong> de l'événement.</li>
  <li>Sélectionnez les <strong>dates</strong> (un seul jour ou plusieurs jours avec plages horaires).</li>
  <li>Décrivez les <strong>consignes générales</strong>.</li>
  <li>Optionnel : tracez l'<strong>itinéraire</strong> et les <strong>zones</strong> concernées sur la carte.</li>
  <li>Appuyez sur <strong>« Créer »</strong>.</li>
  <li>Les chantiers (tâches par service) sont générés automatiquement.</li>
</ol></div>

<h2>Transmettre les ordres de mission</h2>
<div class="steps"><ol>
  <li>Ouvrez un événement.</li>
  <li>Appuyez sur <strong>« Transmettre »</strong>.</li>
  <li>Une fenêtre s'ouvre avec la liste des services. Cochez ceux que vous souhaitez notifier.</li>
  <li>Appuyez sur <strong>« Confirmer la transmission »</strong>.</li>
  <li>Chaque service reçoit une notification dans l'application et un email.</li>
</ol></div>

<h2>Suivre les accusés de réception</h2>
<p>Après transmission, chaque ordre de mission passe par trois états :</p>
<table>
  <tr><th>État</th><th>Signification</th><th>Couleur</th></tr>
  <tr><td>Transmis</td><td>L'ordre a été envoyé au service</td><td>Gris</td></tr>
  <tr><td>Vu</td><td>Le responsable a ouvert le dossier (automatique)</td><td>—</td></tr>
  <tr><td>Accusé</td><td>Le responsable a confirmé la prise en charge</td><td>Vert</td></tr>
</table>
<p>Le <strong>tableau de suivi</strong> affiche l'état de chaque service. Les ordres non accusés depuis plus de 24 heures passent en orange, puis en rouge. Vous pouvez <strong>relancer</strong> les services silencieux.</p>
${imgTag('cabinet_ccoe_scroll.png', 'Suivi des événements et chantiers', 680)}

<h2>Valider les travaux</h2>
<div class="steps"><ol>
  <li>Quand un service a terminé sa checklist et demande la validation, vous recevez une notification.</li>
  <li>Ouvrez le chantier et vérifiez le travail (photos, commentaires).</li>
  <li>Appuyez sur <strong>« Valider »</strong> pour confirmer, ou <strong>« Refuser »</strong> en indiquant le motif.</li>
  <li>La validation se fait en deux niveaux : un premier responsable valide, puis un second confirme.</li>
</ol></div>
<div class="warn">Le Cabinet ne peut pas accuser réception à la place d'un service. Seul le responsable du service concerné peut le faire.</div>

<!-- ═══ PIED DE PAGE ═══ -->
<div class="footer">
  Guide d'utilisation ALGERNA — Version 1.0 — Juillet 2026<br/>
  Plateforme citoyenne — Wilaya d'Alger
</div>

</body>
</html>`;

(async () => {
  console.log('Building PDF...');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await new Promise(r => setTimeout(r, 3000)); // let images render
  await page.pdf({
    path: OUT_PDF,
    format: 'A4',
    printBackground: true,
    margin: { top: '25mm', bottom: '25mm', left: '20mm', right: '20mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: '<div style="width:100%;text-align:center;font-size:9px;color:#999;padding:0 20mm;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
  });
  await browser.close();
  const size = fs.statSync(OUT_PDF).size;
  console.log(`PDF generated: ${OUT_PDF} (${(size/1024/1024).toFixed(1)} MB)`);
})();
