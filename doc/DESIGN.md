# Design System Document: The Monolithic Minimum

## 1. Overview & Creative North Star
**Creative North Star: "The Architectural Void"**
This design system is not a collection of UI components; it is a framework for digital architecture. By stripping away the "noise" of traditional dashboards—borders, vibrant accents, and heavy shadows—we create a "Cockpit" experience that feels like a physical high-end space. We break the "template" look through **Intentional Asymmetry** and **Tonal Depth**. Information is not contained; it is presented. The system relies on the tension between bold, precise typography and expansive "breathing room" (negative space) to guide the user’s eye.

## 2. Colors: The Monochrome Constraint
The palette is strictly restricted to achieve a surgical, high-end aesthetic. We use a monochromatic spectrum to define functionality.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section off the UI. Containers and sections must be defined solely through background color shifts. A section might use `surface-container-low` (#f3f4f5) sitting on a `background` (#f8f9fa).

### Surface Hierarchy & Nesting
Treat the UI as stacked sheets of fine paper. Hierarchy is achieved by nesting surface tokens:
- **Level 0 (Base):** `surface` (#f8f9fa)
- **Level 1 (Sectioning):** `surface-container-low` (#f3f4f5)
- **Level 2 (Active Cards):** `surface-container-lowest` (#ffffff)
- **Level 3 (Popovers/Modals):** `surface-bright` (#f8f9fa) with ambient occlusion.

### The "Glass & Gradient" Rule
To prevent a "flat" or "cheap" feel, use **Glassmorphism** for floating navigation or utility bars. Use a semi-transparent `surface-container-lowest` (80% opacity) with a `32px` backdrop blur. 
*Signature Polish:* Main CTAs should use a subtle linear gradient from `primary` (#000000) to `primary-container` (#3c3b3b) at a 145-degree angle to provide a satin-like texture.

## 3. Typography: Editorial Precision
We use **Inter** with precise weighting. The goal is an editorial feel where the scale does the work that color usually performs.

- **Display (lg/md/sm):** Used for key data points or high-level greetings. Always `Weight: 600` (Semi-bold) with `-0.02em` letter spacing.
- **Headline (lg/md/sm):** For page headers. `Weight: 500` (Medium).
- **Title (lg/md/sm):** For card titles and section headers. `Weight: 600`.
- **Body (lg/md/sm):** Standard information. `Weight: 400`. For "secondary" body text, use `on_surface_variant` (#474747) rather than a smaller font size.
- **Label (md/sm):** For data labels and captions. Always `Weight: 500` and `Uppercase` with `+0.05em` tracking for a premium, technical feel.

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are replaced with **Ambient Occlusion**—the soft darkening that occurs when two surfaces are near each other.

- **The Layering Principle:** Place a card of `surface-container-lowest` (#ffffff) onto a background of `surface-container-low` (#f3f4f5). The contrast provides all the "lift" required.
- **Ambient Shadows:** For floating elements (Modals/Dropdowns), use: `box-shadow: 0 20px 40px rgba(0,0,0, 0.04);`. The shadow color must be a tinted version of the `on-surface` color.
- **The "Ghost Border" Fallback:** If a boundary is required for accessibility (e.g., in a high-density table), use the `outline-variant` (#c6c6c6) at **10% opacity**. Never use a 100% opaque border.

## 5. Components: Surgical Primitives

### Buttons
- **Primary:** `primary` (#000000) background, `on_primary` (#e5e2e1) text. Radius: `8px`. No border.
- **Secondary:** `surface-container-high` (#e7e8e9) background, `primary` (#000000) text.
- **Tertiary:** No background. `primary` text. `Weight: 600`.

### Cards & Lists
- **Rule:** Forbid the use of divider lines. 
- **Execution:** Separate list items using the spacing scale (e.g., `1.5` / `0.5rem` vertical gap) or alternating subtle background shifts. Cards use a `12px` to `16px` radius.

### Input Fields
- **Style:** Subtle `surface-container-highest` (#e1e3e4) background. 
- **Focus:** Transition the background to `surface-container-lowest` (#ffffff) and apply a `1px` Ghost Border (20% opacity `primary`). No glowing outer shadows.

### Status Indicators
Secondary colors are permitted *only* here.
- **Error:** `error` (#ba1a1a) used sparingly in small icons or subtle text.
- **Success:** Use a muted forest green (not in palette, used as an exception) or simply a `primary` checkmark for a cleaner look.

### The "Cockpit" Telemetry (Custom Component)
Large, high-contrast data readouts. Use `display-lg` typography with a `label-sm` (Uppercase) descriptor positioned exactly `0.35rem` (Spacing `1`) above the value.

## 6. Do’s and Don’ts

### Do
- Use **Spacing Scale 16 (5.5rem)** for top-level page margins to create a "gallery" feel.
- Use **Asymmetry**: Align content to a 12-column grid but leave the final 3 columns empty for "visual relief."
- Use **Weight over Color**: To emphasize an element, make it `Bold` rather than a different color.

### Don’t
- **No Pure Black Text on White:** Use `on_surface` (#191c1d) for body text to reduce eye strain and maintain a premium softness.
- **No 90-degree Corners:** Even the smallest "status" chips must have at least a `sm` (0.25rem) radius.
- **No Dividers:** If you feel the need to draw a line, try adding `1.4rem` (Spacing `4`) of whitespace instead.