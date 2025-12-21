# Shared Components Library

This directory contains reusable UI components that follow the application's design system and best practices.

## Components

### Card Component (`app-card`)

A modern, reusable card component with consistent styling.

**Usage:**
```html
<app-card [interactive]="true" [elevated]="true">
  <div card-header>
    <h3>Card Title</h3>
    <span class="status-badge badge-success">Active</span>
  </div>
  <div card-body>
    Card content goes here
  </div>
  <div card-footer>
    <button mat-button>Action</button>
  </div>
</app-card>
```

**Inputs:**
- `interactive: boolean` - Enable hover effects and pointer cursor
- `elevated: boolean` - Use elevated shadow
- `showAccent: boolean` - Show top accent border on hover
- `class: string` - Additional CSS classes
- `animationDelay: string` - Animation delay for staggered animations

---

### Loading State Component (`app-loading-state`)

Standardized loading indicator with optional message.

**Usage:**
```html
<app-loading-state 
  [message]="'Loading data...'" 
  [size]="'large'"
  [fullScreen]="false">
</app-loading-state>
```

**Inputs:**
- `message: string` - Loading message (default: "Chargement...")
- `size: 'small' | 'medium' | 'large'` - Spinner size (default: "medium")
- `fullScreen: boolean` - Show as full screen overlay (default: false)

---

### Empty State Component (`app-empty-state`)

Standardized empty state for when no data is available.

**Usage:**
```html
<app-empty-state
  icon="inventory_2"
  title="No items found"
  description="Start by creating your first item"
  [actionLabel]="'Create Item'"
  [action]="onCreate">
</app-empty-state>
```

**Inputs:**
- `icon: string` - Icon name (Material or SVG icon)
- `iconSize: 'small' | 'medium' | 'large'` - Icon size (default: "large")
- `title: string` - Title text (default: "Aucun élément trouvé")
- `description: string` - Description text
- `actionLabel: string` - Action button label
- `showAction: boolean` - Show action button (default: true)
- `actionColor: 'primary' | 'accent' | 'warn'` - Button color (default: "primary")
- `action: () => void` - Action handler function
- `customContent: TemplateRef` - Custom content template

---

### Error State Component (`app-error-state`)

Standardized error state for displaying error messages.

**Usage:**
```html
<app-error-state
  [message]="'Failed to load data'"
  [details]="'Please check your connection'"
  [retryLabel]="'Retry'"
  [retry]="onRetry">
</app-error-state>
```

**Inputs:**
- `message: string` - Error message (default: "Une erreur est survenue")
- `details: string` - Detailed error description
- `retryLabel: string` - Retry button label (default: "Réessayer")
- `showRetry: boolean` - Show retry button (default: true)
- `retry: () => void` - Retry handler function

---

### Form Field Component (`app-form-field`)

Standardized form field wrapper with consistent styling and validation.

**Usage:**
```html
<app-form-field
  [label]="'Email'"
  [control]="emailControl"
  [required]="true"
  icon="email"
  [errorMessages]="{ required: 'Email is required', email: 'Invalid email format' }">
  <input matInput formControlName="email" type="email">
</app-form-field>
```

**Inputs:**
- `label: string` - Field label
- `control: FormControl` - Form control for validation
- `required: boolean` - Whether field is required
- `icon: string` - Icon name (Material or SVG)
- `iconPosition: 'prefix' | 'suffix'` - Icon position (default: "prefix")
- `hint: string` - Hint text
- `errorMessages: { [key: string]: string }` - Custom error messages map
- `showErrors: boolean` - Show validation errors (default: true)

---

### Base Dialog Component (`app-base-dialog`)

Base dialog component providing consistent structure for all dialogs.

**Usage:**
```html
<app-base-dialog
  [title]="'Create Location'"
  [subtitle]="'Fill in the form below'"
  [loading]="submitting"
  [saveDisabled]="form.invalid"
  (close)="onClose()"
  (save)="onSave()">
  <form [formGroup]="form">
    <!-- Form content -->
  </form>
</app-base-dialog>
```

**Inputs:**
- `title: string` - Dialog title
- `subtitle: string` - Dialog subtitle
- `loading: boolean` - Loading state
- `showSave: boolean` - Show save button (default: true)
- `showCancel: boolean` - Show cancel button (default: true)
- `saveLabel: string` - Save button label (default: "Save")
- `cancelLabel: string` - Cancel button label (default: "Cancel")
- `saveIcon: string` - Save button icon (default: "save")
- `saveDisabled: boolean` - Disable save button
- `customHeader: TemplateRef` - Custom header template
- `customFooter: TemplateRef` - Custom footer template
- `close: () => void` - Close handler
- `save: () => void` - Save handler

---

### Search Bar Component (`app-search-bar`)

Standardized search input with debouncing and clear functionality.

**Usage:**
```html
<app-search-bar
  [placeholder]="'Search locations...'"
  [debounceTime]="300"
  (search)="onSearch($event)">
</app-search-bar>
```

**Inputs:**
- `placeholder: string` - Input placeholder (default: "Rechercher...")
- `value: string` - Initial search value
- `debounceTime: number` - Debounce time in ms (default: 300)
- `showClear: boolean` - Show clear button (default: true)

**Outputs:**
- `search: EventEmitter<string>` - Emits search value after debounce

---

## Design System

All components use the design tokens defined in `src/app/styles/modern-ui-system.scss`:

- **Spacing:** `--spacing-xs` through `--spacing-3xl`
- **Colors:** `--color-primary-*`, `--color-success-*`, `--color-error-*`, etc.
- **Shadows:** `--shadow-sm` through `--shadow-2xl`
- **Transitions:** `--transition-fast`, `--transition-base`, `--transition-slow`

---

## Best Practices

1. **Always use shared components** instead of creating custom implementations
2. **Follow the design system** - use design tokens, not hardcoded values
3. **Keep components focused** - each component has a single responsibility
4. **Use TypeScript types** - avoid `any` types
5. **Document components** - add JSDoc comments for public APIs

---

## Adding New Components

When adding a new shared component:

1. Create component files in `shared/components/[component-name]/`
2. Make it standalone with proper imports
3. Add JSDoc documentation
4. Export from `index.ts`
5. Update this README
6. Follow the existing component patterns

---

## Migration Guide

To migrate existing code to use shared components:

### Before:
```html
<div class="modern-empty-state">
  <mat-icon>inbox</mat-icon>
  <h2>No items</h2>
  <button (click)="create()">Create</button>
</div>
```

### After:
```html
<app-empty-state
  icon="inbox"
  title="No items"
  [actionLabel]="'Create'"
  [action]="create">
</app-empty-state>
```

