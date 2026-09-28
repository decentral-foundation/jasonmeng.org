const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// Parses post dates like "Nov 12th, 2024", "April 20th, 2025" or "Oct 1st 2025".
export function parsePostDate(date) {
  const match = /^([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/i.exec(date.trim());
  if (!match) return 0;
  const month = MONTHS.indexOf(match[1].slice(0, 3).toLowerCase());
  if (month === -1) return 0;
  return new Date(Number(match[3]), month, Number(match[2])).getTime();
}

export function newestFirst(posts) {
  return [...posts].sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date));
}
