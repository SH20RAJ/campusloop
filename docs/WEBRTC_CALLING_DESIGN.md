# CampusLoop Video Calling & Random Loop Video Architecture Design

## 1. Product Overview
CampusLoop introduces high-fidelity, privacy-preserving 1-to-1 WebRTC audio and video calling across two key campus surfaces:
1. **Messenger Calling (`/app/chat`)**: Direct video and audio calls with verified classmates and mutual campus connections.
2. **Random Loop Video (`/app/random`)**: Serendipitous, Omegle-style video conversations starting anonymously, with mutual video consent, mutual identity reveal, and transition to persistent friends.

---

## 2. Separation of Concerns: Control Plane vs. Media Plane

### Control Plane (CampusLoop Worker + Neon PostgreSQL + Upstash Redis)
- User Authentication & Verification (Hexclave).
- Authorization, Call Eligibility & Conversation Membership verification.
- Authoritative Call Session State Machine (`IDLE` $\to$ `CALLING` $\to$ `RINGING` $\to$ `ACCEPTED` $\to$ `CONNECTING` $\to$ `CONNECTED` $\to$ `ENDING` $\to$ `ENDED`).
- Call invitations, ringing timeouts (35s), rejection, and busy-state management.
- Real-time signaling via Upstash Redis pub/sub / REST keys (sub-5ms) + PostgreSQL persistence.
- Block enforcement (blocks immediately sever connections and ban future calls).
- Moderation reports & abuse reporting.

### Media Plane (PeerJS + Direct Browser WebRTC)
- Direct Peer-to-Peer encrypted media streams (Opus Audio, VP8/H.264 Video).
- Audio and video never transit through Cloudflare Workers.
- Browser `navigator.mediaDevices.getUserMedia` with fallback from Video to Audio-only.
- Configurable STUN/TURN ICE servers via environment variables (`NEXT_PUBLIC_PEERJS_HOST`, `NEXT_PUBLIC_PEERJS_PORT`, `NEXT_PUBLIC_PEERJS_PATH`, `NEXT_PUBLIC_ICE_SERVERS`).

---

## 3. Database Architecture (`call_sessions` & `user_behavior_events`)
- `call_sessions` table in `src/db/schema/calls-and-analytics.ts`:
  - `id`: unique UUID.
  - `conversationId`: nullable (linked for `/app/chat` DMs).
  - `callerId`, `receiverId`: references `userProfiles.id`.
  - `type`: `"audio"` | `"video"`.
  - `context`: `"chat"` | `"random_loop"`.
  - `status`: `"CALLING"`, `"ACCEPTED"`, `"CONNECTED"`, `"DECLINED"`, `"MISSED"`, `"ENDED"`.
  - `callerPeerId`, `receiverPeerId`: ephemeral peer identifiers.
  - `durationSeconds`, `startedAt`, `acceptedAt`, `endedAt`, `endedReason`.
- `user_behavior_events` table for behavioral analytics, storing dwell, query, clicks, and dwell weights to fuel recommendations.

---

## 4. WebRTC CallEngine (`src/lib/calls/call-engine.ts`)
A framework-agnostic client abstraction:
- Singleton or scoped CallEngine instance.
- Initializes ephemeral PeerJS instance on-demand with automatic retry and error capture.
- Manages local `MediaStream` tracks (stopping camera/mic hardware cleanly upon disconnect).
- Handles track toggling (mic mute, camera mute, mobile camera flipping via `facingMode: "user" | "environment"`).
- Reconnection states (`CONNECTING`, `CONNECTED`, `RECONNECTING`, `FAILED`).
- Prevents memory leaks by attaching proper event listeners and cleaning up on `destroy()`.

---

## 5. `/chat` Video & Audio Calling UX
- Compact Call Toolbar in `messenger-pane.tsx` header:
  - 📞 Phone Button for Audio Call.
  - 📹 Video Camera Button for Video Call.
- Incoming Call Banner / Sheet:
  - Rings with caller's verified name, avatar, and college badge.
  - Accept and Decline buttons with subtle audio chime.
- Pre-Call Screen:
  - Local camera preview with mic/camera toggle before joining.
- Active Video Call UI:
  - Desktop: Fullscreen remote stream + draggable floating local picture-in-picture.
  - Mobile: Immersive `100dvh` container with bottom control pill tray (Mute, Camera, Flip, End, Report, Block).

---

## 6. Random Loop Video Mode UX
- Toggleable or upgradeable flow from Random Loop text chat.
- User can tap **📹 Request Video**.
- Partner receives mutual consent dialog: *"Anonymous Student wants to switch this conversation to video."*
- Camera starts **ONLY** when both accept.
- Identity remains shielded ("Anonymous Student", college name only).
- Mutual **"Reveal Identity"** button allows both students to unlock real names, photos, and usernames.
- Mutual **"Become Friends"** button follows each other in PostgreSQL and opens persistent chat in `/app/chat`.
- Instant **Next Person** button stops all hardware tracks immediately and re-queues.

---

## 7. Security & Safety Invariants
- Instant termination upon block.
- Zero media recording in V1.
- PII scrubbing on text chat persists throughout video session.
- Report flow with harassment/inappropriate tags accessible in 1 click directly from the call controls.
