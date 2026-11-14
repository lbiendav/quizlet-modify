import Link from "next/link";

import { Button } from "@acme/ui/button";

export default function AuthErrorPage() {
  return (
    <section className="mx-auto flex max-w-lg flex-col items-center gap-4 py-20 text-center">
      <h1 className="text-3xl font-semibold">Sign-in not completed</h1>
      <p className="text-muted-foreground">
        Your account was not connected. You can return home and try signing in
        again whenever you are ready.
      </p>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </section>
  );
}
