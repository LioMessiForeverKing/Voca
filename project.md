# Vocal Coach AI — Project Spec

> An AI-powered mixing assistant that listens to your audio stems and gives
> you specific, actionable Logic Pro X advice in plain language. Built for
> indie musicians who can record but don't know what to do next.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Backend / DB | Convex |
| AI | Anthropic API (`claude-sonnet-4-20250514`) via Next.js API route |
| Audio Analysis | Web Audio API + custom radix-2 FFT (client-side, no upload) |
| Styling | Tailwind CSS |
| Language | TypeScript throughout |

**Why Convex:** Real-time session sync, built-in schema, no infra to manage.
Audio analysis data and full chat history live in Convex. The client sends
analysis results up after computing them locally — audio files never leave the
browser.

---

## Core User Flow

1. User lands on `/` — sees two upload zones (vocal stem, backing track)
2. User drops audio files — Web Audio API runs FFT analysis in the browser
3. Analysis results (band energies, RMS, peak, dynamic range) are stored in Convex
4. A session is created in Convex, user is redirected to `/session/[id]`
5. User types a question in the chat — Next.js API route calls Anthropic with
   the audio analysis as context
6. Response streams back, messages saved to Convex in real time
7. Session is shareable via URL (no auth required for v1)

---

## Convex Schema

```ts
// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sessions: defineTable({
    createdAt: v.number(),
    vocalAnalysis: v.optional(v.object({
      fileName: v.string(),
      duration: v.number(),       // seconds
      sampleRate: v.number(),
      rmsDb: v.number(),
      peakDb: v.number(),
      dynamicRange: v.number(),
      bands: v.array(v.object({
        name: v.string(),
        low: v.number(),
        high: v.number(),
        pct: v.number(),          // normalized 0-100
      })),
    })),
    trackAnalysis: v.optional(v.object({
      fileName: v.string(),
      duration: v.number(),
      sampleRate: v.number(),
      rmsDb: v.number(),
      peakDb: v.number(),
      dynamicRange: v.number(),
      bands: v.array(v.object({
        name: v.string(),
        low: v.number(),
        high: v.number(),
        pct: v.number(),
      })),
    })),
  }),

  messages: defineTable({
    sessionId: v.id("sessions"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_session", ["sessionId"]),
});
```

---

## File Structure

```
vocal-coach/
├── app/
│   ├── layout.tsx                   # Root layout, Convex provider
│   ├── page.tsx                     # Landing / upload page
│   ├── session/
│   │   └── [id]/
│   │       └── page.tsx             # Chat + analysis view
│   └── api/
│       └── chat/
│           └── route.ts             # Anthropic API call (server-side)
│
├── components/
│   ├── UploadZone.tsx               # Drag-and-drop audio upload
│   ├── AudioAnalyzer.tsx            # Runs FFT, emits analysis object
│   ├── SpectrumDisplay.tsx          # Band energy bar visualization
│   ├── ChatInterface.tsx            # Full chat UI with message list
│   ├── MessageBubble.tsx            # Individual message with markdown
│   └── QuickPrompts.tsx             # Starter question chips
│
├── lib/
│   ├── fft.ts                       # Radix-2 FFT implementation
│   ├── analyzeAudio.ts              # Full audio analysis pipeline
│   ├── buildSystemPrompt.ts         # Constructs Claude system prompt from analysis
│   └── types.ts                     # Shared TypeScript types
│
├── convex/
│   ├── schema.ts                    # (see above)
│   ├── sessions.ts                  # create, get, updateAnalysis mutations/queries
│   └── messages.ts                  # addMessage mutation, listMessages query
│
└── convex.json
```

---

## API Route — `/api/chat`

This is the only server-side route. It calls Anthropic and streams the response.
The API key lives in `ANTHROPIC_API_KEY` env var — never exposed to the client.

```ts
// app/api/chat/route.ts
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { messages, systemPrompt } = await req.json();

  const client = new Anthropic();

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  return new Response(stream.toReadableStream());
}
```

The client builds `systemPrompt` via `lib/buildSystemPrompt.ts` using the
analysis data pulled from Convex. Messages array is the full conversation
history from Convex for that session.

---

## Audio Analysis Pipeline (`lib/analyzeAudio.ts`)

Runs entirely in the browser. No file is ever sent to a server.

