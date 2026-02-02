# Claude Code + Playwright MCP - Universelles Multi-Agent System

> **Version:** 2.0 (Generisch)  
> **Erstellt:** 2025-01-26  
> **Für:** Autonome Web-Entwicklung mit visueller Validierung

---

## 🎯 Was ist das?

Ein **universelles Multi-Agent System** für autonome Software-Entwicklung mit Claude Code und Playwright MCP. Das System ermöglicht es, komplexe Web-Projekte **vollautomatisch** zu entwickeln - Sektion für Sektion, mit visueller Validierung nach jeder Änderung.

### Kernkonzept

```
┌─────────────────────────────────────────┐
│ Du definierst Specs in claude.md       │
│ (Was soll gebaut werden?)              │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Orchestrator plant & koordiniert       │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Frontend Builder implementiert Code     │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Playwright macht Screenshot             │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ Design Reviewer validiert visuell      │
└──────────────┬──────────────────────────┘
               ↓
       ┌───────┴───────┐
       │               │
       ✅ PASS        ❌ FAIL
       │               │
       ↓               ↓
  Nächste        Zurück zum
  Sektion        Builder (Fix)
                 (max 3x)
```

---

## 📁 Datei-Struktur

```
dein-projekt/
├── .claude/
│   └── agents/
│       ├── orchestrator-universal.md       # 🎭 Koordiniert alles
│       ├── frontend-builder-universal.md   # 💻 Baut den Code
│       └── design-reviewer-universal.md    # 👁️ Prüft visuell
│
├── claude.md                               # 📋 DEINE Projekt-Specs
│                                          #    (aus Template erstellen)
│
├── .screenshots/                           # 📸 Automatische Screenshots
├── .orchestrator/                          # 📊 Logs & Reports
│   ├── plans/                             #    Implementierungspläne
│   ├── reports/                           #    Design Review Reports
│   └── logs/                              #    Execution Logs
│
└── [dein-projekt-code]
```

---

## 🚀 Quick Start

### 1. Agents in dein Projekt kopieren

```bash
# Erstelle Agent-Verzeichnis
mkdir -p .claude/agents

# Kopiere die 3 universellen Agents
cp orchestrator-universal.md .claude/agents/
cp frontend-builder-universal.md .claude/agents/
cp design-reviewer-universal.md .claude/agents/
```

### 2. Projekt-spezifische claude.md erstellen

```bash
# Kopiere das Template
cp CLAUDE_MD_TEMPLATE.md claude.md

# Öffne und fülle alle [PLATZHALTER] aus
# - Tech Stack
# - Design System (Colors, Typography)
# - Features & Sektionen
# - Acceptance Criteria
```

**Wichtig:** Die `claude.md` ist deine **Single Source of Truth**. Je detaillierter, desto besser die Ergebnisse!

### 3. Playwright MCP konfigurieren

In deiner `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@microsoft/playwright-mcp@latest"
      ],
      "env": {
        "PLAYWRIGHT_BROWSER": "chromium",
        "PLAYWRIGHT_HEADLESS": "false"
      }
    }
  }
}
```

### 4. Autonomen Build starten

```bash
claude -p "@@agent orchestrator 'Starte autonome Entwicklung. Implementiere alle Features aus claude.md. Nutze frontend-builder für Code und design-reviewer für Validierung. Iteriere bis perfekt.'" --dangerously-skip-permissions --allowedTools "Bash,Read,Edit,mcp__playwright"
```

**Das war's!** Das System arbeitet nun autonom durch alle Features.

---

## 🤖 Die 3 Agents im Detail

### 1. Orchestrator Agent

**Rolle:** Senior Technical Architect & Project Manager

**Was er macht:**
- Liest deine `claude.md` und analysiert Scope
- Erstellt detaillierte Implementierungspläne
- Ruft Frontend Builder und Design Reviewer auf
- Koordiniert Iterationen (max 3x pro Feature)
- Trackt Progress in `.orchestrator/STATUS.md`
- Eskaliert zum User bei Problemen

**Wann nutzen:**
```bash
@@agent orchestrator "Starte autonome Entwicklung..."
```

### 2. Frontend Builder Agent

**Rolle:** Senior Frontend Engineer

**Was er macht:**
- Implementiert Code basierend auf Specs
- Unterstützt: React, Vue, Svelte, Vanilla JS
- Kennt: Tailwind, CSS Modules, Styled-Components, etc.
- Handled: TypeScript, State Management, Animations
- Startet Dev Server, installiert Dependencies

**Wann nutzen:**
```bash
@@agent frontend-builder "Implementiere [Feature]. Specs: claude.md → [Section]"
```

### 3. Design Reviewer Agent

**Rolle:** Principal-Level UI/UX Designer & Quality Auditor

