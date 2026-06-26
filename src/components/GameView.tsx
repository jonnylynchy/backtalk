import { useState } from "react";
import { Mic } from "lucide-react";
import type { Level } from "../game/levels";
import { playClip, stopPlayback, unlockAudio } from "../game/audio";
import type { useRecorder } from "../hooks/useRecorder";
import { RECORD_SECONDS } from "../hooks/useRecorder";
import { LevelBadge } from "./LevelBadge";
import { ListenButton } from "./ListenButton";

interface Props {
	level: Level;
	levelNumber: number;
	recorder: ReturnType<typeof useRecorder>;
}

function TimerRing({
	progress,
	seconds,
}: {
	progress: number;
	seconds: number;
}) {
	const R = 45;
	const C = 2 * Math.PI * R;
	return (
		<div className="timer">
			<svg viewBox="0 0 100 100">
				<circle className="track" cx="50" cy="50" r={R} />
				<circle
					className="progress"
					cx="50"
					cy="50"
					r={R}
					strokeDasharray={C}
					strokeDashoffset={C * (1 - progress)}
				/>
			</svg>
			<div className="num">
				<b>{seconds}</b>
				<span>seconds left</span>
			</div>
		</div>
	);
}

export function GameView({ level, levelNumber, recorder }: Props) {
	const [playing, setPlaying] = useState<"fwd" | "bwd" | null>(null);
	const [playError, setPlayError] = useState<string | null>(null);
	const isRequesting = recorder.status === "requesting";
	const isRecording = recorder.status === "recording";
	const isBusy = isRequesting || isRecording;

	const play = async (reverse: boolean) => {
		setPlayError(null);
		setPlaying(reverse ? "bwd" : "fwd");
		try {
			// Unlock iOS audio synchronously, inside the tap, before any await.
			unlockAudio();
			await playClip(level.audio, { reverse });
		} catch (err) {
			console.error(err);
			setPlayError(
				"Couldn't play that clip. Check your connection and try again."
			);
		} finally {
			setPlaying(null);
		}
	};

	const begin = () => {
		unlockAudio();
		stopPlayback();
		setPlaying(null);
		setPlayError(null);
		void recorder.start();
	};

	return (
		<div className="view">
			<LevelBadge level={levelNumber} />

			<p className="section-label" style={{ marginTop: 26 }}>
				Your phrase
			</p>
			<div className={`phrase-card ${isBusy ? "rec" : ""}`}>
				<span className="phrase-text">“{level.phrase}”</span>
			</div>

			{recorder.status === "error" ? (
				<>
					<div className="spacer" />
					<p
						className="result-sub"
						style={{ color: "var(--pink-soft)", marginBottom: 18 }}
					>
						{recorder.error}
					</p>
					<button
						type="button"
						className="btn btn-pill pink"
						onClick={begin}
					>
						Try again
					</button>
					<div className="spacer" />
				</>
			) : isRequesting ? (
				<>
					<div className="spacer" />
					<p
						className="listening-note"
						style={{ color: "var(--text-dim)" }}
					>
						Requesting microphone…
					</p>
					<div className="spacer" />
				</>
			) : isRecording ? (
				<>
					<div className="spacer" />
					<div className="rec-pill">
						<span className="dot" />
						REC
					</div>
					<div style={{ height: 28 }} />
					<TimerRing
						progress={recorder.progress}
						seconds={recorder.secondsLeft}
					/>
					<div className="spacer" />
					<p className="listening-note">
						Listening… say the phrase backwards!
					</p>
				</>
			) : (
				<>
					<div style={{ height: 22 }} />
					<div className="listen-divider">Listen</div>
					<div style={{ height: 20 }} />
					<div className="listen-row">
						<ListenButton
							variant="fwd"
							label="Forward"
							playing={playing === "fwd"}
							onClick={() => play(false)}
						/>
						<ListenButton
							variant="bwd"
							label="Backward"
							playing={playing === "bwd"}
							onClick={() => play(true)}
						/>
					</div>

					{playError && (
						<p className="play-error" role="alert">
							{playError}
						</p>
					)}

					<div className="spacer" />

					<div className="record-wrap">
						<button
							type="button"
							className="record-btn"
							onClick={begin}
						>
							<Mic fill="currentColor" />
							Begin
						</button>
						<p className="record-hint">
							Tap to record · {RECORD_SECONDS}s to say it
							backwards
						</p>
					</div>
					<div className="spacer" />
				</>
			)}
		</div>
	);
}
