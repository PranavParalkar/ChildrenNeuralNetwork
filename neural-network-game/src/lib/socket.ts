import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from './types';

// Bug #4 fix: Factory function instead of singleton.
// Each page creates its own socket, connects on mount, disconnects on cleanup.
// This prevents stale listeners accumulating across page navigations
// and avoids duplicate room creation on reconnect.
export function createSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  return io({
    path: '/api/socketio',
    transports: ['websocket', 'polling'],
    autoConnect: false,
  });
}