**Was er macht:**
- Macht Screenshots mit Playwright
- Validiert gegen deine Specs (claude.md)
- Prüft: Layout, Typography, Colors, Assets, Animations, Responsive, A11y
- Erstellt detaillierte Reports mit konkreten Fixes
- Gibt ✅ PASS oder ❌ FAIL zurück

**Wann nutzen:**
```bash
@@agent design-reviewer "Review [Component]. Specs: claude.md → [Section]"
```

---

## 📝 claude.md - Das Herzstück

Deine `claude.md` ist die **zentrale Spezifikation**. Sie sollte enthalten:

### Muss-Haben Sections:

1. **Tech Stack** - Framework, Sprache, Libraries
2. **Design System** - Colors, Typography, Spacing, Breakpoints
3. **Features** - Was soll gebaut werden?
4. **Sektion-für-Sektion Plan** - Detaillierte Specs für jede Sektion/Feature
5. **Acceptance Criteria** - Wann ist ein Feature "Done"?

### Beispiel:

```markdown
## 🎯 SEKTION 1: Hero Section

**Description:** Full-screen Hero mit Video-Background

**Visual Specs:**
- Height: 100vh
- Video: autoplay, muted, loop
- Title: 12vw, Font "Inter Bold", color: #FFFFFF
- Button: bg-primary, hover:bg-primary-dark

**Components:**
- Hero.tsx (main component)
- VideoBackground.tsx (reusable)

**Acceptance Criteria:**
- [ ] Video plays automatically
- [ ] Title is centered and responsive
- [ ] Button has smooth hover transition
- [ ] Works on Mobile (video should pause on mobile)
```

Je präziser deine Specs, desto besser die Ergebnisse!

---

## 🎨 Workflow-Beispiele

### Beispiel 1: Einzelne Komponente bauen

```bash
# Manueller Workflow (du steuerst jeden Schritt)

# 1. Bauen
@@agent frontend-builder "Implementiere Button-Komponente. Specs: claude.md → Section 'Design System'"

# 2. Prüfen
@@agent design-reviewer "Review Button-Komponente. Specs: claude.md → Section 'Design System'"

# 3. Falls FAIL: Fix
@@agent frontend-builder "Fix Button: [issues from report]"

# 4. Re-Review
@@agent design-reviewer "Re-Review Button"
```

### Beispiel 2: Komplette Website autonom

```bash
# Autonomer Workflow (System arbeitet alleine)

@@agent orchestrator "Baue komplette Website aus claude.md. Alle 6 Sektionen (Hero, About, Features, Pricing, Testimonials, Contact). Nutze frontend-builder und design-reviewer. Iteriere bis perfekt."

# System arbeitet nun autonom durch:
# 1. Hero → Build → Screenshot → Review → (Fix falls nötig) → Done
# 2. About → Build → Screenshot → Review → Done
# 3. Features → ...
# [...]
# 6. Contact → Done
# 
# Ergebnis: Komplette Website, visuell validiert!
```

---

## 🔧 Anpassungen & Erweiterungen

### Eigene Agents hinzufügen

Du kannst weitere Agents erstellen, z.B.:

**Backend Builder Agent** (`.claude/agents/backend-builder.md`)
```markdown
# Backend Builder Agent

**Rolle:** Backend Engineer
**Zuständig für:** API, Database, Auth

[...]
```

Dann in `claude.md` registrieren:

```markdown
## 🤖 AGENT KONFIGURATION

**Backend Builder** (`.claude/agents/backend-builder.md`)
- Rolle: API Implementierung
- Nutzen wenn: Neue Endpoints, DB-Schema Änderungen
```

### Review-Kriterien anpassen

In `claude.md`:

```markdown
## Design Review Configuration

**Strict Mode:** true
- Jede Abweichung = FAIL

**Focus Areas:**
- Typography (kritisch)
- Accessibility (kritisch)
- Animations (nice-to-have)

**Skip Checks:**
- Responsive (Desktop-only App)

**Custom Acceptance Criteria:**
- Button min-width: 120px
- Card shadow: 0 4px 6px rgba(0,0,0,0.1)
```

---

## 📊 Output & Reports

### Automatisch generiert:

**`.screenshots/`**
```
hero-desktop-2025-01-26-14-30.png
hero-mobile-2025-01-26-14-31.png
about-desktop-2025-01-26-15-00.png
[...]
```

**`.orchestrator/reports/`**
```
hero-review-2025-01-26.md
about-review-2025-01-26.md
FINAL-REVIEW.md
```

**`.orchestrator/STATUS.md`**
```markdown
## Overall Progress

Phase: Development
Completion: 60% (3/5 features)

## Completed Tasks
- [x] Hero Section (✅ VALIDATED)
- [x] About Section (✅ VALIDATED)
- [x] Features Section (✅ VALIDATED)

## In Progress
- [ ] Pricing Section (🔄 Iteration 1)

## Metrics
Total Agent Calls: 12
Design Reviews: 8 (7 pass, 1 fail)
Average Iterations: 1.2
```

