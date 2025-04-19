import { useState } from 'react';
import { APIError } from './types';

interface UseAPIState<T> {
  data: T | null;
  error: APIError | null;
  loading: boolean;
}

interface UseAPIResponse<T> extends UseAPIState<T> {
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export function useAPI<T>(
  apiFunction: (...args: any[]) => Promise<T>
): UseAPIResponse<T> {
  const [state, setState] = useState<UseAPIState<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const execute = async (...args: any[]) => {
    try {
      setState({ ...state, loading: true, error: null });
      const result = await apiFunction(...args);
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error as APIError,
      });
    }
  };

  const reset = () => {
    setState({ data: null, error: null, loading: false });
  };

  return {
    ...state,
    execute,
    reset,
  };
} 