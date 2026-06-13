// engine.js - Gère la logique interne, l'état du jeu et les sauvegardes
window.Engine = {
    story: null,
    
    // L'état par défaut d'une nouvelle partie
    state: {
        currentScene: "initium", // L'ID de la première scène dans ton story.json
        inventory: [],
        quests: {}
    },

    init(storyData) {
        this.story = storyData;
    },

    startGame() {
        // Tente de charger une sauvegarde existante
        const savedState = localStorage.getItem('ali_gameState');
        if (savedState) {
            try {
                this.state = JSON.parse(savedState);
            } catch (e) {
                console.error("Erreur lors du chargement de la sauvegarde", e);
            }
        }
        
        this.goToScene(this.state.currentScene);
    },

    // Transition vers une nouvelle scène
    goToScene(sceneId) {
        const sceneData = this.story[sceneId];
        
        if (!sceneData) {
            console.error(`La scène "${sceneId}" n'existe pas dans story.json !`);
            return;
        }

        this.state.currentScene = sceneId;
        this.saveGame(); // Sauvegarde automatique à chaque nouvelle scène

        // On filtre les choix masqués avant d'envoyer à l'UI
        const validChoices = this.filterChoices(sceneData.choices || []);
        
        // Envoi des données à l'interface pour affichage
        window.UI.renderScene(sceneData, validChoices);
    },

    // Vérifie si le joueur remplit les conditions pour voir un choix
    filterChoices(choices) {
        return choices.filter(choice => {
            // Condition d'objet (Artefact)
            if (choice.requiresItem && !this.state.inventory.includes(choice.requiresItem)) {
                return false; // On masque strictment le choix
            }
            
            // Condition d'objet 2 (si deux items requis)
            if (choice.requiresItem2 && !this.state.inventory.includes(choice.requiresItem2)) {
                return false; // On masque strictment le choix
            }
            
            // Choix que la possession d'un objet bloque
            if (choice.excludesItem && this.state.inventory.includes(choice.excludesItem)) {
                return false; // On masque strictment le choix
            }

            // Condition de quête
            if (choice.requiresQuest) {
                const questId = choice.requiresQuest.id;
                const reqStatus = choice.requiresQuest.status;
                if (this.state.quests[questId] !== reqStatus) {
                    return false; // On masque strictment le choix
                }
            }
            
            return true; // Le joueur peut voir ce choix
        });
    },

    // Traite un choix cliqué par le joueur (gain d'objets, progression de quêtes)
    processChoice(choice) {
        // Gain d'un objet
        if (choice.gainItem && !this.state.inventory.includes(choice.gainItem)) {
            this.state.inventory.push(choice.gainItem);
        }

        // Gain d'un second objet
        if (choice.gainItem2 && !this.state.inventory.includes(choice.gainItem2)) {
            this.state.inventory.push(choice.gainItem2);
        }

        if (choice.removeItem && this.state.inventory.includes(choice.removeItem)) {
            this.state.inventory = this.state.inventory.filter(item => item !== choice.removeItem);
        }

        // Mise à jour d'une quête
        if (choice.updateQuest) {
            this.state.quests[choice.updateQuest.id] = choice.updateQuest.status;
        }

        // Passage à la scène suivante
        if (choice.nextScene) {
            this.goToScene(choice.nextScene);
        } else {
            console.warn("Ce choix n'a pas de 'nextScene' défini.");
        }
    },

    saveGame() {
        localStorage.setItem('ali_gameState', JSON.stringify(this.state));
    },

    // Nettoie la mémoire et réinitialise l'état par défaut
    resetGame() {
        localStorage.removeItem('ali_gameState');
        this.state = { 
            currentScene: "initium", 
            inventory: [], 
            quests: {} 
        };
    }
};