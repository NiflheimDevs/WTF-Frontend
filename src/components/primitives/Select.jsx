import { useState, useRef, useEffect, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

const sizeStyles = {
  md: "h-11 text-base",
  sm: "h-10 text-sm",
};

export function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  size = "md",
  dir = "rtl",
  error,
  id,
  className,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const generatedId = useId();
  const selectId = id ?? generatedId;

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label ?? placeholder;

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const triggerClass = cn(
    "w-full px-3 pe-9 rounded-md border bg-neutral-0 font-sans transition-all duration-200",
    "flex items-center text-start",
    sizeStyles[size],
    error ? "border-danger-fg" : "border-neutral-200",
    disabled
      ? "opacity-60 cursor-not-allowed"
      : "cursor-pointer hover:border-primary-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none",
    !value ? "text-neutral-400" : "text-neutral-900",
    className,
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={selectId}
        dir={dir}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={triggerClass}
      >
        <span className="flex-1 truncate text-start">{displayLabel}</span>
        <ChevronDown
          size={16}
          className={cn(
            "pointer-events-none absolute inset-e-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          role="listbox"
          dir={dir}
          aria-labelledby={selectId}
          className={cn(
            "absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-neutral-200",
            "bg-neutral-0 shadow-overlay py-1 animate-slide-in-top",
          )}
        >
          <li
            role="option"
            aria-selected={!value}
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={cn(
              "px-3 py-2 cursor-pointer text-start transition-colors",
              "hover:bg-neutral-100",
              !value ? "bg-neutral-50 text-neutral-900" : "text-neutral-400",
            )}
          >
            {placeholder}
          </li>
          {options.map((option) => (
            <li
              key={option.value}
              role="option"
              aria-selected={value === option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "px-3 py-2 cursor-pointer text-start transition-colors",
                "hover:bg-neutral-100",
                value === option.value
                  ? "bg-primary-50 text-primary-700 font-medium"
                  : "text-neutral-700",
              )}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
