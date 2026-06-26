import { Check, X, RotateCcw, Lightbulb, Play, Sparkles } from "lucide-react";
import { LevelBadge } from "./LevelBadge";

interface SuccessProps {
	kind: "success";
	phrase: string;
	levelNumber: number;
	points: number;
	isLastLevel: boolean;
	onNext: () => void;
	onHearRecording: () => void;
}

interface FailProps {
	kind: "fail";
	phrase: string;
	levelNumber: number;
	onRetry: () => void;
	onQuit: () => void;
}

type Props = SuccessProps | FailProps;

export function ResultView(props: Props) {
	if (props.kind === "success") {
		return (
			<div className="view">
				<LevelBadge level={props.levelNumber} />
				<div className="spacer" />
				<div className="sparkles">
					<Sparkles fill="currentColor" />
					<Sparkles fill="currentColor" />
					<Sparkles fill="currentColor" />
				</div>
				<div className="result-icon win">
					<Check strokeWidth={4} />
				</div>
				<h2 className="result-title win" style={{ marginTop: 22 }}>
					Nailed it!
				</h2>
				<p className="result-sub" style={{ marginTop: 14 }}>
					Reversed, your voice said <em>“{props.phrase}”</em> —
					forwards! 🎉
				</p>
				<p className="points" style={{ marginTop: 16 }}>
					+{props.points} PTS
				</p>
				<div className="spacer" />
				<button
					type="button"
					className="btn btn-pill lime"
					onClick={props.onNext}
				>
					{props.isLastLevel ? "Finish 🏆" : "Next level ▶"}
				</button>
				<button
					type="button"
					className="btn btn-text"
					onClick={props.onHearRecording}
					style={{ alignSelf: "center", marginTop: 6 }}
				>
					<Play size={15} fill="currentColor" />
					hear my recording
				</button>
			</div>
		);
	}

	return (
		<div className="view">
			<LevelBadge level={props.levelNumber} />
			<div className="spacer" />
			<div className="result-icon lose">
				<X strokeWidth={4} />
			</div>
			<h2 className="result-title lose" style={{ marginTop: 22 }}>
				Not quite
			</h2>
			<p className="result-sub" style={{ marginTop: 14 }}>
				Reversed, that didn’t sound like the phrase yet. Give it another
				go!
			</p>
			<div className="tip" style={{ marginTop: 20 }}>
				<Lightbulb fill="currentColor" />
				Tip: replay the backwards audio and copy it sound-for-sound.
			</div>
			<div className="spacer" />
			<button
				type="button"
				className="btn btn-pill pink"
				onClick={props.onRetry}
			>
				<RotateCcw size={20} strokeWidth={3} />
				Retry level
			</button>
			<button
				type="button"
				className="btn btn-text"
				onClick={props.onQuit}
				style={{ alignSelf: "center", marginTop: 6 }}
			>
				← back to start
			</button>
		</div>
	);
}
