# Design Guidelines: Next-Generation Stress Tracking Web App

## Design Approach

**Reference-Based Hybrid:** Drawing inspiration from wellness leaders (Calm, Headspace) for emotional design, Apple Health for data visualization clarity, and ChatGPT for conversational AI interface. The dark theme creates a calming, focused environment that reduces eye strain during extended use.

**Core Design Principles:**
- Calming presence over clinical data display
- Gentle animations that soothe rather than distract
- Neumorphic depth with subtle gradients
- Progressive disclosure of complex data
- Trust-building through clarity and transparency

## Typography

**Font System:**
- Primary: Inter (400, 500, 600, 700) - Clean, readable for data and UI
- Display/Headers: Plus Jakarta Sans (600, 700, 800) - Soft, modern feel for major headings
- Monospace: JetBrains Mono (400, 500) - For numerical data and stress scores

**Type Scale:**
- Hero/Display: text-5xl to text-7xl (Plus Jakarta Sans, font-bold)
- Section Headers: text-3xl to text-4xl (Plus Jakarta Sans, font-semibold)
- Card Titles: text-xl to text-2xl (Inter, font-semibold)
- Body Text: text-base (Inter, font-normal)
- Captions/Meta: text-sm (Inter, font-medium)
- Data Points: text-lg to text-3xl (JetBrains Mono, font-medium)

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Component padding: p-6 to p-8 for cards
- Section spacing: py-16 to py-24 for major sections
- Gaps: gap-4 to gap-8 for grids and flex layouts
- Inner spacing: space-y-4 for vertical stacks

**Grid System:**
- Dashboard: 12-column grid on desktop (grid-cols-12)
- Cards: 2-column on tablet (md:grid-cols-2), 3-column on desktop (lg:grid-cols-3)
- Full-width sections with max-w-7xl container

**Container Strategy:**
- Main app: max-w-screen-2xl mx-auto
- Dashboard cards: Constrained width with breathing room
- Chat interface: max-w-4xl for optimal reading
- Modals: max-w-2xl centered

## Component Library

### Core UI Elements

**Cards (Neumorphic Style):**
- Soft shadows with dual-layer effect (shadow-lg + shadow-inner)
- Subtle gradient backgrounds (from darker to lighter shades)
- Rounded corners: rounded-2xl to rounded-3xl
- Border: 1px solid with subtle opacity
- Hover state: gentle lift with increased shadow
- Padding: p-6 to p-8

**Buttons:**
- Primary: Gradient background with blur backdrop when over images
- Secondary: Outlined with subtle fill on hover
- Ghost: Text-only with hover background
- Sizes: px-6 py-3 (default), px-8 py-4 (large)
- Rounded: rounded-full for primary actions, rounded-lg for secondary

**Data Visualization Cards:**
- Large numerical display (text-4xl to text-6xl in monospace)
- Small trend indicator with up/down arrow
- Subtle gradient progress bars
- Mini sparkline charts showing 7-day trend
- Icon badge in top corner

### Navigation

**Main Navigation:**
- Fixed sidebar on desktop (w-64 to w-72)
- Collapsible mobile drawer
- Active state: Gradient background + icon color shift
- Vertical spacing: space-y-2 between items
- Padding: px-4 py-3 per item

### Forms & Input

**Journal Input:**
- Full-width textarea with auto-expand
- Soft background with subtle border
- Character count in bottom corner
- Floating label animation
- Padding: p-6

**Chat Interface:**
- Message bubbles with asymmetric alignment
- User messages: right-aligned, gradient background
- AI messages: left-aligned, subtle background
- Timestamps: text-xs with reduced opacity
- Typing indicator: animated dots

### Data Displays

**Stress Score Visualization:**
- Large circular progress indicator (size: 200px to 300px)
- Gradient stroke based on stress level
- Animated on load with Framer Motion
- Central score display with emoji indicator
- Surrounding mini stats in cardinal positions

**Chart Components:**
- Line charts: Smooth curves with gradient fills
- Bar charts: Rounded tops with subtle spacing
- Area charts: Semi-transparent fills
- Grid: Minimal dotted lines
- Tooltips: Floating cards with blur backdrop

**Trend Cards:**
- Icon + metric name
- Large number display
- Percentage change badge
- Mini area chart below
- Compact: h-32 to h-40

### Overlays

**Modals:**
- Full-screen backdrop with blur (backdrop-blur-md)
- Centered card with enhanced shadow
- Close button in top-right
- Smooth scale animation on enter/exit
- Padding: p-8 to p-12

**Notifications:**
- Toast-style from top-right
- Icon + message + action
- Auto-dismiss with progress bar
- Blur background
- Width: max-w-md

## Animations

**Subtle Motion Only:**
- Page transitions: Fade + slight slide (20px max)
- Card hover: Lift 4px with shadow increase
- Loading states: Gentle pulse on skeleton screens
- Number counters: Animate on initial load only
- Chart reveals: Stagger entrance by 100ms per element
- Scroll reveals: Fade up on 80% viewport intersection

**Avoid:**
- Continuous animations on static elements
- Parallax scrolling
- Infinite rotations or pulses
- Distracting background movements

## Images

**Hero Section (Dashboard Welcome):**
- Abstract gradient mesh background (full-width, h-64 to h-80)
- Overlay: Soft radial gradient from dark edges to transparent center
- Purpose: Creates depth without distraction
- Placement: Top of dashboard as welcoming banner
- Buttons over image: Use backdrop-blur-md with bg-white/10

**Mindfulness Hub:**
- Category cards with lifestyle imagery
- Images: Calming nature scenes, meditation poses, breathing exercises
- Treatment: Subtle overlay with rounded-2xl masking
- Size: aspect-ratio-16/9 or aspect-ratio-4/3
- Placement: Background of each mindfulness activity card

**Mood Journal:**
- No images needed - focus on text and visualization

**Settings/Profile:**
- Optional avatar upload area
- Placeholder: Gradient circle with user initials

**General Image Strategy:**
- Use sparingly to maintain focus
- Prefer abstract gradients over photographic images for backgrounds
- All images should support the calming, focused atmosphere
- Never use busy or high-contrast images that could increase stress