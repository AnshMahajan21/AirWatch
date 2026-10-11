# AirWatch — Design System & Visual Philosophy

> *"The weather is the air."*  
> AirWatch treats air quality not as a clinical index or emergency alert, but as an atmospheric reality that shifts throughout the day. The visual experience is calm, tactile, illustrated, and deeply human.

---

## 🎨 Visual Invocations & References

| Reference | Applied In AirWatch | Visual Treatment |
|---|---|---|
| **Ref 5 (Barcelona UVI)** | Hero AQI Display & Timeline | Giant Fraunces serif numeral (140–220px) commanding visual focus; color-coded hourly dots on the diurnal timeline; frosted glass card with miniature status pills. |
| **Ref 1 (London Purple)** | Mobile Hero & Bottom Sheet | Full-bleed atmospheric background gradient; glass stat capsule (PM2.5 \| PM10 \| Station); spring-loaded rounded bottom sheet with grab handle sliding up to reveal hourly breakdowns. |
| **Ref 2 (Pastel City Cards)** | Tone & Statement Copy | Human headlines (*"It's hazy out."*, *"Clear skies for outdoor play."*); tactile metric pills; half-circle arc indicators. |
| **Ref 3 (8-Bit Pixel Widgets)** | School Safety Cards | Retro 8-bit styling reserved strictly for shareable campus advisories (`PixelCard`), formatted for WhatsApp and Instagram story screenshots. |
| **Ref 4 (Desktop Weather Dashboard)** | Desktop 1280px+ View | Left-hand `IconRail` navigation; central stage for hero AQI and hourly strip; right panel for cumulative exposure ArcGauge and 3-day forecast outlook. |

---

## 🌈 The 6 Atmospheric Worlds (CPCB Bands)

Every CPCB air band shifts the entire application atmosphere: background gradients, glass surface tints, border opacities, skyline haze, and sun visibility.

```
Good (0–50 AQI)           -> Pale mint, sky teal (#064e3b -> #10b981)
Satisfactory (51–100 AQI) -> Warm golden sand (#713f12 -> #eab308)
Moderate (101–200 AQI)    -> Amber-orange haze (#7c2d12 -> #f97316)
Poor (201–300 AQI)        -> Deep coral/salmon dusk (#881337 -> #f43f5e)
Very Poor (301–400 AQI)   -> Midnight plum-maroon (#3b0764 -> #9333ea)
Severe (401–500 AQI)      -> Near-black brown smog (#1c0a0a -> #581c24)
```

---

## 👁️ WCAG AA Contrast Compliance

AirWatch enforces strict WCAG AA contrast compliance across every single atmospheric world. Text colors are dynamically paired with backgrounds and glass cards to exceed:
- **Body text ($\ge 4.5:1$)**: White `#ffffff` against dark atmospheric gradients yields **$6.58:1$ to $19.14:1$**.
- **Hero Numeral ($\ge 3.0:1$)**: Fraunces font with light tints yields **$7.97:1$ to $15.67:1$**.

Run `npx tsx scripts/contrast-check.ts` anytime to re-validate contrast ratios.

---

## 🏛️ Layered Delhi Skyline SVG Component

The `<Skyline />` component is hand-rolled pure SVG under 25KB, providing deep atmospheric immersion without heavy raster imagery:

1. **Sun / Moon Disc**: Position and opacity scale with air quality. At *Severe*, the sun is dimmed to an obscured blood-orange ember disc.
2. **Stubble Burning Horizon**: Appears at *Poor*, *Very Poor*, and *Severe* as soft, horizontal smoke streaks on the outer horizon.
3. **Far Skyline**: Qutub Minar silhouette, distant domes, and modern high-rise office towers (Noida/Gurugram).
4. **Midground**: India Gate arch and Humayun's Tomb-style domes.
5. **Foreground Ridge**: Native Neem and Peepal tree silhouettes along the Delhi Ridge.
6. **Dynamic Haze Filters**: Two SVG Gaussian blur haze layers sit between depth planes, whose opacity and spread scale directly with measured PM2.5.

---

## 🔤 Typography & Hierarchy

- **Hero Numeral**: `Fraunces` (Serif Display) with `tabular-nums` tracking, scaled from `110px` on mobile up to `180px` on desktop.
- **UI & Controls**: `Plus Jakarta Sans`, clean grotesque styling with high legibility.
- **Retro Shareables**: `Press Start 2P` applied exclusively to the `PixelCard` component.

---

## 📐 Spatial Math & Anti-AI-Slop Rules

- **Zero-Pill Discipline**: Metadata is not wrapped in random static colored capsules. Labels are clean, unboxed text separated by typographic bullets (`·`).
- **Interactive Controls**: Segmented toggles have functional button click handlers with tactile feedback.
- **Single-Elevation Depth**: Glass cards maintain a single consistent elevation layer with `backdrop-filter: blur(20px)` and soft 1px translucent borders.
- **Motion Restraint**: All transitions use cubic spring physics (`motion/react`) and automatically halt when `prefers-reduced-motion` is enabled in system settings.
