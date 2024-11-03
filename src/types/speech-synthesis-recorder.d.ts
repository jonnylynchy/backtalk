declare module 'speech-synthesis-recorder' {
  interface UtteranceOptions {
    voice?: string;
    lang?: string;
    pitch?: number;
    rate?: number;
    volume?: number;
  }

  interface SpeechSynthesisRecorderOptions {
    text: string;
    utteranceOptions?: UtteranceOptions;
  }

  export default class SpeechSynthesisRecorder {
    constructor(options: SpeechSynthesisRecorderOptions);
    start(): Promise<any>;
  }
} 