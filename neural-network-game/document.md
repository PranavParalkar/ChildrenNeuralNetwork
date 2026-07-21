# Neural Network Game - Project Showcase Document

## 1. What Is This Project?
The **Neural Network Game** is a real-time multiplayer educational game designed to simulate how artificial neural networks process information. By assigning human players to act as individual "neurons" within a multi-layered architecture, the application provides an interactive, collaborative experience where users collectively transform a visual input (an image) into a semantic output (a descriptive sentence).

## 2. The Concept
The core inspiration behind this project is to demystify artificial intelligence and deep learning for children and beginners. Instead of using abstract mathematical nodes and weights, people act as the network's components. Just like in a real Neural Network where data passes through sequential layers to extract progressively higher-level features, players parse visual input, condense it into foundational words, combine them into phrases, and finally output complete sentences.

## 3. Domain Logic / Rules
The game is structured as a synchronized, time-bound progression through three distinct layers.
- **Room Creation & Setup**: A Host creates a room (generating a 6-character code) and waits for at least 3 players to join.
- **Layer Assignment**: Upon starting, players are randomly distributed into three architectural layers with specific ratios:
  - **Input Layer (56% of players)**: The sensory layer.
  - **Hidden Layer (40% of players)**: The feature extraction layer.
  - **Output Layer (4% of players)**: The classification/generation layer.
- **Input Phase (30s)**: Input players are shown an image and must describe it using a single word.
- **Hidden Phase (30s)**: Hidden players do not see the image. Instead, they receive the top 25 most frequent words from the Input Layer and must form a descriptive two-word phrase.
- **Output Phase (30s)**: Output players receive the top 10 most frequent phrases from the Hidden Layer and must write a full, coherent sentence.
- **Results**: The top 5 most frequently submitted sentences are displayed to the entire room alongside the original image, revealing the "network's prediction."

## 4. How It Works (The Algorithm/Logic)
The "brain" of this application relies on real-time event synchronization and progressive data reduction (analogous to pooling and activation functions in Machine Learning).

1. **State Management**: The game state is stored in-memory (using Maps for rooms, player mappings, and phase submissions) managed by a central Node.js server.
2. **Frequency Tallying (Max-Pooling)**: As players submit their text, the server normalizes the data (trimming and lowercasing) and tallies the frequencies. 
3. **Data Distillation**: When a phase ends, the `getTopItems` algorithm sorts submissions by frequency and truncates them to a fixed count (e.g., top 25 words). This mimics how an activation function filters out low-weight signals and only passes strong signals to the next layer.
4. **Chronological Progression**: A centralized interval timer controls phase transitions, broadcasting `phase-change` events via WebSockets to keep all clients perfectly synchronized.

## 5. Technical Architecture

### Tech Stack
| Technology | Role | Why It Was Used |
|---|---|---|
| **Next.js (App Router)** | Full-Stack Framework | Provides a robust React foundation with easy routing for Host/Player views. |
| **TypeScript** | Language | Ensures type safety for complex game states and Socket payloads. |
| **Socket.IO** | Real-Time Comms | Facilitates low-latency, bidirectional WebSocket events required for multiplayer sync. |
| **Framer Motion** | Animation Library | Powers smooth UI transitions and the crucial "Layer Assignment" animations. |
| **Tailwind CSS** | Styling | Allows rapid, utility-first UI development for a polished, responsive interface. |
| **Node.js (Custom Server)** | Backend Runtime | Allows Next.js and Socket.IO to run on the same HTTP server (`server.ts`). |

### Project Directory Structure
```text
neural-network-game/
├── server.ts              # Custom backend server & Socket.IO logic
├── src/
│   ├── app/
│   │   ├── page.tsx       # Landing page (Join Room)
│   │   ├── host/          # Host dashboard & controls
│   │   └── play/          # Player game screen
│   ├── components/
│   │   ├── LayerAnimation.tsx # Role assignment UI
│   │   ├── InputPhase.tsx     # Single-word input UI
│   │   ├── HiddenPhase.tsx    # Two-word phrase UI
│   │   ├── OutputPhase.tsx    # Sentence generation UI
│   │   ├── WordCloud.tsx      # Visualizes top words for the hidden layer
│   │   ├── Timer.tsx          # Real-time countdown clock
│   │   └── ResultsScreen.tsx  # Final network output UI
│   └── lib/
│       ├── types.ts       # Shared TypeScript interfaces & configs
│       └── socket.ts      # Client-side Socket singleton
└── public/images/         # Hosted game images
```

### Core Modules Explained
- **`server.ts`**: The central nervous system. It initializes the HTTP and Socket.IO servers, manages the lifecycle of `rooms` and `players`, coordinates the countdown timers, and executes the data aggregation functions.
- **`src/lib/types.ts`**: Defines the rigorous contract between client and server, mapping out `GamePhase`, `RoomState`, and exactly what Socket events are available (`ClientToServerEvents` / `ServerToClientEvents`).
- **Phase Components (`InputPhase.tsx`, `HiddenPhase.tsx`, `OutputPhase.tsx`)**: React components that render conditionally based on the player's assigned layer and the current game phase, handling local input validation and emitting data back to the server.

## 6. User Experience & Features
- **Visual Role Assignment (`LayerAnimation.tsx`)**: A dramatic suspense sequence where a player is visually sorted into their respective layer, reinforcing the concept of network architecture.
- **Word Cloud (`WordCloud.tsx`)**: For the Hidden Layer, raw text data isn't just listed; it's visualized dynamically, simulating how neurons receive overlapping, weighted signals.
- **Asymmetric Gameplay**: The UI completely transforms depending on your role. Input players see images; Hidden/Output players see text data and progress bars.
- **Synchronized Timers**: A pulsing `Timer.tsx` keeps the urgency high, moving all clients forward in lockstep regardless of local lag.
- **Host Dashboard**: Provides a God-view of the room stats, tracking how many players are in each layer and monitoring submission completion rates.

## 7. Key Takeaways
For anyone reviewing this codebase, the most important concepts demonstrated are:
- **Real-Time Multiplayer Synchronization**: Effectively using WebSockets to manage distributed state across dozens of clients simultaneously.
- **Abstracting Complexity**: Successfully turning an intimidating academic concept (Deep Learning) into an intuitive, gamified user experience.
- **Asymmetric State Management**: Handling a unified game loop where different clients require entirely different UI states and data payloads simultaneously.
- **Scalability Considerations**: The codebase highlights pathways for horizontal scaling (e.g., using Redis adapters for Socket.IO).

## 8. Historical Context / Real-World Connection
This project directly parallels the architecture of a **Multi-Layer Perceptron (MLP)** or a basic **Convolutional Neural Network (CNN)**:
1. **The Input Layer (Players seeing the image)** acts like the initial pixels/convolution filters identifying basic edges or colors (basic words).
2. **The Hidden Layer (Players making phrases)** mirrors feature extraction, combining basic edges into shapes (words into phrases).
3. **The Output Layer (Players writing sentences)** represents the final dense classification layer, synthesizing abstract features into a concrete, human-readable prediction.

By forcing human players to operate under strict data-passing constraints, the project perfectly illustrates why Neural Networks are designed in layers, emphasizing that intelligence emerges from the combination of many simple, restricted operations.
