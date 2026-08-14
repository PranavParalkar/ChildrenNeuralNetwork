import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from './types';

// Bug #4 fix: Factory function instead of singleton.
// Each page creates its own socket, connects on mount, disconnects on cleanup.
// This prevents stale listeners accumulating across page navigations
// and avoids duplicate room creation on reconnect.
export function createSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  return io({
    path: '/api/socketio',
    // Start with polling (works everywhere, including behind CDNs/proxies
    // that may block WebSocket upgrades) then upgrade to websocket once a
    // connection is established.  The previous config listed 'websocket'
    // first which silently fails on many hosting platforms.
    transports: ['polling', 'websocket'],
    autoConnect: false,
    // Reconnection settings for hosted environments (network can be flaky)
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });
}
