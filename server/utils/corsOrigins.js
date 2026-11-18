// localhost, loopback, and private RFC 1918 LAN ranges (any port)
const LOCAL_OR_LAN_ORIGIN =
  /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\]|(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}))(?::\d+)?$/;

export function isAllowedCorsOrigin(origin) {
  if (!origin) return true;
  if (LOCAL_OR_LAN_ORIGIN.test(origin)) return true;

  const allowed = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return allowed.includes(origin);
}
