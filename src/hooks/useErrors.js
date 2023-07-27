import { useCallback, useMemo, useState } from "react";

export default function useErrors() {
  const [errors, setErrors] = useState([]);
  const addError = useCallback((error) => {
    setErrors((errors) => [...errors, error]);
  }, []);
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const getErrorsString = useCallback(() => {
    if (Array.isArray(errors)) {
      return errors.join("\n");
    }
  }, [errors]);

  const isErrors = useMemo(() => {
    return Array.isArray(errors) && errors.length > 0;
  }, [errors]);

  return {
    isErrors,
    addError,
    clearErrors,
    getErrorsString,
  };
}
