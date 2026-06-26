import { Play } from "lucide-react";

interface Props {
	variant: "fwd" | "bwd";
	label: string;
	playing: boolean;
	onClick: () => void;
}

export function ListenButton({ variant, label, playing, onClick }: Props) {
	return (
		<button
			type="button"
			className={`listen-btn ${variant} ${playing ? "playing" : ""}`}
			onClick={onClick}
			aria-label={`Play phrase ${
				variant === "fwd" ? "forwards" : "backwards"
			}`}
		>
			<span className="disc">
				<Play
					size={26}
					fill="currentColor"
					style={
						variant === "bwd"
							? { transform: "scaleX(-1)" }
							: undefined
					}
				/>
			</span>
			{label}
		</button>
	);
}
