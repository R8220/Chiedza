# Chiedza Node.js MVP Review

## Scope decision

The reviewed build now focuses on the roles and modules needed for the current core care workflow: **User, Therapist, Care Reviewer, and Administrator**. The Care Reviewer remains separate because the specification says flagged events require human review and that no algorithm responds to a flagged event alone.

Deferred from the current MVP because the supplied product specification places them in later phases:

- Emotional Weather Forecast — Phase 2
- Digital Grief & Healing Archive — Phase 2
- AI Healing Poetry Generator — Phase 2
- Digital Healing Sanctuary — Phase 2
- Companion Mode / Caregiver role — Phase 3
- Full Return to Self portal — Phase 3 (the MVP keeps the Phase 1 Hearthstone/recovery view)

## Functional fixes and improvements

1. **Responsive navigation fixed.** The original CSS hid all normal navigation links and the “More” menu below 980px, leaving authenticated users with almost no usable navigation on tablet/mobile. The navigation now stays accessible and scrollable on narrower screens.
2. **Future-module routes removed.** Removed routes/views/navigation for caregiver, companion, grief archive, poetry and sanctuary to prevent users landing in out-of-phase modules.
3. **Role creation tightened.** Admin can now create only User, Therapist, Care Reviewer and Administrator roles. Subscriptions are created only for end-user accounts rather than operational staff accounts.
4. **MVP recovery view simplified.** Emotional Weather was removed from the dashboard/recovery view; the current recovery experience focuses on Hearthstone milestones, aftercare, summaries and reflections.
5. **Demo seed simplified.** Removed the caregiver demo account.

## Roles kept and why

- **User:** core person receiving support and using the Quiet Arcade, AI Listener, mindfulness, community, sessions and messaging.
- **Therapist:** required by the continuous-care model, therapist intervention, summaries, SOAP notes, care plans and sessions.
- **Care Reviewer:** required by the safeguarding flow for human review of risk flags and moderated community lanterns.
- **Administrator:** required for therapist assignment, account administration, crisis-directory configuration and audit operations.

## Validation performed

- JavaScript syntax checked with `node --check` across server, browser and test JavaScript files.
- Removed-module references checked in active routes/views.
- Full `npm test` could not be completed in the review environment because dependency installation exceeded the available execution window. Run `npm install`, `npm run seed`, and `npm test` locally before release.

## Production items still intentionally unresolved

Clinical threshold validation, real crisis contacts, staffed safeguarding SLAs, true E2E messaging, video/audio providers, WhatsApp/EAP integrations, DPIA/legal compliance, formal WCAG audit and native iOS/Android packaging remain external/production dependencies, consistent with the supplied specification.
