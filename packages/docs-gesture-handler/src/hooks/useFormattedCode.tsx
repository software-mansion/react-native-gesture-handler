import estreeParser from 'prettier/plugins/estree';
import tsParser from 'prettier/plugins/typescript';
import * as prettier from 'prettier/standalone';
import { useEffect, useState } from 'react';

const prettierOptions = {
  parser: 'typescript',
  plugins: [tsParser, estreeParser],
};

export default function useFormattedCode(code: string) {
  const [formattedCode, setFormattedCode] = useState(code);

  useEffect(() => {
    async function formatCode() {
      try {
        const newCode = await prettier.format(code, prettierOptions);
        setFormattedCode(newCode);
      } catch {
        setFormattedCode(code);
      }
    }

    void formatCode();
  }, [code]);

  return formattedCode;
}
