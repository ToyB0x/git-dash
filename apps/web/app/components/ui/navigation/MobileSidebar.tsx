import { Button } from "@/components/Button";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/Drawer";
import { cx, focusRing } from "@/lib/utils";
import { siteConfig } from "@/siteConfig";
import {
  RiAccountCircleLine,
  RiCoinLine,
  RiGitRepositoryLine,
  RiHome2Line,
  RiKey2Line,
  RiLinkM,
  RiMenuLine,
} from "@remixicon/react";
import { Link, useLocation } from "react-router";

const navigation = [
  { name: "Overview", href: siteConfig.baseLinks.overview, icon: RiHome2Line },
  {
    name: "Cost",
    href: siteConfig.baseLinks.cost,
    icon: RiCoinLine,
  },
  {
    name: "Users",
    href: siteConfig.baseLinks.users,
    icon: RiAccountCircleLine,
  },
  // {
  //   name: "Overview (v2)",
  //   href: siteConfig.baseLinks.overview2,
  //   icon: RiLineChartLine,
  // },
  // { name: "PRs", href: siteConfig.baseLinks.prs, icon: RiCodeSSlashLine },
  // {
  //   name: "Reviews",
  //   href: siteConfig.baseLinks.reviews,
  //   icon: RiChatCheckLine,
  // },
  // {
  //   name: "Releases",
  //   href: siteConfig.baseLinks.releases,
  //   icon: RiArrowUpCircleLine,
  // },
  {
    name: "Repositories",
    href: siteConfig.baseLinks.repositories,
    icon: RiGitRepositoryLine,
  },
  {
    name: "Four Keys",
    href: siteConfig.baseLinks.fourkeys,
    icon: RiKey2Line,
  },
  // {
  //   name: "Settings",
  //   href: siteConfig.baseLinks.settings,
  //   icon: RiSettings5Line,
  // },
] as const;

const shortcuts = [
  // {
  //   name: "Add new user",
  //   href: "#",
  //   icon: RiLinkM,
  // },
  {
    name: "Settings",
    href: "settings/members",
    icon: RiLinkM,
  },
  // {
  //   name: "Add Analytics",
  //   href: "#",
  //   icon: RiLinkM,
  // },
] as const;

export default function MobileSidebar() {
  const { pathname } = useLocation();

  const isActive = (itemHref: string) => {
    // if (itemHref === siteConfig.baseLinks.settings) {
    //   return pathname.startsWith("/settings");
    // }
    return pathname === itemHref || pathname.startsWith(itemHref);
  };
  return (
    <>
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            aria-label="open sidebar"
            className="group flex items-center rounded-md p-2 text-sm font-medium hover:bg-gray-100 data-[state=open]:bg-gray-100 data-[state=open]:bg-gray-400/10 hover:dark:bg-gray-400/10"
          >
            <RiMenuLine
              className="size-6 shrink-0 sm:size-5"
              aria-hidden="true"
            />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="sm:max-w-lg">
          <DrawerHeader>
            <DrawerTitle>My workspace</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <nav
              aria-label="core mobile navigation links"
              className="flex flex-1 flex-col space-y-10"
            >
              <ul className="space-y-1.5">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <DrawerClose asChild>
                      <Link
                        to={item.href}
                        className={cx(
                          isActive(item.href)
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-50",
                          "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-base font-medium transition hover:bg-gray-100 sm:text-sm hover:dark:bg-gray-900",
                          focusRing,
                        )}
                      >
                        <item.icon
                          className="size-5 shrink-0"
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </DrawerClose>
                  </li>
                ))}
              </ul>
              <div>
                <span className="text-sm font-medium leading-6 text-gray-500 sm:text-xs">
                  {/*Shortcuts*/}
                  Manage
                </span>
                <ul aria-label="shortcuts" className="space-y-0.5">
                  {shortcuts.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={cx(
                          isActive(item.href)
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-gray-700 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-50",
                          "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 font-medium transition hover:bg-gray-100 sm:text-sm hover:dark:bg-gray-900",
                          focusRing,
                        )}
                      >
                        <item.icon
                          className="size-4 shrink-0"
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
