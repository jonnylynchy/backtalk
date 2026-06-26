# BackTalk 🔊

> Say it backwards. Sound it forwards.

A neon mobile game built with **React + TypeScript + Vite**. You're shown a
phrase, you hear it forwards and backwards, then you record yourself saying it
**backwards** — when your recording is reversed, it should sound like the
original phrase. Clear all the levels to win.

## Run it

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

Other scripts:

```bash
pnpm build      # type-check + production build
pnpm lint       # eslint + prettier
pnpm preview    # serve the production build
```

> 🎧 Best with headphones — it keeps the phrase playback out of your recording.

## How it works

| Concern | Implementation |
| --- | --- |
| Phrase audio (forward + backward) | Pre-generated WAV clips in `public/audio/`, played via the **Web Audio API**. "Backward" reverses the decoded buffer in memory. |
| Recording | **MediaRecorder** + `getUserMedia`, capped at a 5-second countdown. |
| Reversing your voice | The recorded blob is decoded and reversed with the Web Audio API, then played back. |
| Judging success | **Self-judge** — after recording, the app plays your reversed take so you can hear whether it lands, and you tap *Nailed it* / *Not quite* (see note below). |

### Why self-judging?

Automatically detecting whether the *reversed recording* matches the phrase
needs speech-to-text on an arbitrary audio buffer. The browser
`SpeechRecognition` API only transcribes the **live** microphone — it can't run
on a recorded/reversed buffer — so fully-automatic offline judging isn't
possible with pure web APIs. The self-judge step keeps it 100% client-side and
reliable. To make it automatic later, swap `handlePass`/`handleFail` in
[`src/App.tsx`](src/App.tsx) for a cloud speech-to-text call (e.g. via the
`@google-cloud/speech` or `openai` npm package).

## Regenerating phrase audio

Clips are generated with the macOS `say` command:

```bash
say -v Samantha -r 160 -o /tmp/clip.aiff "Your phrase"
afconvert /tmp/clip.aiff public/audio/your-phrase.wav -d LEI16 -f WAVE
```

Then add the phrase + path to [`src/game/levels.ts`](src/game/levels.ts).

## Project layout

```
src/
  App.tsx              # screen state machine (start → play → review → result → win)
  game/
    levels.ts          # phrase list, audio paths, points
    audio.ts           # Web Audio engine: load / reverse / play buffers
  hooks/
    useRecorder.ts     # mic capture, 5s timer, reversed playback
  components/          # StartView, GameView, ReviewView, ResultView, WinView, ...
  index.css            # neon theme + all view styles
```

### Dev tip

In dev you can deep-link to any screen, e.g.
`/?screen=success&level=3&score=950`, to preview it without playing through.
