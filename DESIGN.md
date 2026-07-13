---
name: Origintag Design System
colors:
  surface: '#101415'
  surface-dim: '#101415'
  surface-bright: '#363a3b'
  surface-container-lowest: '#0b0f10'
  surface-container-low: '#191c1e'
  surface-container: '#1d2022'
  surface-container-high: '#272a2c'
  surface-container-highest: '#323537'
  on-surface: '#e0e3e5'
  on-surface-variant: '#c1c8c4'
  inverse-surface: '#e0e3e5'
  inverse-on-surface: '#2d3133'
  outline: '#8b928e'
  outline-variant: '#414845'
  surface-tint: '#a9cfc0'
  primary: '#a9cfc0'
  on-primary: '#13362c'
  primary-container: '#062c22'
  on-primary-container: '#719587'
  inverse-primary: '#426559'
  secondary: '#b2e630'
  on-secondary: '#263500'
  secondary-container: '#97c901'
  on-secondary-container: '#3a5000'
  tertiary: '#9ed1bd'
  on-tertiary: '#00382a'
  tertiary-container: '#002d22'
  on-tertiary-container: '#669886'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4ebdb'
  primary-fixed-dim: '#a9cfc0'
  on-primary-fixed: '#002118'
  on-primary-fixed-variant: '#2b4d42'
  secondary-fixed: '#bff43f'
  secondary-fixed-dim: '#a4d71e'
  on-secondary-fixed: '#151f00'
  on-secondary-fixed-variant: '#384e00'
  tertiary-fixed: '#b9eed9'
  tertiary-fixed-dim: '#9ed1bd'
  on-tertiary-fixed: '#002118'
  on-tertiary-fixed-variant: '#1c4f40'
  background: '#101415'
  on-background: '#e0e3e5'
  surface-variant: '#323537'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 60px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 1.5rem
  margin-desktop: 4rem
  margin-mobile: 1rem
  unit-xs: 0.25rem
  unit-sm: 0.5rem
  unit-md: 1rem
  unit-lg: 2rem
  unit-xl: 4rem
---

## Brand & Style

The design system is anchored in a philosophy of "Organic Intelligence." It bridges the gap between high-precision AI technology and the grounding stability of the natural world. The brand personality is authoritative yet visionary, evoking a sense of growth and pioneering exploration.

The visual style is a fusion of **Corporate Modern** and **Glassmorphism**. It utilizes deep, immersive greens to establish a premium "dark-mode-first" foundation, layered with semi-transparent frosted surfaces that represent the clarity and speed of AI. Vibrant lime accents serve as high-energy catalysts for interaction, ensuring the UI feels alive and responsive. The overall emotional response should be one of profound trust, cutting-edge innovation, and ecological harmony.

## Colors

The palette is derived from deep coniferous forests and alpine landscapes.

- **Primary (Deep Forest):** Used for background surfaces and deep structural elements to create a sense of vast depth.
- **Secondary (Vibrant Lime):** A high-visibility accent color reserved for primary calls to action, focus states, and critical data highlights.
- **Tertiary (Mountain Moss):** Used for subtle borders, secondary containers, and supporting gradients to add layered depth.
- **Neutral (Alpine Mist):** A range of off-whites and cool greys used for high-contrast typography and iconography against dark backgrounds.

The default mode is **Dark**, utilizing high-opacity backgrounds to maintain a premium, cinematic feel.

## Typography

This design system employs a dual-sans-serif pairing to balance character with utility.

**Manrope** is used for headlines to convey modern engineering and refinement. Large display titles should use tighter letter-spacing to appear more impactful and cohesive.

**Hanken Grotesk** is utilized for body text and labels. Its high legibility and neutral character provide a clean reading experience, essential for complex AI data presentation. For mobile, headline sizes are scaled down aggressively to ensure no more than 3-4 words per line, maintaining readability on narrow viewports.

## Layout & Spacing

The layout utilizes a **fluid grid system** based on a 12-column structure for desktop and a 4-column structure for mobile.

- **Desktop:** Large horizontal margins (64px+) create a "gallery" feel for content, emphasizing the premium nature of the agency.
- **Mobile:** Margins are reduced to 16px to maximize screen real estate, while vertical spacing between sections remains generous (64px+) to prevent visual clutter.
- **Rhythm:** An 8px linear scale (unit-sm) governs all padding and margins, ensuring a consistent mathematical harmony across all components.

## Elevation & Depth

Hierarchy is established through **Glassmorphism and Tonal Layering**.

1.  **Base Layer:** Solid `#062C22` (Deep Forest) representing the furthest background.
2.  **Mid Layer (Cards):** Semi-transparent `#1A4D3E` with a 20px backdrop-blur and a 1px soft white border at 10% opacity. This creates the "frosted forest" effect.
3.  **Top Layer (Floating Elements):** High-opacity surfaces with ambient, diffused shadows. Shadows are tinted with the primary green color (`rgba(6, 44, 34, 0.4)`) rather than pure black to maintain color richness.
4.  **Interactive States:** Elements slightly "glow" or lift when hovered, using a subtle lime-colored outer glow.

## Shapes

The shape language is **Rounded**, reflecting organic forms found in nature.

- UI elements like buttons and input fields use a base radius of 8px (0.5rem).
- Large cards and containers use 16px (1rem) or 24px (1.5rem) to soften the overall interface and make it feel more approachable.
- Icons should feature slightly rounded terminals to match the corner radii of the containers they inhabit.

## Components

### Buttons
- **Primary:** Solid Lime (`#BEF33E`) with dark forest text. High-contrast, no shadow, slightly rounded corners.
- **Secondary:** Semi-transparent green with a 1px lime border.
- **Ghost:** Alpine Mist text with no background, highlighting on hover with a subtle green tint.

### Cards
Cards are the hallmark of this system. They must utilize `backdrop-filter: blur(20px)` and a subtle linear gradient from top-left (more opaque) to bottom-right (more transparent).

### Input Fields
Inputs feature a dark, semi-transparent background with a 1px border. On focus, the border transitions to Lime with a subtle glow effect.

### Chips & Tags
Used for AI categories or status indicators. They should be small, pill-shaped, and use the Mountain Moss (`#1A4D3E`) background with Alpine Mist text.

### Progress Bars
Data visualizations and loaders should use a Lime-to-Forest gradient to represent growth and completion.