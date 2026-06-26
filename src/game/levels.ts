export interface Level {
	/** Display text of the phrase. */
	phrase: string;
	/** Path to the pre-generated audio clip (played forward / reversed). */
	audio: string;
	/** Points awarded for clearing the level. */
	points: number;
}

/** Phrases get longer / tongue-twistier as you climb. */
export const LEVELS: Level[] = [
	{ phrase: "Hello there", audio: "/audio/hello-there.wav", points: 50 },
	{ phrase: "Good morning", audio: "/audio/good-morning.wav", points: 100 },
	{
		phrase: "A slice of cake",
		audio: "/audio/a-slice-of-cake.wav",
		points: 150,
	},
	{
		phrase: "Better late than never",
		audio: "/audio/better-late-than-never.wav",
		points: 250,
	},
	{
		phrase: "She sells seashells",
		audio: "/audio/she-sells-seashells.wav",
		points: 400,
	},
];
