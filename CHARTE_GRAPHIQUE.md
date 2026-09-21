# Charte graphique — Xixi Autocars

## 1. Direction artistique

**Concept : Editorial Magazine Spread**

Xixi Autocars est présenté comme un magazine automobile international : éditorial, précis, chaleureux et premium. La composition privilégie les grandes marges, les asymétries maîtrisées, les images fortes, les titres expressifs et les informations courtes facilement scannables.

Mots-clés : **éditorial · export international · confiance · mouvement · sélection · matière · automobile premium**.

Le design doit évoquer une publication spécialisée haut de gamme plutôt qu'un catalogue automobile générique.

## 2. Palette de couleurs

### Encre et surfaces

| Token | Hex | Usage |
|---|---|---|
| `ink-50` | `#FAFAFA` | Fond principal |
| `ink-100` | `#F5F5F5` | Sections secondaires, cartes |
| `ink-200` | `#E5E5E5` | Bordures légères |
| `ink-300` | `#D4D4D4` | Séparateurs visibles |
| `ink-400` | `#A3A3A3` | Texte discret, labels |
| `ink-500` | `#737373` | Texte secondaire |
| `ink-600` | `#525252` | Descriptions et métadonnées |
| `ink-700` | `#404040` | Texte courant renforcé |
| `ink-800` | `#262626` | Titres secondaires |
| `ink-900` | `#171717` | Titres principaux, CTA sombre |
| `ink-950` | `#0A0A0A` | Footer et surfaces très sombres |

### Accents

| Token | Hex | Usage |
|---|---|---|
| `accent-50` | `#FDF4FF` | Surbrillance légère |
| `accent-100` | `#FAE8FF` | Fonds d'accent |
| `accent-200` | `#F5D0FE` | Bordures douces |
| `accent-300` | `#F0ABFC` | Accent intermédiaire |
| `accent-400` | `#E879F9` | Icônes et états visibles |
| `accent-500` | `#D946EF` | Accent principal |
| `accent-600` | `#C026D3` | CTA, hover et liens actifs |
| `accent-700` | `#A21CAF` | Texte d'accent renforcé |

### Accents secondaires

| Famille | Valeurs principales | Usage |
|---|---|---|
| Terracotta | `#FEF7EE` à `#772A10` | Chaleur, export, citations, CTA secondaires |
| Sage | `#F6F7F4` à `#383B2C` | Confiance, nature, garanties, états positifs |

### Contraste

- Texte principal sur fond clair : utiliser `ink-800` ou `ink-900`.
- Texte courant : utiliser au minimum `ink-600`.
- CTA clair : texte blanc sur `ink-900` ou `accent-600`.
- Ne pas utiliser `ink-400` pour du contenu essentiel.
- Vérifier un contraste minimum WCAG AA de 4.5:1 pour le texte normal.

## 3. Typographie

### Familles

| Rôle | Police | Usage |
|---|---|---|
| Display | **Syne** | Titres, noms de véhicules, citations, prix importants |
| Corps/UI | **Outfit** | Paragraphes, navigation, formulaires, boutons |
| Données | **Geist Mono** | Prix secondaires, années, références, identifiants et données techniques |

### Règles

- Les titres utilisent Syne avec des poids 600 à 800.
- Le corps utilise Outfit en 300 à 600.
- Les labels techniques utilisent Geist Mono avec `letter-spacing: 0.08em` à `0.16em`.
- Les titres peuvent employer un tracking légèrement serré, mais jamais négatif de façon excessive.
- Les titres restent courts et éditoriaux : éviter les blocs de plus de 3 ou 4 lignes.
- Prévoir un fallback arabe cohérent pour les interfaces RTL.

### Échelle indicative

| Élément | Mobile | Desktop |
|---|---:|---:|
| Hero H1 | `3rem` | `4.5rem` à `6rem` |
| H2 | `2.25rem` | `3rem` à `3.75rem` |
| H3 | `1.25rem` | `1.5rem` |
| Corps | `1rem` | `1.0625rem` à `1.125rem` |
| Label | `0.75rem` | `0.75rem` à `0.8125rem` |

## 4. Grille et mise en page

### Grille magazine

La grille principale utilise 12 colonnes sur desktop, 6 sur tablette et 4 sur mobile.

```css
.magazine-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 24px;
}

@media (max-width: 768px) {
  .magazine-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .magazine-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }
}
```

### Principes de composition

1. Utiliser des largeurs asymétriques : 7/5, 5/7 ou 4/8 colonnes.
2. Garder des marges généreuses : `24px` minimum sur mobile, `48px` ou plus sur desktop.
3. Utiliser des sections pleines largeur avec un conteneur `max-width: 1280px`.
4. Réserver les cartes aux objets répétés : véhicules, témoignages, services et blocs d'information.
5. Ne pas imbriquer plusieurs niveaux de cartes.
6. Utiliser des séparateurs visibles mais fins pour rythmer les sections.

## 5. Images

