export const buildLanguagePath = (
  language: string | undefined,
  path: string,
) => {
  const normalizedLanguage = language ?? '';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const combined = `/${normalizedLanguage}${normalizedPath}`;
  return combined.replace(/\/+/g, '/');
};
