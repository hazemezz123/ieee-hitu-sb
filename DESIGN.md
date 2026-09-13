# Design System Document: The Global Tech Authority

## 1. Overview & Creative North Star: "The Architectural Blueprint"
The Creative North Star for this design system is **The Architectural Blueprint**. IEEE is the foundation upon which global technology is built. Therefore, the UI must feel like a masterwork of engineering: precise, structural, and indisputably authoritative. 

We move beyond "standard" corporate layouts by embracing **Mathematical Asymmetry**. By utilizing the "IEEE Wedge" (45° and 135° angles) not just as a logo, but as a spatial driver, we create a layout that feels dynamic yet stable. This system rejects the "boxed-in" look of traditional web design in favor of expansive white space, editorial-grade typography, and layered tonal depth.

---

## 2. Colors: Tonal Authority
Our palette is rooted in the heritage of IEEE Blue, but we execute it through a sophisticated "Material-Plus" approach. 

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. Structural integrity is achieved through **Background Shifts**. 
*   Place a `surface-container-low` (#f3f3f3) section against a `surface` (#f9f9f9) background to create a crisp, professional boundary without the "clutter" of lines.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
*   **The Foundation:** `surface` (#f9f9f9) or `surface-container-lowest` (#ffffff).
*   **The Inset:** Use `surface-container` (#eeeeee) for secondary utility areas.
*   **The High-Focus:** Use `surface-container-highest` (#e2e2e2) for navigation or persistent sidebars.
*   **The Wedge Gradient:** For high-impact CTAs or Hero sections, use a subtle linear gradient (135°) transitioning from `primary` (#004976) to `primary-container` (#00629b). This adds "soul" and depth to the tech-focused aesthetic.

### Glassmorphism & Accent Usage
Use `secondary-container` (#42d0fe) at 15% opacity with a `backdrop-filter: blur(12px)` for floating navigation elements. This "frosted cyan" effect maintains high-tech transparency while ensuring text remains WebAIM compliant.

---

## 3. Typography: Editorial Precision
We use **Open Sans** (rendered as Inter-style weight scales) to convey a sense of modern clarity. The hierarchy is driven by dramatic scale shifts.

*   **Display-LG (3.5rem):** Set with -0.02em letter spacing. This is your "Statement" type. Use it sparingly for global technological declarations.
*   **Headline-MD (1.75rem):** The workhorse for section headers. Always pair with generous top-padding to let the "Blueprint" breathe.
*   **Body-LG (1rem):** Optimized for long-form technical white papers. Use a line-height of 1.6 to ensure maximum readability and "High Trust."
*   **Label-SM (0.6875rem):** Uppercase with +0.05em tracking. Use this for technical metadata or categories, evoking the look of a schematic legend.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are forbidden. We define depth through environmental light and tonal stacking.

*   **The Layering Principle:** To "lift" a card, simply change its token from `surface-container-low` to `surface-container-lowest`. The eye perceives the brighter white as being closer to the light source.
*   **Ambient Shadows:** If a floating element (like a modal) is required, use a shadow with a 40px blur and 4% opacity, using the `on-surface` (#1b1b1b) color. It should feel like a soft glow, not a hard edge.
*   **The "Ghost Border" Fallback:** For accessibility in high-density data tables, use the `outline-variant` (#c0c7d1) at **15% opacity**. It should be felt, not seen.
*   **The Wedge Anchor:** Use 45-degree angled masks on the corners of large images or container backgrounds to reinforce the IEEE brand geometry without adding literal logos.

---

## 5. Components: Engineered Elements

### Buttons
*   **Primary:** Solid `primary` (#004976) with `on-primary` (#ffffff) text. Radius: `md` (0.375rem). Apply a 135° "Wedge" clip-path to the top-right corner for a signature brand feel.
*   **Secondary:** `surface-container-lowest` (#ffffff) with a `primary` "Ghost Border."
*   **Tertiary:** Text-only, using `primary` color, with an underline that only appears on hover.

### Cards & Lists
*   **The Divider-Free Rule:** Use vertical whitespace (referencing our `xl` spacing) to separate content. 
*   **Interaction:** On hover, a card should not move up; instead, increase the background brightness from `surface-container-low` to `surface-container-lowest`.

### Input Fields
*   **Styling:** Use a `surface-container` background with a bottom-only `outline` (#717881) at 2px. This mimics a technical form or a blueprint line.
*   **States:** On focus, the bottom line transitions to `accent-cyan` (#00B5E2).

### The "Authority" Chip
*   Used for technical status (e.g., "Standardized," "Draft"). 
*   Style: `tertiary-container` (#00686f) background with `on-tertiary-container` (#75e8f3) text. Small, sharp, and high-contrast.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use 45-degree and 135-degree angles in layout transitions (e.g., a diagonal background split).
*   **Do** embrace extreme white space. A "Global Tech Authority" is never rushed or crowded.
*   **Do** use `primary-fixed-dim` (#98cbff) for subtle highlights in dark-mode or high-density technical charts.

### Don't:
*   **Don't** use 100% black (#000000) for body text; use `on-surface` (#1b1b1b) to reduce eye strain while maintaining high contrast.
*   **Don't** use rounded corners larger than `xl` (0.75rem). The system should feel "engineered" and precise, not "bubbly" or consumer-soft.
*   **Don't** use standard dividers. If the layout feels messy, increase the padding, don't add a line.