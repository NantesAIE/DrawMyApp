# DrawMyApp

Une application web React moderne pour créer et exporter des diagrammes de solutions au format PNG.

## 🚀 Fonctionnalités

### ✏️ Outils de dessin
- **Pinceau libre** : Dessinez à main levée
- **Formes géométriques** : Rectangle, cercle, flèches
- **Texte** : Ajoutez du texte avec des tailles personnalisables
- **Gomme** : Effacez les éléments du dessin

### 🎨 Personnalisation
- **Palette de couleurs** : 12 couleurs prédéfinies + sélecteur de couleur personnalisé
- **Épaisseur de trait** : 6 tailles différentes (1px à 12px)
- **Interface intuitive** : Barre d'outils claire et accessible

### 💾 Gestion des projets
- **Annuler/Refaire** : Historique complet des actions
- **Effacer tout** : Remise à zéro rapide du canvas
- **Sauvegarde locale** : Conservez vos dessins dans le navigateur
- **Export PNG** : Téléchargement direct en haute qualité

## 🛠️ Installation

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn

### Étapes d'installation

1. **Clonez le projet**
   ```bash
   cd DrawMyApp
   ```

2. **Installez les dépendances**
   ```bash
   npm install
   ```

3. **Lancez l'application**
   ```bash
   npm run dev
   ```

4. **Ouvrez votre navigateur**
   ```
   http://localhost:5173
   ```

## 📖 Guide d'utilisation

### Interface principale
L'application se compose de 3 zones principales :
1. **En-tête** : Titre et description de l'application
2. **Barre d'outils** : Tous les outils de dessin et d'édition
3. **Zone de dessin** : Canvas de 1200x800 pixels pour créer vos diagrammes

### Outils disponibles

#### 🖊️ Outils de dessin
- **Pinceau** : Cliquez et glissez pour dessiner librement
- **Rectangle** : Cliquez et glissez pour créer un rectangle
- **Cercle** : Cliquez et glissez pour créer un cercle
- **Flèche** : Cliquez et glissez pour créer une flèche directionnelle
- **Texte** : Cliquez pour placer du texte (une boîte de dialogue s'ouvre)

#### 🎨 Personnalisation
- **Couleurs** : Cliquez sur une couleur prédéfinie ou utilisez le sélecteur personnalisé
- **Épaisseur** : Sélectionnez l'épaisseur dans le menu déroulant

#### ⚡ Actions rapides
- **Annuler** (Ctrl+Z) : Revenir à l'état précédent
- **Refaire** (Ctrl+Y) : Rétablir une action annulée
- **Effacer tout** : Supprimer tous les éléments du canvas
- **Exporter PNG** : Télécharger le dessin en image PNG

#### 💾 Sauvegarde
- **Sauvegarder** : Stockage local dans le navigateur
- **Charger** : Restaurer la dernière sauvegarde

## 🏗️ Architecture technique

### Technologies utilisées
- **React 18** : Framework principal
- **TypeScript** : Typage statique
- **Vite** : Outil de build moderne et rapide
- **HTML5 Canvas** : Rendu graphique haute performance
- **html2canvas** : Export PNG de qualité

### Structure du projet
```
src/
├── components/          # Composants React
│   ├── Canvas.tsx      # Composant canvas principal
│   ├── Toolbar.tsx     # Barre d'outils
│   └── DrawingApp.tsx  # Application principale
├── hooks/              # Hooks personnalisés
│   └── useDrawing.ts   # Logique de dessin
├── types/              # Définitions TypeScript
│   └── drawing.ts      # Types pour le dessin
├── utils/              # Utilitaires
│   └── export.ts       # Fonctions d'export
└── main.tsx           # Point d'entrée
```

### Fonctionnalités techniques
- **État réactif** : Gestion d'état avec hooks React
- **Historique** : Système undo/redo intégré
- **Performance** : Rendu optimisé avec Canvas API
- **Export qualité** : PNG haute résolution avec fond blanc
- **Responsive** : Interface adaptable
- **Accessibilité** : Tooltips et navigation au clavier

## 🎯 Cas d'usage

Cette application est parfaite pour :
- **Diagrammes techniques** : Architecture logicielle, flux de données
- **Wireframes** : Maquettes d'interfaces utilisateur
- **Schémas explicatifs** : Processus métier, workflows
- **Brainstorming visuel** : Mind maps, idéation
- **Annotations** : Marquage de documents, révisions

## 🔧 Développement

### Scripts disponibles
```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Aperçu du build
npm run lint         # Vérification du code
```

### Personnalisation
L'application est conçue pour être facilement extensible :
- Ajout de nouveaux outils dans `types/drawing.ts`
- Extension de la barre d'outils dans `Toolbar.tsx`
- Nouveaux formats d'export dans `utils/export.ts`

## 📝 Licence

Ce projet est sous licence MIT.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche feature
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

---

Créé avec ❤️ pour simplifier la création de diagrammes et solutions visuelles.
