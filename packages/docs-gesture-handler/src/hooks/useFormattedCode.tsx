import { useEffect, useState } from 'react';
import * as prettier from 'prettier/standalone';
import tsParser from 'prettier/plugins/typescript';
import estreeParser from 'prettier/plugins/estree';

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
