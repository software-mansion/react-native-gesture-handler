/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import GitHubButton from 'react-github-btn';
import useLogo from '@theme/hooks/useLogo';

function FooterLink({ to, href, label, prependBaseUrlToHref, ...props }) {
  const toUrl = useBaseUrl(to);
  const normalizedHref = useBaseUrl(href, {
    forcePrependBaseUrl: true,
  });
  return (
    <Link
      className="footer__link-item"
      {...(href
        ? {
            target: '_blank',
            rel: 'noopener noreferrer',
            href: prependBaseUrlToHref ? normalizedHref : href,
          }
        : {
            to: toUrl,
          })}
      {...props}>
      {label}
    </Link>
  );
}

const FooterLogo = ({ url, alt }) => (
  <img className="footer__logo" alt={alt} src={url} />
);

function Footer() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  const { themeConfig = {} } = siteConfig;
  const { footer } = themeConfig;
  const { copyright, links = [], logo = {} } = footer || {};
  const logoUrl = useBaseUrl(logo.src);

  // added
  const logoLink = 'https://www.swmansion.com/';
  const logoAlt = 'Software Mansion logo';
  const logoImageUrl = useBaseUrl('/img/swmLogo.svg');

  if (!footer) {
    return null;
  }

  return (
    <footer
      className={clsx('footer', {
        'footer--dark': footer.style === 'dark',
      })}>
      {/*changed */}
      <div className="footer-container">
        <Link className="navbar__brand footer-image-link" to={logoLink}>
          {logoImageUrl != null && (
            <img className="navbar__logo" src={logoImageUrl} alt={logoAlt} />
          )}
        </Link>
        <div className="githubStarLink">
          <GitHubButton
            href="https://github.com/software-mansion/react-native-gesture-handler"
            // data-color-scheme="no-preference: light; light: light; dark: light;"
            data-icon="octicon-star"
            // data-size="large"
            data-show-count="true"
            aria-label="Star software-mansion/react-native-gesture-handler on GitHub">
            Star
          </GitHubButton>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