```ts
// Steps:
// 1. Read file as ArrayBuffer
// 2. AudioContext.decodeAudioData() -> AudioBuffer
// 3. getChannelData(0) -> Float32Array of PCM samples
// 4. Compute RMS, peak from full signal
// 5. Extract center 8192 samples, apply Hanning window
// 6. Run radix-2 FFT (lib/fft.ts)
// 7. Compute energy per frequency band from magnitude spectrum
// 8. Normalize band energies to 0-100%
// 9. Return AudioAnalysis object

export type AudioAnalysis = {
  fileName: string;
  duration: number;
  sampleRate: number;
  rmsDb: number;
  peakDb: number;
  dynamicRange: number;
  bands: Band[];
};

export type Band = {
  name: string;
  low: number;
  high: number;
  pct: number;
};

export const BANDS: Omit<Band, "pct">[] = [
  { name: "Sub",    low: 30,   high: 80    },
  { name: "Bass",   low: 80,   high: 250   },
  { name: "Lo-mid", low: 250,  high: 800   },
  { name: "Mid",    low: 800,  high: 3000  },
  { name: "Hi-mid", low: 3000, high: 8000  },
  { name: "Highs",  low: 8000, high: 20000 },
];
```

---

## System Prompt Builder (`lib/buildSystemPrompt.ts`)

```ts
export function buildSystemPrompt(
  vocal: AudioAnalysis | null,
  track: AudioAnalysis | null
): string {
  let prompt = `You are an expert Logic Pro X mixing engineer and vocal coach for indie musicians.
Give specific, actionable advice using exact Logic Pro X plugin names:
Channel EQ, Compressor, Space Designer, ChromaVerb, Stereo Spread,
Adaptive Limiter, Multipressor, Pitch Correction, Noise Gate, Tape Delay, etc.

Be conversational and direct — like a producer sitting next to them.
Reference the actual analysis data when it's relevant to the question.
Keep responses focused. Don't over-explain basics unless asked.`;

  if (vocal) {
    prompt += `\n\nVOCAL STEM: ${vocal.fileName}
Duration: ${vocal.duration}s | RMS: ${vocal.rmsDb} dBFS | Peak: ${vocal.peakDb} dBFS | Dynamic Range: ${vocal.dynamicRange} dB
Frequency energy by band:
${vocal.bands.map((b) => `  ${b.name} (${b.low}–${b.high}Hz): ${b.pct}%`).join("\n")}`;
  }

  if (track) {
    prompt += `\n\nBACKING TRACK: ${track.fileName}
Duration: ${track.duration}s | RMS: ${track.rmsDb} dBFS | Peak: ${track.peakDb} dBFS | Dynamic Range: ${track.dynamicRange} dB
Frequency energy by band:
${track.bands.map((b) => `  ${b.name} (${b.low}–${b.high}Hz): ${b.pct}%`).join("\n")}`;
  }

  if (!vocal && !track) {
    prompt += `\n\nNo audio uploaded yet. Give helpful general Logic Pro vocal mixing advice.`;
  }

  return prompt;
}
```

---

## Convex Mutations and Queries

```ts
// convex/sessions.ts

// createSession() -> Id<"sessions">
// getSession(id) -> Session | null
// updateVocalAnalysis(id, analysis)
// updateTrackAnalysis(id, analysis)

// convex/messages.ts

// addMessage(sessionId, role, content) -> Id<"messages">
// listMessages(sessionId) -> Message[]  <- real-time via useQuery
```

---

## Page: Landing (`app/page.tsx`)

- Two `<UploadZone>` components side by side
- On file drop: `analyzeAudio(file)` runs locally, returns `AudioAnalysis`
- Call `createSession()` Convex mutation to get a session ID
- Call `updateVocalAnalysis()` / `updateTrackAnalysis()` with results
- `router.push("/session/" + id)`
- Show `<SpectrumDisplay>` once analysis is done so user sees something while Convex writes

---

## Page: Session (`app/session/[id]/page.tsx`)

- `useQuery(api.sessions.getSession, { id })` — pulls analysis data
- `useQuery(api.messages.listMessages, { sessionId: id })` — real-time messages
- `<SpectrumDisplay>` for vocal + track at top
- `<ChatInterface>` takes up the rest of the view
- On send:
  1. Optimistically add user message to UI
  2. `addMessage(sessionId, "user", content)` — saves to Convex
  3. POST to `/api/chat` with messages + systemPrompt
  4. Stream response token by token into UI
  5. On stream complete: `addMessage(sessionId, "assistant", fullResponse)`

---

## Streaming Chat in the Client

Use the Anthropic SDK's browser-compatible stream or manually read the
`ReadableStream` from the API route:

```ts
const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ messages, systemPrompt }),
});

const reader = response.body!.getReader();
const decoder = new TextDecoder();
let fullText = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  // Parse SSE events from Anthropic stream
  // Update local state token by token
  fullText += extractText(chunk);
  setStreamingContent(fullText);
}

