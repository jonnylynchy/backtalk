import { Headphones } from "lucide-react";
import { Logo } from "./Logo";

export function StartView({ onStart }: { onStart: () => void }) {
	return (
		<div className="view center-col" style={{ justifyContent: "center" }}>
			<div className="spacer" />
			<Logo />
			<p className="tagline" style={{ marginTop: 34 }}>
				Say it backwards.
				<br />
				Sound it forwards.
			</p>
			<div className="spacer" />
			<button
				type="button"
				className="btn btn-pill lime"
				onClick={onStart}
			>
				Start
			</button>
			<p className="headphones-hint">
				<Headphones />
				best with headphones
			</p>
		</div>
	);
}
