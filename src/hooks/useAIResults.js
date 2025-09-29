// src/hooks/useAIResults.js
// Hook for fetching AI scoring, coding profile, and analytics results
import { useState, useCallback } from 'react';
import axios from 'axios';

export default function useAIResults(authToken) {
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchResults = useCallback(async (endpoint, params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(endpoint, {
        params,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setResults(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  return { results, error, loading, fetchResults };
}
