// Backend base URL. Must be reachable from the PHONE (LAN IP or tunnel), not localhost.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';
