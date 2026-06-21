export function createValidators(t) {
  return {
    required: (value) => {
      if (!value && value !== 0) return t("validation.required");
      if (typeof value === "string" && !value.trim())
        return t("validation.required");
      return null;
    },

    email: (email) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(email)) return t("validation.invalidEmail");
      return null;
    },

    phone: (phone) => {
      if (!phone) return null;
      const cleaned = phone.replace(/\D/g, "");
      if (cleaned.length !== 11 || !cleaned.startsWith("09")) {
        return t("validation.invalidPhone");
      }
      return null;
    },

    minLength: (min) => (value) => {
      if (value && value.length < min)
        return t("validation.minLength", { min });
      return null;
    },

    maxLength: (max) => (value) => {
      if (value && value.length > max)
        return t("validation.maxLength", { max });
      return null;
    },

    min: (min) => (value) => {
      if (value && value < min) return t("validation.min", { min });
      return null;
    },

    max: (max) => (value) => {
      if (value && value > max) return t("validation.max", { max });
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
}

export function createFieldValidators(t) {
  const validators = createValidators(t);
  return {
    validateRegion: validators.required,
    validateQuantity: validators.compose(
      validators.min(1),
      validators.max(50),
    ),
    validateTankerQuantity: validators.compose(
      validators.min(1),
      validators.max(5),
    ),
  };
}

// Legacy exports for non-React usage (English fallback via global locale)
import { t as globalT } from "../i18n";

const defaultValidators = createValidators((key, params) =>
  globalT(key, params),
);

export const validators = defaultValidators;
export const validateRegion = defaultValidators.required;
export const validateQuantity = defaultValidators.compose(
  defaultValidators.min(1),
  defaultValidators.max(50),
);
export const validateTankerQuantity = defaultValidators.compose(
  defaultValidators.min(1),
  defaultValidators.max(5),
);
