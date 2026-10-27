import { useEffect, useRef, useState } from 'react';

type State<T> = { data: T | null; error: string | null; loading: boolean };

/**
 * Runs an async loader and re-runs it whenever `key` changes. Pass a string key
 * that captures the inputs (e.g. the filter query) so effects stay predictable.
 */
export function useAsync<T>(key: string, loader: () => Promise<T>) {
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: true });
  const [attempt, setAttempt] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: null }));

    loaderRef
      .current()
      .then((data) => {
        if (active) setState({ data, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            data: null,
            error: error instanceof Error ? error.message : 'Something went wrong.',
            loading: false,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [key, attempt]);

  return { ...state, retry: () => setAttempt((value) => value + 1) };
}
