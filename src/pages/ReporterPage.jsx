import { useState, useEffect } from "react";
import { useRegions } from "../hooks/useRegions";
import { useSubmitRequest } from "../hooks/useSubmitRequest";
import { Button } from "../components/primitives/Button";
import { Card } from "../components/primitives/Card";
import { Input } from "../components/primitives/Input";
import { RegionSelect } from "../components/reporter/RegionSelect";
import { NeedTypePicker } from "../components/reporter/NeedTypePicker";
import { QuantityStepper } from "../components/reporter/QuantityStepper";
import { SuccessView } from "../components/reporter/SuccessView";
import {
  validateRegion,
  validateQuantity,
  validateTankerQuantity,
} from "../utils/validators";
import { NEED_TYPES } from "../api/types";
import toast from "react-hot-toast";

export default function ReporterPage() {
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

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.classList.remove("dark");
  }, []);

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
      toast.error("You are offline. Please check your connection.");
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
    <div
      className="min-h-screen bg-neutral-0 flex flex-col items-center justify-center px-4 font-sans"
      style={{
        background:
          "radial-gradient(circle at 0% 0%, rgba(11,107,203,0.08), transparent 50%), var(--color-neutral-0)",
      }}
    >
      <main className="flex-1 px-4 py-8 w-full max-w-lg mx-auto">
        <Card>
          <div className="flex flex-col gap-5">
            <RegionSelect
              value={region}
              onChange={setRegion}
              regions={regions}
              loading={regionsLoading}
              error={errors.region}
            />

            <NeedTypePicker value={needType} onChange={setNeedType} />

            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              needType={needType}
              error={errors.quantity}
            />

            <Input
              label="Phone number (optional)"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912 345 6789"
              hint="Your phone is only used to coordinate delivery"
            />

            <div>
              <label className="block mb-1.5 text-sm font-semibold text-neutral-700">
                Additional note{" "}
                <span className="text-neutral-400 text-[13px]">(optional)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 280))}
                placeholder="Any details that help dispatchers…"
                rows={3}
                className="w-full px-3 py-2.5 border border-neutral-200 rounded-md text-base font-sans bg-neutral-0 text-neutral-700 outline-none resize-none focus:border-primary-500 transition-colors"
              />
              {note.length >= 240 && (
                <p
                  className={`mt-1 text-xs text-right ${note.length >= 270 ? "text-warning-fg" : "text-neutral-400"}`}
                >
                  {note.length}/280
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
                ? "OFFLINE"
                : submitRequest.isPending
                  ? "SUBMITTING..."
                  : "SUBMIT REQUEST"}
            </Button>
          </div>
        </Card>
      </main>

      <footer className="px-6 py-4 text-center text-[11px] text-neutral-400 uppercase tracking-widest border-t border-neutral-200">
        Provincial Crisis HQ · v1.0
      </footer>
    </div>
  );
}
