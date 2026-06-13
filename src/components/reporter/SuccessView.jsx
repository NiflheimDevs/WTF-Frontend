import { CheckCircle } from "lucide-react";
import { Button } from "../primitives/Button";
import { useTranslation } from "../../context/LocaleContext";

export function SuccessView({ requestId, onReset }) {
  const { t } = useTranslation();
  const shortId = requestId?.slice(0, 8).toUpperCase();

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

      <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-6 py-3">
        <p className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1">
          {t("reporter.referenceId")}
        </p>
        <p className="font-mono text-lg font-semibold text-neutral-900 ltr-isolate">
          {shortId}
        </p>
      </div>

      <Button variant="ghost" onClick={onReset} className="mt-2">
        {t("reporter.submitAnother")}
      </Button>
    </div>
  );
}
