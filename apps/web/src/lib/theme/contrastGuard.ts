const MIN_AA_CONTRAST_RATIO = 4.5;

type TokenPair = {
  backgroundVar: string;
  foregroundVar: string;
  description: string;
};

const TOKEN_PAIRS: TokenPair[] = [
  { backgroundVar: '--background', foregroundVar: '--foreground', description: 'foreground on background' },
  { backgroundVar: '--card', foregroundVar: '--card-foreground', description: 'card foreground on card' },
  { backgroundVar: '--popover', foregroundVar: '--popover-foreground', description: 'popover foreground on popover' },
  { backgroundVar: '--primary', foregroundVar: '--primary-foreground', description: 'text on primary' },
  { backgroundVar: '--secondary', foregroundVar: '--secondary-foreground', description: 'text on secondary' },
  { backgroundVar: '--muted', foregroundVar: '--muted-foreground', description: 'text on muted' },
  { backgroundVar: '--accent', foregroundVar: '--accent-foreground', description: 'text on accent' },
  { backgroundVar: '--destructive', foregroundVar: '--destructive-foreground', description: 'text on destructive' },
];

type ParsedHsl = {
  h: number;
  s: number;
  l: number;
};

const normalizeTokenValue = (value: string) => value.trim().replace(/\s+/g, ' ');

const parseHsl = (value: string): ParsedHsl | null => {
  const normalized = normalizeTokenValue(value);
  const match = normalized.match(/^(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);

  if (!match) {
    return null;
  }

  const [, hRaw, sRaw, lRaw] = match;

  return {
    h: Number.parseFloat(hRaw),
    s: Number.parseFloat(sRaw) / 100,
    l: Number.parseFloat(lRaw) / 100,
  };
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const hslToRgb = ({ h, s, l }: ParsedHsl): [number, number, number] => {
  const hue = ((h % 360) + 360) % 360; // normalize to [0, 360)
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const huePrime = hue / 60;
  const secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (huePrime >= 0 && huePrime < 1) {
    r1 = chroma;
    g1 = secondComponent;
  } else if (huePrime >= 1 && huePrime < 2) {
    r1 = secondComponent;
    g1 = chroma;
  } else if (huePrime >= 2 && huePrime < 3) {
    g1 = chroma;
    b1 = secondComponent;
  } else if (huePrime >= 3 && huePrime < 4) {
    g1 = secondComponent;
    b1 = chroma;
  } else if (huePrime >= 4 && huePrime < 5) {
    r1 = secondComponent;
    b1 = chroma;
  } else if (huePrime >= 5 && huePrime < 6) {
    r1 = chroma;
    b1 = secondComponent;
  }

  const matchLightness = l - chroma / 2;

  return [r1 + matchLightness, g1 + matchLightness, b1 + matchLightness].map((value) => clamp01(value)) as [
    number,
    number,
    number,
  ];
};

const srgbToLuminance = ([r, g, b]: [number, number, number]) => {
  const linearize = (value: number) =>
    value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);

  const [lr, lg, lb] = [r, g, b].map((channel) => linearize(channel));

  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

const calculateContrastRatio = (background: ParsedHsl, foreground: ParsedHsl) => {
  const backgroundRgb = hslToRgb(background);
  const foregroundRgb = hslToRgb(foreground);

  const backgroundLuminance = srgbToLuminance(backgroundRgb);
  const foregroundLuminance = srgbToLuminance(foregroundRgb);

  const lighter = Math.max(backgroundLuminance, foregroundLuminance);
  const darker = Math.min(backgroundLuminance, foregroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
};

const warnIfLowContrast = () => {
  const { documentElement } = document;
  const styles = getComputedStyle(documentElement);

  TOKEN_PAIRS.forEach(({ backgroundVar, foregroundVar, description }) => {
    const backgroundValue = styles.getPropertyValue(backgroundVar);
    const foregroundValue = styles.getPropertyValue(foregroundVar);

    const backgroundHsl = parseHsl(backgroundValue);
    const foregroundHsl = parseHsl(foregroundValue);

    if (!backgroundHsl || !foregroundHsl) {
      console.warn(
        `[theme-contrast] Unable to parse ${description}. Got "${normalizeTokenValue(backgroundValue)}" and "${normalizeTokenValue(foregroundValue)}".`,
      );
      return;
    }

    const contrastRatio = calculateContrastRatio(backgroundHsl, foregroundHsl);

    if (contrastRatio < MIN_AA_CONTRAST_RATIO) {
      console.warn(
        `[theme-contrast] ${description} has contrast ratio ${contrastRatio.toFixed(2)}:1 (< ${MIN_AA_CONTRAST_RATIO}:1). Adjust tokens to meet WCAG AA for normal text.`,
      );
    }
  });
};

export const installContrastGuard = () => {
  if (import.meta.env.DEV && typeof document !== 'undefined' && typeof window !== 'undefined') {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      window.requestAnimationFrame(warnIfLowContrast);
    } else {
      document.addEventListener('DOMContentLoaded', () => window.requestAnimationFrame(warnIfLowContrast), {
        once: true,
      });
    }
  }
};

installContrastGuard();
