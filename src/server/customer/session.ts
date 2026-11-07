import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createCustomerSessionToken,
  CUSTOMER_SESSION_COOKIE,
  CUSTOMER_SESSION_MAX_AGE_SECONDS,
  CUSTOMER_SESSION_SHORT_SECONDS,
  verifyCustomerSessionToken,
  type CustomerSession,
} from "./session-token";

export type { CustomerSession };

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const store = await cookies();
  return verifyCustomerSessionToken(store.get(CUSTOMER_SESSION_COOKIE)?.value);
}

export async function requireCustomerPage(): Promise<CustomerSession> {
  const session = await getCustomerSession();
  if (!session) redirect("/account/login");
  return session;
}

export async function startCustomerSession(id: string, passwordHash: string, remember = true): Promise<void> {
  const maxAge = remember ? CUSTOMER_SESSION_MAX_AGE_SECONDS : CUSTOMER_SESSION_SHORT_SECONDS;
  const store = await cookies();
  store.set(CUSTOMER_SESSION_COOKIE, await createCustomerSessionToken(id, passwordHash, maxAge), {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember ? { maxAge } : {}),
  });
}

export async function endCustomerSession(): Promise<void> {
  const store = await cookies();
  store.delete(CUSTOMER_SESSION_COOKIE);
}
