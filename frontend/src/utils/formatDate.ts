export function formatTime(date: Date | string): string {
  try {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function formatDateTime(date: Date | string): string {
  try {
    return new Date(date).toLocaleString("vi-VN");
  } catch {
    return "";
  }
}
