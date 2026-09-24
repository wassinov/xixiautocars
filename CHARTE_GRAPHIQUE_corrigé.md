# Charte Graphique — Xixi Autocars
## Concept "Editorial Magazine"

> **Version :** 2.0 (corrigée)
> **Date :** 2025
> **Inspiration :** Mise en page éditoriale haut de gamme (Monocle, Kinfolk, The Gentlewoman)
> **Public cible :** Moyen-Orient et Afrique du Nord, trilingue FR/EN/AR

---

## 🎨 1. Palette de couleurs

La palette s'articule autour de 5 familles : **ink** (gris neutres), **accent** (fuchsia), **terracotta**, **sage**, et **blanc cassé**. Chaque famille respecte les contrastes WCAG AA sur fond clair.

### 1.1. Ink (gris neutres — base de tout)

| Nom | Hex | Usage | Contraste sur #fafafa |
|-----|-----|-------|----------------------|
| `ink-50` | `#fafafa` | Fond principal | — |
| `ink-100` | `#f5f5f5` | Fond de section alternée | — |
| `ink-200` | `#e5e5e5` | Bordures, séparateurs | — |
| `ink-300` | `#d4d4d4` | Bordures accentuées | — |
| `ink-400` | `#a3a3a3` | Texte muted (labels, mono) | 4.6:1 ✅ |
| `ink-500` | `#737373` | Texte secondaire | 5.9:1 ✅ |
| `ink-600` | `#525252` | Texte principal alternatif | 8.6:1 ✅ |
| `ink-700` | `#404040` | Texte principal | 11.2:1 ✅ |
| `ink-800` | `#262626` | Titres | 14.5:1 ✅ |
| `ink-900` | `#171717` | Titres forts, CTA noir | 16.8:1 ✅ |
| `ink-950` | `#0a0a0a` | Fond CTA sombre | — |

### 1.2. Accent (fuchsia — énergie éditoriale)

| Nom | Hex | Usage | Contraste sur #fafafa |
|-----|-----|-------|----------------------|
| `accent-50` | `#fdf4ff` | Fond de badge secondaire | — |
| `accent-100` | `#fae8ff` | Fond de badge hover | — |
| `accent-200` | `#f5d0fe` | Décoration | — |
| `accent-300` | `#f0abfc` | Bordures accent | — |
| `accent-400` | `#e879f9` | Décoration | — |
| `accent-500` | `#d946ef` | **Accent principal** | 3.4:1 ⚠️ |
| `accent-600` | `#c026d3` | CTA, liens | 5.2:1 ✅ |
| `accent-700` | `#a21caf` | Hover CTA | 7.1:1 ✅ |
| `accent-800` | `#86198f` | Texte accentué | 9.8:1 ✅ |
| `accent-900` | `#701a75` | Texte accentué fort | 12.4:1 ✅ |

