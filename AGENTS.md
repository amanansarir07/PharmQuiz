# Bujh — Product Engineering and UI Rules

Bujh is a serious education and exam-practice application.

This repository already contains working product functionality. The objective is NOT to continuously redesign it.

The objective is to maintain one coherent, production-quality product system across mobile and desktop.

Before any UI work, read:

* `AGENTS.md`
* `docs/UI_UX_SYSTEM.md`

These documents are the source of truth for product UI decisions.

---

# 1. NON-NEGOTIABLE PRODUCT PRINCIPLE

Bujh must feel like a purpose-built learning application.

It must NOT feel like:

* a generic SaaS dashboard
* a responsive marketing website after login
* an admin panel
* an AI-generated component showcase
* a Dribbble concept
* a collection of independent cards
* a template with random colors and icons

The interface exists to help the student:

* decide what to study
* start studying
* answer questions
* understand performance
* fix mistakes
* continue learning

If an element does not support one of those jobs, question whether it belongs.

---

# 2. DO NOT REDESIGN FREELY

Do not invent a new design direction during implementation.

Before changing a page:

1. inspect the existing rendered page
2. inspect existing shared components
3. identify the actual UX problem
4. identify what can be removed
5. reuse established Bujh patterns
6. make the smallest coherent improvement
7. verify it visually

Never redesign purely from source code.

Never introduce a second visual system.

Never create a new component when an existing shared component can reasonably handle the requirement.

If a shared component is weak, improve the shared component.

---

# 3. MOBILE IS AN APPLICATION

Mobile is not desktop stacked vertically.

This is one of the most important Bujh rules.

Mobile interaction must be:

task-driven
navigation-driven
progressive
focused

Prefer:

Home
→ choose action
→ choose subject
→ choose unit
→ configure
→ practice
→ result

Do NOT prefer:

Home
→ scroll
→ scroll
→ find section
→ scroll
→ configure
→ scroll
→ continue

Each mobile screen should have one primary responsibility.

Long scrolling is appropriate only when the content itself is naturally long.

Examples:

* question bank
* notes
* activity history
* leaderboard
* detailed analytics
* results review

Long scrolling is NOT appropriate simply because several desktop panels were stacked vertically.

---

# 4. MOBILE HOME

The mobile home/dashboard must be short.

Target roughly one to one-and-a-half normal phone viewports for the primary content.

Its job is to answer:

"What should I do next?"

Prioritize:

1. continue learning
2. start practice
3. mock test
4. mistakes / revision
5. small subject preview

Do not put full versions of these on mobile home:

* analytics
* leaderboards
* milestones
* long recent activity
* full subject inventory
* detailed statistics
* large progress reports

Those belong on dedicated screens.

---

# 5. DESKTOP

Desktop may expose more related information simultaneously.

Desktop should still feel like the same application.

Use:

* persistent sidebar when appropriate
* constrained content width
* stronger information density
* two-column layouts only when both columns are genuinely useful
* whitespace to group content

Do not stretch ordinary content across the full monitor.

Do not create widgets simply to fill the right side of a desktop layout.

Empty space is better than meaningless content.

---

# 6. PRODUCT TECHNOLOGY

Current Bujh stack includes:

* Next.js
* React
* Tailwind CSS
* shadcn
* Base UI
* Lucide
* class-variance-authority

Use the existing stack.

Do NOT introduce another UI/component system such as:

* Material UI
* Chakra
* Mantine
* Ant Design
* Bootstrap

without explicit approval.

---

# 7. TYPOGRAPHY

Typography should create hierarchy before borders and boxes do.

Use one deliberate product typeface.

Preferred Bujh font:

Manrope

Use a system fallback stack.

Avoid different font families for different pages.

Maintain a small consistent type scale.

Suggested roles:

Page title:

* 24–28px desktop
* 21–24px mobile
* strong weight
* compact line height

Section title:

* 16–18px
* semibold/bold

Body:

* 14–16px

Secondary/meta:

* 12–14px
* muted

Buttons:

* 14–15px
* medium/semibold

Do not use giant application headings.

Do not put descriptive subtitles below every heading unless they add useful information.

Do not use uppercase micro-labels everywhere.

---

# 8. COLOR

Bujh uses one primary brand accent.

Primary:
Bujh blue.

Neutral surfaces and text should dominate the application.

Color must have a reason.

Use semantic colors for:

* success
* warning
* destructive/error
* information
* selected/active state

Do NOT assign random colors to:

* subjects
* navigation links
* ordinary icons
* quick actions
* cards
* sections

Do NOT make one subject orange, another pink, another violet, etc. unless color carries meaningful persistent categorization.

Avoid unnecessary gradients.

Avoid glow.

Avoid decorative background blobs.

