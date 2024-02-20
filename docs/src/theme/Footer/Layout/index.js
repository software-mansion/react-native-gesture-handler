import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import { useColorMode } from '@docusaurus/theme-common';

import Moon from '@site/src/components/Moon/MoonIcon';
import DarkMoon from '@site/src/components/Moon/MoonIconDark';
import usePageType from '@site/src/hooks/usePageType';

export default function FooterLayout({ style, links, logo, copyright }) {
  const { isLanding } = usePageType();
  const currentSvgComponent =
    useColorMode().colorMode === 'dark' ? <DarkMoon /> : <Moon />;

  return (
    <footer
      className={clsx('footer', isLanding && styles.footerLanding, {
        'footer--dark': style === 'dark',
      })}>
      {isLanding && (
        <>{ExecutionEnvironment.canUseViewport && currentSvgComponent}</>
      )}
      <div className="container container-fluid">
        {links}
        {(logo || copyright) && (
          <div className="footer__bottom text--center">
            {logo && <div className="margin-bottom--sm">{logo}</div>}
            {copyright}
          </div>
        )}
      </div>
    </footer>
  );
}
