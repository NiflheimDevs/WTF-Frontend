import { useState } from "react";
import { Input } from "../primitives/Input";
import { Button } from "../primitives/Button";
import { AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export function SignupForm({ onSwitch }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // API call to register
      await new Promise((r) => setTimeout(r, 1000));
      toast.success("Account created! Please sign in.");
      onSwitch();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-danger-bg text-danger-fg text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <Input
        label="Full Name"
        value={formData.fullName}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, fullName: e.target.value }))
        }
        placeholder="Maryam Ahmadi"
        required
      />

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, email: e.target.value }))
        }
        placeholder="dispatcher@hq.gov"
        required
      />

      <Input
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, password: e.target.value }))
        }
        placeholder="At least 8 characters"
        required
      />

      <Input
        label="Confirm Password"
        type="password"
        value={formData.confirmPassword}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
        }
        placeholder="Confirm your password"
        required
      />

      <Button type="submit" loading={loading} fullWidth>
        Create Account
      </Button>

      <p className="text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-primary-500 font-semibold hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
