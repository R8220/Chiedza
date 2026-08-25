# Chiedza Mobile Conversion & Enhancement Notes

## Architecture decision

The safest and most maintainable conversion is **not** to rewrite the Node.js business logic into the phone. The Node.js/Sequelize application remains the backend and clinical/safeguarding source of truth. A new Expo/React Native client consumes a dedicated REST API under `/api/mobile`.

This preserves the existing risk service, care orchestrator, AI listener, encrypted text storage, therapist matching, review queue and longitudinal data models while replacing EJS pages with native mobile screens.

## Enhancements added during conversion

1. Dedicated bearer-token mobile authentication with 14-day sessions.
2. Mobile-specific REST API instead of screen-scraping EJS routes.
3. Native navigation structured around low cognitive load: Home, Listener, Rooms, Journal, More.
4. Consent controls exposed directly in mobile settings.
5. Human-review safety bridge preserved for listener, journal, community and grief text.
6. Mobile role boundary: client experience is native; therapist/reviewer/admin remain web-first for now.
7. API contracts for check-ins, Quiet Arcade sessions, recovery, milestones, grief archive, sessions and messaging.
8. Mobile build keeps the specification's brand palette and non-gamified tone.

## Requirement gaps intentionally not pretended to be finished

- Voice biofeedback/vocal stress analysis needs validated models, explicit consent, privacy engineering and clinical governance.
- Real audio/video calling needs a selected provider and security review.
- WhatsApp gateway needs an approved provider and safeguarding operating model.
- Crisis numbers must be verified per launch region rather than invented.
- Offline mode currently needs a native encrypted cache layer for full production operation; the web PWA's service worker does not automatically transfer to React Native.
- Push notifications must follow the product's no-guilt/no-FOMO ethical perimeter and should be opt-in and capacity-aware.
- Institutional white-label tenancy requires tenant isolation, organisation admin and data-governance controls.

## Recommended next engineering phase

Implement production-quality room experiences (breathing animation, ambient audio, sensory grounding and offline rest), secure media upload for voice/grief archive, push-notification consent, local encrypted offline storage, localisation resources, and end-to-end tests against the mobile API. Keep clinical validation and safeguarding operations as launch gates rather than coding assumptions.
