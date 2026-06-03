import { cn } from "../../utils/cn";

export function Card({
  children,
  className = "",
  padding = true,
  hover = false,
  ...props
}) {
  return (
    <div
      className={cn(
        "bg-neutral-50 border border-neutral-200 rounded-lg",
        padding && "p-6",
        hover &&
          "transition-all duration-200 hover:shadow-card hover:border-neutral-300 cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <h3 className={cn("text-sm font-semibold text-neutral-700", className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={cn("", className)}>{children}</div>;
}
