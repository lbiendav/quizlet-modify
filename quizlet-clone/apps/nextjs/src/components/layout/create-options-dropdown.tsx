"use client";

import { useRouter } from "next/navigation";

import type { Session } from "@acme/auth";
import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";

import { useFolderDialogContext } from "~/contexts/folder-dialog-context";
import { useSignInDialogContext } from "~/contexts/sign-in-dialog-context";

const CreateOptionsDropdown = ({ session }: { session: Session | null }) => {
  const [, dispatch] = useFolderDialogContext();
  const { onOpenChange } = useSignInDialogContext();
  const router = useRouter();

  const openFolderDialog = () => {
    dispatch({ type: "open" });
  };

  const openSignInDialog = () => {
    onOpenChange(true);
  };

  const onFolderClick = () => {
    if (session) {
      openFolderDialog();
    } else {
      openSignInDialog();
    }
  };

  const onStudySetClick = () => {
    if (session) {
      router.push("/create-set");
    } else {
      openSignInDialog();
    }
  };

  return (
    <div className="hidden h-full md:block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="group/create relative h-full rounded-none px-8 before:absolute before:inset-y-0 before:left-2 before:z-10 before:w-px before:-skew-x-12 before:bg-border after:absolute after:inset-y-0 after:right-2 after:z-10 after:w-px after:-skew-x-12 after:bg-border hover:bg-transparent"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-muted/40 opacity-0 transition-opacity duration-200 [clip-path:polygon(14px_0,100%_0,calc(100%_-_14px)_100%,0_100%)] group-hover/create:opacity-100"
            />
            <span className="relative z-10">Create</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={onFolderClick}>Folder</DropdownMenuItem>
          <DropdownMenuItem onClick={onStudySetClick}>
            Study set
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CreateOptionsDropdown;
