import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Droplets, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// #backend-needed: replace with real API calls
// import api from '../api/axios'

// ── Input Field ────────────────────────────────────────────────────
function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  hint,
  children,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-neutral-700">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full h-11 px-3 rounded-md text-base font-sans bg-neutral-100 text-neutral-700 outline-none border transition-colors duration-100 box-border
            ${error ? "border-danger-fg" : "border-neutral-200 focus:border-primary-500"}
            ${children ? "pr-11" : ""}
          `}
        />
        {children}
      </div>
      {error && <p className="text-xs text-danger-fg">{error}</p>}
      {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

// ── Inline Alert ───────────────────────────────────────────────────
function Alert({ message, type = "danger" }) {
  if (!message) return null;
  const styles = {
    danger: "bg-danger-bg  border-danger-fg  text-danger-fg",
    warning: "bg-warning-bg border-warning-fg text-warning-fg",
  };
  return (
    <div
      className={`px-3 py-2.5 rounded-md border text-sm font-medium ${styles[type]}`}
    >
      {message}
    </div>
  );
}

// ── Login Form ─────────────────────────────────────────────────────
function LoginForm({ onSwitch }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email) errs.email = "Email is required.";
    if (!password) errs.password = "Password is required.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (locked) return;

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dispatcher", { replace: true });
      toast.success(`Welcome back!`);
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPassword("");

      if (newAttempts >= 5) {
        setLocked(true);
        setError("Too many attempts. Try again in 15 minutes.");
        setTimeout(
          () => {
            setLocked(false);
            setAttempts(0);
          },
          15 * 60 * 1000,
        );
      } else if (err.response?.status === 401) {
        setError("Email or password is incorrect.");
      } else if (err.response?.status === 400) {
        setError("Invalid request format.");
      } else {
        setError(
          "We couldn't reach the server. Check your connection and try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field
        label="Email"
        type="email"
        value={email}
        onChange={(val) => {
          setEmail(val);
          setFieldErrors((e) => ({ ...e, email: null }));
        }}
        placeholder="dispatcher@hq.gov"
        error={fieldErrors.email}
      />

      <Field
        label="Password"
        type={showPass ? "text" : "password"}
        value={password}
        onChange={(val) => {
          setPassword(val);
          setFieldErrors((e) => ({ ...e, password: null }));
        }}
        placeholder="••••••••"
        error={fieldErrors.password}
      >
        <button
          type="button"
          onClick={() => setShowPass((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 bg-transparent border-none cursor-pointer p-0"
          tabIndex={-1}
        >
          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </Field>

      {/* Remember me */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="w-4 h-4 accent-primary-500 cursor-pointer"
        />
        <span className="text-sm text-neutral-500">Remember me</span>
      </label>

      {/* Inline error */}
      <Alert message={error} type={locked ? "warning" : "danger"} />

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || locked}
        className={`w-full h-12 flex items-center justify-center gap-2 rounded-md text-sm font-semibold font-sans text-white border-none transition-colors duration-100 tracking-wide mt-1
          ${loading || locked ? "bg-primary-600 cursor-not-allowed" : "bg-primary-500 cursor-pointer hover:bg-primary-600"}
        `}
        style={{ boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.15)" }}
      >
        {loading ? (
          <>
            <Loader2
              size={15}
              style={{ animation: "spin 0.7s linear infinite" }}
            />{" "}
            SIGNING IN…
          </>
        ) : (
          <>
            {" "}
            SIGN IN <ArrowRight size={15} />
          </>
        )}
      </button>

      <p className="text-center text-sm text-neutral-500">
        New dispatcher?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-primary-500 font-semibold bg-transparent border-none cursor-pointer font-sans p-0"
        >
          Create an account
        </button>
      </p>
    </form>
  );
}

// ── Signup Form ────────────────────────────────────────────────────
function SignupForm({ onSwitch }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Full name is required.";
    if (!email.trim()) errs.email = "Email is required.";
    if (password.length < 8)
      errs.password = "Password must be at least 8 characters.";
    if (password !== confirm) errs.confirm = "Passwords do not match.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setError(null);
    setLoading(true);

    try {
      // #backend-needed: replace this block with:
      // await api.post('/auth/register', { name, email, password })
      // then either auto-login or redirect to login tab

      await new Promise((r) => setTimeout(r, 1000));
      throw new Error("backend-needed");
    } catch (err) {
      if (err.message === "backend-needed") {
        setError("Backend not connected yet. Come back soon.");
      } else if (err.response?.status === 409) {
        setError("An account with this email already exists.");
      } else {
        setError(
          "We couldn't reach the server. Check your connection and try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const strength = (() => {
    if (password.length === 0) return null;
    if (password.length < 8)
      return { level: 1, label: "Too short", color: "bg-danger-fg" };
    if (password.length < 12)
      return { level: 2, label: "Fair", color: "bg-warning-fg" };
    return { level: 3, label: "Strong", color: "bg-success-fg" };
  })();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field
        label="Full name"
        value={name}
        onChange={(val) => {
          setName(val);
          setFieldErrors((e) => ({ ...e, name: null }));
        }}
        placeholder="Maryam Ahmadi"
        error={fieldErrors.name}
      />

      <Field
        label="Email"
        type="email"
        value={email}
        onChange={(val) => {
          setEmail(val);
          setFieldErrors((e) => ({ ...e, email: null }));
        }}
        placeholder="dispatcher@hq.gov"
        error={fieldErrors.email}
      />

      <div className="flex flex-col gap-1.5">
        <Field
          label="Password"
          type={showPass ? "text" : "password"}
          value={password}
          onChange={(val) => {
            setPassword(val);
            setFieldErrors((e) => ({ ...e, password: null }));
          }}
          placeholder="••••••••"
          error={fieldErrors.password}
        >
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 bg-transparent border-none cursor-pointer p-0"
            tabIndex={-1}
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </Field>

        {/* Password strength bar */}
        {strength && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1 flex-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-200 ${i <= strength.level ? strength.color : "bg-neutral-200"}`}
                />
              ))}
            </div>
            <span className="text-xs text-neutral-500">{strength.label}</span>
          </div>
        )}
      </div>

      <Field
        label="Confirm password"
        type={showConf ? "text" : "password"}
        value={confirm}
        onChange={(val) => {
          setConfirm(val);
          setFieldErrors((e) => ({ ...e, confirm: null }));
        }}
        placeholder="••••••••"
        error={fieldErrors.confirm}
      >
        <button
          type="button"
          onClick={() => setShowConf((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 bg-transparent border-none cursor-pointer p-0"
          tabIndex={-1}
        >
          {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </Field>

      {/* Inline error */}
      <Alert message={error} />

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full h-12 flex items-center justify-center gap-2 rounded-md text-sm font-semibold font-sans text-white border-none transition-colors duration-100 tracking-wide mt-1
          ${loading ? "bg-primary-600 cursor-not-allowed" : "bg-primary-500 cursor-pointer hover:bg-primary-600"}
        `}
        style={{ boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.15)" }}
      >
        {loading ? (
          <>
            <Loader2
              size={15}
              style={{ animation: "spin 0.7s linear infinite" }}
            />{" "}
            CREATING ACCOUNT…
          </>
        ) : (
          <>
            {" "}
            CREATE ACCOUNT <ArrowRight size={15} />
          </>
        )}
      </button>

      <p className="text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-primary-500 font-semibold bg-transparent border-none cursor-pointer font-sans p-0"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

// ── Main Login Page ────────────────────────────────────────────────
export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const tabFromUrl = searchParams.get("tab");
  const [tab, setTab] = useState(() => {
    if (tabFromUrl === "signup") return "signup";
    return "login";
  });
  useEffect(() => {
    if (user) navigate("/dispatcher", { replace: true });
  }, [user, navigate]);

  return (
    <div
      className="min-h-screen bg-neutral-0 flex flex-col items-center justify-center px-4 font-sans"
      style={{
        background:
          "radial-gradient(circle at 0% 0%, rgba(11,107,203,0.08), transparent 50%), var(--color-neutral-0)",
      }}
    >
      {/* Card */}
      <div className="w-full max-w-sm bg-neutral-50 border border-neutral-200 rounded-lg p-8 shadow-overlay animate-fade-in">
        {/* Logo + heading */}
        <div className="flex flex-col items-start gap-3 mb-6">
          <div className="w-8 h-8 rounded-md bg-primary-500 flex items-center justify-center">
            <Droplets size={18} color="white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 leading-tight">
              {tab === "login" ? "Dispatcher Console" : "Create Account"}
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              {tab === "login"
                ? "Sign in to coordinate relief"
                : "Register as a new dispatcher"}
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-neutral-100 rounded-md p-1 mb-6">
          {["login", "signup"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 h-8 rounded text-sm font-semibold font-sans border-none cursor-pointer transition-colors duration-150
                ${tab === t ? "bg-neutral-0 text-neutral-900 shadow-card" : "bg-transparent text-neutral-500"}
              `}
            >
              {t === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Forms */}
        {tab === "login" ? (
          <LoginForm onSwitch={() => setTab("signup")} />
        ) : (
          <SignupForm onSwitch={() => setTab("login")} />
        )}
      </div>

      {/* Footer */}
      <p className="mt-6 text-[11px] text-neutral-400 uppercase tracking-widest font-medium">
        v1.0 · Provincial Crisis HQ
      </p>
    </div>
  );
}
