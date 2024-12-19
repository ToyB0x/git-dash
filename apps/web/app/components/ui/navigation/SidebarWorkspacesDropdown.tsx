import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/Dropdown";
import { cx, focusInput } from "@/lib/utils";
import { RiArrowRightSLine, RiExpandUpDownLine } from "@remixicon/react";
import React from "react";
import { Link, useParams } from "react-router";
import { ModalAddWorkspace } from "./ModalAddWorkspace";

export const WorkspacesDropdownDesktop = ({
  workspaces = [],
}: {
  workspaces: {
    id: string;
    displayName: string;
    role: string;
  }[];
}) => {
  const { workspaceId: currentWorkspaceId } = useParams();

  const currentWorkspace = workspaces.find(
    (workspace) => workspace.id === currentWorkspaceId,
  );

  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [hasOpenDialog, setHasOpenDialog] = React.useState(false);
  const dropdownTriggerRef = React.useRef<null | HTMLButtonElement>(null);
  const focusRef = React.useRef<null | HTMLButtonElement>(null);

  const handleDialogItemSelect = () => {
    focusRef.current = dropdownTriggerRef.current;
  };

  const handleDialogItemOpenChange = (open: boolean) => {
    setHasOpenDialog(open);
    if (open === false) {
      setDropdownOpen(false);
    }
  };

  return (
    <>
      {/* sidebar (lg+) */}
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        modal={false}
      >
        <DropdownMenuTrigger asChild>
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button
            className={cx(
              "flex w-full items-center gap-x-2.5 rounded-md border border-gray-300 bg-white p-2 text-sm shadow-sm transition-all hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 hover:dark:bg-gray-900",
              focusInput,
            )}
          >
            <span
              className="flex aspect-square size-8 items-center justify-center rounded bg-indigo-600 p-2 text-xs font-medium text-white dark:bg-indigo-500"
              aria-hidden="true"
            >
              {currentWorkspace
                ? currentWorkspace.displayName.slice(0, 2).toUpperCase()
                : " / "}
            </span>
            <div className="flex w-full items-center justify-between gap-x-4 truncate">
              <div className="truncate">
                <p className="truncate whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-50">
                  {currentWorkspace
                    ? currentWorkspace.displayName
                    : "Select workspace"}
                </p>
                <p className="whitespace-nowrap text-left text-xs text-gray-700 dark:text-gray-300">
                  {currentWorkspace ? currentWorkspace.role : ""}
                </p>
              </div>
              <RiExpandUpDownLine
                className="size-5 shrink-0 text-gray-500"
                aria-hidden="true"
              />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          hidden={hasOpenDialog}
          onCloseAutoFocus={(event) => {
            if (focusRef.current) {
              focusRef.current.focus();
              focusRef.current = null;
              event.preventDefault();
            }
          }}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              Workspaces ({workspaces.length})
            </DropdownMenuLabel>
            {workspaces.map((workspace) => (
              <DropdownMenuItem key={workspace.id}>
                <Link
                  className="flex w-full items-center gap-x-2.5"
                  to={`/${workspace.id}`}
                >
                  <span
                    className={cx(
                      // TODO: update to dynamic calculated icon color
                      "bg-indigo-600 dark:bg-indigo-500",
                      "flex aspect-square size-8 items-center justify-center rounded p-2 text-xs font-medium text-white",
                    )}
                    aria-hidden="true"
                  >
                    {workspace.displayName.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                      {workspace.displayName}
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-400">
                      {workspace.role}
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <ModalAddWorkspace
            className="w-full"
            onOpenChange={handleDialogItemOpenChange}
          >
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                handleDialogItemSelect();
              }}
            >
              Add workspace
            </DropdownMenuItem>
          </ModalAddWorkspace>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const WorkspacesDropdownMobile = ({
  workspaces,
}: {
  workspaces: {
    id: string;
    displayName: string;
    role: string;
  }[];
}) => {
  const { workspaceId: currentWorkspaceId } = useParams();
  const currentWorkspace = workspaces.find(
    (workspace) => workspace.id === currentWorkspaceId,
  );

  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [hasOpenDialog, setHasOpenDialog] = React.useState(false);
  const dropdownTriggerRef = React.useRef<null | HTMLButtonElement>(null);
  const focusRef = React.useRef<null | HTMLButtonElement>(null);

  const handleDialogItemSelect = () => {
    focusRef.current = dropdownTriggerRef.current;
  };

  const handleDialogItemOpenChange = (open: boolean) => {
    setHasOpenDialog(open);
    if (open === false) {
      setDropdownOpen(false);
    }
  };
  return (
    <>
      {/* sidebar (xs-lg) */}
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        modal={false}
      >
        <DropdownMenuTrigger asChild>
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button className="flex items-center gap-x-1.5 rounded-md p-2 hover:bg-gray-100 focus:outline-none hover:dark:bg-gray-900">
            <span
              className={cx(
                "flex aspect-square size-7 items-center justify-center rounded bg-indigo-600 p-2 text-xs font-medium text-white dark:bg-indigo-500",
              )}
              aria-hidden="true"
            >
              {currentWorkspace
                ? currentWorkspace.displayName.slice(0, 2).toUpperCase()
                : " / "}
            </span>
            <RiArrowRightSLine
              className="size-4 shrink-0 text-gray-500"
              aria-hidden="true"
            />
            <div className="flex w-full items-center justify-between gap-x-3 truncate">
              <p className="truncate whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-50">
                {currentWorkspace
                  ? currentWorkspace.displayName
                  : "Select workspace"}
              </p>
              <RiExpandUpDownLine
                className="size-4 shrink-0 text-gray-500"
                aria-hidden="true"
              />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="!min-w-72"
          hidden={hasOpenDialog}
          onCloseAutoFocus={(event) => {
            if (focusRef.current) {
              focusRef.current.focus();
              focusRef.current = null;
              event.preventDefault();
            }
          }}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              Workspaces ({workspaces.length})
            </DropdownMenuLabel>
            {workspaces.map((workspace) => (
              <DropdownMenuItem key={workspace.id}>
                <Link
                  className="flex w-full items-center gap-x-2.5"
                  to={`/${workspace.id}`}
                >
                  <span
                    className={cx(
                      // TODO: update to dynamic calculated icon color
                      "bg-indigo-600 dark:bg-indigo-500",
                      "flex size-8 items-center justify-center rounded p-2 text-xs font-medium text-white",
                    )}
                    aria-hidden="true"
                  >
                    {workspace.displayName.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                      {workspace.displayName}
                    </p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      {workspace.role}
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <ModalAddWorkspace
            className="w-full"
            onOpenChange={handleDialogItemOpenChange}
          >
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                handleDialogItemSelect();
              }}
            >
              Add workspace
            </DropdownMenuItem>
          </ModalAddWorkspace>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
