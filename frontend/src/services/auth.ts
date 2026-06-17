import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../Firebase/Firebase";

let authReady = false;
let readyPromise: Promise<void> | null = null;

/**
 * Resolve once Firebase has restored the initial auth state on page load.
 * We keep the listener subscribed for the app's lifetime so that
 * `auth.currentUser` always reflects the *live* signed-in user — sign-outs and
 * account switches are picked up immediately instead of being cached.
 */
function whenAuthReady(): Promise<void> {
  if (authReady) return Promise.resolve();
  if (readyPromise) return readyPromise;
  readyPromise = new Promise<void>((resolve) => {
    onAuthStateChanged(auth, () => {
      if (!authReady) {
        authReady = true;
        resolve();
      }
    });
  });
  return readyPromise;
}

/** The currently signed-in user (always live, never stale). */
export async function getCurrentUser(): Promise<User | null> {
  await whenAuthReady();
  return auth.currentUser;
}

/** Build the X-Firebase-Uid header for authenticated API calls. */
export async function authHeader(): Promise<Record<string, string>> {
  const user = await getCurrentUser();
  if (!user) return {};
  return { "X-Firebase-Uid": user.uid };
}
