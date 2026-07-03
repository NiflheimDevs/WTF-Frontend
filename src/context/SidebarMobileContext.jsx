import { createContext, useCallback, useContext, useMemo, useState } from "react";

const SidebarMobileContext = createContext(null);

export function SidebarMobileProvider({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = useCallback(() => setMobileOpen((open) => !open), []);
  const close = useCallback(() => setMobileOpen(false), []);

  const value = useMemo(
    () => ({ mobileOpen, toggle, close }),
    [mobileOpen, toggle, close],
  );

  return (
    <SidebarMobileContext.Provider value={value}>
      {children}
    </SidebarMobileContext.Provider>
  );
}

export function useSidebarMobile() {
  return useContext(SidebarMobileContext);
}
