# Bujh UI/UX system

## Product intent

Bujh is a learning product for students who need a calm, dependable way to move from a syllabus to practice, understanding and revision. The interface should make the next useful action clear without inventing progress or pressuring a student with noisy dashboards.

## Design decisions

- **Desktop:** a persistent learning sidebar, a light contextual top bar and responsive content grids make the workspace easy to scan at 1024px and above.
- **Mobile:** five thumb-reachable destinations, short app headers, 44px-plus touch targets, safe-area spacing and bottom-sheet dialogs make the product feel app-like at 360–430px.
- **Practice:** an intentionally focused active session hides global navigation. The question, answer choices, timer, progress, review flag and navigation remain visible with a sheet-based question navigator on small screens.
- **Learning loop:** subject → unit → practice → result → retry missed questions / weakest unit / mock. Recommendations use the actual session result only.
- **Data integrity:** statistics, streaks, attempt counts, subject performance, rankings and mock availability all come from existing application data. Empty states are used when no data exists.

## Shared building blocks

- `components/brand.tsx`: code-native Bujh mark and wordmark.
- `components/learning-ui.tsx`: page heading, section heading, stat tile, subject icon, score ring and linked row.
- `components/library-nav.tsx`: shared revision-library navigation.
- `components/app-state.tsx`: loading, empty and error states.
- `components/ui/dialog.tsx`: centered desktop dialog and mobile bottom sheet.
- `components/layout/navbar.tsx` and `bottom-nav.tsx`: responsive desktop and mobile navigation.

## Visual tokens

The system is centralized in `app/globals.css`.

- Primary: Bujh blue `#315cf5`, with dark-mode `#8ca6ff`.
- Surfaces: soft slate workspace background and white cards; navy surfaces in dark mode.
- Shape: 12–28px radii by component role.
- Typography: compact, high-contrast headings and 14–16px reading text.
- Charts: blue, mint, amber, violet and rose palette in both themes.

## Route coverage

| Area | Main route(s) | UX focus |
| --- | --- | --- |
| Discovery | `/`, `/programs` | Real practice preview, programme selection |
| Home and study | `/dashboard`, `/subjects`, `/subjects/[slug]` | Next learning action and syllabus scanability |
| Practice and mocks | `/quiz`, `/quiz/[sessionId]`, `/mock-test` | Fast setup, focused answering, exam conditions |
| Results | `/quiz/[sessionId]/results` | Score clarity and adaptive next steps |
| Revision library | `/review`, `/bookmarks`, `/notes`, `/mistakes`, `/history` | Search, compact repeated study cards, recovery flows |
| Growth | `/analytics`, `/leaderboard` | Student report and programme rankings |
| Account | `/profile`, `/settings`, `/more`, `/auth/*` | Clear account paths and adaptive guest states |

## Reference principles

The interface uses patterns observed from public product examples: progressive learning loops and immediate feedback (Duolingo/Page Flows), compact product navigation and preference sheets (Linear/Refero), editorial landing-page rhythm (Land-book and Lapa Ninja), and deliberate component reuse (Figma design-system guidance). These sources informed interaction patterns and hierarchy; no product UI was copied.

## Verification targets

- Mobile: 360, 375, 390, 412 and 430px.
- Desktop: 768, 1024, 1280 and 1440px.
- Keyboard: visible focus states, semantic buttons/links and focus-managed dialogs.
- Motion: transitions respect `prefers-reduced-motion`.
