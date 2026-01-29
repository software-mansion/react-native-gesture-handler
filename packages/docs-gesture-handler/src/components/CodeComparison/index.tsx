import React from 'react';
import CodeBlock from '@theme/CodeBlock';
import useFormattedCode from '@site/src/hooks/useFormattedCode';

export default function CodeComparison({
  label1,
  label2,
  code1,
  code2,
  skipFormatting1 = false,
  skipFormatting2 = false,
}) {
  const formattedCode1 = useFormattedCode(skipFormatting1 ? '' : code1);
  const formattedCode2 = useFormattedCode(skipFormatting2 ? '' : code2);

  return (
    <div className="codeComparison">
      <div className="codeHolder">
        <div className="codeComparisonHeader">{label1}</div>
        <CodeBlock language="tsx">
          {skipFormatting1 ? code1 : formattedCode1}
        </CodeBlock>
      </div>

      <div className="codeHolder">
        <div className="codeComparisonHeader">{label2}</div>
        <CodeBlock language="tsx">
          {skipFormatting2 ? code2 : formattedCode2}
        </CodeBlock>
      </div>
    </div>
  );
}
