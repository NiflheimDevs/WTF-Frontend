import {
  LayoutDashboard,
  List,
  MapPin,
  Settings,
} from "lucide-react";

export const DISPATCHER_NAV_ITEMS = [
  {
    id: "overview",
    icon: LayoutDashboard,
    path: "/dispatcher",
  },
  {
    id: "requests",
    icon: List,
    path: "/dispatcher/requests",
  },
  {
    id: "regions",
    icon: MapPin,
    path: "/dispatcher/regions",
  },
  {
    id: "settings",
    icon: Settings,
    path: "/dispatcher/settings",
  },
];
