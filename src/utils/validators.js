export const validators = {
  required: (value) => {
    if (!value && value !== 0) return "This field is required";
    if (typeof value === "string" && !value.trim())
      return "This field is required";
    return null;
  },

  email: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return "Invalid email address";
    return null;
  },

  phone: (phone) => {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length !== 11 || !cleaned.startsWith("09")) {
      return "Invalid phone number (must be 11 digits starting with 09)";
    }
    return null;
  },

  minLength: (min) => (value) => {
    if (value && value.length < min)
      return `Must be at least ${min} characters`;
    return null;
  },

  maxLength: (max) => (value) => {
    if (value && value.length > max) return `Must not exceed ${max} characters`;
    return null;
  },

  min: (min) => (value) => {
    if (value && value < min) return `Must be at least ${min}`;
    return null;
  },

  max: (max) => (value) => {
    if (value && value > max) return `Must not exceed ${max}`;
    return null;
  },

  compose:
    (...validators) =>
    (value) => {
      for (const validator of validators) {
        const error = validator(value);
        if (error) return error;
      }
      return null;
    },
};

export const validateRegion = validators.required;
export const validateQuantity = validators.compose(
  validators.min(1),
  validators.max(50),
);
export const validateTankerQuantity = validators.compose(
  validators.min(1),
  validators.max(5),
);
