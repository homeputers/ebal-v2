const dateTimeOptions: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
};

const getLanguage = (lang?: string) => lang || undefined;

export const formatDate = (value: Date | string | number, lang?: string): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat(getLanguage(lang), dateTimeOptions).format(date);
};

export const formatNumber = (value: number | null | undefined, lang?: string): string => {
  if (value == null || Number.isNaN(value)) {
    return '';
  }
  return new Intl.NumberFormat(getLanguage(lang)).format(value);
};

export const formatBpm = (bpm: number | null | undefined, lang?: string): string =>
  formatNumber(bpm, lang);
