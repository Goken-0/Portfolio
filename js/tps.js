/**
 * ============================================
 * CARROUSEL DES TRAVAUX PRATIQUES (TPs)
 * ============================================
 * 
 * Ce fichier gère l'affichage des travaux pratiques dans un carrousel.
 * L'utilisateur peut naviguer entre les différents TPs avec les flèches.
 * 
 * Fonctionnalités :
 * - Navigation avec flèches gauche/droite
 * - Affichage du titre et de la description
 * - Lien vers le PDF dans un nouvel onglet
 * - Navigation circulaire (retour au début après la fin)
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
            fichier: "assets/pdf/TP_Installation_VM.pdf"
        },
        {
            titre: "TP 2 - Découverte du CMD",
            description: "Les commandes de base dans le CMD",
            fichier: "assets/pdf/Tp_Invite_Commande.pdf"
        },
        {
            titre: "TP 3 - Découverte du Powershell",
            description: "Les commandes de base dans le Powershell",
            fichier: "assets/pdf/TP_Powershell.pdf"
        },
        {
            titre: "TP 4 - Conception PC",
            description: "Création d'un ordinateur et choix des composants selon le besoin",
            fichier: "assets/pdf/TP_Config.pdf"
        },
        {
            titre: "TP 5 - Découverte des scripts .bat",
            description: "Création d'un script .bat et maitrîse du CMD",
            fichier: "assets/pdf/TP_Script_Bat.pdf"
        },
        {
            titre: "TD 1 - Découverte d'une base de données",
            description: "Comment est composée une base de données ?",
            fichier: "assets/pdf/TD_1_BD.pdf"
        }
    ];

    // ============================================
    // VARIABLES
    // ============================================
    let indexActuel = 0;  // Index du projet actuellement affiché (commence à 0)

    // Récupérer les éléments HTML où on va afficher les informations
    const titreEl = document.getElementById("project-title");        // Élément pour le titre
    const descEl = document.getElementById("project-description");    // Élément pour la description
    const viewEl = document.getElementById("project-view");          // Bouton/lien "Visualiser"

    // Récupérer les boutons de navigation
    const btnGauche = document.querySelector(".nav-arrow.left");   // Flèche gauche
    const btnDroite = document.querySelector(".nav-arrow.right"); // Flèche droite

    // ============================================
    // FONCTION D'AFFICHAGE
    // ============================================
    
    /**
     * Affiche le projet à l'index donné
     * @param {number} index - L'index du projet à afficher
     */
    function afficherProjet(index) {
        // Récupérer le projet correspondant à l'index
        const projet = projets[index];
        
        // Mettre à jour le titre
        titreEl.textContent = projet.titre;
        
        // Mettre à jour la description
        descEl.textContent = projet.description;

        // Mettre à jour le texte du bouton
        viewEl.textContent = "Visualiser";

        // Mettre à jour le lien pour ouvrir le PDF dans un nouvel onglet
        viewEl.href = projet.fichier;
        viewEl.setAttribute("target", "_blank");  // Ouvrir dans un nouvel onglet
    }

    // ============================================
    // NAVIGATION
    // ============================================
    
    // Quand on clique sur la flèche gauche
    btnGauche.addEventListener("click", () => {
        // Aller au projet précédent (avec boucle : si on est à 0, on va au dernier)
        // Le % permet de faire une boucle circulaire
        indexActuel = (indexActuel - 1 + projets.length) % projets.length;
        afficherProjet(indexActuel);
    });

    // Quand on clique sur la flèche droite
    btnDroite.addEventListener("click", () => {
        // Aller au projet suivant (avec boucle : si on est au dernier, on revient au premier)
        indexActuel = (indexActuel + 1) % projets.length;
        afficherProjet(indexActuel);
    });

    // ============================================
    // INITIALISATION
    // ============================================
    
    // Afficher le premier projet au chargement de la page
    afficherProjet(indexActuel);
});
