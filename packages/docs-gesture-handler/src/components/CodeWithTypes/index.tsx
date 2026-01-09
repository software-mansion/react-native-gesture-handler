import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

import BrowserOnly from '@docusaurus/BrowserOnly';
import CodeBlock from '@theme/CodeBlock';

import styles from './styles.module.css';

import * as prettier from 'prettier/standalone';
import tsParser from 'prettier/plugins/typescript';
import estreeParser from 'prettier/plugins/estree';

interface Props {
  srcCode: string;
  srcDetails: string;
}

const prettierOptions = {
  parser: 'typescript',
  plugins: [tsParser, estreeParser],
};

export default function CodeWithTypes({ srcCode, srcDetails }: Props) {
  const [showCode, setShowCode] = useState(true);
  const [code, setCode] = useState<string>(srcCode);
  const [details, setDetails] = useState<string>('');

  useEffect(() => {
    async function formatCode() {
      const formattedCode = await prettier.format(srcCode, prettierOptions);
      const formattedDetails = await prettier.format(
        srcDetails,
        prettierOptions
      );

      setCode(formattedCode);
      setDetails(formattedDetails);
    }

    void formatCode();
  }, [srcCode, srcDetails]);

  return (
    <BrowserOnly fallback={<div>Loading...</div>}>
      {() => (
        <div
          className={clsx(styles.container, styles.code, styles.marginBottom)}>
          <div
            className={clsx(
              styles.buttonsContainer,
              styles.upperButtonsContainer
            )}>
            <div>
              <button
                type="button"
                className={clsx(
                  styles.actionButton,
                  showCode ? styles.actionButtonActive : ''
                )}
                onClick={() => setShowCode(true)}>
                Type
              </button>
              <button
                type="button"
                className={clsx(
                  styles.actionButton,
                  !showCode ? styles.actionButtonActive : ''
                )}
                onClick={() => setShowCode(false)}>
                Details
              </button>
            </div>
          </div>

          {showCode ? (
            <div className={styles.codeBlock}>
              <CodeBlock language="tsx">{code}</CodeBlock>
            </div>
          ) : (
            <div className={styles.codeBlock}>
              <CodeBlock language="tsx">{details}</CodeBlock>
            </div>
          )}
        </div>
      )}
    </BrowserOnly>
  );
}
