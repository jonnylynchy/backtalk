/* ============================================================
   Audio engine — Web Audio API only.
   Loads phrase clips, plays them forward or reversed, and
   reverses arbitrary recorded blobs for self-judging playback.
   ============================================================ */

let ctx: AudioContext | null = null;

/** Lazily create (and resume) a single shared AudioContext.
 *  Must be called from a user gesture the first time on iOS/Safari. */
export function getAudioContext(): AudioContext {
	if (!ctx) {
		const Ctor =
			window.AudioContext ||
			(window as unknown as { webkitAudioContext: typeof AudioContext })
				.webkitAudioContext;
		ctx = new Ctor();
	}
	if (ctx.state === "suspended") void ctx.resume();
	return ctx;
}

let unlocked = false;

/**
 * Unlock audio for iOS/Safari. MUST be called *synchronously* inside a user
 * gesture (e.g. a click/tap handler, before any `await`). iOS keeps an
 * AudioContext `suspended` — playing silently — unless it is created/resumed
 * and a node is started while the gesture is still active. We resume the
 * context and play a one-sample silent buffer to satisfy that requirement.
 */
export function unlockAudio(): void {
	// Best-effort: if the AudioContext is unavailable this must not throw, so
	// callers (tap handlers) degrade gracefully rather than raising uncaught.
	try {
		const context = getAudioContext();
		// "interrupted" is a non-standard but real iOS Safari state (e.g. after a
		// phone call); cast to string since it's absent from AudioContextState.
		const state = context.state as string;
		if (state === "suspended" || state === "interrupted") {
			void context.resume();
		}
		if (unlocked) return;
		const buffer = context.createBuffer(1, 1, 22050);
		const source = context.createBufferSource();
		source.buffer = buffer;
		source.connect(context.destination);
		source.start(0);
		unlocked = true;
	} catch (err) {
		console.warn("Audio unlock failed:", err);
	}
}

const bufferCache = new Map<string, AudioBuffer>();

/** Fetch + decode an audio file, caching the decoded buffer. */
export async function loadBuffer(url: string): Promise<AudioBuffer> {
	const cached = bufferCache.get(url);
	if (cached) return cached;

	try {
		const res = await fetch(url);
		if (!res.ok) {
			throw new Error(`HTTP ${res.status} ${res.statusText}`);
		}
		const arrayBuffer = await res.arrayBuffer();
		const audioBuffer = await getAudioContext().decodeAudioData(
			arrayBuffer
		);
		bufferCache.set(url, audioBuffer);
		return audioBuffer;
	} catch (err) {
		const detail = err instanceof Error ? err.message : String(err);
		throw new Error(`Could not load audio clip "${url}": ${detail}`);
	}
}

/** Return a NEW buffer with every channel reversed (never mutates input). */
export function reverseBuffer(buffer: AudioBuffer): AudioBuffer {
	const reversed = getAudioContext().createBuffer(
		buffer.numberOfChannels,
		buffer.length,
		buffer.sampleRate
	);
	for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
		const src = buffer.getChannelData(ch);
		const dst = reversed.getChannelData(ch);
		const n = src.length;
		for (let i = 0; i < n; i++) dst[i] = src[n - 1 - i];
	}
	return reversed;
}

/** Decode a recorded Blob into an AudioBuffer. */
export async function blobToBuffer(blob: Blob): Promise<AudioBuffer> {
	const arrayBuffer = await blob.arrayBuffer();
	return getAudioContext().decodeAudioData(arrayBuffer);
}

let currentSource: AudioBufferSourceNode | null = null;
/** Resolver for the in-flight playBuffer() promise, so we can settle it
 *  when playback is interrupted (otherwise callers awaiting it hang). */
let resolveCurrent: (() => void) | null = null;

/** Stop whatever is currently playing and settle its pending promise. */
export function stopPlayback(): void {
	const source = currentSource;
	const resolve = resolveCurrent;
	currentSource = null;
	resolveCurrent = null;

	if (source) {
		// Drop onended so it can't double-settle, then stop.
		source.onended = null;
		try {
			source.stop();
		} catch {
			/* already stopped */
		}
	}
	resolve?.();
}

/** Play a buffer (optionally reversed). Resolves when playback ends OR is
 *  interrupted by another playback / stopPlayback(). */
export function playBuffer(
	buffer: AudioBuffer,
	opts: { reverse?: boolean } = {}
): Promise<void> {
	stopPlayback();
	const context = getAudioContext();
	const source = context.createBufferSource();
	source.buffer = opts.reverse ? reverseBuffer(buffer) : buffer;
	source.connect(context.destination);
	currentSource = source;

	return new Promise((resolve) => {
		resolveCurrent = resolve;
		source.onended = () => {
			if (currentSource === source) {
				currentSource = null;
				resolveCurrent = null;
			}
			resolve();
		};
		source.start();
	});
}

/** Convenience: load a URL and play it forward or reversed. */
export async function playClip(
	url: string,
	opts: { reverse?: boolean } = {}
): Promise<void> {
	const buffer = await loadBuffer(url);
	await playBuffer(buffer, opts);
}
