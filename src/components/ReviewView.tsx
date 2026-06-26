import { useEffect, useRef, useState } from "react";
import { RotateCcw, Check, X } from "lucide-react";
import { LevelBadge } from "./LevelBadge";

interface Props {
	phrase: string;
	levelNumber: number;
	playReversed: () => Promise<void>;
	onPass: () => void;
	onFail: () => void;
}

export function ReviewView({
	phrase,
	levelNumber,
	playReversed,
	onPass,
	onFail,
}: Props) {
	const [playing, setPlaying] = useState(false);
	const playedOnce = useRef(false);

	const replay = async () => {
		setPlaying(true);
		try {
			await playReversed();
		} finally {
			setPlaying(false);
		}
	};

	// Auto-play the reversed recording once when this view appears.
	useEffect(() => {
		if (playedOnce.current) return;
		playedOnce.current = true;
		void replay();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="view">
			<LevelBadge level={levelNumber} />

			<div className="spacer" />

			<p className="section-label">Played back, reversed</p>
			<div className="phrase-card">
				<span className="phrase-text">“{phrase}”</span>
			</div>

			<button
				type="button"
				className="btn btn-text"
				onClick={replay}
				disabled={playing}
				style={{ alignSelf: "center", marginTop: 18 }}
			>
				<RotateCcw size={16} />
				{playing ? "Playing…" : "Hear it again"}
			</button>

			<div className="spacer" />

			<p className="result-sub" style={{ marginBottom: 18 }}>
				Did your reversed voice say <em>“{phrase}”</em>?
			</p>

			<button
				type="button"
				className="btn btn-pill lime"
				onClick={onPass}
			>
				<Check size={22} strokeWidth={3} />
				Nailed it!
			</button>
			<div style={{ height: 12 }} />
			<button
				type="button"
				className="btn btn-pill pink"
				onClick={onFail}
			>
				<X size={22} strokeWidth={3} />
				Not quite
			</button>
		</div>
	);
}