// Save complete message to Convex
await addMessage(sessionId, "assistant", fullText);
```

---

## Environment Variables

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

---

## Quick Prompts (shown on empty session)

Pre-fill the input and auto-send:

```ts
const QUICK_PROMPTS = [
  "Where should I start with my vocals?",
  "Why do my vocals sound thin or weak?",
  "How do I make my voice cut through the mix?",
  "My vocals feel buried — what do I do?",
  "What should I do about the low-end on my vocal?",
];
```

---

## Implementation Order

Build in this exact order to stay unblocked:

1. **Convex setup** — schema, sessions, messages mutations/queries
2. **`lib/fft.ts`** — FFT implementation, test with known signal
3. **`lib/analyzeAudio.ts`** — full pipeline, log output to console to verify
4. **Landing page** — upload zones, analysis runs, session created, redirect works
5. **`/api/chat` route** — basic (non-streaming) Anthropic call first, verify it works
6. **Session page** — display analysis data from Convex, static chat UI
7. **Wire up chat** — send messages, save to Convex, display in real time
8. **Add streaming** — replace static response with streamed tokens
9. **Polish** — quick prompts, loading states, error handling, mobile layout

---

## V1 Non-Goals

Do not build these in v1. They are future scope:

- Auth / user accounts (sessions are anonymous by URL)
- Expo / mobile app
- Logic Pro plugin (AU plugin, requires Xcode + C++)
- Direct plugin control (requires Apple partnership)
- Audio playback in the browser
- Waveform visualization
- Multiple sessions per user / session history list

---

## Notes for Claude Code

- Audio files never leave the browser. The analysis object (numbers only) is
  what gets stored in Convex. Make this clear in comments.
- The FFT must be a power-of-2 radix-2 implementation. Do not use a library
  for this — implement it in `lib/fft.ts` directly.
- Keep the system prompt construction pure and testable. It should be a
  function that takes analysis objects and returns a string.
- Streaming from the API route needs careful SSE parsing. Anthropic's stream
  emits `data:` prefixed JSON events — parse them correctly.
- Use `useQuery` from Convex for messages so the chat updates in real time
  across tabs without any polling.
- Tailwind only. No other CSS framework or CSS-in-JS.

---

## Getting Into Logic Pro — Roadmap

This section outlines a realistic, staged path to becoming a native Logic Pro
experience. No Apple partnership is required for any of the first three stages.

---

### Stage 1: macOS Companion App (Build This First)

The fastest way to be your own first user. No Logic API, no Xcode, no waiting.

**What it is:** A floating macOS window that sits alongside Logic Pro.

**How it works:**
- Wrap the Next.js web app in a macOS desktop shell using **Tauri** (Rust-based,
  much lighter than Electron) or plain **Electron**
- The window floats above Logic using `NSPanel` / `alwaysOnTop`
- User exports stems from Logic (`File > Export > All Tracks as Audio Files`),
  drops them straight into the app window
- Chat works exactly as the web version

**Why this matters:** This is your personal v1. You use it on your own songs,
find out if the advice is actually good, and fix the prompt before anyone else
sees it.

**Build time:** 1-2 days on top of the web app. Just wrap it in Tauri.

```bash
# Tauri setup (after web app is working)
npm install -g @tauri-apps/cli
tauri init
tauri dev    # opens macOS window loading your Next.js app
tauri build  # produces a .dmg you can install
```

**Tauri config for always-on-top floating window:**
```json
// src-tauri/tauri.conf.json
{
  "tauri": {
    "windows": [{
      "title": "Vocal Coach",
      "width": 420,
      "height": 700,
      "alwaysOnTop": true,
      "decorations": true,
      "resizable": true
    }]
  }
}
```

---

### Stage 2: Logic Pro Extension (Native Panel Inside Logic)

Apple introduced **Logic Pro Extensions** in Logic 10.7.5 (2023). This is the
official, supported way for third parties to add UI panels inside Logic's
interface — no jailbreaking, no hacks.

**What it is:** A panel that opens inside Logic's own UI, as a first-class tab.

**How it works:**
- Build a macOS app in **Xcode** using **Swift + SwiftUI**
- Embed a `WKWebView` inside the extension that loads your Next.js app
  (either localhost in dev or your deployed URL in prod)
- The extension registers with Logic and appears in the Logic Extensions panel
- User can open it without leaving Logic at all

**Requirements:**
- Mac with Xcode 15+
- Apple Developer account ($99/year)
- Logic Pro 10.7.5 or later
- The extension must be distributed through the Mac App Store (or TestFlight
  for beta users)

**File structure for the extension target:**
```
VocalCoachExtension/
├── VocalCoachExtension.swift       # Entry point, registers with Logic
├── ExtensionViewController.swift   # Hosts the WKWebView
├── Info.plist                      # NSExtension config
└── Assets.xcassets
```

**Key Swift code:**
```swift
// ExtensionViewController.swift
import LogicPro
import WebKit

