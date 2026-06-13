import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Droplets, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../context/LocaleContext";
import toast from "react-hot-toast";

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
            ${children ? "pe-11" : ""}
          `}
        />
        {children}
      </div>
      {error && <p className="text-xs text-danger-fg">{error}</p>}
      {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

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

function LoginForm({ onSwitch }) {
  const { login } = useAuth();
  const { t } = useTranslation();
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
    if (!email) errs.email = t("auth.emailRequired");
    if (!password) errs.password = t("auth.passwordRequired");
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
      toast.success(t("auth.welcomeBack"));
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPassword("");

      if (newAttempts >= 5) {
        setLocked(true);
        setError(t("auth.tooManyAttempts"));
        setTimeout(
          () => {
            setLocked(false);
            setAttempts(0);
          },
          15 * 60 * 1000,
        );
      } else if (err.response?.status === 401) {
        setError(t("auth.invalidCredentials"));
      } else if (err.response?.status === 400) {
        setError(t("auth.invalidRequest"));
      } else {
        setError(t("auth.serverUnreachable"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field
        label={t("auth.email")}
        type="email"
        value={email}
        onChange={(val) => {
          setEmail(val);
          setFieldErrors((e) => ({ ...e, email: null }));
        }}
        placeholder={t("auth.emailPlaceholder")}
        error={fieldErrors.email}
      />

      <Field
        label={t("auth.password")}
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
          className="absolute end-3 top-1/2 -translate-y-1/2 text-neutral-400 bg-transparent border-none cursor-pointer p-0"
          tabIndex={-1}
        >
          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </Field>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="w-4 h-4 accent-primary-500 cursor-pointer"
        />
        <span className="text-sm text-neutral-500">{t("auth.rememberMe")}</span>
      </label>

      <Alert message={error} type={locked ? "warning" : "danger"} />

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
            {t("auth.signingIn")}
          </>
        ) : (
          <>
            {t("auth.signIn")} <ArrowRight size={15} />
          </>
        )}
      </button>

      <p className="text-center text-sm text-neutral-500">
        {t("auth.newDispatcher")}{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-primary-500 font-semibold bg-transparent border-none cursor-pointer font-sans p-0"
        >
          {t("auth.createAccount")}
        </button>
      </p>
    </form>
  );
}

function SignupForm({ onSwitch }) {
  const { t } = useTranslation();
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
    if (!name.trim()) errs.name = t("auth.fullNameRequired");
    if (!email.trim()) errs.email = t("auth.emailRequired");
    if (password.length < 8)
      errs.password = t("auth.passwordMinLength");
    if (password !== confirm) errs.confirm = t("auth.passwordsNoMatch");
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
      await new Promise((r) => setTimeout(r, 1000));
      throw new Error("backend-needed");
    } catch (err) {
      if (err.message === "backend-needed") {
        setError(t("auth.backendNotConnected"));
      } else if (err.response?.status === 409) {
        setError(t("auth.emailExists"));
      } else {
        setError(t("auth.serverUnreachable"));
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    if (password.length === 0) return null;
    if (password.length < 8)
      return { level: 1, label: t("auth.passwordTooShort"), color: "bg-danger-fg" };
    if (password.length < 12)
      return { level: 2, label: t("auth.passwordFair"), color: "bg-warning-fg" };
    return { level: 3, label: t("auth.passwordStrong"), color: "bg-success-fg" };
  })();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field
        label={t("auth.fullName")}
        value={name}
        onChange={(val) => {
          setName(val);
          setFieldErrors((e) => ({ ...e, name: null }));
        }}
        placeholder={t("auth.namePlaceholder")}
        error={fieldErrors.name}
      />

      <Field
        label={t("auth.email")}
        type="email"
        value={email}
        onChange={(val) => {
          setEmail(val);
          setFieldErrors((e) => ({ ...e, email: null }));
        }}
        placeholder={t("auth.emailPlaceholder")}
        error={fieldErrors.email}
      />

      <div className="flex flex-col gap-1.5">
        <Field
          label={t("auth.password")}
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
            className="absolute end-3 top-1/2 -translate-y-1/2 text-neutral-400 bg-transparent border-none cursor-pointer p-0"
            tabIndex={-1}
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </Field>

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
        label={t("auth.confirmPassword")}
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
          className="absolute end-3 top-1/2 -translate-y-1/2 text-neutral-400 bg-transparent border-none cursor-pointer p-0"
          tabIndex={-1}
        >
          {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </Field>

      <Alert message={error} />

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
            {t("auth.creatingAccount")}
          </>
        ) : (
          <>
            {t("auth.signUp")} <ArrowRight size={15} />
          </>
        )}
      </button>

      <p className="text-center text-sm text-neutral-500">
        {t("auth.alreadyHaveAccount")}{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-primary-500 font-semibold bg-transparent border-none cursor-pointer font-sans p-0"
        >
          {t("auth.signIn")}
        </button>
      </p>
    </form>
  );
}

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

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
      <div className="w-full max-w-sm bg-neutral-50 border border-neutral-200 rounded-lg p-8 shadow-overlay animate-fade-in">
        <div className="flex flex-col items-start gap-3 mb-6">
          <div className="w-8 h-8 rounded-md bg-primary-500 flex items-center justify-center">
            <Droplets size={18} color="white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 leading-tight">
              {tab === "login"
                ? t("auth.dispatcherConsole")
                : t("auth.createAccountTitle")}
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              {tab === "login"
                ? t("auth.signInSubtitle")
                : t("auth.signUpSubtitle")}
            </p>
          </div>
        </div>

        <div className="flex bg-neutral-100 rounded-md p-1 mb-6">
          {["login", "signup"].map((tabKey) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => setTab(tabKey)}
              className={`flex-1 h-8 rounded text-sm font-semibold font-sans border-none cursor-pointer transition-colors duration-150
                ${tab === tabKey ? "bg-neutral-0 text-neutral-900 shadow-card" : "bg-transparent text-neutral-500"}
              `}
            >
              {tabKey === "login" ? t("auth.signIn") : t("auth.signUp")}
            </button>
          ))}
        </div>

        {tab === "login" ? (
          <LoginForm onSwitch={() => setTab("signup")} />
        ) : (
          <SignupForm onSwitch={() => setTab("login")} />
        )}
      </div>

      <p className="mt-6 text-[11px] text-neutral-400 uppercase tracking-widest font-medium">
        {t("common.version")}
      </p>
    </div>
  );
}
