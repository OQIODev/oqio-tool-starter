import Link from "next/link";
import { getAuthUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getAuthUser();

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-6 px-6">
      <h1 className="text-3xl font-semibold tracking-tight">OQIO Tool Starter</h1>
      <p className="text-muted">
        Squelette prêt à l&apos;emploi. Remplace cette page par l&apos;outil décrit dans{" "}
        <code className="rounded bg-border/50 px-1.5 py-0.5 text-sm">SPEC.md</code>.
      </p>
      <div>
        {user ? (
          <Link href="/dashboard" className="text-accent underline">
            Aller au dashboard ({user.email})
          </Link>
        ) : (
          <Link href="/login" className="text-accent underline">
            Se connecter
          </Link>
        )}
      </div>
    </main>
  );
}
