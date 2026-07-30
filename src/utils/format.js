export const formatTitle = (value) =>
  String(value)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^(.)/, (match) => match.toUpperCase());
