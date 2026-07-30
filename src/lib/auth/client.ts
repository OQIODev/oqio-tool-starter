import { createAuthClient } from "better-auth/react";

/** Client auth côté navigateur : signIn, signUp, signOut, useSession. */
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
