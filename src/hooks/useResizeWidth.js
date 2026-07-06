import { useEffect, useRef, useState } from "react";

// Tracks the rendered width of an element so SVG charts can render at the
// correct pixel size (crisp text + responsive layout) instead of relying on a
// stretched viewBox. Returns [ref, width]; width is 0 until first measure.
export function useResizeWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const update = () => setWidth(el.clientWidth);
    update();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return [ref, width];
}
