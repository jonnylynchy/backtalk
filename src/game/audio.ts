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

const bufferCache = new Map<string, AudioBuffer>();

/** Fetch + decode an audio file, caching the decoded buffer. */
export async function loadBuffer(url: string): Promise<AudioBuffer> {
	const cached = bufferCache.get(url);
	if (cached) return cached;

	const res = await fetch(url);
	const arrayBuffer = await res.arrayBuffer();
	const audioBuffer = await getAudioContext().decodeAudioData(arrayBuffer);
	bufferCache.set(url, audioBuffer);
	return audioBuffer;
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

/** Stop whatever is currently playing through the engine. */
export function stopPlayback(): void {
	if (currentSource) {
		try {
			currentSource.onended = null;
			currentSource.stop();
		} catch {
			/* already stopped */
		}
		currentSource = null;
	}
}

/** Play a buffer (optionally reversed). Resolves when playback ends. */
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
		source.onended = () => {
			if (currentSource === source) currentSource = null;
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
