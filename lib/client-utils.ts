// Utility to format date as relative time (e.g., '2 hours ago')
export function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  let diff = (now.getTime() - date.getTime()) / 1000; // seconds
  if (isNaN(diff) || diff < 1) return 'just now';
  diff = Math.round(diff); // round to nearest second
  if (diff < 60) {
    return `${diff} second${diff === 1 ? '' : 's'} ago`;
  }
  if (diff < 3600) {
    const m = Math.round(diff / 60);
    return `${m} minute${m === 1 ? '' : 's'} ago`;
  }
  if (diff < 86400) {
    const h = Math.round(diff / 3600);
    return `${h} hour${h === 1 ? '' : 's'} ago`;
  }
  if (diff < 2592000) {
    const d = Math.round(diff / 86400);
    return `${d} day${d === 1 ? '' : 's'} ago`;
  }
  if (diff < 31536000) {
    const mo = Math.round(diff / 2592000);
    return `${mo} month${mo === 1 ? '' : 's'} ago`;
  }
  const y = Math.round(diff / 31536000);
  return `${y} year${y === 1 ? '' : 's'} ago`;
}
