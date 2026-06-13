import { cn } from "../../utils/cn";

export function Spinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "w-6 h-6 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
    xl: "w-20 h-20 border-4",
  };

  return (
    <div className="w-screen flex h-screen items-center justify-center">
      <div
        className={cn(
          "animate-spin rounded-full border-primary-500 border-t-transparent",
          sizes[size],
          className,
        )}
      />
    </div>
  );
}
