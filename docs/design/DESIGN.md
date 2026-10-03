# NexTure Design System

## 1. Overview

**Product name:** NexTure  
**Brand direction:** Executive / Premium / Minimal / Modern  
**Core feeling:** Professional, trustworthy, structured, refined, heritage-inspired

NexTure is a digital platform for preserving, managing, activating, and sharing enterprise culture assets.

The visual language should reflect:
- professionalism
- clarity
- premium quality
- cultural depth
- modern technology

---

## 2. Brand Personality

### Keywords
- Executive
- Premium
- Trustworthy
- Structured
- Minimal
- Cultural depth
- Modern

### Avoid
- Overly playful UI
- Too many bright colors
- Cartoonish illustrations
- Messy layouts
- Visual styles that feel too casual or youthful

---

## 3. Logo

### Primary logo
Use the provided horizontal NexTure logo with:
- symbol on the left
- wordmark on the right
- “EXECUTIVE” in a thin uppercase style
- “NEXTURE” in a bold uppercase style

### Logo meaning
The mark combines:
- an architectural / structural feeling
- a premium and executive identity
- a cultural / heritage reference through the classical column detail

### Logo usage rules
- Prefer the full logo on light backgrounds
- Keep sufficient clear space around the logo
- Do not stretch, distort, rotate, or recolor arbitrarily
- Do not place the logo on overly busy backgrounds
- Use monochrome versions only when necessary

### Recommended asset files
- `/assets/brand/nexture-logo-primary.svg`
- `/assets/brand/nexture-logo-primary.png`
- `/assets/brand/nexture-icon.svg`
- `/assets/brand/nexture-icon.png`
- `/assets/brand/nexture-logo-dark.svg`
- `/assets/brand/nexture-logo-light.svg`

---

## 4. Color System

> The following brown values are initial approximations based on the current logo. Final values should be sampled from the original vector/source file when available.

### Primary Colors
- **Executive Brown:** `#8B572A`
- **Warm Brown Accent:** `#A5662E`
- **Premium Black:** `#111111`

### Neutral Colors
- **Text Primary:** `#1A1A1A`
- **Text Secondary:** `#4F4F4F`
- **Border / Divider:** `#D9D9D9`
- **Soft Background:** `#F7F5F3`
- **White:** `#FFFFFF`

### Recommended usage
- Brown = brand highlights, active states, selected elements, premium accents
- Black = headings, navigation, key information
- White / soft neutral = main surfaces and breathing space
- Avoid introducing unnecessary accent colors

### Suggested visual balance
- 60% neutral / light background
- 25% black / dark text
- 15% brown accents

---

## 5. Typography

### General direction
Use clean, modern and highly readable sans-serif typography.

### Suggested font stack
1. `Inter`
2. `Manrope`
3. `Plus Jakarta Sans`
4. Fallback: `Arial, sans-serif`

### Hierarchy
- **H1:** Bold, large, clear, executive
- **H2:** Semi-bold / bold
- **H3:** Semi-bold
- **Body:** Regular, highly readable
- **Caption / Metadata:** Smaller, neutral and subtle

### Typography rules
- Maintain generous line-height
- Avoid decorative fonts
- Use uppercase selectively for labels, navigation and section markers
- Large headings should feel premium rather than flashy

---

## 6. Visual Language

### Overall direction
The interface should feel:
- clean
- premium
- structured
- light but serious
- modern with subtle cultural depth

### Shapes
- Prefer clean rectangular forms
- Use subtle corner rounding
- Recommended radius: `10px–16px`

### Shadows
- Use soft, low-contrast shadows
- Keep elevation minimal

### Borders / Dividers
- Thin and subtle
- Avoid visually heavy outlines unless required for state clarity

### Icons
- Simple
- Consistent
- Minimal detail
- Consistent stroke weight

### Imagery
Prioritize:
- company heritage
- milestones
- founders and people
- culture stories
- historical documents
- workplace culture
- authentic corporate moments

Avoid generic stock imagery whenever possible.

---

## 7. Layout Principles

- Use generous whitespace
- Keep composition structured and calm
- Prioritize readability and information hierarchy
- Use a consistent desktop grid
- Maintain clear alignment between cards, sections and content blocks
- Information-heavy screens should still feel elegant
- Brown should function primarily as an accent, not as a dominant full-page background

---

## 8. UI Components

### Primary Button
- Background: `#8B572A`
- Text: `#FFFFFF`
- Weight: Medium / Semi-bold
- Clean, premium appearance

### Secondary Button
- Background: `#FFFFFF`
- Border: `#D9D9D9`
- Text: `#1A1A1A`

### Tertiary / Text Button
- Transparent background
- Brown or black text
- Minimal styling

