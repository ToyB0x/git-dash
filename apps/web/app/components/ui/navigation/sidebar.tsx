import { cx, focusRing } from "@/lib/utils";
import { siteConfig } from "@/siteConfig";
import {
  RiAccountCircleLine,
  RiBugLine,
  RiCoinLine,
  RiGitRepositoryLine,
  RiHome2Line,
  RiKey2Line,
  RiLinkM,
} from "@remixicon/react";
import { Link, useLocation } from "react-router";
import MobileSidebar from "./MobileSidebar";
import {
  WorkspacesDropdownDesktop,
  WorkspacesDropdownMobile,
} from "./SidebarWorkspacesDropdown";
import { UserProfileDesktop, UserProfileMobile } from "./UserProfile";

const navigation = [
  { name: "Overview", href: siteConfig.baseLinks.overview, icon: RiHome2Line },
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
    name: "Users",
    href: siteConfig.baseLinks.users,
    icon: RiAccountCircleLine,
  },
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
  {
    name: "Payments",
    href: siteConfig.baseLinks.cost,
    icon: RiCoinLine,
  },
  {
    name: "Vulnerabilities",
    href: siteConfig.baseLinks.vulns,
    icon: RiBugLine,
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

export function Sidebar({
  email,
  workspaces,
}: {
  email: string;
  workspaces: {
    id: string;
    displayName: string;
    role: string;
  }[];
}) {
  const { pathname } = useLocation();
  const isActive = (itemHref: string) => {
    return pathname.split("/")[2] === itemHref;
  };
  return (
    <>
      {/* sidebar (lg+) */}
      <nav className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <aside className="flex grow flex-col gap-y-6 overflow-y-auto border-r border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <WorkspacesDropdownDesktop workspaces={workspaces} />
          <nav
            aria-label="core navigation links"
            className="flex flex-1 flex-col space-y-10"
          >
            <ul className="space-y-0.5">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cx(
                      isActive(item.href)
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-gray-700 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-50",
                      "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition hover:bg-gray-100 hover:dark:bg-gray-900",
                      focusRing,
                    )}
                  >
                    <item.icon className="size-4 shrink-0" aria-hidden="true" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div>
              <span className="text-xs font-medium leading-6 text-gray-500">
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
                        "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition hover:bg-gray-100 hover:dark:bg-gray-900",
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
          <div className="mt-auto">
            <UserProfileDesktop email={email} />
          </div>
        </aside>
      </nav>
      {/* top navbar (xs-lg) */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-2 shadow-sm sm:gap-x-6 sm:px-4 lg:hidden dark:border-gray-800 dark:bg-gray-950">
        <WorkspacesDropdownMobile workspaces={workspaces} />
        <div className="flex items-center gap-1 sm:gap-2">
          <UserProfileMobile />
          <MobileSidebar />
        </div>
      </div>
    </>
  );
}
