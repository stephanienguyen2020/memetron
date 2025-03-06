import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

// Define the menu item type
export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

interface NavigationMenuProps {
  items: NavItem[];
}

export function NavigationMenu({ items }: NavigationMenuProps) {
  return (
    <nav className="relative z-10 flex items-center justify-center">
      <ul className="flex items-center gap-8">
        {items.map((item) => (
          <li key={item.label}>
            <NavigationMenuItem item={item} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

interface NavigationMenuItemProps {
  item: NavItem;
}

export function NavigationMenuItem({ item }: NavigationMenuItemProps) {
  const { label, href, icon: Icon } = item;
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "text-sm transition-colors",
        isActive
          ? "text-white font-medium"
          : "text-white/80 hover:text-white hover:glow"
      )}
    >
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {label}
    </Link>
  );
}

// Add global style for glow effect
const globalStyles = `
  .hover\\:glow:hover {
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  }
`;

// Export the global styles
export { globalStyles };