### Input Fields
- White background
- Subtle neutral border
- Brown-accent focus state
- Clear validation state without excessive color

### Cards
- White or soft neutral surface
- Gentle border or soft shadow
- Spacious internal padding
- Strong title hierarchy
- Muted supporting metadata

### Tags / Labels
- Neutral tags for metadata and structure
- Brown-tinted tags for selected cultural categories or highlights

### Tables / Lists
- High readability
- Clear row separation
- Minimal visual noise
- Use hierarchy before decoration

---

## 9. Product-specific UI Direction

### 9.1 Digital Culture Hub

The Hub is the private workspace where each enterprise manages and develops its cultural assets.

It should feel:
- structured
- focused
- professional
- operational
- premium B2B SaaS

Recommended UI patterns:
- dashboard
- Culture Library
- Culture Item cards
- Culture Timeline
- People & Legacy
- Culture Stories
- search and filtering
- metadata panels
- upload and AI-processing flows
- review / approval states

The Hub should prioritize productivity, clarity and content management over decorative storytelling.

### 9.2 Enterprise Culture Atlas

The Atlas is NexTure's public-facing discovery layer where approved cultural content can be published and explored.

It should feel:
- curated
- editorial
- premium
- open
- discoverable
- culturally rich

Recommended UI patterns:
- public enterprise Culture Profile
- featured Culture Stories
- visual Culture Timeline
- People & Legacy sections
- milestone storytelling
- company discovery and search
- category / Culture Tag exploration

The Atlas may be more expressive and editorial than the Hub, while remaining visually consistent with the NexTure brand.

---

## 10. UX Principles

- Make information easy to scan
- Keep flows simple and calm
- Reduce unnecessary visual complexity
- Maintain a premium B2B experience
- Design for clarity first, decoration second
- Make every screen feel intentional and organized
- Use progressive disclosure for complex content
- Keep actions predictable and easy to understand

---

## 11. Design Tokens

```css
:root {
  --nexture-brown: #8B572A;
  --nexture-brown-accent: #A5662E;
  --nexture-black: #111111;

  --nexture-text-primary: #1A1A1A;
  --nexture-text-secondary: #4F4F4F;

  --nexture-border: #D9D9D9;
  --nexture-bg-soft: #F7F5F3;
  --nexture-white: #FFFFFF;

  --nexture-radius-sm: 10px;
  --nexture-radius-md: 12px;
  --nexture-radius-lg: 16px;
}
```

---

## 12. Recommended UI Mood

### Mood keywords
- Executive software
- Modern heritage
- Premium enterprise
- Structured storytelling
- Minimal cultural technology

The product should combine the discipline of enterprise software with the depth and storytelling quality of a cultural archive.

---

## 13. Do / Don't

### Do
- Use brown and black as the core identity
- Keep interfaces refined and spacious
- Use clean typography
- Build strong visual hierarchy
- Use authentic enterprise culture imagery
- Maintain consistency across Hub and Atlas
- Keep the brand credible and long-term

### Don't
- Use too many accent colors
- Make the interface playful or gimmicky
- Overdecorate sections
- Use heavy gradients throughout the interface
- Create excessive glassmorphism or trendy visual effects
- Make information-dense screens feel crowded
- Use generic cultural motifs without a clear purpose

---

## 14. Tech Handoff

Treat this file as the baseline visual specification for NexTure.

Recommended implementation order:
1. Export final logo assets as SVG and PNG
2. Confirm exact logo color values from the original source file
3. Convert colors into reusable design tokens
4. Define typography and spacing scale
5. Build reusable base components
6. Build the Digital Culture Hub first
7. Apply the same design language to the Enterprise Culture Atlas
8. Extend this document when new components or patterns are approved

Potential future files:
- `brand.md`
- `ui-components.md`
- `product-screens.md`
- `content-style.md`

---

## 15. Source Asset

Primary brand reference: the current NexTure logo supplied by the project team.

Core visual direction:
**Brown + Black / Executive / Premium / Minimal / Modern Heritage**

---

## 16. Implementation notes (code)

- Tokens live in `packages/config/tokens.css`. Mapping: primary `#8B572A`, primary-dark `#754726` (sampled from the logo source), accent `#A5662E`, surface-dark `#111111`, ink `#1A1A1A`, ink-mute `#4F4F4F`, canvas `#F7F5F3`. Semantic success/error/warning/info keep their own hues for states only.
- Logo files: `apps/*/public/brand/nexture-logo.png` (primary), `nexture-logo-light.png` (on dark), `nexture-mark.png`, `nexture-mark-light.png`. Sources: `docs/design/brand/`. SVG exports are still needed from the original vector file.
- Font: Inter only (300–700).
