import { useState, useCallback, useRef } from 'react';
import type { FieldError } from '../types/api';
import type { NormalizedApiError } from '../lib/api';

export interface ApiFormState {
  saving: boolean;
  saved: boolean;
  error: string | null;
  fieldErrors: FieldError[];
}

export interface ApiFormActions {
  setSaving: (v: boolean) => void;
  setSaved: (v: boolean) => void;
  setError: (e: string | null) => void;
  setFieldErrors: (e: FieldError[]) => void;
  handleApiError: (err: NormalizedApiError) => void;
  reset: () => void;
  getFieldError: (field: string) => string | undefined;
  isFieldInvalid: (field: string) => boolean;
}

export function useApiForm(initialState?: Partial<ApiFormState>): ApiFormState & ApiFormActions {
  const [saving, setSaving] = useState(initialState?.saving ?? false);
  const [saved, setSaved] = useState(initialState?.saved ?? false);
  const [error, setError] = useState<string | null>(initialState?.error ?? null);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>(initialState?.fieldErrors ?? []);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const clearSavedTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setSaved(false), 3000);
  }, []);

  const handleApiError = useCallback((err: NormalizedApiError) => {
    setSaving(false);
    setError(err.message);
    setFieldErrors(err.fieldErrors);
  }, []);

  const reset = useCallback(() => {
    setSaving(false);
    setSaved(false);
    setError(null);
    setFieldErrors([]);
  }, []);

  const getFieldError = useCallback(
    (field: string): string | undefined => {
      return fieldErrors.find((fe) => fe.field === field)?.message;
    },
    [fieldErrors],
  );

  const isFieldInvalid = useCallback(
    (field: string): boolean => {
      return fieldErrors.some((fe) => fe.field === field);
    },
    [fieldErrors],
  );

  return {
    saving,
    saved,
    error,
    fieldErrors,
    setSaving,
    setSaved: (v: boolean) => { setSaved(v); if (v) clearSavedTimeout(); },
    setError,
    setFieldErrors,
    handleApiError,
    reset,
    getFieldError,
    isFieldInvalid,
  };
}
