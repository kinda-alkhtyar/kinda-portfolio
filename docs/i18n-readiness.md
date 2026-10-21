# Website language readiness

This inventory informed the English, German, and Turkish implementation. The website language follows its URL prefix and is also saved as `siteLocale`. The four CV PDF choices remain independent.

## Implemented architecture

- `src/i18n/messages.ts` contains typed dictionaries and `src/i18n/locale.tsx` supplies translation, localized links, and language switching.
- `/en`, `/de`, and `/tr` prefixes cover every page and case study. Existing unprefixed English URLs remain valid.
- The build generates localized HTML metadata for each route. `vercel.json` serves direct requests without a trailing slash. Client navigation updates metadata and history.
- `npm run check:i18n` checks dictionary parity, localized HTML output, live-site URLs, and CV PDFs after `npm run build`.
- Static route HTML includes metadata, while visible page content still renders through React. Full server-rendered page content would require a separate rendering architecture.

## String inventory

Every visible phrase, form label, status, placeholder, link name, image alternative, and accessibility label below needs a locale key. Proper names, email addresses, URLs, filenames, and technology names remain data; translate the surrounding words.

| Source | Strings and templates to extract |
| --- | --- |
| `components/Navbar.tsx`, `pages/AboutPage.tsx` navigation | Home, Projects, About, Contact, 3D; Available for freelance/opportunities; main navigation label; home logo label. Use one shared navigation dictionary for both nav implementations. |
| `components/CVDownload.tsx` | Download CV and any descriptive download label. Keep English, Deutsch, Türkçe, العربية as native language names and keep all four PDF URLs independent of site locale. |
| `sections/Hero.tsx` | Frontend Developer role, professional introduction, View Projects, Contact Me, accessible name of the wordmark. |
| `sections/Projects.tsx` | Selected Work, subtitle, each of the three home project descriptions and category tags, View project and its accessible name, mockup image alternatives. Project names stay proper names. |
| `sections/Contact.tsx` | Heading, subtitle, Start a project. Sword imagery remains decorative. |
| `pages/ProjectsPage.tsx` | Projects hero eyebrow and subtitle, Selected work, Website category, all six card subtitles, Coming Soon name and message, View project details accessible names, preview image alternatives, footer heading and quotation. Keep project names as data. |
| `pages/ProjectDetailPage.tsx` | Back to projects, Case study, all category labels, all five summaries, Built with, Website, Visit Live Website, Overview, Project detail, screenshot alternative template, Previous project, Next project. Technology names and project names stay data. |
| `pages/AboutPage.tsx` | All section eyebrows and headings, name introduction, role and profile copy, Let's connect, purpose copy, decorative word labels if exposed to assistive technology, certificate heading and issuing organization context. Keep the certificate's official name and issuer accurate. |
| `pages/AboutBring.tsx` | What I bring; Responsive, Multilingual, Interactive and their supporting sentences. |
| `pages/AboutTechStack.tsx` | Skills & technologies, Tech Stack, Tools that power ideas, Frontend, Interfaces, Programming, Tools. Technology names stay data. |
| `pages/AboutOpportunities.tsx` | Available for opportunities; Project experience, Location, Open to, Languages and their human-readable values. Keep location and language names locale-aware. |
| `pages/AboutFinalCTA.tsx` | Let's Create Something Real, Let's connect. |
| `pages/ContactPage.tsx` | Contact heading and introduction, decorative text that is readable to users. |
| `pages/ContactMethods.tsx` | Contact methods accessible section name; Email, WhatsApp, Instagram, GitHub, Portfolio labels. Addresses and handles stay data. |
| `pages/ContactForm.tsx` | Send a message, email-app explanation, Your name/email/message, all placeholders, Open email app, review-before-sending note, mailto subject and body labels. Browser validation is localized by the browser locale; custom validation would need keys. |
| `pages/ContactFinalCTA.tsx` | Final invitation and accessible link text, Websites & apps, Interactive web, Creative solutions, Remote worldwide, More than code. |
| `pages/ThreeDPage.tsx` | 3D headings, instructions, viewer accessible name, hotspot names/descriptions and Explore-label template, Close detail, detail counter label, process/studio/final section labels, headings and copy, Start a project, footer labels. |
| `components/Sword3D.tsx`, `components/GlobalCompanion.tsx` | 3D sword and drag-to-rotate accessibility labels. Decorative energy-trail text, if exposed, needs either localization or `aria-hidden`. |
| `pageMetadata.ts`, `index.html` | Per-route document title, meta description, Open Graph and Twitter title/description/image alternative, site name where translated; `html lang`, Open Graph locale, future `hreflang` links. Project names remain data. |

## Original architecture recommendations (implemented)

1. Add typed `en`, `de`, and `tr` dictionaries grouped by `common`, `home`, `projects`, `caseStudy`, `about`, `contact`, `threeD`, `a11y`, and `metadata`. Use interpolation for project names, screenshot numbers, contact-form subject/body, and case-study navigation; avoid assembling sentences from fragments.
2. Add a small React locale context and `useT()` hook. Initialize from a future locale URL prefix when present, then a saved `siteLocale` preference, then English. Set `<html lang>` and update metadata on locale or route changes. No library is required for these three static dictionaries.
3. Preserve current unprefixed URLs as English. When translations are ready, add shareable `/de/...` and `/tr/...` routes, keeping project slugs stable. A website-language control should update the route, persist `siteLocale`, and retain the current page or case study. Browser back/forward must update both route and locale. Keep the CV download menu and its four PDFs unchanged and separate.
4. For search and social previews, generate locale-specific HTML per route (prerender or SSR) with canonical and reciprocal `hreflang` tags. Client-side metadata updates alone do not reliably reach link-preview crawlers.
5. Have native or fluent reviewers check German and Turkish professional copy, form text, accessible names, and metadata. Fall back to English for missing keys during development and fail the build on missing keys before launch.
