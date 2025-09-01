import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useRealtime(table: string, callback: () => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to Socket.IO server
    socketRef.current = io('http://localhost:3001');
    
    const socket = socketRef.current;
    
    // Listen for real-time updates based on table
    const events = {
      providers: ['provider-created', 'provider-updated', 'provider-deleted'],
      families: ['family-created', 'family-updated', 'family-deleted'],
      care_requests: ['care-request-created', 'care-request-updated', 'care-request-deleted'],
      assignments: ['assignment-created', 'assignment-updated']
    };
    
    const tableEvents = events[table as keyof typeof events] || [];
    
    tableEvents.forEach(event => {
      socket.on(event, callback);
    });
    
    // Join room for this table
    socket.emit('join-room', table);

    return () => {
      tableEvents.forEach(event => {
        socket.off(event, callback);
      });
      socket.disconnect();
    };
  }, [table, callback]);
}