import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../primitives/Input";
import { Button } from "../primitives/Button";
import { AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export function LoginForm({ onSwitch }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/dispatcher");
      toast.success("Welcome back!");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
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
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="dispatcher@hq.gov"
        required
      />

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />

      <Button type="submit" loading={loading} fullWidth>
        Sign In
      </Button>

      <p className="text-center text-sm text-neutral-500">
        New dispatcher?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-primary-500 font-semibold hover:underline cursor-pointer"
        >
          Create an account
        </button>
      </p>
    </form>
  );
}