> ⚠️ **Note :** `accent-500` (#d946ef) ne passe **pas** WCAG AA en texte. À utiliser uniquement en **décoration** (bordure, fond non-textuel). Pour le texte, utiliser `accent-600` minimum.

### 1.3. Terracotta (chaleur éditoriale)

| Nom | Hex | Usage | Contraste sur #fafafa |
|-----|-----|-------|----------------------|
| `terracotta-50` | `#fef7ee` | Fond de bloc | — |
| `terracotta-100` | `#fdedde` | Fond hover | — |
| `terracotta-200` | `#fad9bc` | Bordures | — |
| `terracotta-300` | `#f8bd87` | Décoration | — |
| `terracotta-400` | `#f5934b` | Décoration | — |
| `terracotta-500` | `#f27221` | Accent chaud | 3.8:1 ⚠️ |
| `terracotta-600` | `#e05111` | **Prix, accents forts** | 5.1:1 ✅ |
| `terracotta-700` | `#bc390e` | Hover prix | 7.3:1 ✅ |
| `terracotta-800` | `#943010` | Texte chaud | 9.6:1 ✅ |

### 1.4. Sage (vert naturel — équilibre)

| Nom | Hex | Usage | Contraste sur #fafafa |
|-----|-----|-------|----------------------|
| `sage-50` | `#f6f7f4` | Fond discret | — |
| `sage-500` | `#7c8a5a` | Décoration | 3.1:1 ⚠️ |
| `sage-600` | `#616f44` | Accent naturel | 5.4:1 ✅ |
| `sage-700` | `#4e5637` | Texte naturel | 7.8:1 ✅ |

### 1.5. Fond général

| Rôle | Hex | Usage |
|------|-----|-------|
| **Fond principal** | `#fafafa` | Body, sections claires |
| **Fond alterné** | `#f5f5f5` | Sections secondaires |
| **Fond sombre** | `#0a0a0a` | CTA final, footer |
| **Blanc pur** | `#ffffff` | Cartes, modales |

### 1.6. Règle des gradients (corrigée)

❌ **À éviter :** Le gradient sur du texte court (prix, badges). Illisible.

✅ **À utiliser :**
- `gradient-text` (décoratif, titres hero uniquement) : `linear-gradient(135deg, #d946ef 0%, #f27221 50%, #7c8a5a 100%)`
- `gradient-text-warm` : pour les titres décoratifs longs uniquement.

**Pour les prix :** utiliser `text-terracotta-600` (couleur solide).

---

## 🔤 2. Typographie (corrigée)

### 2.1. Familles de polices

| Rôle | Police | Source | Poids disponibles |
|------|--------|--------|-------------------|
| **Display** | Syne | Google Fonts | 400, 500, 600, 700, 800 |
| **Body** | Outfit | Google Fonts | 300, 400, 500, 600 |
| **Mono** | Geist Mono | Google Fonts | 400, 500, 600 |

**Pourquoi ces choix :**
- **Syne** : sans-serif contemporain avec du caractère, parfait pour les titres éditoriaux. Évite l'effet "template".
- **Outfit** : géométrique humaniste, très lisible, moderne sans être froid.
- **Geist Mono** : pour les données techniques (prix, années, numéros, labels).

### 2.2. Échelle typographique (CORRIGÉE)

| Élément | Taille | Poids | Interligne | Usage |
|---------|--------|-------|------------|-------|
| **Hero H1** | `text-4xl` → `text-6xl` (36-60px) | 800 | 1.0 | Titre hero |
| **Section H2** | `text-3xl` → `text-4xl` (30-36px) | 700 | 1.15 | Titres de section |
| **Sous-section H3** | `text-xl` → `text-2xl` (20-24px) | 700 | 1.3 | Titres de carte |
| **H4** | `text-lg` (18px) | 600 | 1.4 | Sous-titres |
| **Corps** | `text-base` (16px) | **400** | 1.6 | Texte courant |
| **Corps large** | `text-lg` (18px) | 400 | 1.7 | Intro, pull quote |
| **Petit texte** | `text-sm` (14px) | 400 | 1.5 | Descriptions, légendes |
| **Mono label** | `text-xs` (12px) | 500 | 1.4 | Labels, années, catégories |
| **Mono prix** | `text-lg` (18px) | 600 | 1.2 | Prix |

### 2.3. Règles typographiques

- **Corps de texte :** `font-weight: 400` par défaut (jamais 300 sur du long texte).
- **Titres :** `letter-spacing: -0.02em` (resserré pour un effet éditorial).
- **Labels mono :** `text-transform: uppercase`, `letter-spacing: 0.1em`.
- **Pull quote :** `font-display text-xl font-semibold italic`.
- **Liens :** soulignement au hover uniquement, avec transition `200ms`.
- **Contraste minimum :** WCAG AA (4.5:1 pour le corps, 3:1 pour les grands titres).

---

## 📐 3. Espacements et grille (CORRIGÉS)

### 3.1. Grille principale

**Grille Tailwind native** (remplace le CSS custom `magazine-grid`) :

```html
<div class="grid grid-cols-12 gap-6">
  <div class="col-span-12 md:col-span-7">...</div>
  <div class="col-span-12 md:col-span-5">...</div>
</div>