import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/session";
import { SignOutButton } from "./sign-out-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Vérification réelle côté serveur — le proxy n'est qu'un filtre optimiste.
  const user = await getAuthUser();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-muted">
        Connecté en tant que <strong className="text-fg">{user.email}</strong>.
      </p>
      <SignOutButton />
    </main>
  );
}
