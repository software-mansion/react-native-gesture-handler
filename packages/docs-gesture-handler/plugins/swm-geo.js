const fs = require('node:fs');
const path = require('node:path');

const ORGANIZATION_ID = 'https://swmansion.com/#organization';
const SECTIONS = { docs: 'Documentation', blog: 'Blog', examples: 'Examples' };

const decode = (value) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/g, "'")
    .trim();

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const metaOf = (html, name) =>
  new RegExp(
    `<meta[^>]+name="${escapeRegExp(name)}"[^>]+content="([^"]*)"`,
    'i',
  ).exec(html)?.[1] ?? '';

function describe(html, siteTitle) {
  const raw = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '';
  const title = decode(raw).replace(
    new RegExp(`\\s*\\|\\s*${escapeRegExp(siteTitle)}$`),
    '',
  );
  return { title, description: decode(metaOf(html, 'description')) };
}

// Same @id as swmansion.com, so engines read one company across both domains.
function buildStructuredData(siteConfig) {
  const { organizationName, projectName, tagline, title } = siteConfig;
  const repository =
    organizationName && projectName
      ? `https://github.com/${organizationName}/${projectName}`
      : undefined;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: 'Software Mansion',
        url: 'https://swmansion.com',
        sameAs: [
          'https://github.com/software-mansion',
          'https://www.linkedin.com/company/software-mansion/',
          'https://twitter.com/swmansion',
          'https://www.youtube.com/c/SoftwareMansion',
        ],
      },
      {
        '@type': 'SoftwareSourceCode',
        name: title,
        ...(tagline ? { description: tagline } : {}),
        ...(repository ? { codeRepository: repository } : {}),
        author: { '@id': ORGANIZATION_ID },
        maintainer: { '@id': ORGANIZATION_ID },
      },
    ],
  };
}

function buildLlmsTxt({ siteConfig, routesPaths, readPage }) {
  const { baseUrl, title, tagline, url } = siteConfig;
  const grouped = new Map();

  for (const route of routesPaths) {
    if (!route.startsWith(baseUrl) || route.endsWith('404.html')) continue;

    const relative = route.slice(baseUrl.length);
    const html = readPage(relative);
    if (!html) continue;

    const page = describe(html, title);
    if (!page.title) continue;

    const section = SECTIONS[relative.split('/')[0]] ?? 'Pages';
    const line = `- [${page.title}](${url.replace(/\/$/, '')}${route})${page.description ? `: ${page.description}` : ''}`;

    if (!grouped.has(section)) grouped.set(section, []);
    grouped.get(section).push(line);
  }

  const lines = [`# ${title}`];
  if (tagline) lines.push('', `> ${tagline}`);

  for (const section of ['Documentation', 'Examples', 'Blog', 'Pages']) {
    const entries = grouped.get(section);
    if (!entries?.length) continue;
    lines.push('', `## ${section}`, '', ...entries.sort());
  }

  lines.push(
    '',
    '## About',
    '',
    `- [Software Mansion](https://swmansion.com): maintainer of ${title}`,
    '',
  );

  return lines.join('\n');
}

module.exports = function swmGeoPlugin(context) {
  return {
    name: 'swm-geo',

    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: 'script',
            attributes: { type: 'application/ld+json' },
            innerHTML: JSON.stringify(buildStructuredData(context.siteConfig)),
          },
        ],
      };
    },

    async postBuild({ siteConfig, routesPaths, outDir }) {
      const readPage = (relative) => {
        const file = path.join(outDir, relative, 'index.html');
        return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
      };

      await fs.promises.writeFile(
        path.join(outDir, 'llms.txt'),
        buildLlmsTxt({ siteConfig, routesPaths, readPage }),
        'utf8',
      );
    },
  };
};

module.exports.buildLlmsTxt = buildLlmsTxt;
module.exports.buildStructuredData = buildStructuredData;
