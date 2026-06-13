import { Toaster } from "react-hot-toast";
import { useTranslation } from "../../context/LocaleContext";

export function AppToaster() {
  const { locale } = useTranslation();

  return (
    <Toaster
      position={locale === "fa" ? "top-left" : "top-right"}
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--bg-subtle)",
          color: "var(--text-default)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          fontSize: "14px",
          fontFamily:
            locale === "fa"
              ? 'Vazirmatn, ui-sans-serif, system-ui, sans-serif'
              : 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif',
          boxShadow: "var(--shadow-overlay)",
          maxWidth: "380px",
        },
        success: { icon: "✓", duration: 3000 },
        error: { icon: "⚠️", duration: 5000 },
        loading: { icon: "⋯", duration: Infinity },
      }}
    />
  );
}
