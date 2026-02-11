/**
 * Custom React hook that subscribes to the backend SSE metrics stream.
 *
 * Provides live-updated metrics state and a `connected` flag.
 * Automatically reconnects with exponential back-off on disconnection.
 *
 * @module hooks/useMetricsSSE
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { getStreamUrl } from '../services/api';

/** Initial reconnect delay in ms. */
const BASE_DELAY = 1000;
/** Maximum reconnect delay in ms. */
const MAX_DELAY = 16000;

/**
 * @returns {{ metrics: Object|null, connected: boolean }}
 */
export default function useMetricsSSE() {
  const [metrics, setMetrics] = useState(null);
  const [connected, setConnected] = useState(false);

  const retryDelay = useRef(BASE_DELAY);
  const retryTimer = useRef(null);
  const esRef = useRef(null);

  const connect = useCallback(() => {
    // Clean up any existing connection
    if (esRef.current) {
      esRef.current.close();
    }

    const url = getStreamUrl();
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => {
      setConnected(true);
      retryDelay.current = BASE_DELAY; // reset on success
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMetrics(data);
      } catch {
        // ignore malformed frames
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();

      // Schedule reconnect with exponential back-off
      const delay = retryDelay.current;
      retryTimer.current = setTimeout(() => {
        retryDelay.current = Math.min(delay * 2, MAX_DELAY);
        connect();
      }, delay);
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (esRef.current) {
        esRef.current.close();
      }
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
      }
    };
  }, [connect]);

  return { metrics, connected };
}
