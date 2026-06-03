import { useState } from "react";
import { Input } from "../primitives/Input";
import { formatPhone, validators } from "../../utils/formatters";

export function PhoneInput({ value, onChange, error }) {
  const [localError, setLocalError] = useState("");

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (newValue && !validators.phone(newValue)) {
      setLocalError("Please enter a valid 11-digit Iranian phone number");
    } else {
      setLocalError("");
    }
  };

  return (
    <Input
      label="Phone number"
      type="tel"
      value={value}
      onChange={handleChange}
      placeholder="0912 345 6789"
      hint="Your phone is only used to coordinate delivery"
      error={error || localError}
    />
  );
}
