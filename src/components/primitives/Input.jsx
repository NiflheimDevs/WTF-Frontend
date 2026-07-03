import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../utils/cn";

export const Input = forwardRef(
  (
    {
      label,
      error,
      hint,
      type = "text",
      icon: Icon,
      className = "",
      dir = "rtl",
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-semibold text-neutral-700">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Icon size={16} className="text-neutral-400" />
            </div>
          )}
          <input
            dir={dir}
            ref={ref}
            type={inputType}
            className={cn(
              "w-full h-11 px-3 rounded-md text-base font-sans bg-neutral-0 text-neutral-700 outline-none border transition-all duration-200",
              "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
              error
                ? "border-danger-fg"
                : "border-neutral-200 hover:border-neutral-300",
              Icon && "pl-9",
              isPassword && "pr-11",
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-danger-fg">{error}</p>}
        {hint && !error && <p className="text-xs text-neutral-400">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