- Les véhicules sont le sujet principal : images nettes, lumineuses et suffisamment grandes.
- Utiliser `object-fit: cover` avec des formats stables (`aspect-ratio: 4 / 5`, `4 / 3` ou `16 / 9`).
- Éviter les images sombres, floues, fortement recadrées ou purement décoratives.
- Les images principales peuvent utiliser une découpe asymétrique légère, jamais au détriment de la lisibilité du véhicule.
- Prévoir un texte alternatif descriptif : marque, modèle et année.
- En production Next.js, préférer `next/image` avec des tailles explicites.

## 6. Composants

### Header

- Hauteur cible : `64px`.
- Logo à gauche, navigation centrale, sélecteur de langue et CTA à droite.
- Fond blanc ou `ink-50` avec bordure basse discrète.
- Navigation visible sur desktop et menu compact sur mobile.
- Le lien d'accès admin peut rester masqué sur le site public selon la règle produit actuelle.

### Boutons

- CTA principal : fond `ink-900` ou `accent-600`, texte blanc.
- CTA secondaire : contour `ink-300` ou `accent-600`.
- Rayon recommandé : `8px`.
- Les actions iconographiques utilisent une icône identifiable et un tooltip si nécessaire.
- Les boutons gardent une largeur et une hauteur stables pendant les états hover/loading.

### Cartes véhicule

- Image dominante en haut.
- Badge court : `Neuf`, `Vedette` ou `Occasion`.
- Marque en label secondaire, modèle en titre, année et kilométrage en données compactes.
- Prix visible et CTA directement accessible.
- Hover : légère translation ou mise à l'échelle de l'image, jamais de déplacement de la grille.

### Badges

- `rounded-full` pour les statuts et tags éditoriaux.
- Fond clair avec texte accent foncé pour les états neutres.
- Fond plein avec texte blanc pour les statuts importants.

## 7. Pages et hiérarchie

### Accueil

1. Header éditorial.
2. Hero asymétrique : promesse, sous-titre, CTA, image véhicule.
3. Sélection du moment : cartes ou carousel horizontal.
4. Processus en 5 étapes : recherche, inspection, paiement, expédition, livraison.
5. Bandeau image reportage sur la logistique internationale.
6. Raisons de choisir Xixi : inspection, réseau international, documents, paiement protégé.
7. Témoignages.
8. CTA final sombre et footer.

### Catalogue

- Filtres visibles mais compacts.
- Grille de véhicules à 3 colonnes desktop et 1 colonne mobile.
- Comparaison rapide : image, statut, prix, année, kilométrage et carburant.
- Pagination claire.

### Détail véhicule

- Galerie image prioritaire.
- Bloc prix et CTA visible sans chercher.
- Fiche technique dense mais lisible.
- Documents, garantie et livraison présentés comme preuves de confiance.
- Véhicules similaires en carousel éditorial.

### Dashboard admin

- Reprendre la logique éditoriale sous une forme plus dense et utilitaire.
- KPIs courts, tableaux scannables, actions directes.
- Ne pas transformer le dashboard en page marketing.

## 8. Motion et interactions

- Reveal vertical discret à l'entrée des sections.
- Translation de `4px` maximum au hover des cartes.
- Mise à l'échelle d'image limitée à `1.03` ou `1.05`.
- Transitions de `200ms` à `350ms` avec une courbe ease-out.
- Respect obligatoire de `prefers-reduced-motion`.
- Aucun effet continu qui détourne l'attention du catalogue ou des actions d'achat.

## 9. Internationalisation et RTL

- Toutes les chaînes visibles passent par `next-intl`.
- Le layout arabe utilise `dir="rtl"`.
- Remplacer les marges directionnelles par `ms-*` et `me-*`.
- Les carousels, icônes fléchées et alignements doivent être inversés en RTL.
- Les polices fallback doivent rester lisibles pour l'arabe.
- Les formats de prix, dates et nombres suivent la locale active.

## 10. Accessibilité et qualité

- Contraste WCAG AA minimum pour tout texte fonctionnel.
- Navigation clavier complète.
- États `focus-visible` visibles.
- `aria-label` sur les boutons icon-only.
- `alt` descriptifs sur les images de véhicules.
- Hiérarchie HTML correcte : un seul H1 par page, H2 par section.
- Les boutons dans les formulaires indiquent explicitement `type="button"` lorsqu'ils ne soumettent pas le formulaire.

## 11. Anti-patterns à éviter

- Template automobile générique avec hero sombre et cartes interchangeables.
- Accumulation de gradients décoratifs.
- Typographie sans caractère ou combinaison de plus de trois familles.
- Images d'ambiance qui masquent le véhicule.
- Texte essentiel en faible contraste.
- Sections pleines de cartes sans hiérarchie.
- Animations permanentes ou agressives.
- Mélange de styles entre pages publiques et dashboard.

## 12. Sources du concept

- Fichier de référence : `concept-3.html`.
- Direction : magazine éditorial automobile orienté export international.
- Système technique observé : Tailwind CDN, Syne, Outfit, Geist Mono, Lucide.
- Langues prévues : français, anglais, arabe.

## Statut

Charte graphique extraite du concept et prête pour validation. Aucun fichier applicatif n'est modifié par cette charte.
