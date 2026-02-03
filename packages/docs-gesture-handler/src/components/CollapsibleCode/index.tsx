import React, { useState } from 'react';
import CodeBlock from '@theme/CodeBlock';
import styles from './styles.module.css';

import CollapseButton from '@site/src/components/CollapseButton';

import useFormattedCode from '@site/src/hooks/useFormattedCode';
interface Props {
  src: string;
  label: string;
  expandedLabel: string;
  lineBounds: number[];
}

export default function CollapsibleCode({
  src,
  label,
  expandedLabel,
  lineBounds,
}: Props) {
  const [collapsed, setCollapsed] = useState(true);
  const code = useFormattedCode(src);

  if (!lineBounds) {
    return <CodeBlock language="tsx">{code}</CodeBlock>;
  }

  const [start, end] = lineBounds;

  const codeLines = code.split('\n');
  const linesToShow = codeLines.slice(start, end + 1).join('\n');

  return (
    <div className={styles.container}>
      <CollapseButton
        label={label}
        expandedLabel={expandedLabel}
        collapsed={collapsed}
        onCollapse={() => setCollapsed(!collapsed)}
        className={styles.collapseButton}
      />
      <CodeBlock language="tsx">{collapsed ? linesToShow : code}</CodeBlock>
    </div>
  );
}
