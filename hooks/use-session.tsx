'use client';

// Step 1: Import React hooks and UUID generator
import { useEffect, useState } from 'react';
import { generateUUID } from '@/lib/utils';

// Step 2: Define localStorage key for session persistence
const SESSION_STORAGE_KEY = 'chat-session-id';

// Step 3: Custom hook to manage persistent chat sessions
export function useSession() {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Step 4: Check if session ID already exists in localStorage
    const existingSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    
    if (existingSessionId) {
      // Step 5: Use existing session ID if found
      setSessionId(existingSessionId);
    } else {
      // Step 6: Generate new UUID and store in localStorage
      const newSessionId = generateUUID();
      localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  // Step 7: Function to reset session with new UUID
  const resetSession = () => {
    const newSessionId = generateUUID();
    localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
    setSessionId(newSessionId);
  };

  // Step 8: Return session state and reset function
  return {
    sessionId,
    resetSession
  };
}