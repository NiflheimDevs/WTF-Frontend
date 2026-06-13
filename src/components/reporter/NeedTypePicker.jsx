import { Droplets, Truck } from "lucide-react";
import { NEED_TYPES } from "../../api/types";

export function NeedTypePicker({ value, onChange }) {
  const options = [
    { id: NEED_TYPES.BOTTLED_WATER, label: "Water Bottles", icon: Droplets },
    { id: NEED_TYPES.TANKER, label: "Tanker Truck", icon: Truck },
  ];

  return (
    <div>
      <label className="block mb-1.5 text-sm font-semibold text-neutral-700">
        What do you need?
      </label>
      <div className="grid grid-cols-2 gap-3">
        {options.map(({ id, label, icon: Icon }) => {
          const active = value === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`
                min-h-16 flex flex-col items-center justify-center gap-1.5 rounded-md text-sm font-medium
                transition-all duration-150 border-2
                ${
                  active
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-neutral-200 bg-neutral-0 text-neutral-700 hover:border-neutral-300"
                }
              `}
            >
              <Icon size={22} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
