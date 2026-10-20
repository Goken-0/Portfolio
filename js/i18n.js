/**
 * ============================================
 * INTERNATIONALISATION (FR / EN)
 * ============================================
 *
 * Le français est la langue source : il vit directement dans index.html.
 * Au premier passage, le contenu français d'origine de chaque nœud annoté est
 * mis en cache. Passer en anglais remplace par le dictionnaire ci-dessous ;
 * revenir au français restaure le cache. Il n'y a donc qu'un seul dictionnaire
 * à maintenir.
 *
 * Annotations disponibles dans le HTML :
 *   data-i18n="cle"              -> remplace innerHTML (les <span>/<br> internes
 *                                   doivent alors figurer dans la traduction)
 *   data-i18n-placeholder="cle"  -> attribut placeholder
 *   data-i18n-title="cle"        -> attribut title
 *   data-i18n-aria="cle"         -> attribut aria-label
 *   data-i18n-alt="cle"          -> attribut alt
 *
 * Les modules qui génèrent du contenu (tps.js, typing.js…) écoutent
 * l'événement `i18n:changed` et se redessinent eux-mêmes.
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'preferred-locale';
    const DEFAULT_LANG = 'fr';
    const SUPPORTED = ['fr', 'en'];

    // ============================================
    // DICTIONNAIRE ANGLAIS
    // ============================================

    const EN = {
        // ---- Méta / document ----
        'meta.title': 'Portfolio - Léo Metgy',
        'meta.description': "Léo Metgy's portfolio, IT student (BTS SIO). Discover my projects, skills and background.",
        'meta.locale': 'en_US',

        // ---- Éléments transverses ----
        'ui.skipLink': 'Skip to content',
        'ui.openMenu': 'Open menu',
        'ui.closeMenu': 'Close menu',
        'ui.backToTop': 'Back to top',
        'ui.noResults': '<i class="fas fa-search"></i> No item in this category.',
        'ui.switchToFr': 'Passer en français',
        'ui.switchToEn': 'Switch to English',
        'ui.viewPdf': 'View PDF',
        'ui.viewSlides': 'View slideshow',
        'ui.viewWord': 'View raw Word file',
        'ui.credit': 'Made with ❤️ by Léo',
        'ui.legal': 'Legal notice',

        // ---- Profil (sidebar) ----
        'profile.photoAlt': 'Profile picture of Léo Metgy',
        'profile.role': 'IT Student (BTS SIO)',
        'profile.home': 'Back to home',
        'profile.linkedin': 'LinkedIn',
        'profile.github': 'GitHub',
        'profile.contact': 'Contact me',

        // ---- Navigation ----
        'nav.home': '<i class="fa-solid fa-house"></i><span>Home</span>',
        'nav.background': '<i class="fa-solid fa-user-graduate"></i><span>Background</span><i class="fa fa-caret-down caret-icon"></i>',
        'nav.experiences': '<i class="fa-solid fa-briefcase"></i>Experience',
        'nav.motivation': '<i class="fa-solid fa-envelope-open-text"></i>Cover letter',
        'nav.work': '<i class="fa-solid fa-layer-group"></i><span>Work</span><i class="fa fa-caret-down caret-icon"></i>',
        'nav.tps': '<i class="fa-solid fa-flask"></i>Labs',
        'nav.projects': '<i class="fa-solid fa-diagram-project"></i>Projects',
        'nav.internships': '<i class="fa-solid fa-briefcase"></i>Internships',
        'nav.skills': '<i class="fa-solid fa-code"></i><span>Skills</span>',
        'nav.watch': '<i class="fa-solid fa-satellite-dish"></i><span>Tech Watch</span>',
        'nav.contact': '<i class="fa-solid fa-envelope"></i><span>Contact</span>',

        // ---- Accueil ----
        'home.title': "Hi, my name is <span>Léo</span>",
        'home.sentence': "I've always been driven by IT: welcome to my digital universe.",
        'home.cta': 'Contact me',
        'home.linkedin': 'LinkedIn profile',
        'home.github': 'GitHub profile',

        // ---- CV ----
        'cv.title': 'My <span>Experience</span>',
        'cv.lede': 'Second-year BTS SIO student, SISR track, at Lycée Saint-Rémi (Amiens).',
        'cv.lede2': 'Focused on network administration and information systems security.',
        'cv.experiences': 'Work experience',
        'cv.formations': 'Education',
        'cv.contact': '<i class="fas fa-envelope" aria-hidden="true"></i> Contact me',

        'cv.exp.somme.title': 'Internship — Network administration',
        'cv.exp.somme.period': 'June 2026',
        'cv.exp.somme.city': 'Amiens',
        'cv.exp.somme.b1': 'Configured Cisco Catalyst 9200 / C1000 switches: VLANs, access &amp; trunk ports, voice VLAN, default route, SNMP, IOS upgrades.',
        'cv.exp.somme.b2': 'Hardened network equipment: DHCP Snooping, Dynamic ARP Inspection, shutdown of unused ports.',
        'cv.exp.somme.b3': 'Alcatel IP telephony (Omnivista 8770): migrated handsets to static IP across several sites.',
        'cv.exp.somme.b4': 'Rolled out Cisco WiFi access points via Catalyst Center, pulled 10G fibre, on-site diagnostics and troubleshooting.',

        'cv.exp.civique.title': 'Civic Service — Digital support',
        'cv.exp.civique.period': 'April – August 2025',
        'cv.exp.civique.city': 'Doullens',
        'cv.exp.civique.b1': 'Helped jobseekers use digital tools and online public services.',
        'cv.exp.civique.b2': 'Explaining technical steps clearly to people with no IT background.',

        'cv.exp.bigard.title': 'Industrial maintenance technician',
        'cv.exp.bigard.period': 'August – October 2024',
        'cv.exp.bigard.city': 'Flixecourt',
        'cv.exp.bigard.b1': 'Worked on production machinery and fixed common breakdowns.',
        'cv.exp.bigard.b2': 'First exposure to teamwork in an industrial environment.',

        'cv.form.bts.title': 'BTS SIO — SISR track',
        'cv.form.bts.period': 'Since 2025',
        'cv.form.psc1.title': 'PSC1 — Level 1 first aid certificate',
        'cv.form.pix.title': 'PIX certification — 206 points',
        'cv.form.bac.title': 'STI2D high school diploma',

        // ---- Lettre de motivation ----
        'motivation.title': 'My <span>Cover Letter</span>',
        'motivation.kicker': 'Looking for a BTS SIO internship',
        'motivation.period': 'From 11 January to 19 February 2027',
        'motivation.objectLabel': 'Subject:',
        'motivation.object': 'Speculative application for an internship — BTS SIO',
        'motivation.role': 'BTS SIO student — SISR track',
        'motivation.contact': '<i class="fas fa-envelope" aria-hidden="true"></i> Contact me',
        'motivation.p0': 'Dear Sir or Madam,',
        'motivation.p1': "I am currently in my second year of BTS SIO, SISR track, at Lycée Saint-Rémi in Amiens. I am looking for a company to host me for an internship from 11 January to 19 February 2027, and I am writing to apply.",
        'motivation.p2': 'Last year I completed my first-year internship with the IT department of the Somme Departmental Council, in the support and network team. I mainly configured Cisco switches, installed WiFi access points and worked on IP telephony. I also took part in troubleshooting across the various sites of the department.',
        'motivation.p3': 'That internship taught me a great deal, both technically and in how to work: troubleshooting methodically, and being careful not to bring a service down while working on it. It confirmed my choice of the SISR track and my wish to work in network administration and IT security.',
        'motivation.p4': 'Before that, I had taught myself to install Windows and various Linux distributions, build PCs and set up everyday software. I also completed a civic service placement helping jobseekers with their online procedures, which taught me to explain things simply.',
        'motivation.p5': 'Today I would like to keep progressing on a real infrastructure and make myself useful on your projects. I am reliable, curious and motivated, and I will commit fully to the tasks entrusted to me.',
        'motivation.p6': 'I remain available for an interview and thank you for the attention given to my application.',
        'motivation.p7': 'Yours faithfully,',

        // ---- Mentions legales ----
        'legal.title': 'Legal <span>Notice</span>',
        'legal.editor.title': 'Site publisher',
        'legal.editor.body': 'This site is a personal portfolio published on a non-professional basis by a private individual, a BTS SIO student. Under article 6-III-2 of French law no. 2004-575 on confidence in the digital economy, the publisher has chosen to remain anonymous to the public; their identity has been provided to the host, who holds it at the disposal of the judicial authorities.',
        'legal.editor.contact': 'For any request, please use the <a href="#contact">contact form</a>.',
        'legal.host.title': 'Hosting provider',
        'legal.host.country': 'United States',
        'legal.host.note': 'The site is published through GitHub Pages.',
        'legal.data.title': 'Personal data',
        'legal.data.purpose': '<strong>Purpose.</strong> The only data collected comes from the contact form (last name, first name, email address, message), for the sole purpose of answering your request. No marketing, no resale, no profiling.',
        'legal.data.basis': '<strong>Legal basis.</strong> The publisher’s legitimate interest in replying to messages addressed to them (article 6.1.f GDPR). No consent is required, since you are the one initiating contact.',
        'legal.data.recipient': '<strong>Recipients.</strong> Messages are routed through Formspree, Inc. (United States), the processor handling form delivery, then reach the publisher by email. No other third party has access to them.',
        'legal.data.retention': '<strong>Retention.</strong> Messages are kept for as long as needed to handle the request, and at most twelve months after the last exchange.',
        'legal.data.rights': '<strong>Your rights.</strong> You have the right to access, rectify, erase, restrict and object to the processing of your data. To exercise it, write via the <a href="#contact">contact form</a>. You may also lodge a complaint with the French data protection authority, the CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener">cnil.fr</a>).',
        'legal.cookies.title': 'Cookies and trackers',
        'legal.cookies.body': '<strong>This site sets no cookies</strong> and uses no analytics, no ad network and no third-party share buttons.',
        'legal.cookies.storage': 'Three items are saved in your browser’s local storage, purely to make the site work: the language you picked, the audio player state, and the timestamp of your last message (to limit repeated submissions). This data never leaves your device and allows no tracking whatsoever. As such, it is exempt from consent.',
        'legal.cookies.thirdparty': 'No external resource is loaded: fonts and icons are hosted on this site. No third party receives your IP address when you browse it.',
        'legal.ip.title': 'Intellectual property',
        'legal.ip.body': 'The code and editorial content of this site belong to its publisher. The Poppins typeface and Font Awesome icons are used under the SIL Open Font License 1.1. Lab reports are published for educational purposes.',
        'legal.liability.title': 'Liability',
        'legal.liability.body': 'Information is published for guidance only and may change. Links to third-party sites are provided for reference; the publisher has no control over their content and cannot be held responsible for it.',

        // ---- TPs ----
        'tps.title': 'My <span>Labs</span>',
        'tps.subtitle': 'Practical work completed during my BTS SIO',
        'tps.sectionTitle': '<i class="fas fa-folder-open"></i> All labs',
        'tps.filter.all': '<i class="fas fa-th"></i> All',
        'tps.filter.virtualisation': '<i class="fas fa-desktop"></i> Virtualization',
        'tps.filter.linux': '<i class="fab fa-linux"></i> Linux',
        'tps.filter.scripting': '<i class="fas fa-terminal"></i> Scripting',
        'tps.filter.reseau': '<i class="fas fa-network-wired"></i> Networking',
        'tps.filter.hardware': '<i class="fas fa-microchip"></i> Hardware',
        'tps.filter.bdd': '<i class="fas fa-database"></i> Databases',

        // ---- Projets ----
        'projets.title': 'My <span>Projects</span>',
        'projets.subtitle': 'Personal creations and technical achievements',
        'projets.sectionTitle': '<i class="fas fa-folder-open"></i> All projects',
        'projets.filter.all': '<i class="fas fa-th"></i> All',
        'projets.filter.web': '<i class="fas fa-globe"></i> Web',
        'projets.filter.reseau': '<i class="fas fa-network-wired"></i> Networking',
        'projets.filter.systeme': '<i class="fas fa-server"></i> Systems',
        'projets.filter.securite': '<i class="fas fa-shield-alt"></i> Security',
        'projets.filter.logiciel': '<i class="fas fa-laptop-code"></i> Software',

        'projets.featured.badge': '<i class="fas fa-star"></i> Flagship Project',
        'projets.nas.alt': 'DIY NAS project - Network Attached Storage',
        'projets.nas.desc': 'NAS server built from a Dell Optiplex 3050 desktop, running OpenMediaVault together with CasaOS (for the interface).<br><br>Click the <strong>"View PDF"</strong> button for more details.',
        'projets.nas.statProject': 'Project:',
        'projets.nas.statProjectValue': 'NAS server',
        'projets.nas.statType': 'Type:',
        'projets.nas.statTypeValue': 'Systems &amp; Networking',
        'projets.nas.statStatus': 'Status:',
        'projets.nas.statStatusValue': 'Completed',
        'projets.nas.viewPdf': '<i class="fas fa-eye"></i> View PDF',

        'projets.filecompressor.badge': 'Software',
        'projets.filecompressor.alt': 'FileCompressor - compression application',
        'projets.filecompressor.desc': 'File compression software (PDF, images, documents)<br>High-performance desktop app with a modern interface',
        'projets.filecompressor.date': '<i class="far fa-calendar"></i> April 2026',
        'projets.filecompressor.repo': 'GitHub repo',

        'projets.securepass.badge': 'Web',
        'projets.securepass.alt': 'Secure_Pass_Gen - password generator',
        'projets.securepass.desc': 'Secure password generator<br>NO LOG (CLIENT SIDE ONLY)',
        'projets.securepass.date': '<i class="far fa-calendar"></i> December 2025',

        'projets.tangle.badge': 'Web',
        'projets.tangle.alt': 'The Tangle - Snake game',
        'projets.tangle.desc': 'Snake game<br>Built with JavaScript, HTML and CSS',
        'projets.tangle.date': '<i class="far fa-calendar"></i> December 2025',

        'projets.spaceinvaders.badge': 'Web',
        'projets.spaceinvaders.alt': 'Space Invaders - retro game',
        'projets.spaceinvaders.desc': 'Space Invaders game<br>Built with JavaScript, HTML and CSS',
        'projets.spaceinvaders.date': '<i class="far fa-calendar"></i> December 2025',

        'projets.nascard.badge': 'Systems &amp; Networking',
        'projets.nascard.alt': 'DIY NAS running OpenMediaVault',
        'projets.nascard.desc': 'NAS server built from a Dell Optiplex 3050 desktop, running OpenMediaVault together with CasaOS (for the interface).<br><br>Click the <strong>"external link"</strong> button for more details.',
        'projets.nascard.date': '<i class="far fa-calendar"></i> January 2026',

        'projets.thinkpad.badge': 'Systems &amp; Networking',
        'projets.thinkpad.alt': 'Refurbished ThinkPad T490',
        'projets.thinkpad.desc': 'A refurbishing and system configuration project to build my own working environment.<br><br>Click the <strong>"external link"</strong> button for more details.',
        'projets.thinkpad.date': '<i class="far fa-calendar"></i> May 2026',

        // ---- Stages ----
        'stages.title': 'My <span>Internships</span>',
        'stages.subtitle': 'Professional path and rewarding experiences',
        'stages.somme.desc': 'Four-week internship at the IT department of the Somme Departmental Council.',
        'stages.somme.missionsTitle': '<i class="fas fa-tasks"></i> Assignments completed',
        'stages.somme.m1': 'User support and assistance',
        'stages.somme.m2': 'Networking and voice over IP (VoIP)',
        'stages.somme.m3': 'Security: tiered model and phishing',
        'stages.somme.m4': 'Cisco switch and VLAN configuration',
        'stages.somme.tagSecurity': 'Security',
        'stages.somme.tagDeploy': 'Deployment',
        'stages.somme.report': '<i class="fas fa-book-open"></i> Read the internship report',

        // ---- Compétences ----
        'competences.title': 'My <span>Skills</span>',
        'competences.subtitle': 'What I can do, and where I learned it',
        'competences.stat.tps': 'labs completed',
        'competences.stat.weeks': 'weeks in an IT department',
        'competences.stat.domains': 'technical areas',
        'competences.domains': 'Areas',
        'competences.src.stage': 'Internship',

        'competences.tool.fibre': '10G fibre',
        'competences.tool.tiers': 'Tiering',
        'competences.tool.wifi': 'Access points',

        'competences.reseau.title': 'Networking',
        'competences.reseau.tps': '5 labs',
        'competences.securite.title': 'Security',
        'competences.securite.tps': '3 labs',
        'competences.securite.extra': 'ANSSI MOOC',
        'competences.telecom.title': 'IP telephony &amp; WiFi',
        'competences.systeme.title': 'Systems &amp; virtualisation',
        'competences.systeme.tps': '12 labs',
        'competences.scripting.title': 'Scripting',
        'competences.scripting.tps': '7 labs',
        'competences.dev.title': 'Development',
        'competences.dev.tps': '1 lab',
        'competences.dev.projects': 'Personal projects',

        'competences.stage.label': 'In the field',
        'competences.stage.meta': 'June 2026 · 4 weeks · Amiens',
        'competences.mission.switch': 'Catalyst switches',
        'competences.mission.secu': 'DHCP Snooping &amp; DAI',
        'competences.mission.voip': 'Alcatel IP telephony',
        'competences.mission.wifi': 'Access points',
        'competences.mission.fibre': '10G fibre',
        'competences.mission.support': 'On-site support',
        'competences.stage.report': 'Internship report <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>',
        'competences.stage.more': 'Internships page <i class="fas fa-arrow-right" aria-hidden="true"></i>',

        'competences.soft.label': 'Approach',
        'competences.soft.diag': 'Methodical troubleshooting',
        'competences.soft.service': 'Service continuity',
        'competences.soft.pedago': 'Teaching',
        'competences.soft.auto': 'Self-reliance',

        'competences.reseau.desc': 'Configuring, segmenting and troubleshooting a corporate network, from the switch to the workstation.',
        'competences.securite.desc': 'Shrinking an infrastructure\'s attack surface and raising user awareness.',
        'competences.telecom.desc': 'Deploying and maintaining communication services across several sites.',
        'competences.systeme.desc': 'Installing, virtualising and administering workstations and servers, Windows and Linux alike.',
        'competences.scripting.desc': 'Automating routine tasks and administering from the command line.',
        'competences.dev.desc': 'Building web tools and applications, structuring data.',
        'competences.stage.intro': 'First-year internship in the support and network team, on a multi-site infrastructure.',
        'competences.mission.switch.desc': 'VLANs, access and trunk ports, voice VLAN, SNMP, IOS upgrades.',
        'competences.mission.secu.desc': 'Hardening switches and shutting down unused ports.',
        'competences.mission.voip.desc': 'Moving desk phones to static IP through OmniVista 8770.',
        'competences.mission.wifi.desc': 'Deploying Cisco access points through Catalyst Center.',
        'competences.mission.fibre.desc': 'Pulling fibre links between network equipment.',
        'competences.mission.support.desc': 'On-site user assistance and troubleshooting.',
        'competences.soft.diag.desc': 'Tracking a fault down step by step, layer by layer.',
        'competences.soft.service.desc': 'Working on live equipment without cutting users off.',
        'competences.soft.pedago.desc': 'Explaining things simply to non-technical people.',
        'competences.soft.auto.desc': 'Self-taught: operating systems, PC building, personal projects.',

        'competences.certs.label': 'Certifications',
        'competences.certs.anssi': 'Obtained',
        'competences.certs.viewCert': 'View certificate',
        'competences.certs.cisco': 'In progress',
        'competences.certs.ciscoSite': 'Cisco NetAcad website',

        // ---- Veille ----
        'veille.title': '<span class="title-main">Tech</span> <span class="title-accent">Watch</span>',
        'veille.subtitle': 'Exploring and analysing emerging technologies',
        'veille.intro': 'As part of my studies, I actively monitor two key areas: <strong>graphics cards</strong> and <strong>artificial intelligence</strong>. This lets me stay up to date with innovations and analyse market trends.',

        'veille.gpu.heading': 'Graphics Cards',
        'veille.gpu.tag': 'Hardware &amp; Performance',
        'veille.gpu.contextTitle': '<i class="fas fa-info-circle"></i> Context',
        'veille.gpu.context': 'I regularly follow Nvidia and AMD GPU releases: performance, power efficiency, ray tracing, upscaling (DLSS/FSR) and pricing. <strong>As of late 2026, no new gaming card has launched</strong>: the RTX 60 series has been pushed back to 2028 and RDNA 5 is not expected before 2027. This match-up therefore remains the mid-range benchmark, but the memory shortage has sent prices soaring.',
        'veille.gpu.nvidiaName': 'Palit GeForce RTX 5060 Ti 16 GB',
        'veille.gpu.amdName': 'Sapphire Radeon RX 9060 XT 16 GB',
        'veille.gpu.statPerf': '1080p performance',
        'veille.gpu.statPower': 'Power draw',
        'veille.gpu.statTemp': 'Temperature',
        'veille.gpu.statPrice': 'Price (Aug 2026)',
        'veille.gpu.strengths': 'Strengths',
        'veille.gpu.limits': 'Limitations',
        'veille.gpu.nv1': '<i class="fas fa-check"></i> DLSS 4 and excellent ray tracing',
        'veille.gpu.nv2': '<i class="fas fa-check"></i> Recent NVENC encoders',
        'veille.gpu.nv3': '<i class="fas fa-check"></i> Solid power efficiency',
        'veille.gpu.nv4': '<i class="fas fa-check"></i> Good creation/streaming support',
        'veille.gpu.nvLimit': '<i class="fas fa-minus"></i> Steep price rise in 2026 (+50%)',
        'veille.gpu.amd1': '<i class="fas fa-check"></i> 16 GB VRAM',
        'veille.gpu.amd2': '<i class="fas fa-check"></i> Excellent rasterisation',
        'veille.gpu.amd3': '<i class="fas fa-check"></i> Vendor-agnostic FSR 4',
        'veille.gpu.amd4': '<i class="fas fa-check"></i> Smaller price increase (+36%)',
        'veille.gpu.amdLimit': '<i class="fas fa-minus"></i> Weaker ray tracing',
        'veille.gpu.analysisTitle': '<i class="fas fa-chart-line"></i> Comparative analysis',
        'veille.gpu.analysis': 'At launch prices, the RTX 5060 Ti delivered roughly <strong>10% more performance</strong> with slightly lower power draw, while the RX 9060 XT stood out with <strong>lower temperatures</strong> and better value for money.<br><br>In 2026 the picture changed: the memory shortage, driven by AI data-centre demand, pushed the RTX 5060 Ti from $429 to around $650, against roughly $475 for the RX 9060 XT. Paying <strong>nearly 40% more for 10% more performance</strong> no longer makes sense: the RX 9060 XT becomes the default pick, with the RTX still relevant for anyone set on DLSS 4 and ray tracing.',
        'veille.gpu.source': '<i class="fas fa-database"></i> <span>Testing: <a href="https://www.techpowerup.com/" target="_blank" rel="noopener">TechPowerUp</a> · Prices: <a href="https://thepcenthusiast.com/gpu-prices-2026-rtx-50-rx-9000-price-increase/" target="_blank" rel="noopener">The PC Enthusiast</a> (Aug 2026, US prices) · Roadmap: <a href="https://www.thefpsreview.com/2026/03/23/no-new-rtx-gaming-gpus-in-2026-rtx-60-series-pushed-to-2028/" target="_blank" rel="noopener">The FPS Review</a></span>',
        'veille.gpu.nvidiaAlt': 'NVIDIA RTX GPU architecture',
        'veille.gpu.nvidiaCaption': 'NVIDIA RTX architecture',
        'veille.gpu.amdAlt': 'AMD RX GPU architecture',
        'veille.gpu.amdCaption': 'AMD RDNA 4 architecture',

        'veille.ai.heading': 'Artificial Intelligence',
        'veille.ai.tag': 'Conversational Models',
        'veille.ai.contextTitle': '<i class="fas fa-info-circle"></i> Context',
        'veille.ai.statIndex': 'Intelligence Index (AA)',
        'veille.ai.statTaskCost': 'Cost per task (index)',
        'veille.ai.context': 'I track how conversational AI models evolve by looking at answer quality, reasoning ability, multimodal vision and real cost in use. I always compare models <strong>from equivalent tiers</strong>: pitting a specialised model against a generalist, or a flagship against an entry-level model, tells you nothing you can act on.',
        'veille.ai.statContext': 'Context window',
        'veille.ai.statPrice': 'Price (input / output)',
        'veille.ai.features': 'Features',
        'veille.ai.bestFor': 'Best for',
        'veille.ai.claude1': '<i class="fas fa-brain"></i> Adaptive thinking, adjustable effort (low → max)',
        'veille.ai.claude2': '<i class="fas fa-gauge-high"></i> Output 30% faster than Sonnet 5',
        'veille.ai.claude3': '<i class="fas fa-terminal"></i> 70.6% on Terminal-Bench 4.0 (Sonnet 5: 10.3%)',
        'veille.ai.claude4': '<i class="fas fa-tags"></i> Full 1M context at standard pricing',
        'veille.ai.claudeUse1': '<i class="fas fa-check-circle"></i> Agentic coding and multi-file refactors',
        'veille.ai.claudeUse2': '<i class="fas fa-check-circle"></i> Long-document analysis and code review',
        'veille.ai.claudeUse3': '<i class="fas fa-check-circle"></i> Long contexts with no surcharge',
        'veille.ai.gpt1': '<i class="fas fa-layer-group"></i> The mid tier, between Astra and Luna',
        'veille.ai.gpt2': '<i class="fas fa-bullseye"></i> Fewer factual errors (11.4% → 7.7%)',
        'veille.ai.gpt3': '<i class="fas fa-database"></i> Prompt cache at $0.10 per million',
        'veille.ai.gpt4': '<i class="fas fa-exclamation-triangle"></i> Input billed ×2 beyond 272K tokens',
        'veille.ai.gptUse1': '<i class="fas fa-check-circle"></i> High volumes on a tight budget',
        'veille.ai.gptUse2': '<i class="fas fa-check-circle"></i> Codex and command-line workflows',
        'veille.ai.gptUse3': '<i class="fas fa-check-circle"></i> OpenAI ecosystem and tooling',
        'veille.ai.analysisTitle': '<i class="fas fa-chart-line"></i> Comparative analysis (2026)',
        'veille.ai.analysis': 'Sonnet 5.5 and GPT-6.1 Sol are both the <strong>mid-tier model</strong> of their family, released one day apart in late September 2026 at exactly the same price ($2 / $10 per million tokens).<br><br>On Artificial Analysis\'s Intelligence Index, an independent measurement, <strong>Claude Sonnet 5.5</strong> beats Sol at max effort (56 vs 52). But <strong>GPT-6.1 Sol</strong> is more than 7 times cheaper per task ($0.72 vs $5.46), because it uses far fewer tokens. On long context, Anthropic bills a 900K request at the same rate as a 9K one, whereas OpenAI doubles the input price beyond 272K. In short: Sonnet 5.5 for maximum quality and long documents, Sol for high volumes on a tight budget.',
        'veille.ai.caveat': '<i class="fas fa-triangle-exclamation"></i> <span>Methodological caveat: index scores come from <a href="https://artificialanalysis.ai/" target="_blank" rel="noopener">Artificial Analysis</a> (independent measurement, max effort). The other figures are published by the vendors themselves and have not been independently reproduced.</span>',
        'veille.ai.claudeAlt': 'Claude AI interface',
        'veille.ai.claudeCaption': 'Claude Sonnet 5.5 — Quality &amp; long contexts',
        'veille.ai.gptAlt': 'GPT logo',
        'veille.ai.gptCaption': 'GPT-6.1 Sol — Efficiency &amp; cost per task',
        'veille.ai.techReportAnthropic': 'Artificial Analysis measurement',
        'veille.ai.techReportOpenai': 'Artificial Analysis measurement',

        'veille.method.title': '<i class="fas fa-microscope"></i> Watch Methodology',
        'veille.method.sources': 'Sources',
        'veille.method.hardware': '<i class="fas fa-microchip"></i> Hardware',
        'veille.method.hardwareText': "TechPowerUp, VideoCardz, Tom's Hardware, tech channels (Gamers Nexus, Hardware Unboxed).",
        'veille.method.ai': '<i class="fas fa-brain"></i> Artificial Intelligence',
        'veille.method.aiText': 'OpenAI and Anthropic documentation, Artificial Analysis and LMArena.',
        'veille.method.frequency': 'Frequency',
        'veille.method.weekly': '<i class="fas fa-sync-alt"></i> Weekly routine',
        'veille.method.weeklyText': 'Reviewing RSS feeds and technical newsletters every Monday morning.',
        'veille.method.monthly': '<i class="fas fa-file-alt"></i> Monthly summary',
        'veille.method.monthlyText': 'Writing a summary of the major trends and updating the portfolio.',
        'veille.method.tools': 'Tools',
        'veille.method.benchmarking': '<i class="fas fa-tachometer-alt"></i> Benchmarking',
        'veille.method.benchmarkingText': '3DMark, Cinebench (GPU), Artificial Analysis and LMArena (AI).',
        'veille.method.organisation': '<i class="fas fa-folder-open"></i> Organisation',
        'veille.method.organisationText': 'Feedly, Notion and GitHub.',

        // ---- Contact ----
        'contact.title': 'Contact <span>Me</span>',
        'contact.name': 'Last name',
        'contact.firstname': 'First name',
        'contact.email': 'Email',
        'contact.emailAria': 'Email address',
        'contact.message': 'Your message',
        'contact.namePattern': 'Letters, spaces, hyphens and apostrophes only',
        'contact.submit': 'Send',
        'contact.privacy': 'Your details are used solely to answer your message and are never resold or used for advertising. Full details of processing and of your rights in the <a href="#mentions">legal notice</a>.',
        'contact.sending': 'Sending…',
        'contact.success': 'Message sent, thank you!',
        'contact.invalidEmail': 'Please enter a valid email address',
        'contact.invalidName': 'Please enter a real name: this entry does not look like one.',
        'contact.emailTypo': 'Did you mean {s}? Fix it, or send again to confirm your address.',
        'contact.rateLimit': 'Too many messages sent in a short time. Please wait a few minutes before trying again.',
        'contact.throttle': 'Please wait another {s} seconds before sending again.',
        'contact.error': 'Something went wrong. Try again or reach me on LinkedIn.',
        'contact.network': 'Unable to send the message. Check your connection.',

        // ---- Modale de zoom (CV / lettre de motivation) ----
        'modal.cv': 'Resume',
        'modal.lm': 'Cover Letter',
        'modal.document': 'Document',
        'modal.close': 'Close',
        'modal.zoomIn': 'Zoom in',
        'modal.zoomOut': 'Zoom out',
        'modal.fit': 'Fit',
        'modal.download': 'Download',

        // ---- Lecteur de musique ----
        'music.prev': 'Previous track',
        'music.play': 'Play / pause',
        'music.next': 'Next track',
        'music.volume': 'Volume',
        'music.loop': 'Repeat',

        // Le texte rotatif de l'accueil vit dans js/typing.js : il lui faut
        // un tableau de mots complet plutôt que des clés isolées.

        // ---- Contenu généré : TPs ----
        'tps.badge.systeme': 'System',
        'tps.badge.materiel': 'Hardware',
        'tps.badge.scripting': 'Scripting',
        'tps.badge.bdd': 'Database',
        'tps.badge.reseau': 'Networking',
        'tps.badge.virtualisation': 'Virtualization',
        'tps.badge.linux': 'Linux'
    };

    // ============================================
    // MOTEUR
    // ============================================

    // Sélecteurs annotés -> nom de l'attribut cible ('' = innerHTML)
    const TARGETS = [
        ['data-i18n', ''],
        ['data-i18n-placeholder', 'placeholder'],
        ['data-i18n-title', 'title'],
        ['data-i18n-aria', 'aria-label'],
        ['data-i18n-alt', 'alt']
    ];

    // Cache du texte français d'origine : clé = élément, valeur = { attr: texte }
    const originals = new WeakMap();

    let currentLang = DEFAULT_LANG;

    function readStoredLang() {
        let stored = null;
        try {
            stored = localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            // localStorage indisponible (mode privé strict) : on reste en mémoire
        }
        if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;

        const browser = (navigator.language || '').slice(0, 2).toLowerCase();
        return SUPPORTED.indexOf(browser) !== -1 ? browser : DEFAULT_LANG;
    }

    function storeLang(lang) {
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) {
            // ignoré volontairement
        }
    }

    function readCurrent(el, attr) {
        return attr === '' ? el.innerHTML : el.getAttribute(attr);
    }

    function writeCurrent(el, attr, value) {
        if (attr === '') el.innerHTML = value;
        else el.setAttribute(attr, value);
    }

    /**
     * Applique la langue à un élément annoté.
     * Le contenu français est mémorisé au premier appel : c'est lui qui sert
     * de "traduction" pour le retour en FR, aucun dictionnaire français requis.
     */
    function applyToElement(el, dataAttr, targetAttr, lang) {
        const key = el.getAttribute(dataAttr);
        if (!key) return;

        let cache = originals.get(el);
        if (!cache) {
            cache = {};
            originals.set(el, cache);
        }
        if (!(targetAttr in cache)) {
            cache[targetAttr] = readCurrent(el, targetAttr);
        }

        if (lang === 'fr') {
            writeCurrent(el, targetAttr, cache[targetAttr]);
            return;
        }

        const translated = EN[key];
        if (translated === undefined) {
            // Clé manquante : on garde le français plutôt que d'afficher un trou
            console.warn('[i18n] clé manquante : ' + key);
            return;
        }
        writeCurrent(el, targetAttr, translated);
    }

    /**
     * (Re)traduit un sous-arbre. Appelé sur tout le document au démarrage,
     * puis sur les fragments injectés (lecteur de musique, cartes de TPs…).
     */
    function translate(root, lang) {
        const scope = root || document.body;
        if (!scope) return;

        TARGETS.forEach(function (pair) {
            const dataAttr = pair[0];
            const targetAttr = pair[1];
            const selector = '[' + dataAttr + ']';

            if (scope.nodeType === 1 && scope.hasAttribute(dataAttr)) {
                applyToElement(scope, dataAttr, targetAttr, lang);
            }
            scope.querySelectorAll(selector).forEach(function (el) {
                applyToElement(el, dataAttr, targetAttr, lang);
            });
        });
    }

    function applyDocumentMeta(lang) {
        document.documentElement.lang = lang;
        document.title = lang === 'en' ? EN['meta.title'] : 'Portfolio - Léo Metgy';

        const description = document.querySelector('meta[name="description"]');
        if (description && lang === 'en') description.content = EN['meta.description'];

        const ogLocale = document.querySelector('meta[property="og:locale"]');
        if (ogLocale) ogLocale.content = lang === 'en' ? EN['meta.locale'] : 'fr_FR';
    }

    function updateSwitcher(lang) {
        document.querySelectorAll('.lang-btn').forEach(function (btn) {
            const isActive = btn.dataset.lang === lang;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }

    function setLang(lang, options) {
        if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT_LANG;
        currentLang = lang;

        // Le meta doit passer avant `translate` : la balise <title> n'est pas
        // annotée, elle est pilotée directement par applyDocumentMeta.
        applyDocumentMeta(lang);
        translate(document.body, lang);
        updateSwitcher(lang);

        if (!options || options.persist !== false) storeLang(lang);

        document.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang: lang } }));
    }

    // ============================================
    // API PUBLIQUE
    // ============================================

    window.i18n = {
        get lang() {
            return currentLang;
        },
        set: setLang,
        /** Traduction d'une clé unique, utilisable depuis n'importe quel module. */
        t: function (key, frenchFallback) {
            if (currentLang === 'en' && EN[key] !== undefined) return EN[key];
            return frenchFallback !== undefined ? frenchFallback : (EN[key] || key);
        },
        /** Retraduit un fragment fraîchement injecté dans le DOM. */
        apply: function (root) {
            translate(root, currentLang);
        }
    };

    // ============================================
    // INITIALISATION
    // ============================================

    function bindSwitcher() {
        document.querySelectorAll('.lang-btn').forEach(function (btn) {
            btn.onclick = function () {
                const lang = btn.dataset.lang;
                if (lang && lang !== currentLang) setLang(lang);
            };
        });
    }

    function init() {
        currentLang = readStoredLang();
        bindSwitcher();
        // persist:false — une langue déduite du navigateur ne doit pas être
        // gravée dans localStorage tant que l'utilisateur n'a pas choisi.
        setLang(currentLang, { persist: false });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Fragments réinjectés par le routeur SPA (lecteur de musique notamment)
    document.addEventListener('spa-page-loaded', function () {
        bindSwitcher();
        translate(document.body, currentLang);
    });
})();
