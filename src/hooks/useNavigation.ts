import { DISCORD, DOCS, RISE, X } from "@/lib/url";

export type NavigationItem = {
  id: string;
  label: string;
  path: string;
  isDisabled: boolean;
  icon?: string;
};

export type Navigation = NavigationItem & {
  subMenu?: NavigationItem[];
};

export function useNavigation() {
  const navItems: Navigation[] = [
    {
      id: "home",
      label: "Demo",
      path: "/",
      isDisabled: false,
      icon: "/icons/buttons/home.svg",
    },
  ];

  const footerItems: Navigation[] = [
    {
      id: "rise",
      label: "RISE",
      path: RISE,
      isDisabled: false,
    },
    {
      id: "docs",
      label: "Docs",
      path: DOCS,
      isDisabled: false,
    },
    {
      id: "x",
      label: "X",
      path: X,
      isDisabled: false,
    },
    {
      id: "discord",
      label: "Discord",
      path: DISCORD,
      isDisabled: false,
    },
  ];

  return { navItems, footerItems };
}
