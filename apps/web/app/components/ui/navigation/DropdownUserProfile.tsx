import { auth } from "@/clients";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSubMenu,
  DropdownMenuSubMenuContent,
  DropdownMenuSubMenuTrigger,
  DropdownMenuTrigger,
} from "@/components/Dropdown";
import {
  RiArrowRightUpLine,
  RiComputerLine,
  RiMoonLine,
  RiSunLine,
} from "@remixicon/react";
import { signOut } from "firebase/auth";
import { useTheme } from "next-themes";
import type * as React from "react";
import { useEffect, useState } from "react";

export type DropdownUserProfileProps = {
  children: React.ReactNode;
  align?: "center" | "start" | "end";
};

export function DropdownUserProfile({
  children,
  align = "start",
}: DropdownUserProfileProps) {
  const [mounted, setMounted] = useState(false);

  const { theme, setTheme } = useTheme();

  // ref: https://azukiazusa.dev/blog/tailwind-css-dark-mode-system-light-dark/
  const handleThemeChange = (value: string) => {
    setTheme(value);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align={align}>
          <DropdownMenuGroup>
            <DropdownMenuSubMenu>
              <DropdownMenuSubMenuTrigger>Theme</DropdownMenuSubMenuTrigger>
              <DropdownMenuSubMenuContent>
                <DropdownMenuRadioGroup
                  value={theme}
                  onValueChange={handleThemeChange}
                >
                  <DropdownMenuRadioItem
                    aria-label="Switch to Light Mode"
                    value="light"
                    iconType="check"
                  >
                    <RiSunLine className="size-4 shrink-0" aria-hidden="true" />
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    aria-label="Switch to Dark Mode"
                    value="dark"
                    iconType="check"
                  >
                    <RiMoonLine
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    aria-label="Switch to System Mode"
                    value="system"
                    iconType="check"
                  >
                    <RiComputerLine
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubMenuContent>
            </DropdownMenuSubMenu>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              Changelog
              <RiArrowRightUpLine
                className="mb-1 ml-1 size-2.5 shrink-0 text-gray-500"
                aria-hidden="true"
              />
            </DropdownMenuItem>
            <DropdownMenuItem>
              Documentation
              <RiArrowRightUpLine
                className="mb-1 ml-1 size-2.5 shrink-0 text-gray-500"
                aria-hidden="true"
              />
            </DropdownMenuItem>
            <DropdownMenuItem>
              Join Slack community
              <RiArrowRightUpLine
                className="mb-1 ml-1 size-2.5 shrink-0 text-gray-500"
                aria-hidden="true"
              />
            </DropdownMenuItem>
            <DropdownMenuItem>
              <a
                href="https://github.com/ToyB0x/git-dash"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center"
              >
                Contribution
                <RiArrowRightUpLine
                  className="mb-1 ml-1 size-2.5 shrink-0 text-gray-500"
                  aria-hidden="true"
                />
              </a>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={async () => {
                await signOut(auth);
                location.pathname = "/login";
              }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
