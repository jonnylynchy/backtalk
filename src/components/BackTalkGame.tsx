import { useState, useRef, useEffect } from 'react';
import { Play, Mic, Volume2 } from 'lucide-react';

interface AudioChunkTable {
    [key: string]: AudioBuffer;
}

const BackTalkGame = () => {
  const [gameState, setGameState] = useState({
    currentPhrase: 'Hello! How are you?',
    isRecording: false,
    hasRecording: false,
    score: 0,
    feedback: '',
  });
  
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream>(new MediaStream());
  const audioChunks = useRef<BlobPart[]>([]);
  const audioChunkList: AudioChunkTable = {};

  useEffect(() => {
    const getMediaStream = async () => {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    }
    getMediaStream();
  });

  const startRecording = async () => {
    try {
      // Check for supported mime types
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : ''; // Let the browser choose the default format

      mediaRecorder.current = new MediaRecorder(stream.current, {
        ...(mimeType && { mimeType }) // Only include mimeType if we found a supported one
      });

      mediaRecorder.current.ondataavailable = (event: BlobEvent) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        // Use the same mime type for the Blob
        const audioBlob = new Blob(audioChunks.current, {
          type: mimeType || 'audio/mp4' // Fallback to mp4 if no mime type was specified
        });

        console.log('AUDIO BLOB', audioBlob);
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('AUDIO URL FROM RECORDING', audioUrl);
        setAudioUrl(audioUrl);
        setGameState(prev => ({ ...prev, hasRecording: true }));
        audioChunks.current = [];
        stream.current.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setGameState(prev => ({ ...prev, isRecording: true }));
    } catch (err) {
      console.error('Recording error:', err);
      setGameState(prev => ({ 
        ...prev, 
        feedback: 'Please enable microphone access to play'
      }));
    }
  };

  const stopRecording = async () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setGameState(prev => ({ ...prev, isRecording: false }));
    }
  };
  
  const playRecording = (audioUserUrl: string | null) => {
    if (audioUserUrl) {
      const audio = new Audio(audioUserUrl);
      audio.volume = 1;
      audio.play();
      setGameState(prev => ({
        ...prev,
        feedback: 'Playing Audio...'
      }));
      audio.onended = () => {
        setGameState(prev => ({
          ...prev,
          feedback: 'Audio Complete'
        }));
      }
    }
  };

  const playInReverseRecording = async (audioUrl: string | null) => {
    try {
      if (!audioUrl) {
        return;
      }
      // Create audio context
      const audioContext = new AudioContext();
      let savedAudioBuffer: AudioBuffer;
      console.log('AUDIO CHUNK LIST', audioChunkList);

      if (audioChunkList[audioUrl]) {
        savedAudioBuffer = audioChunkList[audioUrl];
        console.log('ARRAY BUFFER EXISTS', savedAudioBuffer);
      } else {
        // Fetch the audio file
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();

        // Decode the audio data
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Reverse the audio data for each channel
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
          const channelData = audioBuffer.getChannelData(channel);
          channelData.reverse();
        }

        audioChunkList[audioUrl] = audioBuffer;
        savedAudioBuffer = audioBuffer;
      }
      
      // Create and configure audio source
      const source = audioContext.createBufferSource();
      source.buffer = savedAudioBuffer;
      source.connect(audioContext.destination);
      
      // Play the reversed audio
      source.start();
      source.onended = () => {
        setGameState(prev => ({
          ...prev,
          feedback: 'Audio Complete'
        }));
      }
      
      setGameState(prev => ({
        ...prev,
        feedback: 'Playing audio in reverse'
      }));
    } catch (error) {
      console.error('Error playing reversed audio:', error);
      setGameState(prev => ({
        ...prev,
        feedback: 'Error playing reversed audio'
      }));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">BackTalk</h1>
        
        <div className="text-center mb-8">
          <p className="text-lg font-medium mb-2">Current Phrase:</p>
          <p className="text-xl font-bold text-blue-600">{gameState.currentPhrase}</p>
        </div>

        <div className="d-flex flex-column">
          <button
            onClick={() => playRecording('/audio/hello-how-are-you.wav')}
            className="mb-3 w-100 btn btn-primary flex-fill"
          >
            <Volume2 size={24} />
            <span>Play Phrase</span>
          </button>

          <button
            onClick={() => playInReverseRecording('/audio/hello-how-are-you.wav')}
            className="mb-3 w-100 btn btn-primary flex-fill"
          >
            <Volume2 size={24} />
            <span>Hear Reversed Phrase</span>
          </button>

          <button
            onClick={gameState.isRecording ? stopRecording : startRecording}
            className={`mb-3 w-100 btn btn-primary flex-fill ${
              gameState.isRecording 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            <Mic size={24} />
            <span>{gameState.isRecording ? 'Stop Recording' : 'Start Recording'}</span>
          </button>

          {gameState.hasRecording && (
            <button
              onClick={() => playRecording(audioUrl)}
              className="mb-3 w-100 btn btn-primary flex-fill"
            >
              <Play size={24} />
              <span>Play Your Recording</span>
            </button>
          )}

          {gameState.hasRecording && (
            <button
              onClick={() => playInReverseRecording(audioUrl)}
              className="mb-3 w-100 btn btn-primary flex-fill"
            >
              <Play size={24} />
              <span>Play Your Recording In Reverse</span>
            </button>
          )}
        </div>

        {gameState.feedback && (
          <p className="mt-4 text-center text-gray-600">{gameState.feedback}</p>
        )}

        <div className="mt-6 text-center">
          <p className="text-lg font-medium">Score: {gameState.score}</p>
        </div>
      </div>
    </div>
  );
};

export default BackTalkGame;