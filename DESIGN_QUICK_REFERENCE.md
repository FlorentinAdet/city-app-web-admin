# Minimal Design System - Quick Reference

## Color Palette

### Text Hierarchy
```
Primary (Body):     #212121 - Used for main content
Secondary (Labels): #616161 - Used for labels, secondary info
Tertiary (Hints):   #9E9E9E - Used for placeholders, disabled
Muted (Links):      #1565C0 - Only for interactive elements
```

### Backgrounds
```
White (Primary):    #FFFFFF - Main background
Light (Cards):      #FAFAFA - Card backgrounds
Lighter (Forms):    #F5F5F5 - Form backgrounds
Borders:            #E0E0E0 - All borders use this
```

### Actions
```
Primary Action:     #1565C0 - Buttons, links, accents
Hover Primary:      #1455B0 - Primary button hover
Active Primary:     #0D47A1 - Primary button active

Success:            #2E7D32 - Green for confirmations
Error:              #C62828 - Red for deletions
Warning:            #F57F17 - Orange for warnings
Info:               #0277BD - Blue for information
```

## Spacing Scale (8px Grid)
```
4px   --space-1   (xs gaps)
8px   --space-2   (small gaps)
12px  --space-3   (medium gaps)
16px  --space-4   (regular gaps)
20px  --space-5   (large gaps)
24px  --space-6   (xl gaps)
32px  --space-8   (2xl gaps)
64px  --space-16  (4xl gaps)
```

## Typography Scale
```
H1: 36px 700 1.2 - Page titles
H2: 30px 700 1.2 - Section titles
H3: 24px 600 1.2 - Subsection titles
H4: 18px 600 1.5 - Component titles
Body: 16px 400 1.5 - Primary content
Small: 14px 400 1.5 - Secondary content
Xs: 12px 400 1.5 - Tertiary/Labels
```

## Component Styles

### Buttons
```
Primary:   Blue bg, white text, 1px border
Secondary: Gray bg, black text, gray border
Success:   Green bg, white text
Error:     Red bg, white text
Ghost:     Transparent bg, blue text, blue border
Sizes:     sm (32h), md (40h), lg (48h)
States:    :hover, :active, :disabled, :focus
```

### Inputs
```
Default:   White bg, gray border
Focus:     Light gray bg, blue border
Error:     Light red bg (#FEF2F2), red border
Disabled:  Light gray bg, gray text
Padding:   8px 12px
Radius:    2px
```

### Forms
```
Label:     14px 500 weight, gray-900
Required:  Red asterisk after label
Error:     12px red text below input
Spacing:   8px between label/input, 16px between fields
Field width: 100% of container
```

### Modals
```
Background:    White with gray-50 header/footer
Border:        1px gray-300
Radius:        2px
Header:        Gray-50 background
Footer:        Gray-50 background with button actions
Overlay:       20% black (rgba(0,0,0,0.2))
Max width:     Small: 400px, Medium: 600px, Large: 900px
No animations, no blur
```

### Tables
```
Header bg:     Gray-50
Row border:    1px gray-300
Cell padding:  12px 16px
Header weight: 600
Body text:     gray-700
Hover state:   Gray-50 background
Radius:        2px corners
```

### Sidebar
```
Width:         260px (fixed)
Background:    White
Border:        1px gray-300 right border
Nav item:      12px padding, blue on hover/active
Active state:  Gray-50 bg, left blue border
Logout button: Gray border + text, red bg on hover
```

### Layout
```
Sidebar:       260px fixed left
TopBar:        64px fixed top
Main content:  Remaining space with padding
Margin:        32px desktop, 16px mobile
Breakpoint:    768px for responsive
```

## Transitions
```
Fast:   100ms - hover/focus feedback
Normal: 150ms - state changes
Slow:   200ms - reserved for important transitions
NO decorative animations
```

## Shadows
```
None on decorative elements
Shadow-sm:  0 1px 2px rgba(0,0,0,0.05)
Shadow-md:  0 1px 3px rgba(0,0,0,0.1)
Shadow-lg:  0 2px 4px rgba(0,0,0,0.1)
```

## Border & Radius
```
Borders:     1px gray-300 only
Radius:      2px max (minimal rounding)
No large rounded corners
No decorative effects
```

## Mobile Responsive
```
Desktop:    >= 1024px
Tablet:     768px - 1023px
Mobile:     < 768px
Extra small: < 480px
```

## Utilities
```
Text colors:
.text-primary (#1565C0)
.text-success (#2E7D32)
.text-error (#C62828)
.text-muted (#757575)

Backgrounds:
.bg-light (#FAFAFA)
.bg-lighter (#F5F5F5)

Spacing:
.mt-1/2/3/4 (margin-top)
.mb-1/2/3/4 (margin-bottom)
.p-1/2/3/4 (padding)

Flexbox:
.flex .flex-col .justify-center .items-center
.gap-2 .gap-4

Typography:
.text-center .text-left .text-right
.h1 .h2 .h3 .h4

States:
.opacity-50 .opacity-75
.hidden .w-full .max-w-full
```

## Usage Examples

### Button
```html
<button class="btn btn-primary btn-md">Primary</button>
<button class="btn btn-secondary btn-md">Secondary</button>
<button class="btn btn-error btn-lg">Delete</button>
```

### Form
```html
<div class="form-group">
  <label class="form-label">Email <span class="required">*</span></label>
  <input class="form-input" type="email" placeholder="user@example.com">
  <span class="form-error">Invalid email</span>
</div>
```

### Modal
```html
<div class="modal-overlay">
  <div class="modal-content modal-medium">
    <div class="modal-header">
      <h2 class="modal-title">Title</h2>
      <button class="modal-close">×</button>
    </div>
    <div class="modal-body">Content</div>
    <div class="modal-footer">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-primary">Save</button>
    </div>
  </div>
</div>
```

### Card
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Title</h3>
  </div>
  <div class="card-body">Content</div>
</div>
```

## Do's and Don'ts

### ✅ DO
- Use 2px radius max
- Keep transitions under 150ms
- Use 8px spacing grid
- Maintain high contrast
- Use semantic colors for meaning
- Keep animations functional only
- Use system font stack
- Test accessibility

### ❌ DON'T
- Add gradients
- Use decorative animations
- Create custom colors
- Add blur effects
- Use large rounded corners
- Add shadows for decoration
- Change typography hierarchy
- Use opacity effects

---
**Version**: 1.0
**Last Updated**: 2024
**Status**: Active
