// Game types and interfaces

export type Layer = 'input' | 'hidden' | 'output';

export interface WordWithFrequency {
  word: string;
  count: number;
}

export type GamePhase =
  | 'waiting'        // Players joining
  | 'distributing'   // Assigning layers with animation
  | 'input-phase'    // Input layer describing the image
  | 'hidden-phase'   // Hidden layer forming phrases
  | 'output-phase'   // Output layer forming sentences
  | 'results';       // Showing top 5 sentences vs image

export interface Player {
  id: string;
  name: string;
  layer?: Layer;
  hasSubmitted?: boolean;
}

export interface RoomState {
  roomCode: string;
  hostId: string;
  players: Player[];
  phase: GamePhase;
  currentImage?: string;
  // Phase data
  inputWords?: string[];
  topWords?: string[];        // Top 25 words from input layer
  hiddenPhrases?: string[];
  topPhrases?: string[];      // Top 10 phrases from hidden layer
  outputSentences?: string[];
  topSentences?: string[];    // Top 5 sentences from output layer
}

export interface GameConfig {
  // Layer distribution ratios (must sum to 1)
  inputRatio: number;   // 0.56
  hiddenRatio: number;  // 0.40
  outputRatio: number;  // 0.04
  // Timing (in seconds)
  inputTime: number;          // 30s for input layer
  hiddenHaltTime: number;     // 30s halt before hidden layer starts
  hiddenTime: number;         // 30s for hidden layer to work
  outputHaltTime: number;     // 60s halt before output layer starts
  outputTime: number;         // 30s for output layer to work
  resultsDelay: number;       // 10s before showing results
  // Aggregation
  topWordsCount: number;      // 25
  topPhrasesCount: number;    // 10
  topSentencesCount: number;  // 5
}

export const DEFAULT_CONFIG: GameConfig = {
  inputRatio: 0.56,
  hiddenRatio: 0.40,
  outputRatio: 0.04,
  inputTime: 30,
  hiddenHaltTime: 30,
  hiddenTime: 30,
  outputHaltTime: 60,
  outputTime: 30,
  resultsDelay: 10,
  topWordsCount: 25,
  topPhrasesCount: 10,
  topSentencesCount: 5,
};

// Socket events
export interface ServerToClientEvents {
  'room-created': (data: { roomCode: string }) => void;
  'player-joined': (data: { players: Player[] }) => void;
  'player-left': (data: { players: Player[] }) => void;
  'game-starting': (data: { layer: Layer }) => void;
  'phase-change': (data: { phase: GamePhase; timeRemaining?: number }) => void;
  'show-image': (data: { imageUrl: string }) => void;
  'show-words': (data: { words: WordWithFrequency[] }) => void;
  'show-phrases': (data: { phrases: string[] }) => void;
  'show-results': (data: { sentences: string[]; imageUrl: string }) => void;
  'timer-tick': (data: { timeRemaining: number }) => void;
  'timer-started': (data: { phase: GamePhase; totalTime: number }) => void;
  'submission-received': () => void;
  'game-finished': () => void;
  'error': (data: { message: string }) => void;
  'host-update': (data: { phase: GamePhase; stats: RoomStats; timerStarted: boolean }) => void;
}

export interface ClientToServerEvents {
  'create-room': (data: { hostName: string }) => void;
  'join-room': (data: { roomCode: string; playerName: string }) => void;
  'start-game': (data: { roomCode: string }) => void;
  'start-timer': (data: { roomCode: string }) => void;
  'end-phase': (data: { roomCode: string }) => void;
  'submit-word': (data: { roomCode: string; word: string }) => void;
  'submit-phrase': (data: { roomCode: string; phrase: string }) => void;
  'submit-sentence': (data: { roomCode: string; sentence: string }) => void;
  'finish-game': (data: { roomCode: string }) => void;
}

export interface RoomStats {
  totalPlayers: number;
  inputCount: number;
  hiddenCount: number;
  outputCount: number;
  submissions: number;
  inputSubmissions: number;
  hiddenSubmissions: number;
  outputSubmissions: number;
}
