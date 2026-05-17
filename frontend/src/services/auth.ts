import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../Firebase/Firebase";

let resolved: { user: User | null } | null = null;
let pending: Promise<User | null> | null = null;

/** Resolve once Firebase has settled the initial auth state. */
export function getCurrentUser(): Promise<User | null> {
  if (resolved) return Promise.resolve(resolved.user);
  if (pending) return pending;
  pending = new Promise<User | null>((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      resolved = { user };
      unsub();
      resolve(user);
    });
  });
  return pending;
}

/** Build the X-Firebase-Uid header for authenticated API calls. */
export async function authHeader(): Promise<Record<string, string>> {
  const user = await getCurrentUser();
  if (!user) return {};
  return { "X-Firebase-Uid": user.uid };
}
