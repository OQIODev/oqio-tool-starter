"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signUp } from "@/lib/auth/client";

export function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") ?? "/dashboard";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const name = String(formData.get("name") ?? "").trim() || email.split("@")[0];

    const result =
      mode === "signin"
        ? await signIn.email({ email, password })
        : await signUp.email({ email, password, name });

    setPending(false);
    if (result.error) {
      setError(result.error.message ?? "Échec de la connexion.");
      return;
    }
    router.push(next);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {mode === "signin" ? "Connexion" : "Créer un compte"}
      </h1>

      <form action={onSubmit} className="flex flex-col gap-3">
        {mode === "signup" && (
          <input
            name="name"
            placeholder="Nom"
            autoComplete="name"
            className="rounded-md border border-border bg-transparent px-3 py-2"
          />
        )}
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          autoComplete="email"
          className="rounded-md border border-border bg-transparent px-3 py-2"
        />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Mot de passe (8 caractères min.)"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          className="rounded-md border border-border bg-transparent px-3 py-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-3 py-2 font-medium text-white disabled:opacity-50"
        >
          {pending ? "…" : mode === "signin" ? "Se connecter" : "Créer le compte"}
        </button>
      </form>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="text-sm text-muted underline"
      >
        {mode === "signin" ? "Pas de compte ? En créer un" : "J'ai déjà un compte"}
      </button>
    </main>
  );
}
