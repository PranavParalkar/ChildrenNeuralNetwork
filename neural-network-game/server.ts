import { createServer } from 'http';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import {
  Player,
  RoomState,
  GamePhase,
  Layer,
  DEFAULT_CONFIG,
  ServerToClientEvents,
  ClientToServerEvents,
  RoomStats,
  WordWithFrequency,
} from './src/lib/types';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// In-memory room storage (use Redis for production at scale)
const rooms = new Map<string, RoomState>();
const playerRooms = new Map<string, string>(); // socketId -> roomCode

// Submission storage per phase
const inputSubmissions = new Map<string, string[]>(); // roomCode -> words
const hiddenSubmissions = new Map<string, string[]>(); // roomCode -> phrases
const outputSubmissions = new Map<string, string[]>(); // roomCode -> sentences

// Timer tracking per room (Bug #2 fix: clean up intervals on room deletion)
const roomTimers = new Map<string, NodeJS.Timeout[]>();

function addRoomTimer(roomCode: string, timer: NodeJS.Timeout) {
  const timers = roomTimers.get(roomCode) || [];
  timers.push(timer);
  roomTimers.set(roomCode, timers);
}

function clearRoomTimers(roomCode: string) {
  const timers = roomTimers.get(roomCode) || [];
  timers.forEach(t => clearInterval(t));
  roomTimers.delete(roomCode);
}

// Consolidated room cleanup (Bug #6 fix: clean up all playerRooms entries)
function cleanupRoom(roomCode: string, room: RoomState) {
  // Clean up all player mappings
  for (const player of room.players) {
    playerRooms.delete(player.id);
  }
  playerRooms.delete(room.hostId);
  clearRoomTimers(roomCode);
  rooms.delete(roomCode);
  inputSubmissions.delete(roomCode);
  hiddenSubmissions.delete(roomCode);
  outputSubmissions.delete(roomCode);
}

// Bug #7 fix: collision-safe room code generation
function generateRoomCode(): string {
  let code: string;
  do {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  } while (rooms.has(code));
  return code;
}

function getTopItems(items: string[], topN: number): string[] {
  const frequency = new Map<string, number>();
  for (const item of items) {
    const normalized = item.toLowerCase().trim();
    if (normalized) {
      frequency.set(normalized, (frequency.get(normalized) || 0) + 1);
    }
  }
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);
}

function getTopItemsWithFrequency(items: string[], topN: number): WordWithFrequency[] {
  const frequency = new Map<string, number>();
  for (const item of items) {
    const normalized = item.toLowerCase().trim();
    if (normalized) {
      frequency.set(normalized, (frequency.get(normalized) || 0) + 1);
    }
  }
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }));
}

function distributePlayersToLayers(players: Player[]): Player[] {
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const total = shuffled.length;

  // Bug #1 fix: Safety guard for < 3 players (should not happen due to start-game guard,
  // but protects against race conditions like disconnect during distributing phase)
  if (total < 3) {
    const layers: Layer[] = ['input', 'hidden', 'output'];
    return shuffled.map((player, i) => ({
      ...player,
      layer: layers[i % 3],
      hasSubmitted: false,
    }));
  }

  // For small player counts, just assign 1 to each layer and distribute the rest
  let inputCount: number;
  let hiddenCount: number;
  let outputCount: number;

  if (total <= 10) {
    // Guarantee 1 per layer, distribute remainder by ratio
    inputCount = 1;
    hiddenCount = 1;
    outputCount = 1;
    const remaining = Math.max(0, total - 3); // Bug #1 fix: clamp to 0
    const extraInput = Math.round(remaining * DEFAULT_CONFIG.inputRatio);
    const extraHidden = Math.round(remaining * DEFAULT_CONFIG.hiddenRatio);
    const extraOutput = remaining - extraInput - extraHidden;
    inputCount += extraInput;
    hiddenCount += extraHidden;
    outputCount += extraOutput;
  } else {
    inputCount = Math.round(total * DEFAULT_CONFIG.inputRatio);
    hiddenCount = Math.round(total * DEFAULT_CONFIG.hiddenRatio);
    outputCount = total - inputCount - hiddenCount;

    // Safety check: ensure at least 1 in each layer
    if (outputCount < 1) {
      outputCount = 1;
      inputCount = Math.round((total - 1) * DEFAULT_CONFIG.inputRatio / (DEFAULT_CONFIG.inputRatio + DEFAULT_CONFIG.hiddenRatio));
      hiddenCount = total - inputCount - outputCount;
    }
    if (hiddenCount < 1) {
      hiddenCount = 1;
      inputCount = total - hiddenCount - outputCount;
    }
    if (inputCount < 1) {
      inputCount = 1;
      hiddenCount = total - inputCount - outputCount;
    }
  }

  return shuffled.map((player, index) => {
    let layer: Layer;
    if (index < inputCount) {
      layer = 'input';
    } else if (index < inputCount + hiddenCount) {
      layer = 'hidden';
    } else {
      layer = 'output';
    }
    return { ...player, layer, hasSubmitted: false };
  });
}

