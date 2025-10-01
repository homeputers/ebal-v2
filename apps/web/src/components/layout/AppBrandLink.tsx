import type { ComponentProps } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type RouterLinkProps = ComponentProps<typeof Link>;

type AppBrandLinkProps = {
  to: RouterLinkProps['to'];
  className?: string;
  onClick?: RouterLinkProps['onClick'];
  collapseTextOnMobile?: boolean;
  showText?: boolean;
  imageClassName?: string;
  textClassName?: string;
  ariaLabel?: string;
};

const mergeClassNames = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(' ');

export function AppBrandLink({
  to,
  className,
  onClick,
  collapseTextOnMobile = false,
  showText = true,
  imageClassName,
  textClassName,
  ariaLabel,
}: AppBrandLinkProps) {
  const { t } = useTranslation('common');
  const label = ariaLabel ?? t('app.title');
  const brandText = t('app.brandInitials', { defaultValue: 'EBaL' });

  const baseClassName =
    'inline-flex items-center gap-2 text-foreground transition-colors hover:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';
  const mergedClassName = mergeClassNames(baseClassName, className);
  const mergedImageClassName = mergeClassNames('h-9 w-auto', imageClassName);
  const mergedTextClassName = mergeClassNames(
    'text-lg font-semibold tracking-tight',
    collapseTextOnMobile ? 'hidden sm:inline' : undefined,
    textClassName,
  );

  const baseUrl = import.meta.env.BASE_URL ?? '/';
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const logoSrc = `${normalizedBaseUrl}logo.png`;

  return (
    <Link to={to} className={mergedClassName} aria-label={label} onClick={onClick}>
      <span className="sr-only">{label}</span>
      <img src={logoSrc} alt="" aria-hidden="true" className={mergedImageClassName} />
      {showText ? (
        <span aria-hidden="true" className={mergedTextClassName}>
          {brandText}
        </span>
      ) : null}
    </Link>
  );
}

