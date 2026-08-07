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
        'competences.subtitle': 'Technical and professional know-how from my BTS SIO',
        'competences.sectionTitle': '<i class="fas fa-toolbox"></i> All my skills',
        'competences.filter.all': '<i class="fas fa-th"></i> All',
        'competences.filter.dev': '<i class="fas fa-code"></i> Development',
        'competences.filter.reseau': '<i class="fas fa-network-wired"></i> Networking',
        'competences.filter.systeme': '<i class="fas fa-server"></i> Systems',
        'competences.filter.securite': '<i class="fas fa-shield-alt"></i> Security',

        'competences.featured.badge': '<i class="fas fa-star"></i> Core Skill',
        'competences.featured.alt': 'HTML5/CSS3 logo',
        'competences.featured.desc': 'Learning web development during the first year of my BTS SIO. Discovering front-end and back-end technologies, building web pages and getting started with databases.',
        'competences.featured.statTraining': 'Training',
        'competences.featured.statTrainingValue': 'Ongoing',
        'competences.featured.statYear': 'BTS SIO',
        'competences.featured.statYearValue': '1st year',
        'competences.featured.statLevel': 'Level',
        'competences.featured.statLevelValue': 'Improving',
        'competences.featured.tagResponsive': 'Responsive',

        'competences.badge.dev': 'Development',
        'competences.badge.security': 'Cybersecurity',
        'competences.badge.network': 'Networking',
        'competences.learning': '<i class="fas fa-signal"></i> Learning',

        'competences.htmlcss.desc': 'Learning to build structured web pages. Discovering responsive design and CSS fundamentals.',
        'competences.htmlcss.tagResponsive': 'Responsive',
        'competences.js.alt': 'JavaScript logo',
        'competences.js.desc': 'Introduction to JavaScript programming, DOM manipulation and event handling.',
        'competences.anssi.title': '<i class="fas fa-shield-alt"></i> ANSSI MOOC',
        'competences.anssi.alt': 'SecNumAcadémie logo',
        'competences.anssi.desc': 'Certified training on digital security fundamentals: authentication, internet security, workstations and mobile working.',
        'competences.anssi.tagHygiene': 'Digital Hygiene',
        'competences.anssi.status': '<i class="fas fa-check-circle" style="color: #3caee4;"></i> Certificate obtained',
        'competences.anssi.viewCert': 'View certificate',
        'competences.anssi.official': 'Official website',
        'competences.cisco.alt': 'Cisco logo',
        'competences.cisco.desc': 'Introduction to networking: architectures, OSI and TCP/IP models, IPv4/IPv6 addressing and basic router and switch configuration.',
        'competences.cisco.tagAddressing': 'IP Addressing',
        'competences.cisco.status': '<i class="fas fa-spinner fa-spin"></i> In progress',
        'competences.cisco.site': 'Cisco NetAcad website',

        // ---- Veille ----
        'veille.title': '<span class="title-main">Tech</span> <span class="title-accent">Watch</span>',
        'veille.subtitle': 'Exploring and analysing emerging technologies',
        'veille.intro': 'As part of my studies, I actively monitor two key areas: <strong>graphics cards</strong> and <strong>artificial intelligence</strong>. This lets me stay up to date with innovations and analyse market trends.',

        'veille.gpu.heading': 'Graphics Cards',
        'veille.gpu.tag': 'Hardware &amp; Performance',
        'veille.gpu.contextTitle': '<i class="fas fa-info-circle"></i> Context',
        'veille.gpu.context': 'I regularly follow Nvidia and AMD GPU releases to analyse performance, power efficiency, ray tracing, upscaling technologies (DLSS/FSR) and software support.',
        'veille.gpu.nvidiaName': 'Palit GeForce RTX 5060 Ti 16 GB',
        'veille.gpu.amdName': 'Sapphire Radeon RX 9060 XT 16 GB',
        'veille.gpu.statPerf': '1080p performance',
        'veille.gpu.statPower': 'Power draw',
        'veille.gpu.statTemp': 'Temperature',
        'veille.gpu.strengths': 'Strengths',
        'veille.gpu.limits': 'Limitations',
        'veille.gpu.nv1': '<i class="fas fa-check"></i> DLSS 4 and excellent ray tracing',
        'veille.gpu.nv2': '<i class="fas fa-check"></i> Recent NVENC encoders',
        'veille.gpu.nv3': '<i class="fas fa-check"></i> Solid power efficiency',
        'veille.gpu.nv4': '<i class="fas fa-check"></i> Good creation/streaming support',
        'veille.gpu.nvLimit': '<i class="fas fa-minus"></i> Generally higher price',
        'veille.gpu.amd1': '<i class="fas fa-check"></i> 16 GB VRAM',
        'veille.gpu.amd2': '<i class="fas fa-check"></i> Excellent rasterisation',
        'veille.gpu.amd3': '<i class="fas fa-check"></i> Vendor-agnostic FSR 4',
        'veille.gpu.amd4': '<i class="fas fa-check"></i> Competitive price/performance ratio',
        'veille.gpu.amdLimit': '<i class="fas fa-minus"></i> Weaker ray tracing',
        'veille.gpu.analysisTitle': '<i class="fas fa-chart-line"></i> Comparative analysis',
        'veille.gpu.analysis': 'The RTX 5060 Ti delivers roughly <strong>10% more performance</strong> with slightly lower power draw, but runs hotter. The RX 9060 XT stands out with <strong>lower temperatures</strong> and excellent value for money. The choice mostly comes down to the preferred software ecosystem (DLSS vs FSR) and the available budget.',
        'veille.gpu.source': '<i class="fas fa-database"></i> Data from <a href="https://www.techpowerup.com/" target="_blank" rel="noopener">TechPowerUp</a>',
        'veille.gpu.nvidiaAlt': 'NVIDIA RTX GPU architecture',
        'veille.gpu.nvidiaCaption': 'NVIDIA RTX architecture',
        'veille.gpu.amdAlt': 'AMD RX GPU architecture',
        'veille.gpu.amdCaption': 'AMD RDNA 4 architecture',

        'veille.ai.heading': 'Artificial Intelligence',
        'veille.ai.tag': 'Conversational Models',
        'veille.ai.contextTitle': '<i class="fas fa-info-circle"></i> Context',
        'veille.ai.context': 'I track how conversational AI models evolve by looking at answer quality, reasoning ability, multimodal vision and real cost in use. I always compare models <strong>from equivalent tiers</strong>: pitting a specialised model against a generalist, or a flagship against an entry-level model, tells you nothing you can act on.',
        'veille.ai.statTerminal': 'Terminal-Bench 2.1',
        'veille.ai.statContext': 'Context window',
        'veille.ai.statPrice': 'Price (input / output)',
        'veille.ai.features': 'Features',
        'veille.ai.bestFor': 'Best for',
        'veille.ai.claude1': '<i class="fas fa-brain"></i> Adaptive thinking on by default',
        'veille.ai.claude2': '<i class="fas fa-sliders-h"></i> Adjustable effort dial (low → max)',
        'veille.ai.claude3': '<i class="fas fa-image"></i> High-resolution vision (2576 px)',
        'veille.ai.claude4': '<i class="fas fa-tags"></i> Near Opus 4.8 quality at Sonnet pricing',
        'veille.ai.claudeUse1': '<i class="fas fa-check-circle"></i> Agentic coding and multi-file refactors',
        'veille.ai.claudeUse2': '<i class="fas fa-check-circle"></i> Code review and bug hunting',
        'veille.ai.claudeUse3': '<i class="fas fa-check-circle"></i> Long contexts with no surcharge',
        'veille.ai.gpt1': '<i class="fas fa-layer-group"></i> The balanced tier, between Sol and Luna',
        'veille.ai.gpt2': '<i class="fas fa-project-diagram"></i> Natively omnimodal architecture',
        'veille.ai.gpt3': '<i class="fas fa-database"></i> Prompt caching (−90% on reads)',
        'veille.ai.gpt4': '<i class="fas fa-exclamation-triangle"></i> Surcharge beyond 272K tokens',
        'veille.ai.gptUse1': '<i class="fas fa-check-circle"></i> Everyday general-purpose use',
        'veille.ai.gptUse2': '<i class="fas fa-check-circle"></i> Command-line workflows',
        'veille.ai.gptUse3': '<i class="fas fa-check-circle"></i> OpenAI ecosystem and tooling',
        'veille.ai.analysisTitle': '<i class="fas fa-chart-line"></i> Comparative analysis (2026)',
        'veille.ai.analysis': 'I deliberately compared two models <strong>from the same tier</strong>: Sonnet 5 and Terra are both the balanced model of their family, at an identical output price ($15 per million tokens). Putting Sonnet 5 up against the GPT-5.6 Sol flagship ($5 / $30) would have said nothing useful.<br><br><strong>GPT-5.6 Terra</strong> leads Sonnet 5 on Terminal-Bench 2.1 (84.3% vs 80.4%) and has cheaper input. <strong>Claude Sonnet 5</strong> takes the lead back on long context: OpenAI applies a surcharge beyond 272K tokens, whereas Anthropic bills a 900K-token request at the same rate as a 9K one. The choice therefore comes down mostly to the size of the contexts you handle.',
        'veille.ai.caveat': '<i class="fas fa-triangle-exclamation"></i> Methodological caveat: these scores are published by the vendors themselves, on different test harnesses. They give an order of magnitude, not a strictly comparable measurement.',
        'veille.ai.claudeAlt': 'Claude AI interface',
        'veille.ai.claudeCaption': 'Claude Sonnet 5 — Agentic coding',
        'veille.ai.gptAlt': 'GPT logo',
        'veille.ai.gptCaption': 'GPT-5.6 Terra — General-purpose &amp; omnimodal',
        'veille.ai.techReportAnthropic': 'Anthropic technical report',
        'veille.ai.techReportOpenai': 'OpenAI technical report',

        'veille.method.title': '<i class="fas fa-microscope"></i> Watch Methodology',
        'veille.method.sources': 'Sources',
        'veille.method.hardware': '<i class="fas fa-microchip"></i> Hardware',
        'veille.method.hardwareText': "TechPowerUp, VideoCardz, Tom's Hardware, tech channels (Gamers Nexus, Hardware Unboxed).",
        'veille.method.ai': '<i class="fas fa-brain"></i> Artificial Intelligence',
        'veille.method.aiText': 'OpenAI and Anthropic documentation, LMARENA',
        'veille.method.frequency': 'Frequency',
        'veille.method.weekly': '<i class="fas fa-sync-alt"></i> Weekly routine',
        'veille.method.weeklyText': 'Reviewing RSS feeds and technical newsletters every Monday morning.',
        'veille.method.monthly': '<i class="fas fa-file-alt"></i> Monthly summary',
        'veille.method.monthlyText': 'Writing a summary of the major trends and updating the portfolio.',
        'veille.method.tools': 'Tools',
        'veille.method.benchmarking': '<i class="fas fa-tachometer-alt"></i> Benchmarking',
        'veille.method.benchmarkingText': '3DMark, Cinebench (GPU) and LMSYS Arena.',
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
