import { cookies } from "next/headers";
import { getIronSession } from "iron-session";

const sessionOptions = {
  cookieName: process.env.IRON_SESSION_COOKIE_NAME || "meraevent_session",
  password:
    process.env.IRON_SESSION_PASSWORD ||
    "fallback_password_which_should_be_overridden_in_env",
  ttl: 60 * 60 * 24 * 7,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export async function getSession() {
  const c = await cookies();
  const session = await getIronSession(c, sessionOptions);
  return session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session.user) {
    return null;
  }
  return session.user;
}