class ExtensionViewController: LPAudioUnitViewController {
    private var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()
        webView = WKWebView(frame: view.bounds)
        webView.autoresizingMask = [.width, .height]
        view.addSubview(webView)

        // In dev: load localhost. In prod: load your deployed URL.
        let url = URL(string: "https://your-app.vercel.app")!
        webView.load(URLRequest(url: url))
    }
}
```

**Info.plist extension config:**
```xml
<key>NSExtension</key>
<dict>
  <key>NSExtensionPointIdentifier</key>
  <string>com.apple.logicpro.extension</string>
  <key>NSExtensionPrincipalClass</key>
  <string>VocalCoachExtension</string>
</dict>
```

**Limitation at this stage:** Logic Extensions cannot yet read the current
session's tracks, plugin states, or timeline data programmatically. The user
still exports stems manually. But the experience is dramatically better because
the chat panel is inside Logic rather than a separate window.

**What Logic CAN expose to extensions (as of 2024):**
- Playback state (playing, stopped, position)
- Current BPM and time signature
- MIDI input events

These alone let you say things like "your track is at 93 BPM, here's how to
set your delay time to match the tempo" automatically.

---

### Stage 3: Reading the Session (The Hard Part)

This is where it gets genuinely powerful — and genuinely difficult.

**Goal:** The extension reads what plugins are on each track, what their current
settings are, and can suggest changes without the user manually describing
their session.

**Two paths:**

**Path A — Logic Scripting (Available Now):**
Logic has a built-in JavaScript scripting environment called **MIDI Scripter**.
It can inspect and manipulate MIDI, but not audio plugin parameters directly.
Limited but available today with no special access.

**Path B — Apple's Plugin API (Requires Partnership or AUv3):**
Audio Unit v3 (AUv3) plugins can expose their parameters programmatically.
If the Vocal Coach extension also registers as an AUv3 plugin inserted on a
track, it can read and write its own parameters. To read OTHER plugins'
parameters (like Logic's built-in Channel EQ or Compressor), you would need
either:
- Apple to expose a session introspection API (currently not public)
- Direct outreach to Apple's Logic Pro team for partnership / beta API access

**How to approach Apple:**
1. Build Stage 1 and Stage 2 first. Have a working product with real users.
2. Apply to the **Apple Developer Program** and submit the extension to the
   Mac App Store.
3. Reach out via **developer.apple.com/contact** referencing your published
   extension and requesting access to Logic Pro's extended session API.
4. Alternatively: post on the Apple Developer Forums under Logic Pro — Apple
   engineers actively monitor it.

Getting traction (downloads, reviews, press) before approaching Apple is the
single best thing you can do to accelerate that conversation.

---

### Stage 4: Knob Control (The Dream)

**Goal:** The AI doesn't just tell you what to do — it does it.

This requires Logic to expose a **remote control / automation write API** to
third-party extensions. As of 2024, this does not exist publicly.

The path to making it happen:
- Stage 3 relationship with Apple unlocks this conversation
- Alternatively, Apple could ship this in a future Logic Pro update (they
  have been steadily opening up the extension API each year)

In the meantime, the gap can be narrowed by making the instructions so specific
that following them takes 30 seconds. "Open Channel EQ. Click the 300Hz band.
Drag it down 3dB. Done." is almost as fast as automation for a single tweak.

---

### Your Personal First-User Checklist

Do these in order. Each step makes the next one easier.

- [ ] Get the web app working locally
- [ ] Use it on 5 of your own unfinished songs
- [ ] Note every time the advice is wrong or confusing — fix the system prompt
- [ ] Build the Tauri wrapper, install it on your Mac
- [ ] Use it for a month while producing — collect your real questions
- [x] Set up an Apple Developer account
- [ ] Build the Logic Extension (WKWebView wrapper) in Xcode
- [ ] Submit to TestFlight and give access to 5 other indie musician friends
- [ ] Collect feedback, iterate on the system prompt
- [ ] Submit to Mac App Store
- [ ] Post about it (Reddit r/edmproduction, r/WeAreTheMusicMakers, Twitter/X)
- [ ] Reach out to Apple Developer Relations with your published app
