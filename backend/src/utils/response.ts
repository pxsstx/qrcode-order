export const success = <T>(data: T, message?: string) => {
  return {
    message: message || "Success",
    data,
  };
};

export const error = (message: string, details?: any) => {
  return {
    message,
    ...(details && { details }),
  };
};
