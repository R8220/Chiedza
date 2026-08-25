# Chiedza Mobile App (Expo / React Native)

This folder is the native mobile client added to the original Node.js Chiedza system. The existing Express/Sequelize backend remains the source of truth and now exposes a token-authenticated `/api/mobile` API for iOS and Android.

## What is implemented in the mobile client

- Register / sign in and persistent mobile session
- First-90-seconds inspired onboarding and capacity check
- Adaptive home screen and check-ins API
- AI Emotional Listener with safeguarding bridge
- Quiet Arcade entry points for all five rooms
- Mindfulness / journaling
- Carry With Me moderated lantern community
- Return to Self recovery portal and Hearthstone milestones
- Grief & Healing Archive
- Therapist session requests and secure messages
- Consent / privacy / low-battery / reduced-motion controls

Therapist, Care Reviewer and Admin operational dashboards remain in the web application because those workflows are information-dense and safety-critical. They can be moved into tablet/mobile clients later if required.

## Run the backend

From the project root:

```bash
npm install
npm run seed
npm run dev
```

The API will be available at `http://localhost:3000/api/mobile`.

## Run the mobile client

In another terminal:

```bash
cd mobile-app
npm install
npm start
```

For an Android emulator the default API URL is `http://10.0.2.2:3000/api/mobile`.
For a physical phone on the same Wi-Fi network, set your computer's LAN IP before starting Expo:

**Windows PowerShell**

```powershell
$env:EXPO_PUBLIC_API_URL="http://192.168.1.10:3000/api/mobile"
npm start
```

Replace `192.168.1.10` with the IP address of the laptop running Node.js.

## Production work still required

This is a development build, not a clinically validated medical product. Before public release, complete clinical safeguarding review, verified crisis contact configuration, privacy/DPIA/legal review, security testing, true E2E messaging design if required, production media providers, push-notification policy, store privacy declarations, offline encrypted storage, accessibility audit, translations/cultural review, and Apple/Google release signing.
