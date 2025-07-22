import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceInputProps {
  onClose: () => void;
  onTranscript: (transcript: string) => void;
}

export function VoiceInput({ onClose, onTranscript }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string>('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if browser supports Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptSegment + ' ';
          } else {
            interimTranscript += transcriptSegment;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        let errorMessage = '';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking closer to your microphone.';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone found. Please check your microphone connection.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
            break;
          case 'network':
            errorMessage = 'Network error occurred. Please check your internet connection.';
            break;
          default:
            errorMessage = 'Speech recognition error occurred. Please try again.';
        }
        setError(errorMessage);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognition) {
      setTranscript('');
      setError('');
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleSubmit = () => {
    if (transcript.trim()) {
      onTranscript(transcript.trim());
    } else {
      onClose();
    }
  };

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Voice Input</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {!isSupported ? (
            <div className="text-center py-8">
              <Volume2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Voice input not supported</h3>
              <p className="text-gray-500 text-sm">
                Your browser doesn't support speech recognition. Please use a modern browser like Chrome or Edge.
              </p>
            </div>
          ) : (
            <>
              {/* Voice Recording Interface */}
              <div className="text-center py-8">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`relative mx-auto mb-4 h-20 w-20 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isListening 
                      ? 'bg-red-500 text-white scale-110 animate-pulse' 
                      : 'bg-emerald-500 text-white hover:bg-emerald-600'
                  }`}
                >
                  {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                  
                  {isListening && (
                    <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
                  )}
                </button>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isListening ? 'Listening...' : 'Ready to listen'}
                </h3>
                
                <p className="text-gray-500 text-sm mb-4">
                  {isListening 
                    ? 'Say items separated by commas (e.g., "milk, bread, eggs")'
                    : 'Click the microphone to start recording'
                  }
                </p>
              </div>

              {/* Transcript Display */}
              {transcript && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recognized Text:
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 min-h-[60px]">
                    <p className="text-gray-900">{transcript}</p>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mb-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                {transcript && (
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Add Items
                  </button>
                )}
                
                {!isListening && !transcript && (
                  <button
                    onClick={startListening}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Mic className="h-4 w-4" />
                    <span>Start Recording</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}