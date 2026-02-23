export const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).toLowerCase());

export const isValidPassword = (value) =>
  typeof value === 'string' && value.length >= 6 && value.length <= 64;