import { Star } from "lucide-react";

export function LevelBadge({ level }: { level: number }) {
	return (
		<div className="level-badge">
			<Star fill="currentColor" />
			Level {level}
		</div>
	);
}