---

# 9. ICONS

Use Lucide consistently.

An icon must improve recognition or interaction.

Do NOT add an icon merely because an empty spot exists.

Do NOT automatically put icons inside colored circles.

Do NOT assign decorative colors to icons.

Use consistent sizes:

* inline/small: approximately 16px
* normal actions/navigation: 18–20px
* larger feature icon: only when genuinely needed

Avoid mixing icon families.

Subject rows do not automatically require unique decorative icons.

Text may be stronger than an unnecessary symbol.

---

# 10. CHEVRONS AND ARROWS

Do not scatter arrow icons across the interface.

A chevron or arrow is allowed only when it communicates:

* navigate deeper
* open details
* expand/collapse
* forward/back in a sequence

Do not add arrows merely to make a row look interactive.

If the entire row is clearly clickable, an arrow may be unnecessary.

Use semantic interaction cues instead of decorative arrows.

---

# 11. CARDS AND BOXES

Bujh currently tends toward excessive containers.

Before creating a card ask:

"Does this content need a distinct visual boundary?"

If not, use:

* spacing
* typography
* dividers
* alignment

instead.

Avoid:

* card inside card
* every stat in a card
* every navigation item in a card
* every section in a rounded box
* every quick action in its own large container

Cards are appropriate for:

* meaningful independent objects
* grouped interactive content
* question/test summaries
* substantial summary blocks

Sections do not automatically need borders.

---

# 12. BORDER RADIUS

Use restrained radii.

Suggested scale:

Small:
6px

Controls:
8px

Inputs/buttons:
8–10px

Cards/panels:
10–12px

Dialogs/sheets:
12–16px

Avoid 20–28px radii on ordinary application surfaces.

Pill shapes are reserved for:

* tags
* statuses
* compact filters
* segmented controls

Normal application containers should not look like bubbles.

---

# 13. SHADOWS

Hierarchy should primarily come from:

* layout
* typography
* spacing
* contrast
* subtle borders

Use shadows only when elevation is meaningful.

Examples:

* popover
* dropdown
* dialog
* floating temporary layer

Ordinary dashboard cards should not look like floating tiles.

---

# 14. BUTTONS

Maintain clear hierarchy:

Primary
Secondary
Ghost
Destructive

There should usually be only one visually dominant primary action per section/screen.

Button labels must describe the action.

Good:

Start practice
Continue
Submit report
Save changes
Retry

Bad:

Go
Proceed
Explore
Click here

Do not use gradients or glow on ordinary buttons.

---

# 15. FEEDBACK SYSTEM

Every meaningful user action must visibly communicate its state.

Actions need:

Idle
Loading
Success
Error

The user should never click something and wonder whether anything happened.

Examples:

Submit report:
Submitting…
→ Report submitted

Save profile:
Saving…
→ Changes saved

Delete bookmark:
confirmation when appropriate
→ deleting…
→ removed

Start mock:
Preparing test…
→ navigate

---

# 16. LOADING STATES

Do not use one generic spinner everywhere.

Use the correct loading treatment.

Button action:
spinner inside button + disabled state

List/page data:
skeleton shaped like the real content

Navigation:
subtle transition/progress feedback

Long-running operation:
progress or descriptive loading state

Full-screen spinner:
only when absolutely unavoidable

Never display an empty layout while data silently loads.

---

# 17. SKELETONS

Skeletons should resemble the real component.

Examples:

Subject list loading:
subject-row skeletons

Dashboard loading:
continue-learning block + subject rows

Leaderboard:
rank rows

Question bank:
question rows

Do not show arbitrary gray rectangles that do not match eventual layout.

Respect reduced-motion preferences.

---

# 18. SUCCESS FEEDBACK

Use success feedback proportionally.

Use toast for:

* saved
* added
* removed
* submitted
* copied
* bookmarked

Use inline persistent success for:

* forms where submitted status matters
* applications/reports whose state should remain visible

Use full-screen success/result states for major flows:

* mock completed
* practice completed
* account setup completed

Do not show a modal after every successful action.

---

# 19. ERROR FEEDBACK

Errors must explain:

* what failed
* what the user can do

Use inline errors for forms.

Use toast for transient operation failures.

Use page-level error state for failed page/data loading.

Provide retry when recovery is possible.

Do not expose raw backend errors to users.

---

# 20. TOASTS

Use one consistent toast system.

Toast should contain:

* clear result
* short supporting detail only if necessary
* optional relevant action

Examples:

Report submitted
We'll review it shortly.

Saved
Your settings were updated.

Couldn't save changes
Check your connection and try again.

Avoid giant notification cards.

Avoid stacking many toasts.

---

# 21. DIALOGS AND SHEETS

Dialog:
confirmation or focused short task

