# Neural Network Game

A real-time multiplayer game that simulates how neural networks process information. Players are randomly distributed across three layers (Input, Hidden, Output) and collaboratively transform an image into descriptive sentences — just like a real neural network.

## How It Works

1. **Host** creates a room and shares the code with players
2. **Players** join using the room code
3. Host clicks **Start** — players are randomly assigned to layers:
   - **Input Layer (56%)** — See an image, describe it in one word (30s)
   - **Hidden Layer (40%)** — Receive top 25 words, form a two-word phrase (30s)
   - **Output Layer (4%)** — Receive top 10 phrases, write a sentence (30s)
4. Top 5 sentences are displayed alongside the original image

## Tech Stack

- **Next.js** (App Router + TypeScript)
- **Socket.IO** for real-time communication
- **Framer Motion** for animations
- **Tailwind CSS** for styling
- Custom Node.js server for WebSocket support

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
cd neural-network-game
npm install
```

### Development

```bash
npm run dev
```

The app runs at http://localhost:3000

### Production

```bash
npm run build
npm start
```

## Adding Your Own Images

Place your images in `/public/images/` and update the list in:
- `src/lib/game-config.ts`
- `server.ts` (the `GAME_IMAGES` array)

Supported formats: JPG, PNG, SVG, WebP

## Architecture

```
neural-network-game/
├── server.ts              # Custom server with Socket.IO game logic
├── src/
│   ├── app/
│   │   ├── page.tsx       # Home/landing page
│   │   ├── host/page.tsx  # Host dashboard
│   │   └── play/page.tsx  # Player game screen
│   ├── components/
│   │   ├── Timer.tsx          # Countdown timer
│   │   ├── LayerAnimation.tsx # Role assignment animation
│   │   ├── PlayerList.tsx     # Player table
│   │   ├── InputPhase.tsx     # Input layer UI
│   │   ├── HiddenPhase.tsx    # Hidden layer UI
│   │   ├── OutputPhase.tsx    # Output layer UI
│   │   ├── WaitingScreen.tsx  # Spectator/waiting view
│   │   └── ResultsScreen.tsx  # Final results display
│   └── lib/
│       ├── types.ts       # TypeScript types & Socket events
│       ├── socket.ts      # Client socket singleton
│       └── game-config.ts # Image configuration
└── public/images/         # Game images
```

## Scalability Notes

For 25,000+ concurrent users:

- The current setup uses in-memory state (single server). For production scale:
  - Use **Redis** as Socket.IO adapter for horizontal scaling
  - Deploy multiple server instances behind a load balancer with sticky sessions
  - Use Redis pub/sub for room state synchronization
- Socket.IO is configured with WebSocket-first transport for optimal performance
- Ping intervals and timeouts are tuned for large player counts

## Game Configuration

Edit `src/lib/types.ts` (`DEFAULT_CONFIG`) to adjust:

| Setting | Default | Description |
|---------|---------|-------------|
| inputRatio | 0.56 | % of players in input layer |
| hiddenRatio | 0.40 | % of players in hidden layer |
| outputRatio | 0.04 | % of players in output layer |
| inputTime | 30s | Time for input layer to submit |
| hiddenTime | 30s | Time for hidden layer to submit |
| outputTime | 30s | Time for output layer to submit |
| topWordsCount | 25 | Words passed to hidden layer |
| topPhrasesCount | 10 | Phrases passed to output layer |
| topSentencesCount | 5 | Final sentences shown in results |
