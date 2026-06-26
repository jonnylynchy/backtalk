import { useEffect, useState } from "react";
import { LEVELS } from "./game/levels";
import { stopPlayback } from "./game/audio";
import { useRecorder } from "./hooks/useRecorder";
import { StartView } from "./components/StartView";
import { GameView } from "./components/GameView";
import { ReviewView } from "./components/ReviewView";
import { ResultView } from "./components/ResultView";
import { WinView } from "./components/WinView";

type Screen = "start" | "play" | "review" | "success" | "fail" | "win";

// Dev-only deep-link, e.g. ?screen=success&level=3, for previewing screens
// without driving the whole flow. Stripped from production behaviour.
function devOverride<T>(key: string, parse: (v: string) => T): T | undefined {
	if (!import.meta.env.DEV) return undefined;
	const v = new URLSearchParams(window.location.search).get(key);
	return v == null ? undefined : parse(v);
}

function App() {
	const [screen, setScreen] = useState<Screen>(
		devOverride("screen", (v) => v as Screen) ?? "start"
	);
	const [levelIndex, setLevelIndex] = useState(
		devOverride("level", (v) => Math.max(0, Number(v) - 1)) ?? 0
	);
	const [score, setScore] = useState(devOverride("score", Number) ?? 0);

	const recorder = useRecorder();
	const level = LEVELS[levelIndex];
	const isLastLevel = levelIndex === LEVELS.length - 1;

	// When a recording finishes, move to the self-judge review screen.
	useEffect(() => {
		if (screen === "play" && recorder.status === "recorded") {
			setScreen("review");
		}
	}, [screen, recorder.status]);

	const startGame = () => {
		stopPlayback();
		recorder.reset();
		setScore(0);
		setLevelIndex(0);
		setScreen("play");
	};

	const goToLevel = (index: number) => {
		stopPlayback();
		recorder.reset();
		setLevelIndex(index);
		setScreen("play");
	};

	const handlePass = () => {
		stopPlayback();
		setScore((s) => s + level.points);
		setScreen("success");
	};

	const handleFail = () => {
		stopPlayback();
		setScreen("fail");
	};

	const handleNext = () => {
		if (isLastLevel) {
			stopPlayback();
			setScreen("win");
		} else {
			goToLevel(levelIndex + 1);
		}
	};

	const quitToStart = () => {
		stopPlayback();
		recorder.reset();
		setScreen("start");
	};

	return (
		<div className="stage">
			{screen === "start" && <StartView onStart={startGame} />}

			{screen === "play" && (
				<GameView
					level={level}
					levelNumber={levelIndex + 1}
					recorder={recorder}
				/>
			)}

			{screen === "review" && (
				<ReviewView
					phrase={level.phrase}
					levelNumber={levelIndex + 1}
					playReversed={recorder.playReversed}
					onPass={handlePass}
					onFail={handleFail}
				/>
			)}

			{screen === "success" && (
				<ResultView
					kind="success"
					phrase={level.phrase}
					levelNumber={levelIndex + 1}
					points={level.points}
					isLastLevel={isLastLevel}
					onNext={handleNext}
					onHearRecording={() => void recorder.playReversed()}
				/>
			)}

			{screen === "fail" && (
				<ResultView
					kind="fail"
					phrase={level.phrase}
					levelNumber={levelIndex + 1}
					onRetry={() => goToLevel(levelIndex)}
					onQuit={quitToStart}
				/>
			)}

			{screen === "win" && (
				<WinView
					score={score}
					levelsCleared={LEVELS.length}
					onPlayAgain={startGame}
				/>
			)}
		</div>
	);
}

export default App;
