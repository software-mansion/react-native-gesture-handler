import React from 'react';
import NotFound from '@theme-original/NotFound';
import { Redirect, useLocation } from '@docusaurus/router';
import { mapLegacyUrl } from './mapLegacyUrl';

export default function NotFoundWrapper(props) {
  const location = useLocation();

  const redirect = mapLegacyUrl(location);

  if (redirect) {
    return <Redirect to={redirect} />;
  }

  return (
    <>
      <NotFound {...props} />
    </>
  );
}
