import { useCallback, useEffect, useRef, useState } from "react";
import { blobToBuffer, playBuffer, stopPlayback } from "../game/audio";

export const RECORD_SECONDS = 5;

export type RecorderStatus =
	| "idle"
	| "requesting"
	| "recording"
	| "recorded"
	| "error";

function pickMimeType(): string {
	const candidates = ["audio/webm", "audio/mp4", "audio/ogg"];
	for (const type of candidates) {
		if (MediaRecorder.isTypeSupported(type)) return type;
	}
	return "";
}

/**
 * Records up to RECORD_SECONDS of microphone audio, then exposes the
 * captured buffer so it can be played back reversed (for self-judging).
 */
export function useRecorder() {
	const [status, setStatus] = useState<RecorderStatus>("idle");
	const [error, setError] = useState<string | null>(null);
	/** Fraction of time remaining, 1 → 0 (drives the timer ring). */
	const [progress, setProgress] = useState(1);
	/** Whole seconds remaining, shown in the timer. */
	const [secondsLeft, setSecondsLeft] = useState(RECORD_SECONDS);

	const recorderRef = useRef<MediaRecorder | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const chunksRef = useRef<BlobPart[]>([]);
	const bufferRef = useRef<AudioBuffer | null>(null);
	const rafRef = useRef<number | null>(null);

	const releaseStream = useCallback(() => {
		streamRef.current?.getTracks().forEach((t) => t.stop());
		streamRef.current = null;
	}, []);

	const cancelTimer = useCallback(() => {
		if (rafRef.current !== null) {
			cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
		}
	}, []);

	const stop = useCallback(() => {
		cancelTimer();
		if (recorderRef.current && recorderRef.current.state === "recording") {
			recorderRef.current.stop();
		}
	}, [cancelTimer]);

	const start = useCallback(async () => {
		setError(null);
		bufferRef.current = null;
		chunksRef.current = [];
		setProgress(1);
		setSecondsLeft(RECORD_SECONDS);
		setStatus("requesting");

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
				},
			});
			streamRef.current = stream;

			const mimeType = pickMimeType();
			const recorder = new MediaRecorder(
				stream,
				mimeType ? { mimeType } : undefined
			);
			recorderRef.current = recorder;

			recorder.ondataavailable = (e: BlobEvent) => {
				if (e.data.size > 0) chunksRef.current.push(e.data);
			};

			recorder.onstop = async () => {
				releaseStream();
				try {
					const blob = new Blob(chunksRef.current, {
						type: mimeType || "audio/webm",
					});
					bufferRef.current = await blobToBuffer(blob);
					setStatus("recorded");
				} catch {
					setError("Couldn't process the recording. Try again.");
					setStatus("error");
				}
			};

			recorder.start();
			setStatus("recording");

			// Drive the countdown ring with rAF for smoothness.
			const startTime = performance.now();
			const tick = (now: number) => {
				const elapsed = now - startTime;
				const remaining = Math.max(0, RECORD_SECONDS * 1000 - elapsed);
				setProgress(remaining / (RECORD_SECONDS * 1000));
				setSecondsLeft(Math.ceil(remaining / 1000));
				if (remaining <= 0) {
					stop();
					return;
				}
				rafRef.current = requestAnimationFrame(tick);
			};
			rafRef.current = requestAnimationFrame(tick);
		} catch (err) {
			releaseStream();
			const denied =
				err instanceof DOMException &&
				(err.name === "NotAllowedError" ||
					err.name === "PermissionDeniedError");
			setError(
				denied
					? "Microphone access is needed to play. Enable it and try again."
					: "Couldn't start recording on this device."
			);
			setStatus("error");
		}
	}, [releaseStream, stop]);

	/** Play the recording reversed — this should sound like the phrase. */
	const playReversed = useCallback(async () => {
		if (bufferRef.current)
			await playBuffer(bufferRef.current, { reverse: true });
	}, []);

	const reset = useCallback(() => {
		cancelTimer();
		stopPlayback();
		releaseStream();
		bufferRef.current = null;
		chunksRef.current = [];
		setProgress(1);
		setSecondsLeft(RECORD_SECONDS);
		setError(null);
		setStatus("idle");
	}, [cancelTimer, releaseStream]);

	useEffect(() => {
		return () => {
			cancelTimer();
			releaseStream();
		};
	}, [cancelTimer, releaseStream]);

	return {
		status,
		error,
		progress,
		secondsLeft,
		hasRecording: status === "recorded",
		start,
		stop,
		reset,
		playReversed,
	};
}
