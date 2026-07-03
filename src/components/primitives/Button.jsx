import { forwardRef } from "react";
import { cn } from "../../utils/cn";

export const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      fullWidth = false,
      icon: Icon,
      iconPosition = "left",
      onClick,
      className = "",
      type = "button",
      ...props
    },
    ref,
  ) => {
    const variants = {
      primary:
        "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
      secondary:
        "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-200",
      ghost:
        "bg-transparent dark:bg-neutral-700 text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200",
      danger:
        "bg-danger-bg text-danger-fg hover:bg-danger-bg/80 active:bg-danger-bg/90",
      success:
        "bg-success-bg text-success-fg hover:bg-success-bg/80 active:bg-success-bg/90",
      warning:
        "bg-warning-bg text-warning-fg hover:bg-warning-bg/80 active:bg-warning-bg/90",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2",
      xl: "h-14 px-8 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-semibold font-sans transition-all duration-200 cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {Icon && iconPosition === "left" && !loading && (
          <Icon size={size === "sm" ? 14 : size === "md" ? 16 : 18} />
        )}
        {children}
        {Icon && iconPosition === "right" && !loading && (
          <Icon size={size === "sm" ? 14 : size === "md" ? 16 : 18} />
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
