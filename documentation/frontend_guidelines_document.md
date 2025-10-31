# Frontend Guidelines for react-supabase-digital-agreement

This document describes the frontend setup, architecture, and best practices for the **react-supabase-digital-agreement** project—a digital agreement and e-signature platform built with React and Supabase.

## 1. Frontend Architecture

We follow a **single-page application (SPA)** model with React (v18) and Vite as our build tool. The architecture is organized into:

- **Pages**: Top-level route components (e.g., Dashboard, AgreementView).
- **Features**: Feature-sliced modules for agreements, templates, and authentication.
- **UI Components**: Reusable building blocks under `src/components/ui` (buttons, dialogs, tables).
- **Hooks & Services**: Custom hooks (`useAgreements`, `useTemplates`) and a layer of API functions wrapping Supabase calls.
- **State Management**: Server state with TanStack Query; local state with React Context and hooks.

How it supports our goals:
- **Scalability**: Feature-sliced folders and path aliases keep code organized as the app grows.
- **Maintainability**: Component‐driven development and TypeScript types ensure consistency.
- **Performance**: Vite’s fast hot-reload, code splitting, and optimized production builds.

## 2. Design Principles

1. **Usability**: Clear, consistent UI patterns (forms, tables, dialogs) allow users to complete tasks quickly.
2. **Accessibility**: All custom components follow WCAG guidelines—ARIA roles, keyboard navigation, and focus management.
3. **Responsiveness**: Mobile-first layouts using Tailwind CSS breakpoints ensure a seamless experience on any device.
4. **Clarity**: Minimalist, modern design avoids clutter, placing emphasis on the document workflow.

These principles guide every interface:
- Form fields show inline validation messages.
- Tables and cards adapt to screen size, collapsing columns or stacking items.
- Dialogs focus on the first interactive element when opened.

## 3. Styling and Theming

### Approach
- Tailwind CSS for utility-first styling and rapid layout adjustments.
- CSS variables for theming (light/dark mode support).
- No additional preprocessor—Tailwind’s built-in directives handle promotional variants.

### Style Direction
- **Design Style**: Modern flat design with subtle glassmorphism overlays on modals and cards.
- **Theming**: Two themes (light and dark). Users can toggle via a switch in the header.

### Color Palette
```css
:root {
  --color-primary: #4F46E5;    /* Indigo */
  --color-secondary: #10B981;  /* Emerald */
  --color-accent: #F59E0B;     /* Amber */
  --color-background: #F9FAFB; /* Light gray */
  --color-surface: #FFFFFF;    /* White */
  --color-muted: #6B7280;      /* Gray-600 */
  --color-success: #22C55E;    /* Green-500 */
  --color-error: #EF4444;      /* Red-500 */
}

.dark {
  --color-background: #1F2937; /* Gray-800 */
  --color-surface: #111827;    /* Gray-900 */
  --color-muted: #9CA3AF;      /* Gray-400 */
}
```

### Typography
- **Font Family**: Inter, with system fonts fallback.
- **Base Sizes**: 16px default; scale with `text-sm`, `text-base`, `text-lg`, `text-xl`.
- **Line Height**: 1.5 for body text, 1.25 for headings.

## 4. Component Structure

We use a **component-driven architecture**:

- **`src/components/ui`**: Low-level, styling-agnostic UI elements (Button, Input, Dialog).
- **`src/features`**: Higher-level compositions (AgreementList, TemplateEditor).
- **`src/pages`**: Routed pages that assemble features.
- **Reusability**: Each component accepts minimal props and exposes clear callbacks.
- **Naming**: Folders match feature names; files use lowercase-dash (e.g., `agreement-list.tsx`).

Benefits:
- Faster development: build new screens by assembling existing components.
- Easier testing: small, focused components have clear responsibilities.

## 5. State Management

1. **Server State**: TanStack Query (react-query)
   - Caching API responses from Supabase.
   - Automatic refetch on window focus and mutation invalidation.
   - Hooks: `useQuery` for lists (agreements, templates); `useMutation` for create/update.

2. **Local State**:
   - React `useState` for ephemeral UI state (modal open/close).
   - React Context for global settings (theme, user profile).

3. **Form State**:
   - React Hook Form + Zod schema validation.
   - Schema-driven forms generated from template JSON.

This hybrid approach keeps data fresh, minimizes prop drilling, and ensures type safety.

## 6. Routing and Navigation

- **Library**: React Router DOM.
- **Route Layout**: Nested routes under `AppLayout` for common header and sidebar.
- **Main Routes**:
  - `/login` & `/signup` (Supabase Auth)
  - `/dashboard` (Agreement overview)
  - `/templates` (Template management)
  - `/agreements/:id` (View or sign)
- **Protected Routes**: A `<PrivateRoute>` wrapper checks authentication state.
- **Lazy Loading**: Routes are code-split with `React.lazy` and `Suspense` for faster initial load.

## 7. Performance Optimization

- **Code Splitting**: Dynamic imports of route components.
- **Lazy Loading**: Images and heavy UI parts (signature canvas) load on demand.
- **Tailwind PurgeCSS**: Removes unused CSS classes in production.
- **Vite Build Optimizations**: Minification, tree-shaking, and asset fingerprinting.
- **Caching**: Leverage Supabase CDN for storage assets; TanStack Query cache reduces repeated requests.

Together, these techniques keep bundle sizes small and pages responsive.

## 8. Testing and Quality Assurance

1. **Unit Tests**:
   - Vitest + React Testing Library.
   - Focus on small components and custom hooks (`useAgreements`).
2. **Integration Tests**:
   - Verify component compositions (forms integrated with validation).
3. **End-to-End (E2E)**:
   - Cypress tests for key workflows: login, template creation, agreement signing.
4. **Linting and Formatting**:
   - ESLint with TypeScript rules.
   - Prettier for consistent code style.
5. **Accessibility Testing**:
   - Axe or similar tools integrated into CI to catch WCAG violations.

These practices ensure reliability, catch regressions, and maintain code health.

## 9. Conclusion and Overall Frontend Summary

This frontend guideline captures our approach to building a robust, scalable digital agreement platform. By using React, TypeScript, Tailwind CSS, Supabase, and best-in-class libraries (TanStack Query, React Hook Form, Zod, shadcn/ui), we achieve:

- A **maintainable** codebase with clear folder and component organization.
- A **performant** user experience via code splitting, caching, and Vite optimizations.
- A **consistent** look and feel through theming, a defined color palette, and typography.
- A **secure** foundation by enforcing RLS policies, form validation, and protected routes.

Following these guidelines will help any developer understand and extend the frontend with confidence, ensuring alignment with project goals and user needs.