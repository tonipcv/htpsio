import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface DocumentTrackingOptions {
  documentId: string;
  onError?: (error: Error) => void;
}

/**
 * Hook for tracking document access and view time
 * 
 * This hook will:
 * 1. Send a 'documentViewed' event when the component mounts
 * 2. Send a 'documentClosed' event when the component unmounts or tab visibility changes
 * 3. Track time spent viewing the document
 * 
 * @param options Configuration options
 * @returns Object with tracking status
 */
export function useDocumentTracking({ documentId, onError }: DocumentTrackingOptions) {
  const [isTracking, setIsTracking] = useState(false);
  const [visitorToken, setVisitorToken] = useState<string>('');
  const [startTime, setStartTime] = useState<number>(0);

  // Initialize visitor token if not logged in
  useEffect(() => {
    // Get existing token from localStorage or create a new one
    let token = localStorage.getItem('document_visitor_token');
    if (!token) {
      token = uuidv4();
      localStorage.setItem('document_visitor_token', token);
    }
    setVisitorToken(token);
  }, []);

  // Send tracking events and handle visibility changes
  useEffect(() => {
    if (!documentId || !visitorToken) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Document/tab is being closed or hidden
        sendTrackingEvent('documentClosed');
      } else if (document.visibilityState === 'visible' && !isTracking) {
        // Document/tab is visible again after being hidden
        sendTrackingEvent('documentViewed');
      }
    };

    // Initial tracking when component mounts
    sendTrackingEvent('documentViewed');
    
    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Send final tracking event if component unmounts
      if (isTracking) {
        sendTrackingEvent('documentClosed');
      }
    };
  }, [documentId, visitorToken]);

  // Function to send tracking events to the API
  const sendTrackingEvent = async (event: 'documentViewed' | 'documentClosed') => {
    try {
      const now = Date.now();
      
      // Calculate duration for 'documentClosed' events
      let duration;
      if (event === 'documentClosed' && startTime > 0) {
        duration = Math.floor((now - startTime) / 1000); // Convert to seconds
      }
      
      // Update tracking state
      if (event === 'documentViewed') {
        setStartTime(now);
        setIsTracking(true);
      } else {
        setIsTracking(false);
      }
      
      // Send data to API
      const response = await fetch('/api/analytics/document-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          visitorToken,
          event,
          timestamp: now,
          duration,
          userAgent: navigator.userAgent,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send ${event} event: ${response.statusText}`);
      }
      
    } catch (error) {
      console.error(`Error sending ${event} event:`, error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  };

  return { isTracking };
}