Alert dialog:
destructive/irreversible confirmation

Mobile sheet:
temporary choices, filters, secondary controls

Do NOT use dialogs for normal page navigation.

Major task steps should navigate to dedicated screens.

---

# 22. MOTION

Motion should communicate hierarchy and navigation.

Use subtle:

* fade
* slide
* content enter/exit
* pressed states
* sheet transitions

Keep motion fast and restrained.

Typical UI transitions:
approximately 150–250ms.

Do not animate everything.

Respect:

prefers-reduced-motion

---

# 23. FORMS

Forms require:

* visible labels
* consistent field heights
* clear required state
* inline validation
* loading state
* error state
* success state when relevant

Do not rely only on placeholder text.

On mobile avoid multiple important fields on one row.

Do not clear user input after a validation error.

---

# 24. EMPTY STATES

Empty states must help the user.

Example:

No mistakes yet
Questions you answer incorrectly will appear here.

Do not add giant decorative illustrations by default.

Use one useful action when appropriate.

---

# 25. DASHBOARD

Dashboard is not an analytics page.

Its purpose is navigation into learning.

Desktop may show:

* next learning action
* concise progress
* subject list
* small relevant secondary information

Mobile should show less.

Avoid:

* meaningless metrics
* milestone filler
* separate widgets merely to fill columns
* multiple competing CTAs
* full leaderboard widgets

---

# 26. SUBJECTS

Subject presentation should prioritize:

* subject name
* progress or availability
* units/topics
* primary action

Do not rely on colorful subject icons.

Use a clean list/grid depending on viewport.

---

# 27. PRACTICE FLOW

Mobile practice setup should use progressive navigation.

Preferred:

Practice
→ Subject
→ Unit/topic
→ Session configuration
→ Start

Do not place every choice in one giant scrolling page.

Desktop may combine closely related steps where space allows.

---

# 28. ACTIVE QUESTION SCREEN

During an active practice session:

the question is the product.

Global navigation should not compete with it.

Priority:

1. progress
2. question
3. answer options
4. answer/next action
5. explanation
6. secondary review controls

Answer states need:

* default
* hover where relevant
* selected
* correct
* incorrect
* disabled

Do not communicate correctness by color alone.

---

# 29. RESULTS

Results should answer:

* how did I do?
* what did I get wrong?
* what should I do next?

Prioritize:

score
accuracy
incorrect questions
weak unit/topic
retry/review action

Avoid decorative analytics that do not help revision.

---

# 30. MOBILE NAVIGATION

Bottom navigation should contain only frequent top-level destinations.

Maximum approximately five.

Recommended conceptual structure:

Home
Practice
Tests
Library
Profile/More

Do not place every feature in bottom navigation.

The active destination must be obvious.

Ensure safe-area padding.

Content must never hide behind navigation.

---

# 31. DESKTOP SIDEBAR

The sidebar should not expose every possible feature equally.

Reduce hierarchy.

Recommended conceptual grouping:

Primary:
Overview
Subjects
Practice
Mock tests

Study:
Question bank
Mistakes
Progress

Secondary access:
saved questions
notes
history
leaderboard

Settings/account at the bottom.

Secondary destinations can live under Library/More if needed.

Do not over-segment with excessive headings.

---

# 32. RESPONSIVE VERIFICATION

Every meaningful UI change must be inspected at:

360×800
390×844
430×932
768×1024
1024×768
1440×900

Verify:

* horizontal overflow
* clipping
* safe areas
* fixed/sticky collisions
* bottom-nav clearance
* long text
* loading states
* empty states
* error states
* focus behavior
* touch sizes

---

# 33. PLAYWRIGHT IS REQUIRED

After a meaningful UI change:

run the application
open it with Playwright
inspect mobile
inspect desktop

Do not declare UI work complete based purely on code.

When available, capture screenshots before and after significant changes.

---

# 34. FUNCTIONAL SAFETY

UI migration must not break:

* authentication
* authorization
* Supabase behavior
* quiz generation
* quiz submission
* results
* mock tests
* bookmarks
* notes
* reports
* admin functions
* analytics
* leaderboard
* route behavior

Do not rewrite business logic unless necessary.

Design changes should remain primarily presentational/interaction changes.

---

# 35. REMOVE BEFORE ADDING

When a screen feels wrong:

first remove unnecessary:

* cards
* text
* icon decoration
* colors
* widgets
* actions
* separators

Only then consider adding something.

Simplification is preferred over replacement decoration.

---

# 36. FINAL STANDARD

When choosing between:

A visually impressive screen

and

A calm screen that helps the student complete the task faster

choose the calm screen.

Bujh should feel:

focused
human
fast
coherent
trustworthy
educational
intentional

Not generated.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
