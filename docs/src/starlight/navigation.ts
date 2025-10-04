import config from 'virtual:starlight/user-config';
import {
  getPrevNextLinks,
  flattenSidebar,
  getSidebar as baseGetSidebar,
  type Link,
  type SidebarEntry
} from '../../node_modules/@astrojs/starlight/utils/navigation.ts';
import { localeSidebars } from '../../starlight.config.mjs';

const fallbackLocale = config.defaultLocale?.locale ?? 'root';

export function getSidebar(pathname: string, locale: string | undefined): SidebarEntry[] {
  const localeKey = locale ?? fallbackLocale;
  const originalSidebar = config.sidebar;
  const localizedSidebar = localeSidebars?.[localeKey] ?? localeSidebars?.[fallbackLocale];

  if (localizedSidebar) {
    config.sidebar = localizedSidebar;
  } else if (!originalSidebar) {
    config.sidebar = undefined;
  }

  const entries = baseGetSidebar(pathname, locale);

  config.sidebar = originalSidebar;

  return entries;
}

export { flattenSidebar, getPrevNextLinks };
export type { Link, SidebarEntry };
