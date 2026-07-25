# Neural Network Game

A real-time, responsive multiplayer game that simulates how neural networks process information. In this interactive experience, players act as nodes in a neural network. They are randomly distributed across three distinct layers (Input, Hidden, and Output) and must collaboratively transform an image into descriptive sentences — mimicking the layered processing of a real neural network.

**Key Features:**
- **Host-Controlled Progression:** A dedicated host dashboard allows the game host to control phase timers, monitor per-layer submissions in real-time, and manage the flow of the game.
- **Layer-Specific Tasks:** 
  - **Input Layer (56% of players):** Describe a source image in a single word.
  - **Hidden Layer (40% of players):** Synthesize the most common words into two-word phrases without seeing the image.
  - **Output Layer (4% of players):** Construct full sentences from the generated phrases.
- **Fully Responsive:** Playable on any device, from mobile phones to desktop computers.

## How to Run the Project

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (Version 18 or higher)
- npm (comes with Node.js)

### Installation

1. Navigate to the project directory:
   ```bash
   cd neural-network-game
   ```

2. Install the necessary dependencies:
   ```bash
   npm install
   ```

### Running the Game Locally

1. Start the development server (which also spins up the custom Socket.IO server):
   ```bash
   npm run dev
   ```

2. Open your web browser and go to:
   **[http://localhost:3000](http://localhost:3000)**

3. **To test multiplayer:** Open multiple browser tabs/windows. Use one tab to create a room as the **Host**, and use the other tabs to join as **Players** using the generated room code.

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
