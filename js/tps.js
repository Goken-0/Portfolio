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

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
  
    // ============================================
    // LISTE DES PROJETS/TPs
    // ============================================
    // Tableau contenant tous les travaux pratiques avec leurs informations
    const projets = [
        {
            titre: "TP 1 - Installation d'une VM",
            description: "Comment installer une machine virtuelle sous Windows ?",
            fichier: "assets/pdf/TP_Installation_VM.pdf",
            image: "assets/images/vm.jpg",
            badge: "Système"
        },
        {
            titre: "TP 2 - Découverte du CMD",
            description: "Les commandes de base dans le CMD",
            fichier: "assets/pdf/Tp_Invite_Commande.pdf",
            image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop",
            badge: "Système"
        },
        {
            titre: "TP 3 - Découverte du Powershell",
            description: "Les commandes de base dans le Powershell",
            fichier: "assets/pdf/TP_Powershell.pdf",
            image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop",
            badge: "Système"
        },
        {
            titre: "TP 4 - Conception PC",
            description: "Création d'un ordinateur et choix des composants selon le besoin",
            fichier: "assets/pdf/TP_Config.pdf",
            image: "assets/images/pc.jpg",
            badge: "Matériel"
        },
        {
            titre: "TP 5 - Découverte des scripts .bat",
            description: "Création d'un script .bat et maitrîse du CMD",
            fichier: "assets/pdf/TP_Script_Bat.pdf",
            image: "assets/images/bat.png",
            badge: "Scripting"
        },
        {
            titre: "TD 1 - Découverte d'une base de données",
            description: "Comment est composée une base de données ?",
            fichier: "assets/pdf/TD_1_BD.pdf",
            image: "assets/images/basedonnees.jpg",
            badge: "Base de données"
        }
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
    // INITIALISATION
    // ============================================
    
    // Générer toutes les cartes au chargement
    genererCartes();
});
