# PROJECT NAME - Autonomer Entwicklungs-Workflow

> **Template Version:** 2.0  
> **Ersetze alle [PLATZHALTER] mit projektspezifischen Werten**

---

## 🎯 PROJECT OVERVIEW

**Project Name:** [Projekt Name]  
**Type:** [Website / Web App / Mobile App / API / Full-Stack]  
**Description:** [Kurze Beschreibung was gebaut wird]

**Timeline:**
- Start: [YYYY-MM-DD]
- Target Completion: [YYYY-MM-DD]
- Current Phase: [Planning / Development / Testing / Launch]

---

## 📋 TECH STACK

### Frontend
- **Framework:** [React 18 / Vue 3 / Svelte 4 / Next.js 14 / Nuxt 3 / Vanilla JS]
- **Language:** [TypeScript (strict) / JavaScript (ES6+)]
- **Styling:** [Tailwind CSS / CSS Modules / Styled-Components / Sass / Emotion]
- **State Management:** [Zustand / Redux / Context API / Pinia / Jotai]
- **Animations:** [GSAP / Framer Motion / React Spring / CSS Animations]
- **Routing:** [React Router / Next.js / Vue Router / TanStack Router]

### Backend (falls relevant)
- **Runtime:** [Node.js / Deno / Bun]
- **Framework:** [Express / Fastify / Hono / NestJS]
- **Database:** [PostgreSQL / MongoDB / Supabase / Firebase]
- **ORM:** [Prisma / Drizzle / TypeORM / Mongoose]
- **Auth:** [NextAuth / Clerk / Supabase Auth / Custom JWT]

### Development
- **Package Manager:** [npm / yarn / pnpm]
- **Build Tool:** [Vite / Webpack / Turbopack / esbuild]
- **Testing:** [Vitest / Jest / Playwright / Cypress]
- **Linting:** [ESLint / Prettier / Biome]

---

## 🎨 DESIGN SYSTEM

### Color Palette

```css
:root {
  /* Primary Colors */
  --color-primary: [#HEX];
  --color-primary-dark: [#HEX];
  --color-primary-light: [#HEX];
  
  /* Secondary Colors */
  --color-secondary: [#HEX];
  
  /* Neutral Colors */
  --color-background: [#HEX];
  --color-surface: [#HEX];
  --color-text: [#HEX];
  --color-text-muted: [#HEX];
  
  /* Semantic Colors */
  --color-success: [#HEX];
  --color-warning: [#HEX];
  --color-error: [#HEX];
  --color-info: [#HEX];
}
```

### Typography

| Element | Font Family | Size | Weight | Line Height |
|---------|-------------|------|--------|-------------|
| H1 | [Font Name] | [Xpx / Xrem / Xvw] | [weight] | [X] |
| H2 | [Font Name] | [Xpx / Xrem / Xvw] | [weight] | [X] |
| H3 | [Font Name] | [Xpx / Xrem / Xvw] | [weight] | [X] |
| Body | [Font Name] | [Xpx / Xrem / Xvw] | [weight] | [X] |
| Caption | [Font Name] | [Xpx / Xrem / Xvw] | [weight] | [X] |

**Font Sources:**
- [Font 1]: [Google Fonts / Adobe Fonts / Local / URL]
- [Font 2]: [...]

### Spacing Scale

```css
/* Tailwind-style spacing (anpassen falls anderes System) */
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
--spacing-3xl: 4rem;     /* 64px */
```

### Breakpoints

```css
/* Responsive Breakpoints */
--breakpoint-sm: 640px;   /* Mobile */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large Desktop */
--breakpoint-2xl: 1536px; /* Extra Large */
```

---

## 📁 PROJECT STRUCTURE

```
[project-name]/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Base components (Button, Input, etc.)
│   │   ├── features/        # Feature-specific components
│   │   └── layout/          # Layout components (Header, Footer, etc.)
│   ├── pages/               # Page components / routes
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript type definitions
│   ├── styles/              # Global styles, themes
│   ├── assets/              # Static assets (images, fonts, etc.)
│   └── [andere-ordner]
├── public/                  # Public static files
├── tests/                   # Test files
├── docs/                    # Documentation
└── [config-files]

[Passe Struktur an dein Projekt an]
```

---

## 📊 SCOPE & FEATURES

### Must-Have Features (MVP)

1. **[Feature 1 Name]**
   - Description: [Was macht dieses Feature]
   - Components: [Welche Komponenten/Seiten]
   - Priority: P0 (Critical)
   - Status: [ ] Todo / [x] Done

