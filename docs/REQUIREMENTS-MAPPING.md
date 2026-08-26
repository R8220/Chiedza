# Chiedza v2.0 — Requirements Mapping

This file maps the supplied 35-page scope to this Node.js repository. **Implemented** means the workflow/UI/data model exists in this codebase. **Prototype** means the user experience and orchestration are present but external clinical/technical validation or a third-party platform is still required. **Future** means the specification itself places the item in a later phase.

| Specification area | Status in this build | Implementation |
|---|---|---|
| AI Emotional Listener | Implemented | `/listener`, `src/services/aiService.js`, encrypted AI message store |
| Care Summarisation Engine | Implemented | structured summaries generated periodically; therapist review/correction |
| Care Orchestrator | Implemented | state-based routing service: Stable / Struggling / Overwhelmed / High Risk / Crisis |
| Therapist System | Implemented | caseload, AI insight review, SOAP notes, care plans, sessions, messages |
| Matching Engine | Implemented | clinical specialty → safety/preferences → language/timezone → workload scoring |
| Longitudinal Care Memory | Implemented baseline | check-ins, room sessions, journals, summaries, milestones, risk history |
| Predictive Care | Deferred to Phase 2 | Removed from MVP navigation and dashboard; retain as a later non-diagnostic feature |
| Crisis Detection & Safeguarding | Prototype / operational dependency | risk rules, immediate low-stimulation response, human review queue, crisis directory; thresholds and contacts require clinical/operational validation |
| User Consent & Control | Implemented | AI-only preference, therapist visibility, transcript, recording, contact, communication, low-battery, reduced motion |
| Therapeutic Modes | Implemented | stabilisation, active, recovery, crisis modes stored per user |
| Therapist Workload Intelligence | Implemented baseline | workload limits and auto-matching; deeper complexity weighting can be expanded |
| SAFER journey | Implemented UX mapping | onboarding, capacity, routing, rooms, escalation bridge, recovery portal |
| Calm Me / Lantern Breathing | Implemented | interactive no-fail breathing room |
| Ground Me / Quiet Room | Implemented | sensory orientation room |
| Let Me Rest / Long Afternoon | Implemented | no-reflection rest space |
| Help Me Return / Memory House | Implemented | reflective room + journal persistence |
| Carry With Me / Lanterns | Implemented | no likes/replies/follows; pre-publication moderation |
| Capacity Engine | Implemented baseline | explicit capacity plus state adaptation; passive behavioral inputs kept limited for privacy |
| Containment Pipeline | Implemented baseline | room completion / aftercare capture and crisis routing |
| Season Recogniser | Prototype | longitudinal themes feed forecast/recovery presentation; automatic visual seasons can be expanded |
| Escalation Bridge | Implemented prototype | human flag queue, assigned therapist notification timestamp, configurable crisis contacts |
| Gentle Return Layer | Implemented | “Welcome back. We kept your place.” without missed-day guilt |
| Ethical perimeter | Implemented product rules | no streak loss, leaderboard, FOMO timer or infinite social feed |
| Onboarding first 90 seconds | Implemented | staged arrival, consent, capacity, culture, routing, aftercare preview |
| Therapist secure chat | Implemented prototype | authenticated app messaging + encrypted-at-rest text; true E2E architecture is a production security dependency |
| Voice messages | Data model ready | message type/media fields exist; media provider/storage workflow not enabled |
| Video/audio sessions | Scheduling implemented | session request/status workflow; live media provider not selected in source specification |
| Community moderation | Implemented | pending queue, safety gating, human approve/reject |
| Mindfulness / Insomnia | Implemented baseline | rest/downshift and silence UI |
| Grounding protocols | Implemented | sensory room and paced quiet UI |
| Co-Regulation Mode | Implemented baseline | listener adapts brevity/capacity; real-time voice co-regulation requires voice provider/client integration |
| Journaling | Implemented | night, release, reflection + AI reflective mirror |
| Brand palette & typography | Implemented | Cream, Sepia, Lantern Gold, Ink, Soft Rose, Moss; Cormorant/Lora stack |
| Low Battery / reduced motion | Implemented | user controls + CSS adaptations |
| WCAG-oriented semantics | Implemented baseline | responsive labels, landmarks, role/status semantics; formal WCAG 2.2 AA audit still required |
| Low-data / offline grounding | Implemented baseline | PWA service worker + offline grounding shell |
| WhatsApp gateway | External integration required | adapter point documented; provider credentials and approved care workflow required |
| Recovery metrics | Implemented baseline | aftercare completion, room/check-in counts and system operations dashboard |
| Cultural Relevance Engine™ | Implemented baseline | language/culture/faith preferences are passed into AI context; onboarding copy includes English, Shona, isiXhosa, isiZulu, Afrikaans, Yoruba prototype copy |
| Hearthstone™ | Implemented | visual user-defined milestone hearth |
| “I'm With You” Live Co-Regulation™ | Prototype | adaptive listener + minimalist distress response; always-on voice presence not enabled |
| Voice Biofeedback & Vocal Stress Analysis™ | Not clinically enabled | deliberately omitted from inference/routing until validated biomarker model, consent flow, on-device/privacy design and clinical governance exist |
| Emotional Weather Forecast™ | Deferred to Phase 2 | Removed from the reviewed MVP build |
| Digital Grief Archive™ | Deferred to Phase 2 | Removed from the reviewed MVP build |
| AI Poetry Generator™ | Deferred to Phase 2 | Removed from the reviewed MVP build |
| Digital Healing Sanctuary™ | Deferred to Phase 2 | Removed from the reviewed MVP build |
| Companion Mode™ | Deferred to Phase 3 | Caregiver role and module removed from the reviewed MVP build |
| Thematic Community Threads™ | Implemented baseline | theme/pod filters; no popularity ranking |
| Return to Self Portal™ | Deferred to Phase 3 | MVP keeps the core Recovery & Hearthstone view without the full Phase 3 portal |
| Cultural & Regional Care Pods™ | Implemented baseline | community `pod` filter/data field; trained facilitator operating model is external |
| AR/VR Healing Sanctuary™ | Future | Phase 4 item; not represented as finished |
| Full AI Care Ecosystem | Future / partial foundations | shared record models and role workflows are present; full partner ecosystem requires integrations |
| SAFER Global Standard™ | Future organisational programme | not a software-only deliverable |
| Subscriptions / pricing display | Implemented baseline | data model + pricing UI; payment gateway intentionally not selected |
| Corporate / Pathway Youth white label | Architecture-ready | roles/data model can be extended; tenant isolation and institutional admin are a later deployment layer |
| GDPR / POPIA | Engineering foundations only | consent controls, sensitive-text encryption, audit; compliance requires legal, DPIA, policies, retention/deletion and deployment review |
| iOS / Android | PWA / responsive prototype | native store packaging and platform-specific testing remain deployment tasks |

## Safety implementation order

Every text-bearing high-risk pathway in this MVP is intended to create a human-review flag before or instead of ordinary generative reflection: AI Listener, check-in, journal and community lantern. The crisis directory ships with **non-functional placeholders** so the demo never fabricates local emergency contacts.

## Deliberate non-claims

- The application does not diagnose mental-health conditions.
- The Emotional Weather feature is a gentle longitudinal pattern reflection, not a clinical prediction.
- The application does not claim clinical efficacy for the Quiet Arcade.
- AI-generated therapist summaries explicitly require clinician review.
- Voice biomarker claims are not implemented without validated science/governance.
- This repository does not claim legal compliance merely because consent/security features exist.
