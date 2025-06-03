"use client";

import { cn } from "@/lib/utils";
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Separator,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@components/ui";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  useSidebar,
} from "@components/ui/sidebar";
import { NavigationItem, useNavigation } from "@hooks/useNavigation";
import { ChevronDown, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { HTMLAttributes } from "react";

import Image from "next/image";
import Link from "next/link";

type SideBarItemProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  icon?: string;
};

export function SideBarItem(props: Readonly<SideBarItemProps>) {
  const { label, className, icon, ...divProps } = props;

  return (
    <>
      <div
        className={cn(
          "shadow-md p-3 rounded-md h-10 flex items-center bg-button-bg-accent/10",
          "group-[.active]:bg-linear-to-b from-teal-200 from-0% via-lime-200 via-50% to-yellow-200 to-100%",
          className
        )}
        {...divProps}
      >
        <Avatar className="w-4 h-4 group-[.active]:brightness-0">
          <AvatarImage src={icon} />
          <AvatarFallback>{label.substring(0, 1)}</AvatarFallback>
        </Avatar>
      </div>
      {label}
    </>
  );
}

type SideBarButtonProps = NavigationItem & {
  isActive?: boolean;
  hideIcon?: boolean;
};

export function SideBarButton(props: Readonly<SideBarButtonProps>) {
  const { id, label, path, isActive, hideIcon = false, icon } = props;
  const { state: sideBarState, isMobile, toggleSidebar } = useSidebar();
  const router = useRouter();

  return (
    <Button
      key={id}
      variant="ghost"
      className={cn(
        "text-base justify-start w-full h-fit p-2",
        isActive && "hover:bg-accent bg-accent text-foreground group active"
      )}
      onClick={(event) => {
        router.push(path);
        event.stopPropagation();

        if (isMobile && sideBarState === "expanded") {
          toggleSidebar();
        }
      }}
    >
      {!hideIcon ? <SideBarItem label={label} icon={icon} /> : label}
    </Button>
  );
}

