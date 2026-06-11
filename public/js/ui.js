// ui.js - Gère l'interface utilisateur et le DOM
window.UI = {
    elements: {
        storyText: document.getElementById('story-text'),
        choicesContainer: document.getElementById('choices-container'),
        tooltipBox: document.getElementById('tooltip-box')
    },

    lexicon: null, // Sera chargé depuis main.js

    // Initialise le dictionnaire pour l'interface
    init(lexiconData) {
        this.lexicon = lexiconData;
        this.setupTooltipEvents();
    },

    // Affiche une scène à l'écran
    renderScene(sceneData, validChoices) {
        // 1. Afficher le texte de l'histoire (en y injectant les spans du dictionnaire)
        this.elements.storyText.innerHTML = this.parseTextForLexicon(sceneData.text);

        // 2. Vider les anciens boutons
        this.elements.choicesContainer.innerHTML = '';

        // 3. Générer les nouveaux boutons de choix
        validChoices.forEach(choice => {
            const btn = document.createElement('button');
            // Le texte des choix bénéficie aussi du parseur de vocabulaire !
            btn.innerHTML = this.parseTextForLexicon(choice.text);
            
            btn.onclick = () => window.Engine.processChoice(choice);
            this.elements.choicesContainer.appendChild(btn);
        });

        // 4. Réattacher les événements de survol pour les nouveaux mots générés
        this.attachWordEvents();
    },

    // Analyse une phrase et encadre les mots trouvés dans le lexicon.json
    parseTextForLexicon(text) {
        if (!this.lexicon) return text;

        // Trie les mots du plus long au plus court pour éviter les conflits (ex: "gladius" vs "gladi")
        const words = Object.keys(this.lexicon).sort((a, b) => b.length - a.length);
        
        let parsedText = text;
        words.forEach(word => {
            // Expression régulière pour trouver le mot entier (\b) sans casser la casse (gi)
            const regex = new RegExp(`\\b(${word})\\b`, 'gi');
            parsedText = parsedText.replace(regex, `<span class="vocab-word" data-word="${word}">$1</span>`);
        });

        return parsedText;
    },

    // Attache les événements de survol aux mots complexes générés dans le HTML
    attachWordEvents() {
        const vocabWords = document.querySelectorAll('.vocab-word');
        
        vocabWords.forEach(span => {
            span.addEventListener('mouseenter', (e) => {
                // Ne rien faire si l'option d'aide est désactivée
                if (document.body.classList.contains('lexicon-disabled')) return;

                const baseWord = e.target.getAttribute('data-word');
                const definition = this.lexicon[baseWord];
                
                if (definition) {
                    this.elements.tooltipBox.textContent = definition;
                    this.elements.tooltipBox.classList.remove('hidden');
                }
            });

            span.addEventListener('mouseleave', () => {
                this.elements.tooltipBox.classList.add('hidden');
            });
        });
    },

    // Gère le déplacement de l'encadré pour qu'il suive la souris
    setupTooltipEvents() {
        document.addEventListener('mousemove', (e) => {
            if (!this.elements.tooltipBox.classList.contains('hidden')) {
                // Léger décalage (+15px) pour que la souris ne cache pas le texte
                this.elements.tooltipBox.style.left = `${e.pageX + 15}px`;
                this.elements.tooltipBox.style.top = `${e.pageY + 15}px`;
            }
        });
    }
};