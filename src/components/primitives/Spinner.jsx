import { cn } from "../../utils/cn";

export function Spinner({ size = "md", className = "", fullScreen = true }) {
  const sizes = {
    sm: "w-6 h-6 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
    xl: "w-20 h-20 border-4",
  };

  const spinner = (
    <div
      className={cn(
        "animate-spin rounded-full border-primary-500 border-t-transparent",
        sizes[size],
        className,
      )}
    />
  );

  if (!fullScreen) {
    return (
      <div className="flex items-center justify-center py-20">{spinner}</div>
    );
  }

  return (
    <div className="w-screen flex h-screen items-center justify-center">
      {spinner}
    </div>
  );
}
