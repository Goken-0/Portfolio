/**
 * ============================================
 * AFFICHAGE DES TRAVAUX PRATIQUES (TPs)
 * ============================================
 *
 * Ce fichier génère les cartes de travaux pratiques dans une grille.
 * Chaque TP est affiché dans une carte avec une image, un titre, une description
 * et un lien vers le PDF.
 *
 * Fonctionnalités :
 * - Génération dynamique de cartes en grille
 * - Images pour chaque TP
 * - Lien vers le PDF dans un nouvel onglet
 * - Bilingue : chaque TP porte sa traduction anglaise (titre_en / description_en)
 *   et la grille est redessinée quand la langue change (événement i18n:changed)
 */

(function() {

    // ============================================
    // LISTE DES PROJETS/TPs
    // ============================================
    // Tableau contenant tous les travaux pratiques avec leurs informations
    // Correspondance badge → catégorie pour le filtrage
    const badgeToCategory = {
        'Système': 'scripting',
        'Matériel': 'hardware',
        'Scripting': 'scripting',
        'Base de données': 'base-de-donnees',
        'Réseau': 'reseau',
        'Virtualisation': 'virtualisation',
        'Linux': 'linux'
    };

    // Badge français → clé de traduction (voir js/i18n.js)
    const badgeToKey = {
        'Système': 'tps.badge.systeme',
        'Matériel': 'tps.badge.materiel',
        'Scripting': 'tps.badge.scripting',
        'Base de données': 'tps.badge.bdd',
        'Réseau': 'tps.badge.reseau',
        'Virtualisation': 'tps.badge.virtualisation',
        'Linux': 'tps.badge.linux'
    };

    const projets = [
        {
            titre: "TP 1 - Installation d'une VM",
            titre_en: "Lab 1 - Installing a VM",
            description: "Comment installer une machine virtuelle sous Windows ?",
            description_en: "How do you install a virtual machine on Windows?",
            fichier: "assets/pdf/TP_Installation_VM.pdf",
            image: "assets/images/vm.jpg",
            badge: "Système",
            categories: ["virtualisation"]
        },
        {
            titre: "TP 2 - Découverte du CMD",
            titre_en: "Lab 2 - Discovering CMD",
            description: "Les commandes de base dans le CMD",
            description_en: "Basic commands in the Windows command prompt",
            fichier: "assets/pdf/Tp_Invite_Commande.pdf",
            image: "assets/images/cmd.jpg",
            badge: "Système",
            categories: ["scripting"]
        },
        {
            titre: "TP 3 - Découverte du Powershell",
            titre_en: "Lab 3 - Discovering PowerShell",
            description: "Les commandes de base dans le Powershell",
            description_en: "Basic commands in PowerShell",
            fichier: "assets/pdf/TP_Powershell.pdf",
            image: "assets/images/powershell.jpg",
            badge: "Système",
            categories: ["scripting"]
        },
        {
            titre: "TP 4 - Conception PC",
            titre_en: "Lab 4 - Building a PC",
            description: "Création d'un ordinateur et choix des composants selon le besoin",
            description_en: "Assembling a computer and picking components to match the requirements",
            fichier: "assets/pdf/TP_Config.pdf",
            image: "assets/images/pc.jpg",
            badge: "Matériel",
            categories: ["hardware"]
        },
        {
            titre: "TP 5 - Découverte des scripts .bat",
            titre_en: "Lab 5 - Discovering .bat scripts",
            description: "Création d'un script .bat et maîtrise du CMD",
            description_en: "Writing a .bat script and mastering the command prompt",
            fichier: "assets/pdf/TP_Script_Bat.pdf",
            image: "assets/images/bat.jpg",
            badge: "Scripting",
            categories: ["scripting"]
        },
        {
            titre: "TP 6 - Découverte d'une base de données",
            titre_en: "Lab 6 - Discovering databases",
            description: "Comment est composée une base de données ?",
            description_en: "What is a database made of?",
            fichier: "assets/pdf/TD_1_BD.pdf",
            image: "assets/images/basedonnees.jpg",
            badge: "Base de données",
            categories: ["base-de-donnees"]
        },
        {
            titre: "TP 7 - Commandes CMD",
            titre_en: "Lab 7 - CMD commands",
            description: "Commandes CMD Essentielles du Support Informatique",
            description_en: "Essential command-prompt commands for IT support",
            fichier: "assets/pdf/TP_Commandes_Avancees.pdf",
            image: "assets/images/commandescmd.jpg",
            badge: "Scripting",
            categories: ["scripting"]
        },
        {
            titre: "TP 8 - Problème réseau",
            titre_en: "Lab 8 - Network troubleshooting",
            description: "Diagnostic et Réparation d'un Problème de Connexion Réseau",
            description_en: "Diagnosing and fixing a network connectivity issue",
            fichier: "assets/pdf/TP_problemesreseaux.pdf",
            image: "assets/images/problemesreseaux.jpg",
            badge: "Réseau",
            categories: ["reseau"]
        },
        {
            titre: "TP 9 - Commandes PowerShell",
            titre_en: "Lab 9 - PowerShell commands",
            description: "Interface en ligne de commande",
            description_en: "Command-line interface",
            fichier: "assets/pdf/TP_commandespowershell.pdf",
            image: "assets/images/commandespowershell.jpg",
            badge: "Scripting",
            categories: ["scripting"]
        },
        {
            titre: "TP 10 - Première Connexion Linux",
            titre_en: "Lab 10 - First Linux login",
            description: "Configuration générale de l'OS, c'est à dire résolution écran, disposition clavier...",
            description_en: "General OS setup: screen resolution, keyboard layout and so on",
            fichier: "assets/pdf/TP_PremiereConnexionLinux.pdf",
            image: "assets/images/linux.jpg",
            badge: "Virtualisation",
            categories: ["virtualisation", "linux"]
        },
        {
            titre: "TP 11 - GuestAdditions",
            titre_en: "Lab 11 - Guest Additions",
            description: "Installation des GuestAdditions sur Oracle VirtualBox",
            description_en: "Installing Guest Additions on Oracle VirtualBox",
            fichier: "assets/pdf/TP_GuestAdditions.pdf",
            image: "assets/images/guestadditions.jpg",
            badge: "Virtualisation",
            categories: ["virtualisation"]
        },
        {
            titre: "TP 12 - Xubuntu",
            titre_en: "Lab 12 - Xubuntu",
            description: "Installation de l'OS Xubuntu sur Oracle VirtualBox",
            description_en: "Installing the Xubuntu OS on Oracle VirtualBox",
            fichier: "assets/pdf/TP_Xubuntu.pdf",
            image: "assets/images/xubuntu.jpg",
            badge: "Virtualisation",
            categories: ["virtualisation", "linux"]
        },
        {
            titre: "TP 13 - Gestion des utilisateurs",
            titre_en: "Lab 13 - User management",
            description: "Configuration des permissions, création d'utilisateurs, de groupes...",
            description_en: "Setting permissions, creating users and groups, and more",
            fichier: "assets/pdf/TP_GestionUtilisateurs.pdf",
            image: "assets/images/gestionutilisateurs.jpg",
            badge: "Linux",
            categories: ["linux"]
        },
        {
            titre: "TP 14 - DualBoot Windows/Linux",
            titre_en: "Lab 14 - Windows/Linux dual boot",
            description: "Tutoriel sur la création d'un DualBoot Windows 10 et Linux Mint",
            description_en: "Walkthrough for setting up a Windows 10 and Linux Mint dual boot",
            fichier: "assets/pdf/TP_WinMint.pdf",
            image: "assets/images/dualboot.jpg",
            badge: "Linux",
            categories: ["linux"]
        },
        {
            titre: "TP 15 - IoT Avancé & Réseau",
            titre_en: "Lab 15 - Advanced IoT & networking",
            description: "Laboratoires IoT (Parties 1 & 2) et mise en place d'infrastructure réseau (Étapes 1 & 2)",
            description_en: "IoT labs (parts 1 & 2) and network infrastructure setup (steps 1 & 2)",
            fichier: "assets/pdf/TP_Cisco.pdf",
            image: "assets/images/cisco.jpg",
            badge: "Réseau",
            categories: ["reseau"]
        },
        {
            titre: "TP 16 - Configuration d'un Switch réseau",
            titre_en: "Lab 16 - Configuring a network switch",
            description: "Sécurisation et configuration d'un switch Cisco SF302-08",
            description_en: "Hardening and configuring a Cisco SF302-08 switch",
            fichier: "assets/pdf/TP_Switch.pdf",
            image: "assets/images/switch.jpg",
            badge: "Réseau",
            categories: ["reseau"]
        },
        {
            titre: "TP 17 - Commandes Windows & Linux",
            titre_en: "Lab 17 - Windows & Linux commands",
            description: "Diaporama des commandes Windows & Linux, Administrateur Système et Réseau",
            description_en: "Slideshow of Windows & Linux commands for system and network administrators",
            fichier: "assets/pdf/TP_Commandes.pdf",
            image: "assets/images/commandeswindowslinux.jpg",
            badge: "Linux",
            categories: ["linux"]
        },
        {
            titre: "TP 18 - Infrastructure Réseau d'Entreprise",
            titre_en: "Lab 18 - Enterprise network infrastructure",
            description: "Mise en place d'une infrastructure réseau d'entreprise.",
            description_en: "Setting up an enterprise network infrastructure.",
            fichiers: [
                { url: "assets/pdf/TP_InfraReseau.pdf", titleKey: 'ui.viewSlides', title: "Voir le Diaporama", icon: '<i class="fas fa-file-powerpoint"></i>' },
                { url: "assets/pdf/TP_InfraReseauWord.pdf", titleKey: 'ui.viewWord', title: "Voir le fichier Brut Word", icon: '<i class="fas fa-file-word"></i>' }
            ],
            image: "assets/images/infrareseau.jpg",
            badge: "Réseau",
            categories: ["reseau"]
        },
        {
            titre: "TP 19 - Gestion de l'impression sous Linux via Cups",
            titre_en: "Lab 19 - Printing on Linux with CUPS",
            description: "Comment imprimer sous Linux ? / Comment configurer une imprimante ?",
            description_en: "How do you print on Linux? / How do you set up a printer?",
            fichiers: [
                { url: "assets/pdf/TP_cups.pdf", titleKey: 'ui.viewSlides', title: "Voir le Diaporama", icon: '<i class="fas fa-file-powerpoint"></i>' },
                { url: "assets/pdf/TP_cupsword.pdf", titleKey: 'ui.viewWord', title: "Voir le fichier Brut Word", icon: '<i class="fas fa-file-word"></i>' }
            ],
            image: "assets/images/cups.jpg",
            badge: "Linux",
            categories: ["linux"]
        },
        {
            titre: "TP 20 - Révision LAB1 Cisco Packet Tracer",
            titre_en: "Lab 20 - Review: Cisco Packet Tracer Lab 1",
            description: "Fondations, Sécurité de Base, VLAN et SSH précoce",
            description_en: "Foundations, Basic Security, VLANs, and Early SSH",
            fichier: "assets/pdf/TP_revisionlab1.pdf",
            image: "assets/images/revisionlab1.jpg",
            badge: "Réseau",
            categories: ["reseau"]
        },
        {
            titre: "TP 21 - Révision Commandes Linux",
            titre_en: "Lab 21 - Linux Commands Review",
            description: "Commandes fondamentales Linux",
            description_en: "Linux Fundamental Commands",
            fichier: "assets/pdf/TP_revisioncommandeslinux.pdf",
            image: "assets/images/revisioncommandeslinux.jpg",
            badge: "Linux",
            categories: ["linux"]
        },
    ];

    // ============================================
    // OUTILS DE LANGUE
    // ============================================

    function isEnglish() {
        return !!(window.i18n && window.i18n.lang === 'en');
    }

    /** Traduit une clé, avec le texte français comme valeur de repli. */
    function t(key, french) {
        return (window.i18n && window.i18n.t) ? window.i18n.t(key, french) : french;
    }

    function titreOf(projet) {
        return isEnglish() && projet.titre_en ? projet.titre_en : projet.titre;
    }

    function descriptionOf(projet) {
        return isEnglish() && projet.description_en ? projet.description_en : projet.description;
    }

    function badgeOf(projet) {
        const key = badgeToKey[projet.badge];
        return key ? t(key, projet.badge) : (projet.badge || 'TP');
    }

    // ============================================
    // GÉNÉRATION DES CARTES
    // ============================================

    /**
     * Crée une carte pour un TP
     * @param {Object} projet - L'objet contenant les informations du TP
     * @returns {HTMLElement} - L'élément HTML de la carte
     */
    function creerCarte(projet) {
        // Créer la carte principale
        const carte = document.createElement('div');
        carte.className = 'project-card';
        // On gère le cas tableau (plusieurs) ou string (une seule, pour compatibilité)
        let cats = projet.categories || [projet.category || badgeToCategory[projet.badge]];
        // On transforme le tableau en une chaîne séparée par des espaces (ex: "linux virtualisation")
        carte.setAttribute('data-category', cats.join(' '));

        // Créer la section image
        const imageContainer = document.createElement('div');
        imageContainer.className = 'project-image';

        // Badge de catégorie
        const badge = document.createElement('span');
        badge.className = 'project-badge';
        badge.textContent = badgeOf(projet);

        // Image
        const img = document.createElement('img');
        img.src = projet.image || '';
        img.alt = titreOf(projet);
        img.loading = 'lazy';

        imageContainer.appendChild(badge);
        imageContainer.appendChild(img);

        // Créer la section contenu
        const contentContainer = document.createElement('div');
        contentContainer.className = 'project-content';

        // Header avec titre
        const header = document.createElement('div');
        header.className = 'project-header';

        // Icône et titre montés séparément : le titre passe par textContent,
        // pour qu'il reste sûr même si `projets` venait un jour d'un JSON
        // externe plutôt que du tableau statique de ce fichier.
        const titre = document.createElement('h3');
        titre.className = 'project-title';
        const titreIcon = document.createElement('i');
        titreIcon.className = 'fas fa-file-alt';
        titre.appendChild(titreIcon);
        titre.appendChild(document.createTextNode(' ' + titreOf(projet)));

        header.appendChild(titre);

        // Description
        const description = document.createElement('p');
        description.className = 'project-description';
        description.textContent = descriptionOf(projet);

        // Footer avec lien PDF
        const footer = document.createElement('div');
        footer.className = 'project-footer';

        const linksContainer = document.createElement('div');
        linksContainer.className = 'project-links';
        linksContainer.style.marginLeft = 'auto'; // Pour aligner à droite

        if (projet.fichiers && Array.isArray(projet.fichiers)) {
            projet.fichiers.forEach(f => {
                const lien = document.createElement('a');
                lien.href = f.url;
                lien.target = '_blank';
                lien.rel = 'noopener';
                lien.className = 'project-link';
                lien.title = t(f.titleKey, f.title);
                lien.innerHTML = f.icon || '<i class="fas fa-file-pdf"></i>';
                linksContainer.appendChild(lien);
            });
        } else if (projet.fichier) {
            const lienPDF = document.createElement('a');
            lienPDF.href = projet.fichier;
            lienPDF.target = '_blank';
            lienPDF.rel = 'noopener';
            lienPDF.className = 'project-link';
            lienPDF.title = t('ui.viewPdf', 'Voir le PDF');
            lienPDF.innerHTML = '<i class="fas fa-file-pdf"></i>';
            linksContainer.appendChild(lienPDF);
        }

        footer.appendChild(linksContainer);

        // Assembler le contenu
        contentContainer.appendChild(header);
        contentContainer.appendChild(description);
        contentContainer.appendChild(footer);

        // Assembler la carte
        carte.appendChild(imageContainer);
        carte.appendChild(contentContainer);

        return carte;
    }

    /**
     * Génère toutes les cartes et les ajoute à la grille.
     * Appelée au chargement puis à chaque changement de langue.
     */
    function genererCartes() {
        const gridContainer = document.getElementById('tps-grid');
        if (!gridContainer) {
            console.error('Conteneur tps-grid introuvable');
            return;
        }

        // Vider le conteneur au cas où
        gridContainer.innerHTML = '';

        // Créer une carte pour chaque projet
        projets.forEach((projet, index) => {
            const carte = creerCarte(projet);
            // Ajouter un délai d'animation progressif
            carte.style.animationDelay = `${index * 0.1}s`;
            gridContainer.appendChild(carte);
        });
    }

    // ============================================
    // INITIALISATION
    // ============================================
    // (le filtrage est géré par filters.js, commun à toutes les sections)

    // Exposé pour permettre un redessin manuel si besoin
    window.renderTps = genererCartes;

    // Les cartes portent leur texte en dur : on les régénère à chaque bascule.
    // Le filtre actif est réappliqué par filters.js au clic suivant ; on remet
    // simplement toutes les cartes visibles pour rester cohérent.
    document.addEventListener('i18n:changed', function () {
        genererCartes();
        const activeFilter = document.querySelector('#tps .filter-btn.active');
        if (activeFilter && activeFilter.dataset.filter !== 'all') activeFilter.click();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', genererCartes);
    } else {
        genererCartes();
    }
})();