2. **[Feature 2 Name]**
   - Description: [...]
   - Components: [...]
   - Priority: P0 (Critical)
   - Status: [ ] Todo

3. **[Feature 3 Name]**
   - [...]

### Nice-to-Have Features (Post-MVP)

1. **[Feature Name]**
   - Description: [...]
   - Priority: P2 (Medium)

[Liste alle Features auf]

---

## 🎯 SEKTION-FÜR-SEKTION PLAN

### [Sektion/Feature 1]: [Name]

**Description:** [Detaillierte Beschreibung]

**Visual Specs:**
- Layout: [beschreibe Layout]
- Colors: [welche Farben aus Palette]
- Typography: [welche Font-Größen, Weights]
- Spacing: [Padding, Margins]
- Responsive: [Verhalten auf verschiedenen Screens]

**Components:**
- [Component 1]: [Beschreibung]
- [Component 2]: [Beschreibung]

**Assets:**
- Images: [Liste oder Pfade]
- Icons: [welche Icons, aus welcher Library]
- Videos: [falls relevant]

**Interactions:**
- [Beschreibe Hover States, Animations, Transitions]

**Acceptance Criteria:**
- [ ] [Kriterium 1]
- [ ] [Kriterium 2]
- [ ] [Kriterium 3]

---

### [Sektion/Feature 2]: [Name]

[Wiederhole für jede Sektion/Feature]

---

## 🤖 AGENT KONFIGURATION

### Verfügbare Agents

**Frontend Builder** (`.claude/agents/frontend-builder-universal.md`)
- **Rolle:** UI/UX Implementierung
- **Zuständig für:** Components, Styling, Interactions
- **Nutzen wenn:** Neue UI-Features oder Design-Änderungen

**Design Reviewer** (`.claude/agents/design-reviewer-universal.md`)
- **Rolle:** Visuelle Qualitätskontrolle
- **Zuständig für:** Screenshot-Validierung gegen Specs
- **Nutzen wenn:** Nach jeder Frontend-Änderung

**Orchestrator** (`.claude/agents/orchestrator-universal.md`)
- **Rolle:** Projekt-Koordination
- **Zuständig für:** Planung, Agent-Koordination, Progress-Tracking
- **Nutzen wenn:** Autonomer Multi-Sektion Build

[Falls du weitere Agents hast (Backend, Testing, etc.), hier definieren]

---

## 🔄 WORKFLOW CONFIGURATION

### Orchestration Mode

**Type:** [Waterfall / Agile / Kanban]

**Iteration Limits:**
- Max Iterations pro Feature: 3
- Bei 3 Fails: Eskaliere zu User

**Quality Gates:**
- Design Review: ✅ Required für alle UI-Änderungen
- Console Errors: ❌ Jeder Console Error = Auto-Fail
- TypeScript: ✅ Must compile without errors
- Accessibility: ✅ WCAG [AA / AAA] compliance

### Playwright MCP Configuration

**Browser:** [chromium / firefox / webkit]  
**Device Emulation:** [none / "iPhone 15" / "iPad Pro" / custom]  
**Headless:** [true / false]  
**Vision Mode:** [false / true]

**Screenshot Location:** `.screenshots/`  
**Report Location:** `.orchestrator/reports/`

---

## 📝 CODE CONVENTIONS

### Naming

**Files:**
- Components: `PascalCase.tsx` (z.B. `Button.tsx`)
- Utils: `camelCase.ts` (z.B. `formatDate.ts`)
- Pages: `kebab-case.tsx` (z.B. `about-us.tsx`)
- Styles: `ComponentName.module.css` oder `styles.css`

**Variables/Functions:**
- Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Functions: `camelCase`
- React Components: `PascalCase`
- Type/Interface: `PascalCase`

### Import Order

```typescript
// 1. External libraries
import React from 'react';
import { useState } from 'react';

// 2. Internal absolute imports
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

// 3. Relative imports
import { helper } from './helper';

// 4. Types
import type { User } from '@/types';

// 5. Styles
import styles from './Component.module.css';
```

### Component Structure

```typescript
// [Prefer this structure]

// 1. Imports
import { ... } from '...';

// 2. Types/Interfaces
interface ComponentProps {
  // ...
}

// 3. Component
export const Component: FC<ComponentProps> = (props) => {
  // 3.1 Hooks
  const [state, setState] = useState();
  
  // 3.2 Derived State / Computed Values
  const computed = useMemo(() => {}, []);
  
  // 3.3 Event Handlers
  const handleClick = useCallback(() => {}, []);
  
  // 3.4 Effects
  useEffect(() => {}, []);
  
  // 3.5 Render
  return (
    // JSX
  );
};
```

