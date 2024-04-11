import { createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import OGImageStream from './og-image-stream';

const formatImportantHeaders = (headers) => {
  return Object.fromEntries(
    headers
      .map((header) => header.replace(/---/g, '').split('\n'))
      .flat()
      .filter((header) => header !== '')
      .map((header) => header.split(':').map((part) => part.trim()))
  );
};

const formatHeaderToFilename = (header) => {
  return `${header
    .replace(/[ /]/g, '-')
    .replace(/`/g, '')
    .replace(/:/g, '')
    .toLowerCase()}.png`;
};

const getMarkdownHeader = (path) => {
  const content = fs.readFileSync(path, 'utf-8');

  // get first text between ---
  const importantHeaders = content
    .match(/---([\s\S]*?)---/g)
    ?.filter((header) => header !== '------');

  if (importantHeaders) {
    const obj = formatImportantHeaders(importantHeaders);

    if (obj?.title) {
      return obj.title;
    }
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

  return headers[0]?.title || 'React Native Reanimated';
};

async function saveStreamToFile(stream, path) {
  const writeStream = createWriteStream(path);
  await promisify(pipeline)(stream, writeStream);
}

const formatFilesInDoc = async (dir, files, baseDocsPath) => {
  return await Promise.all(
    files.map(async (file) => ({
      file,
      isDirectory: (
        await fs.promises.lstat(path.resolve(baseDocsPath, dir, file))
      ).isDirectory(),
      isMarkdown: file.endsWith('.md') || file.endsWith('.mdx'),
    }))
  );
};

const formatDocInDocs = async (dir, baseDocsPath) => {
  const files = await fs.promises.readdir(path.resolve(baseDocsPath, dir));
  return {
    dir,
    files: (await formatFilesInDoc(dir, files, baseDocsPath)).filter(
      ({ isDirectory, isMarkdown }) => isDirectory || isMarkdown
    ),
  };
};

const extractSubFiles = async (dir, files, baseDocsPath) => {
  return (
    await Promise.all(
      files.map(async (file) => {
        if (!file.isDirectory) return file.file;

        const subFiles = (
          await fs.promises.readdir(path.resolve(baseDocsPath, dir, file.file))
        ).filter((file) => file.endsWith('.md') || file.endsWith('.mdx'));

        return subFiles.map((subFile) => `${file.file}/${subFile}`);
      })
    )
  ).flat();
};

const getDocs = async (baseDocsPath) => {
  let docs = await Promise.all(
    (
      await fs.promises.readdir(baseDocsPath)
    ).map(async (dir) => formatDocInDocs(dir, baseDocsPath))
  );

  docs = await Promise.all(
    docs.map(async ({ dir, files }) => ({
      dir,
      files: await extractSubFiles(dir, files, baseDocsPath),
    }))
  );

  return docs;
};

const buildOGImages = async () => {
  const baseDocsPath = path.resolve(__dirname, '../docs');

  const docs = await getDocs(baseDocsPath);

  const targetDocs = path.resolve(__dirname, '../build/img/og');

  if (fs.existsSync(targetDocs)) {
    fs.rmSync(targetDocs, { recursive: true });
  }

  fs.mkdirSync(targetDocs, { recursive: true });

  console.log('Generating OG images for docs...');

  const imagePath = path.resolve(__dirname, '../unproccessed/og-image.png');
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;

  docs.map(async ({ dir, files }) => {
    files.map(async (file) => {
      const header = getMarkdownHeader(path.resolve(baseDocsPath, dir, file));

      const ogImageStream = await OGImageStream(
        header,
        base64Image,
        targetDocs
      );

      await saveStreamToFile(
        ogImageStream,
        path.resolve(targetDocs, formatHeaderToFilename(header))
      );
    });
  });
};

buildOGImages();
