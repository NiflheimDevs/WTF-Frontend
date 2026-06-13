import { useLocation } from "react-router-dom";

export function useRouteType() {
  const { pathname } = useLocation();

  const isDispatcherRoute = pathname.startsWith("/dispatcher");
  const isAuthRoute = pathname.startsWith("/dispatcher/login");
  const isPublicRoute = !isDispatcherRoute;

  return {
    isDispatcherRoute,
    isAuthRoute,
    isPublicRoute,
    isDashboardRoute: isDispatcherRoute && !isAuthRoute,
  };
}
