"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth/client";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await signOut();
        router.push("/login");
      }}
      className="self-start rounded-md border border-border px-3 py-2 text-sm"
    >
      Se déconnecter
    </button>
  );
}
