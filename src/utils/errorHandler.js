import toast from "react-hot-toast";

export const errorCodes = {
  // Auth errors
  AUTH_001: "Invalid credentials",
  AUTH_002: "Account locked",
  AUTH_003: "Session expired",
  AUTH_004: "Unauthorized access",

  // Request errors
  REQ_001: "Invalid request data",
  REQ_002: "Rate limit exceeded",
  REQ_003: "Resource not found",
  REQ_004: "Conflict with existing resource",

  // Server errors
  SRV_001: "Internal server error",
  SRV_002: "Service unavailable",
  SRV_003: "Database connection failed",
  SRV_004: "Timeout error",

  // Network errors
  NET_001: "Network connection error",
  NET_002: "Request timeout",
  NET_003: "DNS lookup failed",

  // Validation errors
  VAL_001: "Validation failed",
  VAL_002: "Missing required field",
  VAL_003: "Invalid field format",
};

export class AppError extends Error {
  constructor(code, message, originalError = null) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

export function handleApiError(error, context = "") {
  console.error(`[${context}] API Error:`, error);

  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;

    switch (status) {
      case 400:
        toast.error(data?.message || errorCodes.REQ_001);
        return new AppError(
          "REQ_001",
          data?.message || errorCodes.REQ_001,
          error,
        );

      case 401:
        toast.error(errorCodes.AUTH_003);
        localStorage.removeItem("dispatcher_token");
        localStorage.removeItem("dispatcher_user");
        setTimeout(() => (window.location.href = "/login"), 1500);
        return new AppError("AUTH_003", errorCodes.AUTH_003, error);

      case 403:
        toast.error(errorCodes.AUTH_004);
        return new AppError("AUTH_004", errorCodes.AUTH_004, error);

      case 404:
        toast.error(data?.message || errorCodes.REQ_003);
        return new AppError(
          "REQ_003",
          data?.message || errorCodes.REQ_003,
          error,
        );

      case 409:
        toast.error(data?.message || errorCodes.REQ_004);
        return new AppError(
          "REQ_004",
          data?.message || errorCodes.REQ_004,
          error,
        );

      case 429:
        toast.error(errorCodes.REQ_002);
        return new AppError("REQ_002", errorCodes.REQ_002, error);

      case 500:
        toast.error(errorCodes.SRV_001);
        return new AppError("SRV_001", errorCodes.SRV_001, error);

      case 503:
        toast.error(errorCodes.SRV_002);
        return new AppError("SRV_002", errorCodes.SRV_002, error);

      default:
        toast.error("An unexpected error occurred");
        return new AppError("UNKNOWN", "An unexpected error occurred", error);
    }
  } else if (error.request) {
    // Request was made but no response
    toast.error(errorCodes.NET_001);
    return new AppError("NET_001", errorCodes.NET_001, error);
  } else {
    // Something else happened
    toast.error("Application error. Please try again.");
    return new AppError("APP_001", "Application error", error);
  }
}

export function validateResponse(response) {
  if (!response) {
    throw new AppError("VAL_001", "Empty response received");
  }

  if (response.error) {
    throw new AppError(response.error.code, response.error.message);
  }

  return response;
}

export function retryOperation(fn, retries = 3, delay = 1000) {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error) => {
        if (retries === 0) {
          reject(error);
          return;
        }
        setTimeout(() => {
          retryOperation(fn, retries - 1, delay * 2)
            .then(resolve)
            .catch(reject);
        }, delay);
      });
  });
}
