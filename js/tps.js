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
 */

(function() {
    function init() {
  
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

    const projets = [
        {
            titre: "TP 1 - Installation d'une VM",
            description: "Comment installer une machine virtuelle sous Windows ?",
            fichier: "assets/pdf/TP_Installation_VM.pdf",
            image: "assets/images/vm.jpg",
            badge: "Système",
            categories: ["virtualisation"]
        },
        {
            titre: "TP 2 - Découverte du CMD",
            description: "Les commandes de base dans le CMD",
            fichier: "assets/pdf/Tp_Invite_Commande.pdf",
            image: "assets/images/cmd.jpg",
            badge: "Système",
            categories: ["scripting"]
        },
        {
            titre: "TP 3 - Découverte du Powershell",
            description: "Les commandes de base dans le Powershell",
            fichier: "assets/pdf/TP_Powershell.pdf",
            image: "assets/images/powershell.jpg",
            badge: "Système",
            categories: ["scripting"]
        },
        {
            titre: "TP 4 - Conception PC",
            description: "Création d'un ordinateur et choix des composants selon le besoin",
            fichier: "assets/pdf/TP_Config.pdf",
            image: "assets/images/pc.jpg",
            badge: "Matériel",
            categories: ["hardware"]
        },
        {
            titre: "TP 5 - Découverte des scripts .bat",
            description: "Création d'un script .bat et maitrîse du CMD",
            fichier: "assets/pdf/TP_Script_Bat.pdf",
            image: "assets/images/bat.jpg",
            badge: "Scripting",
            categories: ["scripting"]
        },
        {
            titre: "TP 6 - Découverte d'une base de données",
            description: "Comment est composée une base de données ?",
            fichier: "assets/pdf/TD_1_BD.pdf",
            image: "assets/images/basedonnees.jpg",
            badge: "Base de données",
            categories: ["base-de-donnees"]
        },
        {
            titre: "TP 7 - Commandes CMD",
            description: "Commandes CMD Essentielles du Support Informatique",
            fichier: "assets/pdf/TP_Commandes_Avancees.pdf",
            image: "assets/images/commandescmd.jpg",
            badge: "Scripting",
            categories: ["scripting"]
        },
        {
            titre: "TP 8 - Problème réseau",
            description: "Diagnostic et Réparation d'un Problème de Connexion Réseau",
            fichier: "assets/pdf/TP_problemesreseaux.pdf",
            image: "assets/images/problemesreseaux.jpg",
            badge: "Réseau",
            categories: ["reseau"]
        },
        {
            titre: "TP 9 - Commandes PowerShell",
            description: "Interface en ligne de commande",
            fichier: "assets/pdf/TP_commandespowershell.pdf",
            image: "assets/images/commandespowershell.jpg",
            badge: "Scripting",
            categories: ["scripting"]
        },
        {
            titre: "TP 10 - Première Connexion Linux",
            description: "Configuration générale de l'OS, c'est à dire résolution écran, disposition clavier...",
            fichier: "assets/pdf/TP_PremiereConnexionLinux.pdf",
            image: "assets/images/linux.jpg",
            badge: "Virtualisation",
            categories: ["virtualisation", "linux"]
        },
        {
            titre: "TP 11 - GuestAdditions",
            description: "Installation des GuestAdditions sur Oracle VirtualBox",
            fichier: "assets/pdf/TP_GuestAdditions.pdf",
            image: "assets/images/guestadditions.jpg",
            badge: "Virtualisation",
            categories: ["virtualisation"]
        },
        {
            titre: "TP 12 - Xubuntu",
            description: "Installation de l'OS Xubuntu sur Oracle VirtualBox",
            fichier: "assets/pdf/TP_Xubuntu.pdf",
            image: "assets/images/xubuntu.jpg",
            badge: "Virtualisation",
            categories: ["virtualisation", "linux"]
        },
        {
            titre: "TP 13 - Gestion des utilisateurs",
            description: "Configuration des permissions, création d'utilisateurs, de groupes...",
            fichier: "assets/pdf/TP_GestionUtilisateurs.pdf",
            image: "assets/images/gestionutilisateurs.jpg",
            badge: "Linux",
            categories: ["linux"]
        },
        {
            titre: "TP 14 - DualBoot Windows/Linux",
            description: "Tutoriel sur la création d'un DualBoot Windows 10 et Linux Mint",
            fichier: "assets/pdf/TP_WinMint.pdf",
            image: "assets/images/dualboot.jpg",
            badge: "Linux",
            categories: ["linux"]
        },
        {
            titre: "TP 15 - IoT Avancé & Réseau",
            description: "Laboratoires IoT (Parties 1 & 2) et mise en place d'infrastructure réseau (Étapes 1 & 2)",
            fichier: "assets/pdf/TP_Cisco.pdf",
            image: "assets/images/cisco.jpg",
            badge: "Réseau",
            categories: ["reseau"]
        },
        {
            titre: "TP 16 - Configuration d'un Switch",
            description: "Sécurisation et configuration d'un switch Cisco SF302-08",
            fichier: "assets/pdf/TP_Switch.pdf",
            image: "assets/images/cisco.jpg",
            badge: "Réseau",
            categories: ["reseau"]
        },
    ];

    // ============================================
    // GÉNÉRATION DES CARTES
    // ============================================
    
    // Récupérer le conteneur de la grille
    const gridContainer = document.getElementById('tps-grid');
    
    if (!gridContainer) {
        console.error('Conteneur tps-grid introuvable');
        return;
    }

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
        badge.textContent = projet.badge || 'TP';
        
        // Image
        const img = document.createElement('img');
        img.src = projet.image || '';
        img.alt = projet.titre;
        img.loading = 'lazy';
        
        imageContainer.appendChild(badge);
        imageContainer.appendChild(img);
        
        // Créer la section contenu
        const contentContainer = document.createElement('div');
        contentContainer.className = 'project-content';
        
        // Header avec titre
        const header = document.createElement('div');
        header.className = 'project-header';
        
        const titre = document.createElement('h3');
        titre.className = 'project-title';
        titre.innerHTML = `<i class="fas fa-file-alt"></i> ${projet.titre}`;
        
        header.appendChild(titre);
        
        // Description
        const description = document.createElement('p');
        description.className = 'project-description';
        description.textContent = projet.description;
        
        // Footer avec lien PDF
        const footer = document.createElement('div');
        footer.className = 'project-footer';
        
        const lienPDF = document.createElement('a');
        lienPDF.href = projet.fichier;
        lienPDF.target = '_blank';
        lienPDF.className = 'project-link';
        lienPDF.title = 'Voir le PDF';
        lienPDF.innerHTML = '<i class="fas fa-file-pdf"></i>';
        
        footer.appendChild(lienPDF);
        
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
     * Génère toutes les cartes et les ajoute à la grille
     */
    function genererCartes() {
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
    // FILTRAGE DES TPs
    // ============================================
    
    function setupFilters() {
        const filterBtns = document.querySelectorAll('#tps-filters .filter-btn');
        if (!filterBtns.length) return;

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Retirer la classe active de tous les boutons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Ajouter la classe active au bouton cliqué
                btn.classList.add('active');

                const filter = btn.dataset.filter;
                const cards = gridContainer.querySelectorAll('.project-card');

                cards.forEach(card => {
                    const cardCats = card.dataset.category.split(' ');
                    if (filter === 'all' || cardCats.includes(filter)) {
                        card.style.display = 'block';
                        // Réanimer l'apparition
                        card.style.animation = 'none';
                        setTimeout(() => {
                            card.style.animation = 'projectAppear 0.6s ease-out forwards';
                        }, 10);
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // ============================================
    // INITIALISATION
    // ============================================
    
    // Générer toutes les cartes au chargement
    genererCartes();
    // Initialiser les filtres
    setupFilters();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();




