import { toast } from "sonner";

/**
 * Toast utility functions for frontend
 */

export const toastSuccess = (message: string) => {
  toast.success(message);
};

export const toastInfo = (message: string) => {
  toast.info(message);
};

export const toastWarning = (message: string) => {
  toast.warning(message);
};

export const toastError = (message: string) => {
  toast.error(message);
};

/**
 * Show a toast tied to a promise lifecycle
 */
export const toastPromise = (
  action: () => Promise<any>,
  {
    loading = "Loading...",
    success = "Success!",
    error = "Something went wrong",
  }: {
    loading?: string;
    success?: string | ((data: any) => string);
    error?: string;
  } = {}
) => {
  return toast.promise(action, {
    loading,
    success,
    error,
  });
};
