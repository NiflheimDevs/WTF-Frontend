import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";

export function RouteProgressBar() {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  const [state, setState] = useState("idle");
  const timeouts = useRef([]);

  const clearTimeouts = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  }, []);

  const schedule = useCallback(
    (fn, ms) => {
      timeouts.current.push(setTimeout(fn, ms));
    },
    [],
  );

  useEffect(() => {
    if (prevPath.current === location.pathname) return;
    prevPath.current = location.pathname;

    clearTimeouts();
    setState("loading");

    schedule(() => setState("complete"), 500);
    schedule(() => setState("idle"), 800);

    return clearTimeouts;
  }, [location.pathname, clearTimeouts, schedule]);

  if (state === "idle") return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[100] h-[3px] pointer-events-none">
      <div
        className={cn(
          "h-full rounded-e-full",
          "bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600",
          state === "loading" && "animate-progress-bar",
          state === "complete" &&
            "w-full transition-[width] duration-200 ease-out",
        )}
        style={{
          boxShadow: "0 0 8px var(--color-primary-400)",
          opacity: state === "complete" ? 0 : 1,
          transition:
            state === "complete"
              ? "opacity 300ms ease-out, width 200ms ease-out"
              : undefined,
        }}
      />
    </div>
  );
}
