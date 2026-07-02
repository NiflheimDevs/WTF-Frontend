import { useState, useEffect, useMemo, useRef } from "react";
import { useRegions } from "../hooks/useRegions";
import { useSubmitRequest } from "../hooks/useSubmitRequest";
import { Button } from "../components/primitives/Button";
import { Card } from "../components/primitives/Card";
import { Input } from "../components/primitives/Input";
import { RegionSelect } from "../components/reporter/RegionSelect";
import { NeedTypePicker } from "../components/reporter/NeedTypePicker";
import { QuantityStepper } from "../components/reporter/QuantityStepper";
import { SuccessView } from "../components/reporter/SuccessView";
import { createFieldValidators } from "../utils/validators";
import { NEED_TYPES } from "../api/types";
import { useTranslation } from "../context/LocaleContext";
import toast from "react-hot-toast";
import { toLocaleDigits } from "../utils/localeDigits";
import { Droplets, ChevronDown } from "lucide-react";

export default function ReporterPage() {
  const { t, locale } = useTranslation();
  const { validateRegion, validateQuantity, validateTankerQuantity } =
    useMemo(() => createFieldValidators(t), [t]);

  const { data: regions = [], isLoading: regionsLoading } = useRegions();
  const submitRequest = useSubmitRequest();

  const [region, setRegion] = useState("");
  const [needType, setNeedType] = useState(NEED_TYPES.BOTTLED_WATER);
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const formRef = useRef(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};

    const regionError = validateRegion(region);
    if (regionError) newErrors.region = regionError;

    const quantityValidator =
      needType === NEED_TYPES.TANKER
        ? validateTankerQuantity
        : validateQuantity;
    const quantityError = quantityValidator(quantity);
    if (quantityError) newErrors.quantity = quantityError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!isOnline) {
      toast.error(t("reporter.offlineError"));
      return;
    }

    if (!validateForm()) return;

    try {
      const result = await submitRequest.mutateAsync({
        region_id: region,
        need_type: needType,
        quantity,
        contact_phone: phone || undefined,
        note: note || undefined,
      });

      setRequestId(result.id);
      setSubmitted(true);
    } catch {
      // Error handled by hook
    }
  };

  const handleNeedTypeChange = (newNeedType) => {
    const max = newNeedType === NEED_TYPES.TANKER ? 5 : 50;
    setNeedType(newNeedType);
    setQuantity((current) => Math.min(current, max));
    setErrors((prev) => {
      if (!prev.quantity) return prev;
      const { quantity: _, ...rest } = prev;
      return rest;
    });
  };

  const handleReset = () => {
    setRegion("");
    setNeedType(NEED_TYPES.BOTTLED_WATER);
    setQuantity(1);
    setPhone("");
    setNote("");
    setErrors({});
    setSubmitted(false);
    setRequestId(null);
  };

  if (submitted) {
    return <SuccessView requestId={requestId} onReset={handleReset} />;
  }

  return (
    <div className="min-h-screen bg-neutral-0 font-sans">
      <section
        className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center"
        style={{
          background:
            "radial-gradient(circle at 0% 0%, rgba(11,107,203,0.08), transparent 50%), var(--color-neutral-0)",
        }}
      >
        <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg mb-6">
          <Droplets size={28} className="text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight mb-2">
          <span>{t("brand.water")}</span>
          <span className="text-primary-500">{t("brand.supply")}</span>
        </h1>
        <p className="text-sm text-neutral-400 font-medium mb-6">
          {t("brand.crisisResponse")}
        </p>
        <h2 className="text-lg sm:text-xl font-semibold text-neutral-700 mb-3">
          {t("reporter.heroTitle")}
        </h2>
        <p className="text-sm text-neutral-500 max-w-md mb-8">
          {t("reporter.heroDescription")}
        </p>
        <Button
          size="lg"
          onClick={() =>
            formRef.current?.scrollIntoView({ behavior: "smooth" })
          }
        >
          {t("reporter.heroAction")}
          <ChevronDown size={16} className="ms-1.5" />
        </Button>
      </section>

      <main ref={formRef} className="px-4 py-12 w-full max-w-lg mx-auto">
        <Card>
          <div className="flex flex-col gap-5">
            <RegionSelect
              value={region}
              onChange={setRegion}
              regions={regions}
              loading={regionsLoading}
              error={errors.region}
            />

            <NeedTypePicker value={needType} onChange={handleNeedTypeChange} />

            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              needType={needType}
              error={errors.quantity}
            />

            <Input
              label={t("reporter.phoneLabel")}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("reporter.phonePlaceholder")}
              hint={t("reporter.phoneHint")}
            />

            <div>
              <label className="block mb-1.5 text-sm font-semibold text-neutral-700">
                {t("reporter.noteLabel")}{" "}
                <span className="text-neutral-400 text-[13px]">
                  {t("common.optional")}
                </span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 280))}
                placeholder={t("reporter.notePlaceholder")}
                rows={3}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-md text-base font-sans bg-neutral-0 text-neutral-700 outline-none resize-none focus:border-primary-500 transition-colors"
              />
              {note.length >= 240 && (
                <p
                  className={`mt-1 text-xs text-end ${note.length >= 270 ? "text-warning-fg" : "text-neutral-400"}`}
                >
                  {toLocaleDigits(`${note.length}/280`, locale)}
                </p>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              loading={submitRequest.isPending}
              disabled={!isOnline}
              fullWidth
              size="xl"
              icon={!submitRequest.isPending && isOnline ? "→" : null}
              iconPosition="right"
            >
              {!isOnline
                ? t("reporter.offline")
                : submitRequest.isPending
                  ? t("reporter.submitting")
                  : t("reporter.submitRequest")}
            </Button>
          </div>
        </Card>
      </main>

      <footer className="px-6 py-4 text-center text-[11px] text-neutral-400 uppercase tracking-widest border-t border-neutral-200">
        {t("common.footer")}
      </footer>
    </div>
  );
}
