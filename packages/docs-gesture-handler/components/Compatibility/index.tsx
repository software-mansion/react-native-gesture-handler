import { useDocsVersion } from '@docusaurus/plugin-content-docs/client';
import React from 'react';

import untypedCompatibilityData from 'react-native-gesture-handler/compatibility.json';
import styles from './styles.module.css';

interface CompatibilityEntry {
  'react-native': string[];
}

type CompatibilityData = Record<string, CompatibilityEntry>;

const compatibilityData = untypedCompatibilityData as CompatibilityData;

export function Yes() {
  return <div className={styles.supported}>yes</div>;
}

export function No() {
  return <div className={styles.notSupported}>no</div>;
}

interface VersionProps {
  version: string;
}

export function Version({ version }: VersionProps) {
  return <div className={styles.version}>{version}</div>;
}

export function Spacer() {
  return <div className={styles.spacer}></div>;
}

interface CompatibilityItem {
  version: string;
  isSpacer: boolean;
  compatibility: Record<string, boolean>;
}

type GestureHandlerCompatibilityProps = {
  spacerAfterIndex?: number;
};

const getCompatibilityEntriesForVersion = (
  version: string,
  shouldInclude: (data: CompatibilityEntry) => boolean = () => true
) => {
  if (version === 'current') {
    // For current version, find the highest major version and include nightly
    const highestMajorVersion = Math.max(
      ...Object.keys(compatibilityData).map((key) => {
        const num = key.split('.')[0];
        return isNaN(+num) ? 0 : +num;
      })
    );

    return Object.entries(compatibilityData).filter(
      ([key, data]) =>
        (key === 'nightly' || key.startsWith(`${highestMajorVersion}.`)) &&
        shouldInclude(data)
    );
  }

  // For versioned docs (e.g. "3.x", "2.x", "1.x"), extract the major version number
  const majorVersion = version.replace('.x', '');
  return Object.entries(compatibilityData).filter(
    ([key, data]) => key.startsWith(`${majorVersion}.`) && shouldInclude(data)
  );
};

const extractVersions = (
  data: [string, CompatibilityEntry][],
  getVersions: (entry: CompatibilityEntry) => string[]
): string[] =>
  Array.from(new Set(data.flatMap(([, entry]) => getVersions(entry)))).sort();

const createCompatibilityItems = (
  filteredData: [string, CompatibilityEntry][],
  versions: string[],
  getSupportedVersions: (data: CompatibilityEntry) => Set<string>,
  spacerAfterIndex?: number
): CompatibilityItem[] =>
  filteredData.map(([version, data], index) => {
    const supportedVersions = getSupportedVersions(data);
    const compatibility = Object.fromEntries(
      versions.map((versionNumber) => [
        versionNumber,
        supportedVersions.has(versionNumber),
      ])
    );

    return {
      version,
      isSpacer: index === spacerAfterIndex,
      compatibility,
    };
  });

interface CompatibilityTableProps {
  versions: string[];
  items: CompatibilityItem[];
}

function CompatibilityTable({ versions, items }: CompatibilityTableProps) {
  return (
    <div className="compatibility">
      <table className={styles.table}>
        <thead>
          <tr>
            <th></th>
            {versions.map((version) => (
              <th key={version}>{version}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <tr>
                <td>
                  <Version version={item.version} />
                </td>
                {versions.map((version) => (
                  <td key={version}>
                    {item.compatibility[version] ? <Yes /> : <No />}
                  </td>
                ))}
              </tr>
              {item.isSpacer && <Spacer />}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function GestureHandlerCompatibility({
  spacerAfterIndex,
}: GestureHandlerCompatibilityProps) {
  const docsVersion = useDocsVersion();
  const filteredCompatibilityData = getCompatibilityEntriesForVersion(
    docsVersion.version
  );

  const reactNativeVersions = extractVersions(
    filteredCompatibilityData,
    (data) => data['react-native']
  );

  const compatibilityItems = createCompatibilityItems(
    filteredCompatibilityData,
    reactNativeVersions,
    (data) => new Set(data['react-native']),
    spacerAfterIndex
  );

  return (
    <CompatibilityTable
      versions={reactNativeVersions}
      items={compatibilityItems}
    />
  );
}
