import type { LucideIcon } from "lucide-react";

export interface CategoryNavItem {
  id: string | number;
  name: string;
  icon?: LucideIcon;
  slug?: string | number;
}