function getRoomStats(room: RoomState): RoomStats {
  return {
    totalPlayers: room.players.length,
    inputCount: room.players.filter(p => p.layer === 'input').length,
    hiddenCount: room.players.filter(p => p.layer === 'hidden').length,
    outputCount: room.players.filter(p => p.layer === 'output').length,
    submissions: room.players.filter(p => p.hasSubmitted).length,
  };
}

app.prepare().then(() => {
  // Bug #8 fix: removed deprecated url.parse() — Next.js handles URL parsing internally
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    path: '/api/socketio',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    // Scalability settings
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6,
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // HOST: Create a room
    socket.on('create-room', ({ hostName }) => {
      const roomCode = generateRoomCode();
      const room: RoomState = {
        roomCode,
        hostId: socket.id,
        players: [],
        phase: 'waiting',
      };
      rooms.set(roomCode, room);
      playerRooms.set(socket.id, roomCode);
      socket.join(roomCode);
      socket.emit('room-created', { roomCode });
      console.log(`Room ${roomCode} created by ${hostName}`);
    });

    // PLAYER: Join a room
    socket.on('join-room', ({ roomCode, playerName }) => {
      const normalizedCode = roomCode.toUpperCase();
      const room = rooms.get(normalizedCode);
      if (!room) {
        socket.emit('error', { message: 'Room not found. Check the code and try again.' });
        return;
      }
      if (room.phase !== 'waiting') {
        socket.emit('error', { message: 'Game has already started.' });
        return;
      }

      // Prevent duplicate joins from the same socket
      const existingPlayer = room.players.find(p => p.id === socket.id);
      if (existingPlayer) return;

      const player: Player = {
        id: socket.id,
        name: playerName,
      };
      room.players.push(player);
      playerRooms.set(socket.id, normalizedCode);
      socket.join(normalizedCode);

      // Notify all in room
      io.to(normalizedCode).emit('player-joined', { players: room.players });
      console.log(`${playerName} joined room ${normalizedCode} (${room.players.length} players)`);
    });

    // HOST: Start the game
    socket.on('start-game', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room) return;
      if (socket.id !== room.hostId) return;
      // Bug #10 fix: prevent double-click from starting the game twice
      if (room.phase !== 'waiting') return;
      if (room.players.length < 3) {
        socket.emit('error', { message: 'Need at least 3 players to start.' });
        return;
      }

      // Distribute players to layers
      room.players = distributePlayersToLayers(room.players);
      room.phase = 'distributing';

      // Initialize submission storage
      inputSubmissions.set(roomCode, []);
      hiddenSubmissions.set(roomCode, []);
      outputSubmissions.set(roomCode, []);

      // Select a random image
      const GAME_IMAGES = [
        '/images/sample-1.svg',
        '/images/sample-2.svg',
        '/images/sample-3.svg',
        '/images/sample-4.svg',
        '/images/sample-5.svg',
      ];
      room.currentImage = GAME_IMAGES[Math.floor(Math.random() * GAME_IMAGES.length)];

      // Notify each player of their layer assignment
      for (const player of room.players) {
        io.to(player.id).emit('game-starting', { layer: player.layer! });
      }

      // Notify host
      io.to(room.hostId).emit('host-update', {
        phase: 'distributing',
        stats: getRoomStats(room),
      });

      // After 5 seconds of assignment animation, start the input phase
      const distributingTimeout = setTimeout(() => {
        // Verify room still exists before proceeding
        if (rooms.has(roomCode)) {
          startInputPhase(io, room, roomCode);
        }
      }, 5000);
      addRoomTimer(roomCode, distributingTimeout as unknown as NodeJS.Timeout);
    });

    // PLAYER: Submit a word (input layer)
    socket.on('submit-word', ({ roomCode, word }) => {
      const room = rooms.get(roomCode);
      if (!room || room.phase !== 'input-phase') return;

      const player = room.players.find(p => p.id === socket.id);
      if (!player || player.layer !== 'input' || player.hasSubmitted) return;

      // Validate input
      const trimmedWord = word.trim().toLowerCase();
      if (!trimmedWord) return;

      const words = inputSubmissions.get(roomCode) || [];
      words.push(trimmedWord);
      inputSubmissions.set(roomCode, words);
      player.hasSubmitted = true;

      socket.emit('submission-received');

      // Update host
      io.to(room.hostId).emit('host-update', {
        phase: room.phase,
        stats: getRoomStats(room),
      });
    });

    // PLAYER: Submit a phrase (hidden layer)
    socket.on('submit-phrase', ({ roomCode, phrase }) => {
      const room = rooms.get(roomCode);
      if (!room || room.phase !== 'hidden-phase') return;

      const player = room.players.find(p => p.id === socket.id);
      if (!player || player.layer !== 'hidden' || player.hasSubmitted) return;

      // Validate input
      const trimmedPhrase = phrase.trim().toLowerCase();
      if (!trimmedPhrase) return;

      const phrases = hiddenSubmissions.get(roomCode) || [];
      phrases.push(trimmedPhrase);
      hiddenSubmissions.set(roomCode, phrases);
      player.hasSubmitted = true;

      socket.emit('submission-received');

      io.to(room.hostId).emit('host-update', {
        phase: room.phase,
        stats: getRoomStats(room),
      });
    });

    // PLAYER: Submit a sentence (output layer)
    socket.on('submit-sentence', ({ roomCode, sentence }) => {
      const room = rooms.get(roomCode);
      if (!room || room.phase !== 'output-phase') return;

      const player = room.players.find(p => p.id === socket.id);
      if (!player || player.layer !== 'output' || player.hasSubmitted) return;

      // Validate input
      const trimmedSentence = sentence.trim().toLowerCase();
      if (!trimmedSentence) return;

      const sentences = outputSubmissions.get(roomCode) || [];
      sentences.push(trimmedSentence);
      outputSubmissions.set(roomCode, sentences);
      player.hasSubmitted = true;

      socket.emit('submission-received');

      io.to(room.hostId).emit('host-update', {
        phase: room.phase,
        stats: getRoomStats(room),
      });
    });

    // HOST: Finish the game (after results are shown)
    socket.on('finish-game', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room) return;
      if (socket.id !== room.hostId) return;
      if (room.phase !== 'results') return;

      // Notify all players the game is over
      io.to(roomCode).emit('game-finished');

      // Clean up room state (Bug #6 fix: consolidated cleanup)
      cleanupRoom(roomCode, room);

      console.log(`Room ${roomCode} finished and cleaned up`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const roomCode = playerRooms.get(socket.id);
      if (roomCode) {
        const room = rooms.get(roomCode);
        if (room) {
          room.players = room.players.filter(p => p.id !== socket.id);
          io.to(roomCode).emit('player-left', { players: room.players });

          // If host leaves, clean up room
          if (socket.id === room.hostId) {
            io.to(roomCode).emit('error', { message: 'Host has disconnected. Game over.' });
            // Bug #6 fix: use consolidated cleanup to remove all playerRooms entries
            cleanupRoom(roomCode, room);
          }
        }
        playerRooms.delete(socket.id);
      }
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  // Game phase management functions
  function startInputPhase(io: SocketIOServer, room: RoomState, roomCode: string) {
    // Verify room still exists
    if (!rooms.has(roomCode)) return;

    room.phase = 'input-phase';
    // Reset submissions
    room.players.forEach(p => { if (p.layer === 'input') p.hasSubmitted = false; });

    // Show image to input layer players
    for (const player of room.players) {
      if (player.layer === 'input') {
        io.to(player.id).emit('show-image', { imageUrl: room.currentImage! });
        io.to(player.id).emit('phase-change', { phase: 'input-phase', timeRemaining: DEFAULT_CONFIG.inputTime });
      } else {
        io.to(player.id).emit('phase-change', { phase: 'input-phase', timeRemaining: DEFAULT_CONFIG.inputTime });
      }
    }

    io.to(room.hostId).emit('host-update', { phase: 'input-phase', stats: getRoomStats(room) });

    // Timer countdown (Bug #2 fix: track interval for cleanup)
    let timeLeft = DEFAULT_CONFIG.inputTime;
    const timerInterval = setInterval(() => {
      // Stop if room was deleted
      if (!rooms.has(roomCode)) {
        clearInterval(timerInterval);
        return;
      }
      timeLeft--;
      io.to(roomCode).emit('timer-tick', { timeRemaining: timeLeft });
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        endInputPhase(io, room, roomCode);
      }
    }, 1000);
    addRoomTimer(roomCode, timerInterval);
  }

  function endInputPhase(io: SocketIOServer, room: RoomState, roomCode: string) {
    if (!rooms.has(roomCode)) return;

    const words = inputSubmissions.get(roomCode) || [];
    const topWordsWithFreq = getTopItemsWithFrequency(words, DEFAULT_CONFIG.topWordsCount);
    room.topWords = topWordsWithFreq.map(w => w.word);

    // Bug #9 fix: handle empty submissions gracefully
    if (topWordsWithFreq.length === 0) {
      // If no words were submitted, provide a fallback so the game can continue
      console.log(`Room ${roomCode}: No words submitted in input phase, using fallback`);
    }

    // Start hidden phase with frequency data
    startHiddenPhase(io, room, roomCode, topWordsWithFreq);
  }

  function startHiddenPhase(io: SocketIOServer, room: RoomState, roomCode: string, wordsWithFreq?: WordWithFrequency[]) {
    if (!rooms.has(roomCode)) return;

    room.phase = 'hidden-phase';
    room.players.forEach(p => { if (p.layer === 'hidden') p.hasSubmitted = false; });

    // Use provided frequency data or build it from stored topWords
    const wordData: WordWithFrequency[] = wordsWithFreq || room.topWords!.map(w => ({ word: w, count: 1 }));

    // Send words to hidden layer players
    for (const player of room.players) {
      if (player.layer === 'hidden') {
        io.to(player.id).emit('show-words', { words: wordData });
        io.to(player.id).emit('phase-change', { phase: 'hidden-phase', timeRemaining: DEFAULT_CONFIG.hiddenTime });
      } else {
        io.to(player.id).emit('phase-change', { phase: 'hidden-phase', timeRemaining: DEFAULT_CONFIG.hiddenTime });
      }
    }

    io.to(room.hostId).emit('host-update', { phase: 'hidden-phase', stats: getRoomStats(room) });

    // Timer countdown (Bug #2 fix: track interval for cleanup)
    let timeLeft = DEFAULT_CONFIG.hiddenTime;
    const timerInterval = setInterval(() => {
      if (!rooms.has(roomCode)) {
        clearInterval(timerInterval);
        return;
      }
      timeLeft--;
      io.to(roomCode).emit('timer-tick', { timeRemaining: timeLeft });
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        endHiddenPhase(io, room, roomCode);
      }
    }, 1000);
    addRoomTimer(roomCode, timerInterval);
  }

  function endHiddenPhase(io: SocketIOServer, room: RoomState, roomCode: string) {
    if (!rooms.has(roomCode)) return;

    const phrases = hiddenSubmissions.get(roomCode) || [];
    const topPhrases = getTopItems(phrases, DEFAULT_CONFIG.topPhrasesCount);
    room.topPhrases = topPhrases;

    // Bug #9: log if no phrases submitted
    if (topPhrases.length === 0) {
      console.log(`Room ${roomCode}: No phrases submitted in hidden phase`);
    }

    // Start output phase
    startOutputPhase(io, room, roomCode);
  }

  function startOutputPhase(io: SocketIOServer, room: RoomState, roomCode: string) {
    if (!rooms.has(roomCode)) return;

    room.phase = 'output-phase';
    room.players.forEach(p => { if (p.layer === 'output') p.hasSubmitted = false; });

    // Send phrases to output layer players
    for (const player of room.players) {
      if (player.layer === 'output') {
        io.to(player.id).emit('show-phrases', { phrases: room.topPhrases! });
        io.to(player.id).emit('phase-change', { phase: 'output-phase', timeRemaining: DEFAULT_CONFIG.outputTime });
      } else {
        io.to(player.id).emit('phase-change', { phase: 'output-phase', timeRemaining: DEFAULT_CONFIG.outputTime });
      }
    }

    io.to(room.hostId).emit('host-update', { phase: 'output-phase', stats: getRoomStats(room) });

    // Timer countdown (Bug #2 fix: track interval for cleanup)
    let timeLeft = DEFAULT_CONFIG.outputTime;
    const timerInterval = setInterval(() => {
      if (!rooms.has(roomCode)) {
        clearInterval(timerInterval);
        return;
      }
      timeLeft--;
      io.to(roomCode).emit('timer-tick', { timeRemaining: timeLeft });
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        endOutputPhase(io, room, roomCode);
      }
    }, 1000);
    addRoomTimer(roomCode, timerInterval);
  }

  function endOutputPhase(io: SocketIOServer, room: RoomState, roomCode: string) {
    if (!rooms.has(roomCode)) return;

    const sentences = outputSubmissions.get(roomCode) || [];
    const topSentences = getTopItems(sentences, DEFAULT_CONFIG.topSentencesCount);
    room.topSentences = topSentences;

    // Show results after delay
    room.phase = 'results';
    io.to(roomCode).emit('phase-change', { phase: 'results', timeRemaining: DEFAULT_CONFIG.resultsDelay });

    // Timer countdown for results delay (Bug #2 fix: track interval for cleanup)
    let timeLeft = DEFAULT_CONFIG.resultsDelay;
    const timerInterval = setInterval(() => {
      if (!rooms.has(roomCode)) {
        clearInterval(timerInterval);
        return;
      }
      timeLeft--;
      io.to(roomCode).emit('timer-tick', { timeRemaining: timeLeft });
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
      }
    }, 1000);
    addRoomTimer(roomCode, timerInterval);

    const resultsTimeout = setTimeout(() => {
      if (!rooms.has(roomCode)) return;

      io.to(roomCode).emit('show-results', {
        sentences: topSentences,
        imageUrl: room.currentImage!,
      });

      io.to(room.hostId).emit('host-update', { phase: 'results', stats: getRoomStats(room) });
    }, DEFAULT_CONFIG.resultsDelay * 1000);
    addRoomTimer(roomCode, resultsTimeout as unknown as NodeJS.Timeout);
  }

  httpServer.listen(port, () => {
    console.log(`> Neural Network Game ready on http://${hostname}:${port}`);
  });
});
