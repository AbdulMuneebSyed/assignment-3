import { ironSession } from 'iron-session/edge';

const cookieName = process.env.IRON_SESSION_COOKIE_NAME || 'meraevent_session';

export function getSessionOptions() {
  return {
    cookieName,
    password: process.env.IRON_SESSION_PASSWORD || 'fallback_password_which_should_be_overridden_in_env',
    ttl: 60 * 60 * 24 * 7, // 7 days
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
  };
}

export function getEdgeSession(request, response) {
  return ironSession(request, response, getSessionOptions());
}
