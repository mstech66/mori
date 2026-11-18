/**
 * Browser-aware date & time formatting utilities.
 * Uses native Intl and toLocale* APIs with undefined locale to automatically
 * adopt the user's browser language, date order, and 12h/24h preference.
 */

// Formats a Date or timestamp to user's localized short date (e.g. "Nov 18" in US, "18 Nov" in UK; includes year if different year, e.g. "Nov 18, 2020")
export const formatUserDate = (date: Date | number = new Date()): string => {
  const d = typeof date === "number" ? new Date(date) : date;
  const isDifferentYear = d.getFullYear() !== new Date().getFullYear();
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(isDifferentYear ? { year: "numeric" } : {}),
  });
};

// Formats a Date or timestamp to user's localized time (e.g. "1:15 PM" for 12h, "13:15" for 24h)
export const formatUserTime = (date: Date | number = new Date()): string => {
  const d = typeof date === "number" ? new Date(date) : date;
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
};

// Formats a Date or timestamp to both localized date and time: "Nov 18 · 1:15 PM" (or "18 Nov · 13:15")
export const formatUserDateTime = (date: Date | number = new Date()): string => {
  const d = typeof date === "number" ? new Date(date) : date;
  const dateStr = formatUserDate(d);
  const timeStr = formatUserTime(d);
  return `${dateStr} · ${timeStr}`;
};

// Converts string times like "10:30 AM" or "8:15 PM" to the user's browser 12h/24h format
export const formatTimeString = (timeStr?: string): string => {
  if (!timeStr) return "";
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?:\s*([APap][Mm]))?$/);
  if (!match) return timeStr;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3]?.toUpperCase();
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;

  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return formatUserTime(d);
};

// Converts string dates like "Oct 13" or "Sep 20" to the user's browser date order
const MONTH_MAP: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

// Converts string dates like "Oct 13" or "Nov 18, 2020" to the user's browser date order
export const formatDateString = (dateStr?: string): string => {
  if (!dateStr) return "";
  const match = dateStr.trim().match(/^([A-Za-z]{3})\s+(\d{1,2})(?:,?\s*(\d{4}))?$/);
  if (match) {
    const monthIndex = MONTH_MAP[match[1].toLowerCase()];
    const day = parseInt(match[2], 10);
    const currentYear = new Date().getFullYear();
    const year = match[3] ? parseInt(match[3], 10) : currentYear;
    if (monthIndex !== undefined) {
      const d = new Date(year, monthIndex, day);
      return formatUserDate(d);
    }
  }
  return dateStr;
};

// Formats full header date for navigation (e.g. "Wednesday, November 18")
export const formatNavHeaderDate = (date: Date = new Date()): string => {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
};