export function SideBar() {
  const { theme, setTheme } = useTheme();
  const { footerItems, navItems } = useNavigation();
  const { state: sideBarState, isMobile, toggleSidebar } = useSidebar();

  const state = isMobile ? "expanded" : sideBarState;

  const pathName = usePathname();
  const router = useRouter();

  function isMenuActive(id: string, isHome?: boolean) {
    const pathLevel = pathName.match(/\//gm)?.length ?? 0;
    const menuLevel = id.match(/\//gm)?.length ?? 0;

    if (pathLevel === 1) {
      return pathName === id;
    } else {
      const pathList = pathName.replace(/(?:^\/)|(?:\/$)/g, "").split("/");

      const parent = `/${pathList[pathLevel - (menuLevel + 1)]}`;
      const isParentSelected = parent === id;

      return (!!isParentSelected && !isHome) || pathName === id;
    }
  }

  function getRiseLogo() {
    if (state === "collapsed") {
      return `/icons/rise-logo-dark.svg`;
    } else {
      return theme === "light" // doesnt work with dynamic theme
        ? "/icons/rise-light.svg"
        : "/icons/rise-dark.svg";
    }
  }

  return (
    <Sidebar
      collapsible="icon"
      data-state={state}
      className="p-3 data-[state=expanded]:pr-0 data-[state=collapsed]:rounded-r-none data-[state=collapsed]:border-r border-border/25 border-solid"
    >
      <SidebarHeader
        data-state={state}
        className={cn("p-4 data-[state=collapsed]:p-1 group peer")}
      >
        <div data-state={state} className="flex gap-2 items-center group peer">
          <Image
            src={getRiseLogo()}
            alt="RISE Logo"
            width={60}
            height={20}
            priority
          />
          <div className="flex gap-2 group-data-[state=collapsed]:hidden">
            <p className="text-base font-headline">Testnet</p>
            <Image
              src={
                theme === "light"
                  ? "/icons/code-light.svg"
                  : "/icons/code-dark.svg"
              }
              alt="Deployment Code Logo"
              width={14}
              height={14}
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent
        data-state={state}
        className="p-4 group-data-[state=collapsed]:p-0 space-y-10 group cursor-pointer"
        onClick={() => {
          toggleSidebar();
        }}
      >
        {/* COLLAPSED NAVIGATION */}
        <div className="group-data-[state=expanded]:hidden space-y-2 pt-4">
          {navItems.map((item) => {
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "text-base bg-accent justify-center w-full h-fit p-2",
                  "shadow-lg rounded-md h-10 w-full group",
                  "from-teal-200 from-0% via-lime-200 via-50% to-yellow-200 to-100%",
                  isMenuActive(item.path) && "bg-linear-to-b active"
                )}
                onClick={(event) => {
                  router.push(item.path);
                  event.stopPropagation();
                }}
              >
                <Image
                  src={`/icons/buttons/${item.id}.svg`}
                  width={24}
                  height={24}
                  alt={item.label}
                  className="group-[.active]:brightness-0 brightness-0 dark:invert-100 dark:group-[.active]:invert-0"
                  priority
                />
              </Button>
            );
          })}
        </div>

        {/* EXPANDED NAVIGATION */}
        <div className="group-data-[state=collapsed]:hidden">
          {navItems.map((item) => {
            return item.subMenu ? (
              <Collapsible
                key={item.id}
                defaultOpen
                className="group/collapsible"
              >
                <SidebarGroup>
                  <SidebarGroupLabel
                    asChild
                    className={cn(
                      "p-0 text-base justify-start w-full font-normal text-sidebar-foreground",
                      isMenuActive(item.path) && "text-foreground group active"
                    )}
                  >
                    <CollapsibleTrigger
                      className="h-fit"
                      onClick={(event) => {
                        router.push(item.path);
                        event.stopPropagation();

                        if (isMobile && sideBarState === "expanded") {
                          toggleSidebar();
                        }
                      }}
                    >
                      <SideBarItem
                        id={item.id}
                        label={item.label}
                        className="mr-2"
                        icon={item.icon}
                      />
                      <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                    <SidebarGroupContent className="pl-10">
                      {item.subMenu.map((subItem, index) => {
                        return (
                          <SideBarButton
                            key={subItem.id}
                            hideIcon
                            isActive={isMenuActive(subItem.path, index === 0)}
                            {...subItem}
                          />
                        );
                      })}
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            ) : (
              <SideBarButton
                key={item.id}
                isActive={isMenuActive(item.path)}
                {...item}
              />
            );
          })}
        </div>
      </SidebarContent>
      <SidebarFooter
        data-state={state}
        className="p-4 group peer-data-[state=collapsed]:px-0 flex flex-row peer-data-[state=collapsed]:flex-col"
      >
        {footerItems.map((item) => {
          return (
            <div key={item.id} className="flex gap-3 items-center">
              <Button
                asChild
                variant="link"
                className="h-fit w-fit p-0 text-xs group-data-[state=collapsed]:text-invert text-foreground"
              >
                <Link href={item.path} target="_blank">
                  {item.label}
                </Link>
              </Button>
              <Separator
                orientation="vertical"
                className={cn(state === "collapsed" && "hidden")}
              />
            </div>
          );
        })}

        <div className="flex items-center justify-start">
          <Button
            asChild
            variant="ghost"
            className="h-fit p-0 "
            onClick={() => {
              setTheme(theme === "light" ? "dark" : "light");
            }}
          >
            {theme === "light" ? (
              <MoonIcon
                data-state={state}
                color={
                  state === "collapsed"
                    ? "var(--gray-contrast)"
                    : "var(--gray-12)"
                }
                className="h-4 w-4"
              />
            ) : (
              <SunIcon data-state={state} className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
