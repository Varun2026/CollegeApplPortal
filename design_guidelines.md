# Design Guidelines: College Application Encryption System

## Design Approach
**Selected Approach:** Modern Utility-Focused Design System
**Justification:** This is a form-heavy, security-critical application requiring trust, clarity, and efficiency. Drawing inspiration from Linear's clean interface, Notion's content hierarchy, and enterprise form systems for optimal data submission experience.

**Key Design Principles:**
- Trust through minimalism and clarity
- Progressive disclosure via multi-step flow
- Security-first visual language
- Professional, institutional credibility

## Core Design Elements

### A. Color Palette

**Primary (Trust & Security):**
- Primary Blue: 217 91% 60% (buttons, active states, progress indicators)
- Primary Dark: 217 91% 45% (hover states)

**Neutrals (Clean Interface):**
- Background: 0 0% 100% (light mode)
- Surface: 0 0% 98% (cards, form containers)
- Border: 220 13% 91%
- Text Primary: 222 47% 11%
- Text Secondary: 215 14% 34%

**Semantic Colors:**
- Success: 142 71% 45% (submission confirmation)
- Error: 0 84% 60% (validation errors)
- Warning: 38 92% 50% (file size warnings)
- Info: 199 89% 48% (encryption status)

**Dark Mode:**
- Background: 222 47% 11%
- Surface: 217 33% 17%
- Border: 217 20% 25%

### B. Typography

**Font Stack:**
- Primary: 'Inter', system-ui, sans-serif (via Google Fonts CDN)
- Monospace: 'JetBrains Mono', monospace (for encrypted data display)

**Hierarchy:**
- H1 (Page Title): text-3xl font-bold (30px)
- H2 (Section Headers): text-2xl font-semibold (24px)
- H3 (Step Titles): text-xl font-medium (20px)
- Body: text-base (16px)
- Small: text-sm (14px)
- Labels: text-sm font-medium uppercase tracking-wide

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16
- Micro spacing (gaps, padding): p-2, p-4
- Component spacing: p-6, p-8
- Section spacing: py-12, py-16
- Container padding: px-4 md:px-8

**Grid System:**
- Max container width: max-w-4xl (form optimal reading width)
- Admin dashboard: max-w-6xl
- Form fields: Full width within container
- Two-column layouts for name/email splits: grid-cols-1 md:grid-cols-2 gap-4

### D. Component Library

**Forms & Inputs:**
- Input fields: Rounded corners (rounded-lg), subtle border, focus ring with primary color
- Labels: Above input, font-medium, text-sm
- Helper text: Below input, text-xs, text-secondary
- Error states: Red border, error message in semantic error color
- File upload: Dashed border dropzone, drag-and-drop interaction, file preview cards

**Multi-Step Progress:**
- Horizontal stepper with 4 steps
- Active step: Primary color with larger circle indicator
- Completed steps: Check icon, muted primary
- Inactive steps: Gray with number
- Step connector: Horizontal line between circles

**Buttons:**
- Primary: Solid primary blue background, white text, rounded-lg, shadow-sm
- Secondary: Outline style with primary border
- Sizes: px-6 py-3 for primary actions, px-4 py-2 for secondary
- States: Subtle hover lift (shadow-md on hover), disabled with opacity-50

**Cards:**
- White/surface background
- Border: 1px solid border color
- Shadow: shadow-sm for elevation
- Padding: p-6 to p-8
- Rounded: rounded-xl

**Navigation:**
- Clean header with logo/title left, security indicator right
- Fixed position during scroll
- Background: Surface color with subtle bottom border
- Height: h-16

**Data Display (Admin):**
- Table layout with alternating row colors
- Encrypted data: Monospace font, truncated with expand option
- Decrypt button: Info color, icon + text
- Timestamp: text-xs, muted

**Feedback Elements:**
- Success toast: Green background, white text, slide-in from top
- Error banner: Red background, within form container
- Loading states: Spinner with "Encrypting..." text
- Confirmation modal: Centered, overlay backdrop

### E. Animations

**Minimal, Purposeful Motion:**
- Step transitions: Smooth fade + slide (200ms ease-in-out)
- Button hover: Subtle scale (1.02) and shadow increase
- Form validation: Shake animation on error (300ms)
- Success state: Checkmark draw animation (500ms)
- NO scroll-triggered animations, NO complex parallax

## Page-Specific Guidelines

**Application Form (Main Interface):**
- Centered single-column layout, max-w-4xl
- Progress stepper at top, always visible
- Form container: White card with generous padding (p-8)
- Navigation buttons: Right-aligned, Next/Back pattern
- Step content: Fade transition between steps

**Admin Dashboard:**
- Two-column header: Title left, decrypt-all action right
- Data table: Striped rows, hover state on rows
- Modal for decrypted view: Overlay with structured data display
- Empty state: Centered icon + message when no applications

**Review Step:**
- Read-only summary of all entered data
- Edit buttons next to each section to jump back
- Encryption status indicator: "Ready to encrypt and submit"
- Submit button: Prominent, primary color, full width on mobile

## Accessibility & Responsiveness

- Mobile-first: Stack all form elements vertically on small screens
- Desktop: Utilize two-column for name/email, phone/GPA pairs
- Focus indicators: Prominent 2px ring in primary color
- Label-input associations: Proper for attributes
- Error announcements: ARIA live regions
- High contrast maintained in both light and dark modes

## Security Visual Language

- Lock icon in header indicating secure connection
- "End-to-End Encrypted" badge near submit button
- Encryption status: Real-time indicator showing "Encrypting data..." during process
- Random IV display: Small technical detail for transparency (monospace, muted)
- Professional color scheme avoiding overly vibrant colors to maintain institutional trust