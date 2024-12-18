import { Button } from "@/components/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/Dialog";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import type { ReactNode } from "react";
import { useParams } from "react-router";

export type ModalProps = {
  children: ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
};

export function ModalAddWorkspace({
  children,
  className,
  onOpenChange,
}: ModalProps) {
  const { workspaceId } = useParams();
  const isDemo = workspaceId === "demo";

  return (
    <>
      <Dialog onOpenChange={onOpenChange}>
        <DialogTrigger className={className}>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <form>
            <DialogHeader>
              <DialogTitle>Add new workspace</DialogTitle>
              <DialogDescription className="mt-1 text-sm leading-6">
                With free plan, you can add up to 10 workspaces.
              </DialogDescription>
              <div className="mt-6">
                <Label htmlFor="workspace-name" className="font-medium">
                  Workspace name
                </Label>
                <Input
                  id="workspace-name"
                  name="workspace-name"
                  placeholder="my_workspace"
                  className="mt-2"
                />
              </div>
            </DialogHeader>
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button
                  className="mt-2 w-full sm:mt-0 sm:w-fit"
                  variant="secondary"
                >
                  Go back
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  type="submit"
                  className="w-full sm:w-fit"
                  disabled={isDemo}
                >
                  Add workspace
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
