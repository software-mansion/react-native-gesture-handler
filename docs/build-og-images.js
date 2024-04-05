const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage, registerFont } = require('canvas');

registerFont('static/fonts/Aeonik-Bold.otf', { family: 'Aeonik Bold' });

const getMarkdownHeader = (path) => {
  const content = fs.readFileSync(path, 'utf-8');

  // get first text between ---
  const importantHeaders = content.match(/---([\s\S]*?)---/g)?.filter(header => header !== '------');

  if (importantHeaders) {
    const obj = Object.fromEntries(
      importantHeaders
        .map(header => header.replace(/---/g, '').split('\n'))
        .flat()
        .filter(header => header !== '')
        .map(header => header.split(':').map(part => part.trim()))
    )

    if (obj?.title)
      return obj.title;
  }

  const headers = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('#'))
    .map((line, index) => ({
      level: line.match(/#/g).length,
      title: line.replace(/#/g, '').trim(),
      index,
    }))
    .sort((a, b) => a.level - b.level || a.index - b.index);

  return headers[0]?.title || '';
};

const getDocs = async (baseDocsPath) => {
  let docs = await Promise.all(
    (await fs.promises.readdir(baseDocsPath)).map(async (dir) => {
      const files = await fs.promises.readdir(path.resolve(baseDocsPath, dir));
      return {
        dir,
        files: (await Promise.all(
          files.map(async (file) => ({
            file,
            isDirectory: ((await fs.promises.lstat(path.resolve(baseDocsPath, dir, file))).isDirectory()),
            isMarkdown: file.endsWith('.md') || file.endsWith('.mdx')
          }))
        )).filter(({ isDirectory, isMarkdown }) => isDirectory || isMarkdown)
      };
    })
  );

  docs = await Promise.all(docs.map(async ({dir, files}) => ({
    dir,
    files: (await Promise.all(files.map(async file => {
      if (!file.isDirectory) return file.file;

      const subFiles = (await fs.promises.readdir(path.resolve(baseDocsPath, dir, file.file)))
        .filter(file => file.endsWith('.md') || file.endsWith('.mdx'));

      return subFiles.map(subFile => `${file.file}/${subFile}`);
    }))).flat()
  })));

  return docs;
}

const buildOGImages = async () => {
  const baseDocsPath = path.resolve(__dirname, 'docs');

  const docs = await getDocs(baseDocsPath);

  const targetDocs = path.resolve(__dirname, 'build/docs/og');

  if (fs.existsSync(targetDocs)) fs.rmSync(targetDocs, { recursive: true });


  fs.mkdirSync(targetDocs, { recursive: true });

  console.log('Generating OG images for docs...');

  const image = await loadImage(
    path.resolve(__dirname, 'unproccessed/og-image.png')
  );
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');

  await Promise.all(
    docs.map(async ({ dir, files }) => {
      files.map(async (file) => {
        ctx.drawImage(image, 0, 0, 1200, 630);

        let header = getMarkdownHeader(path.resolve(baseDocsPath, dir, file));

        if (header === '') header = 'unnamed';

        ctx.font = 'bold 72px "Aeonik Bold"';
        ctx.fillStyle = '#001A72';
        ctx.textAlign = 'left';
        if (ctx.measureText(`${header}`).width < 1200 - 6*67) {
          ctx.fillText(`${header}`, 67, 337);
        } else {
          const words = header.split(' ');
          let line = '';
          const lines = [];
          let y = 337;
          for (let i = 0; i < words.length; i++) {
            const newLine = `${line} ${words[i]}`.trim();
            if (ctx.measureText(`${newLine}`).width < 1200 - 6*67) {
              line = newLine;
            } else {
              lines.push({
                line,
                y
              });
              y += 37;
              line = `${words[i]}`;
            }
          }
          lines.push({
            line,
            y
          })
          lines.forEach(({line, y}, index) => {
            ctx.fillText(line, 67, y - (lines.length - index) * 37);
          });         
        }

        ctx.font = 'bold 40px "Aeonik Bold"';
        ctx.fillText(
          'Check out the React Native Reanimated\ndocumentation.',
          67,
          439
        );

        const buffer = canvas.toBuffer('image/png');
        const target = path.resolve(
          targetDocs,
          `${header.replace(/[ /]/g, '-').replace(/`/g, '').replace(/:/g, '').toLowerCase()}.png`
        );
        await fs.promises.writeFile(target, buffer);

        ctx.clearRect(0, 0, 1200, 630);
      });
    })
  );

  console.log('OG images generated.');
};

buildOGImages();
