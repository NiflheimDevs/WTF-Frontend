import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, CheckCircle, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../primitives/Button";
import { useTranslation } from "../../context/LocaleContext";

export function SuccessView({ requestId, onReset }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const fullId = String(requestId ?? "");

  const handleCopy = async () => {
    if (!fullId) return;

    try {
      await navigator.clipboard.writeText(fullId);
      setCopied(true);
      toast.success(t("reporter.referenceIdCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("reporter.copyReferenceIdFailed"));
    }
  };

  return (
    <div className="animate-fade-in flex flex-col items-center text-center px-6 py-12 gap-5">
      <div className="w-20 h-20 rounded-full bg-success-bg flex items-center justify-center">
        <CheckCircle size={40} className="text-success-fg" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          {t("reporter.requestReceived")}
        </h2>
        <p className="text-sm text-neutral-500">
          {t("reporter.requestReceivedHint")}
        </p>
      </div>

      <div className="w-full max-w-md bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
        <p className="text-[11px] text-neutral-400 uppercase tracking-wider mb-2">
          {t("reporter.referenceId")}
        </p>
        <div
          className="overflow-x-auto rounded-md bg-neutral-0 border border-neutral-200 px-3 py-2.5 mb-3"
          dir="ltr"
        >
          <p className="font-mono text-xs sm:text-sm font-semibold text-neutral-900 ltr-isolate whitespace-nowrap select-all text-center">
            {fullId}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          disabled={!fullId}
          fullWidth
          aria-label={t("reporter.copyReferenceId")}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? t("reporter.referenceIdCopied") : t("reporter.copyReferenceId")}
        </Button>
      </div>

      <Button variant="ghost" onClick={onReset} className="mt-2">
        {t("reporter.submitAnother")}
      </Button>

      {fullId && (
        <Link
          to={`/track/${fullId}`}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
        >
          {t("reporter.trackRequest")} →
        </Link>
      )}
    </div>
  );
}
