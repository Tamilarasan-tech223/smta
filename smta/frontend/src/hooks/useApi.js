import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Generic data-fetching hook: loading / error / data states plus optional
 * auto-refresh polling. `fetcher` must return { data, error }.
 */
export function useApi(fetcher, deps = [], { autoRefreshMs = 0 } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const { data, error } = await fetcherRef.current();
    if (error) {
      setError(error);
    } else {
      setData(data);
      setError(null);
      setLastFetched(new Date());
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!autoRefreshMs) return;
    const id = setInterval(() => load(true), autoRefreshMs);
    return () => clearInterval(id);
  }, [autoRefreshMs, load]);

  return { data, error, loading, lastFetched, refresh: () => load(true) };
}
