import Image from "next/image";
import Link from "next/link";

import type { Session } from "@acme/auth";

import CreateOptionsDropdown from "./create-options-dropdown";
import MobileMenu from "./mobile-menu";
import SignInButton from "./sign-in-button";
import UserDropdown from "./user-dropdown";

const Navbar = ({ session }: { session: Session | null }) => {
  return (
    <header className="border-b">
      <div className="mx-auto grid h-16 w-full max-w-screen-2xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-6 md:px-10">
        <div className="flex h-full min-w-0 items-center gap-3">
          <MobileMenu session={session} />
          <Link href="/" className="hidden shrink-0 md:block">
            <Image src="/logo.svg" alt="logo" width={110} height={24} />
          </Link>
          <CreateOptionsDropdown session={session} />
        </div>

        <p className="pointer-events-none hidden whitespace-nowrap text-xs font-medium text-muted-foreground md:block lg:text-sm">
          Để nắm hết từ vựng N5, N4, N3 cần{" "}
          <span className="rainbow-text font-bold">5.000</span> từ
        </p>

        <div className="flex min-w-0 items-center justify-end">
          {session ? <UserDropdown user={session.user} /> : <SignInButton />}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
