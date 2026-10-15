import { useCallback, useEffect, useRef, useState } from "react";
export function useResource<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  refreshMs = 0,
  retainOnRefresh = false,
) {
  const [state, setState] = useState<{
    data: T | null;
    error: Error | null;
    loading: boolean;
  }>({ data: null, error: null, loading: true });
  const [tick, setTick] = useState(0);
  const seq = useRef(0);
  const refresh = useCallback(() => setTick((x) => x + 1), []);
  useEffect(() => {
    const controller = new AbortController(),
      generation = ++seq.current;
    // Do not display a previous page or previously configured record during errors.
    setState((previous) => ({
      data: retainOnRefresh ? previous.data : null,
      error: null,
      loading: true,
    }));
    loader(controller.signal)
      .then((data) => {
        if (generation === seq.current && !controller.signal.aborted)
          setState({ data, error: null, loading: false });
      })
      .catch((error) => {
        if (!controller.signal.aborted && generation === seq.current)
          setState({ data: null, error, loading: false });
      });
    return () => controller.abort();
  }, [loader, tick, retainOnRefresh]);
  useEffect(() => {
    if (!refreshMs) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, refreshMs);
    return () => clearInterval(timer);
  }, [refresh, refreshMs]);
  return { ...state, refresh };
}
