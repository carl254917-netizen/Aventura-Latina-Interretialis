// main.js - Point d'entrée de l'application

document.addEventListener('DOMContentLoaded', async () => {
    // Éléments du DOM globaux
    const btnStart = document.getElementById('btn-start-game');
    const btnTheme = document.getElementById('btn-toggle-theme');
    const btnLexicon = document.getElementById('btn-toggle-lexicon');
    
    const introScreen = document.getElementById('intro-screen');
    const gameScreen = document.getElementById('game-screen');

    // 1. GESTION DU THÈME (Clair/Sombre)
    const savedTheme = localStorage.getItem('ali_theme') || 'theme-light';
    document.body.className = savedTheme;

    btnTheme.addEventListener('click', () => {
        if (document.body.classList.contains('theme-light')) {
            document.body.className = 'theme-dark';
            localStorage.setItem('ali_theme', 'theme-dark');
        } else {
            document.body.className = 'theme-light';
            localStorage.setItem('ali_theme', 'theme-light');
        }
    });

    // 2. GESTION DE L'AIDE AU VOCABULAIRE (Dictionnaire)
    const savedLexiconState = localStorage.getItem('ali_lexicon_disabled');
    if (savedLexiconState === 'true') {
        document.body.classList.add('lexicon-disabled');
    }

    btnLexicon.addEventListener('click', () => {
        document.body.classList.toggle('lexicon-disabled');
        const isDisabled = document.body.classList.contains('lexicon-disabled');
        localStorage.setItem('ali_lexicon_disabled', isDisabled);
    });

    // 3. CHARGEMENT DES DONNÉES JSON
    try {
        const [storyResponse, lexiconResponse] = await Promise.all([
            fetch('data/story.json'),
            fetch('data/lexicon.json')
        ]);

        if (!storyResponse.ok || !lexiconResponse.ok) {
            throw new Error("Impossible de charger les fichiers JSON.");
        }

        const storyData = await storyResponse.json();
        const lexiconData = await lexiconResponse.json();

        // Initialisation des modules
        window.UI.init(lexiconData);
        window.Engine.init(storyData);

        // Active le bouton de démarrage une fois les données chargées
        btnStart.disabled = false;
        btnStart.textContent = "Incipe Aventuram";

    } catch (error) {
        console.error("Erreur d'initialisation :", error);
        btnStart.textContent = "Error: Fichiers non trouvés";
        btnStart.disabled = true;
    }

    // 4. DÉMARRAGE DU JEU
    btnStart.addEventListener('click', () => {
        // Transition d'écrans fluide
        introScreen.classList.remove('active-screen');
        introScreen.classList.add('hidden-screen');
        
        gameScreen.classList.remove('hidden-screen');
        gameScreen.classList.add('active-screen');

        // Lancement de la machine
        window.Engine.startGame();
    });
    
    // 5. GESTION DU CLIC SUR LE LOGO "A.L.I." (RETOUR ACCUEIL + RESET)
    const btnLogo = document.getElementById('btn-logo-reset');

    btnLogo.addEventListener('click', () => {
        // Alerte immersive en latin : "Es-tu sûr de vouloir réinitialiser le jeu ? Toute ta progression sera perdue."
        const certusEs = confirm("Visne ludum reinitiare? Omnia progressa peribunt.");
        
        if (certusEs) {
            // 1. On efface les données dans l'Engine et le LocalStorage
            window.Engine.resetGame();
            
            // 2. Transition visuelle : On cache le jeu, on montre l'intro
            gameScreen.classList.remove('active-screen');
            gameScreen.classList.add('hidden-screen');
            
            introScreen.classList.remove('hidden-screen');
            introScreen.classList.add('active-screen');
        }
    });
});