---

## ✅ DEFINITION OF DONE

Ein Feature gilt als "Done" wenn:

- [ ] **Implementation Complete:** Alle Code geschrieben, compiliert ohne Errors
- [ ] **Design Review Passed:** Design Reviewer gibt ✅ PASS
- [ ] **Console Clean:** Keine JavaScript/TypeScript Errors in Console
- [ ] **Responsive:** Funktioniert auf Mobile, Tablet, Desktop
- [ ] **Accessible:** WCAG [AA/AAA] compliant, Keyboard-Navigation funktioniert
- [ ] **Performance:** [Lighthouse Score >X / Load Time <Xs / etc.]
- [ ] **Tests:** [Unit/E2E Tests geschrieben und passed] (falls relevant)
- [ ] **Documentation:** Code kommentiert wo nötig, README updated
- [ ] **Assets:** Alle Images/Videos optimiert und korrekt eingebunden

---

## 🚨 SPECIAL INSTRUCTIONS

### Critical Rules

1. **NIEMALS** Tailwind-Klassen mit String-Interpolation bauen
   ```typescript
   // ❌ FALSCH
   className={`bg-${color}-500`}
   
   // ✅ RICHTIG
   className={color === 'blue' ? 'bg-blue-500' : 'bg-red-500'}
   ```

2. **IMMER** Cleanup-Functions in useEffect/onUnmounted
   ```typescript
   useEffect(() => {
     const listener = () => {};
     window.addEventListener('resize', listener);
     
     return () => window.removeEventListener('resize', listener);
   }, []);
   ```

3. **NIEMALS** console.log im Production-Code (außer mit TODO-Comment für temporäres Debugging)

[Füge projektspezifische kritische Regeln hinzu]

### Custom Patterns

**[Pattern Name]:**
```typescript
// Code-Beispiel für ein wichtiges Pattern in diesem Projekt
```

[Dokumentiere wichtige projektspezifische Patterns]

---

## 📚 EXTERNAL RESOURCES

**Design:**
- Figma: [URL wenn vorhanden]
- Design System Docs: [URL wenn vorhanden]
- Inspiration: [Referenz-Websites]

**Documentation:**
- Framework Docs: [URL]
- Library Docs: [relevante Library-URLs]
- API Docs: [falls Backend-API vorhanden]

**Assets:**
- Images: [Wo sind die Bilder? Cloud Storage Link?]
- Icons: [Welche Icon-Library oder Custom?]
- Fonts: [Wo gehostet? Google Fonts, Adobe, Local?]

---

## 🚀 GETTING STARTED (für autonomen Build)

### Prerequisites

```bash
# Node.js Version
node --version  # [required version]

# Package Manager
npm --version   # oder yarn, pnpm
```

### Setup

```bash
# 1. Dependencies installieren
npm install

# 2. Dev Server starten
npm run dev
# Läuft auf: http://localhost:[PORT]

# 3. Playwright MCP prüfen
# Stelle sicher dass Playwright MCP in claude_desktop_config.json konfiguriert ist
```

### Starte Autonomen Build

```bash
claude -p "@@agent orchestrator 'Starte autonome Entwicklung. Implementiere alle Features aus claude.md Sektion für Sektion. Nutze frontend-builder für Code und design-reviewer für Validierung. Iteriere bis perfekt.'" --dangerously-skip-permissions --allowedTools "Bash,Read,Edit,mcp__playwright"
```

---

## 📊 SUCCESS METRICS

**Projekt gilt als abgeschlossen wenn:**

- [ ] Alle Must-Have Features implementiert und validiert
- [ ] Design Review: [X]% Pass-Rate (Target: >95%)
- [ ] Performance: Lighthouse Score >[X]
- [ ] Accessibility: WCAG [AA/AAA] konform
- [ ] Responsive: Funktioniert auf allen Target-Devices
- [ ] Browser-Kompatibilität: Tested auf [Chrome, Firefox, Safari, Edge]
- [ ] [Weitere projektspezifische Metriken]

---

## 💡 NOTES & LEARNINGS

[Dokumentiere wichtige Learnings während des Projekts]

**Known Issues:**
- [Liste bekannte Issues die nicht kritisch sind aber dokumentiert werden sollten]

**Future Improvements:**
- [Ideas für Post-MVP Verbesserungen]

---

**Version:** 1.0  
**Last Updated:** [YYYY-MM-DD]  
**Maintained By:** [Name/Team]
