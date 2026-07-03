import { Plus, Minus } from "lucide-react";
import { NEED_TYPES } from "../../api/types";
import { useTranslation } from "../../context/LocaleContext";
import { formatNumber } from "../../utils/localeDigits";

export function QuantityStepper({ value, onChange, needType, error }) {
  const { t, locale } = useTranslation();
  const max = needType === NEED_TYPES.TANKER ? 5 : 50;
  const min = 1;

  return (
    <div>
      <label className="block mb-1.5 text-sm font-semibold text-neutral-700">
        {t("reporter.howMany")}
      </label>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className={`
            w-11 h-11 flex items-center justify-center border border-neutral-200 rounded-s-md
            transition-colors duration-100
            ${
              value <= min
                ? "text-neutral-300 cursor-not-allowed"
                : "text-neutral-700 hover:bg-neutral-50 cursor-pointer"
            }
          `}
        >
          <Minus size={16} />
        </button>

        <div className="w-16 h-11 flex items-center justify-center border-t border-b border-neutral-200 font-mono text-base font-medium text-neutral-900 bg-neutral-0">
          {formatNumber(value, locale)}
        </div>

        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className={`
            w-11 h-11 flex items-center justify-center border border-neutral-200 rounded-e-md
            transition-colors duration-100
            ${
              value >= max
                ? "text-neutral-300 cursor-not-allowed"
                : "text-neutral-700 hover:bg-neutral-50 cursor-pointer"
            }
          `}
        >
          <Plus size={16} />
        </button>

        <span className="ms-3 text-sm text-neutral-500">
          {t("common.max", { max })}
        </span>
      </div>
      {error && <p className="mt-1 text-xs text-danger-fg">{error}</p>}
    </div>
  );
}
