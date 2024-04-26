import React from 'react';
import { PageMetadata } from '@docusaurus/theme-common';
import { useDoc } from '@docusaurus/theme-common/internal';
export default function DocItemMetadata() {
  const { metadata, frontMatter } = useDoc();

  if (!metadata) return null;

  const ogImageName = metadata.title
    .replace(/[ /]/g, '-')
    .replace(/`/g, '')
    .replace(/:/g, '')
    .toLowerCase();

  return (
    <PageMetadata
      title={metadata.title}
      description={metadata.description}
      keywords={frontMatter.keywords}
      image={`img/og/${ogImageName}.png`}
    />
  );
}
