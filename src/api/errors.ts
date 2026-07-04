// Single place that turns any failure into a warm, human message.
// No status codes, stack traces, or blame ever reach the UI.
export class ApiError extends Error {
  status: number;
  friendly: string;
  constructor(status: number, friendly: string, message?: string) {
    super(message ?? friendly);
    this.name = 'ApiError';
    this.status = status;
    this.friendly = friendly;
  }
}

export function toFriendly(status: number, kind: 'network' | 'http'): string {
  if (kind === 'network' || status === 0) {
    return "Can't reach Lahza right now. Check your connection and pull to retry.";
  }
  switch (status) {
    case 400:
      return "Something in that request didn't look right. Give it another go.";
    case 401:
      return 'Please sign in to continue.';
    case 403:
      return "You don't have access to that.";
    case 404:
      return "We couldn't find that.";
    case 409:
      return 'That already exists.';
    case 422:
      return 'Please check the details and try again.';
    case 503:
      return "That feature isn't switched on for this event yet.";
    default:
      return status >= 500
        ? 'Lahza is having a moment on our end. Please try again shortly.'
        : 'Something went off-script. Please try again.';
  }
}
