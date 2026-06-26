import { Trophy, RotateCcw } from "lucide-react";

interface Props {
	score: number;
	levelsCleared: number;
	onPlayAgain: () => void;
}

export function WinView({ score, levelsCleared, onPlayAgain }: Props) {
	return (
		<div className="view center-col">
			<div className="spacer" />
			<div className="sparkles">
				<Trophy fill="currentColor" />
			</div>
			<h2
				className="result-title win"
				style={{ fontSize: "clamp(3rem, 16vw, 4.4rem)" }}
			>
				You win!
			</h2>
			<p className="result-sub" style={{ marginTop: 14 }}>
				You out-talked every phrase. Backwards is your new forwards.
			</p>

			<div className="win-stats" style={{ marginTop: 30 }}>
				<div className="stat">
					<b>{score}</b>
					<span>points</span>
				</div>
				<div className="stat">
					<b>{levelsCleared}</b>
					<span>levels</span>
				</div>
			</div>

			<div className="spacer" />
			<button
				type="button"
				className="btn btn-pill cyan"
				onClick={onPlayAgain}
			>
				<RotateCcw size={20} strokeWidth={3} />
				Play again
			</button>
		</div>
	);
}