---

## 🚨 Troubleshooting

### Problem: "Playwright MCP not found"

**Lösung:**
```bash
# 1. Check claude_desktop_config.json
cat ~/.config/Claude/claude_desktop_config.json

# 2. Installiere Playwright MCP manuell
npx -y @microsoft/playwright-mcp@latest

# 3. Restart Claude App
```

### Problem: "Agent macht 3x denselben Fehler"

**Ursache:** Unklare Specs oder Edge-Case

**Lösung:**
1. System eskaliert automatisch zu dir
2. Du bekommst Report mit allen 3 Versuchen
3. Du kannst:
   - Specs in `claude.md` präzisieren
   - Manuell fixen
   - Alternative Approach vorschlagen

### Problem: "Screenshot zeigt nicht die neueste Version"

**Lösung:**
```bash
# Browser-Cache löschen vor Screenshot
@@agent design-reviewer "Review mit Cache-Clear. Nutze: playwright:browser_navigate mit Cache: false"
```

---

## 💡 Best Practices

### ✅ DO:

1. **Präzise Specs in claude.md**
   - Je detaillierter, desto besser
   - Konkrete Werte (nicht "groß" sondern "24px")
   - Screenshots/Mockups als Referenz verlinken

2. **Design System dokumentieren**
   - Colors als CSS Variables
   - Typography-Scale definieren
   - Component-Variants spezifizieren

3. **Acceptance Criteria definieren**
   - Messbar & überprüfbar
   - Nicht subjektiv ("sieht gut aus" ❌)
   - Konkret ("Button hat hover:bg-blue-700" ✅)

4. **Iterativ arbeiten**
   - Erst eine Sektion perfekt
   - Dann die nächste
   - Nicht alles parallel

### ❌ DON'T:

1. **Vage Anweisungen**
   - "Bau eine schöne Homepage" ❌
   - "Implementiere Hero mit Video-BG, Title 12vw, Button primary" ✅

2. **Design-Entscheidungen während Build**
   - Alle Decisions vorher in claude.md
   - Agents sollen umsetzen, nicht designen

3. **Parallel-Entwicklung ohne Dependencies**
   - Agents können sich gegenseitig blocken
   - Immer seriell (außer explizit unabhängig)

---

## 🎓 Erweiterte Nutzung

### Multi-Project Setup

Dieselben Agents für mehrere Projekte:

```
~/coding/
├── .claude/
│   └── agents/              # Globale Agents (1x)
│       ├── orchestrator-universal.md
│       ├── frontend-builder-universal.md
│       └── design-reviewer-universal.md
│
├── project-a/
│   └── claude.md            # Project A Specs
│
├── project-b/
│   └── claude.md            # Project B Specs
│
└── project-c/
    └── claude.md            # Project C Specs
```

In jedem Projekt-`claude.md`:
```markdown
## 🤖 AGENT KONFIGURATION

**Agents Location:** `~/.claude/agents/`
```

### CI/CD Integration

```yaml
# .github/workflows/auto-develop.yml
name: Autonomous Development

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Run Claude Code Agent
        run: |
          claude -p "@@agent orchestrator 'Build next feature from claude.md'" \
            --dangerously-skip-permissions \
            --allowedTools "Bash,Read,Edit,mcp__playwright"
      
      - name: Commit changes
        run: |
          git config user.name "Claude Bot"
          git commit -am "feat: autonomous development"
          git push
```

---

## 📚 Weitere Ressourcen

### Offizielle Docs:
- [Claude Code Docs](https://docs.anthropic.com/claude-code)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [MCP Protocol](https://modelcontextprotocol.io)

### Community:
- [Claude Discord](https://discord.gg/anthropic)
- [MCP GitHub Discussions](https://github.com/modelcontextprotocol/discussions)

### Tutorials:
- Diese Leitfäden im `/mnt/project/` Verzeichnis
- Video-Tutorials (falls vorhanden)

---

## 🙏 Credits

**Konzept basiert auf:**
- [Anthropic's MCP Announcement](https://anthropic.com/mcp)
- [Microsoft's Playwright](https://playwright.dev)
- Community Best Practices aus Discord & GitHub

**Template erstellt von:**
- Claude AI Assistant (Anthropic)
- Kuratiert für: FrameForge Media & Community

---

## 📄 Lizenz

Dieses Template ist **frei verwendbar** für kommerzielle und private Projekte.

**MIT License** - Nutze, modifiziere, teile frei.

---

## 🔄 Updates

**v2.0** (2025-01-26)
- ✅ Komplett generisch (framework-agnostic)
- ✅ 3 universelle Agents
- ✅ Claude.md Template
- ✅ Multi-Project Support

**v1.0** (2025-01-13)
- Initial Release (FrameForge-spezifisch)

---

**Viel Erfolg beim autonomen Entwickeln! 🚀**

Bei Fragen: [Discord / GitHub Issues / Email]
