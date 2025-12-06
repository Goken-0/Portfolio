document.addEventListener('DOMContentLoaded', () => {
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

  let indexActuel = 0;

  const titreEl = document.getElementById("project-title");
  const descEl = document.getElementById("project-description");
  const viewEl = document.getElementById("project-view");

  const btnGauche = document.querySelector(".nav-arrow.left");
  const btnDroite = document.querySelector(".nav-arrow.right");

  function afficherProjet(index) {
    const projet = projets[index];
    titreEl.textContent = projet.titre;
    descEl.textContent = projet.description;

    // Fonction du bouton Visualiser
    viewEl.textContent = "Visualiser";


    // Mettre à jour le lien pour ouvrir dans un nouvel onglet
    viewEl.href = projet.fichier;
    viewEl.setAttribute("target", "_blank");
  }

  btnGauche.addEventListener("click", () => {
    indexActuel = (indexActuel - 1 + projets.length) % projets.length;
    afficherProjet(indexActuel);
  });

  btnDroite.addEventListener("click", () => {
    indexActuel = (indexActuel + 1) % projets.length;
    afficherProjet(indexActuel);
  });

  afficherProjet(indexActuel);
});
