#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const blogDir = path.join(rootDir, 'blog');
const outputPath = path.join(rootDir, 'blogs.json');
const dataJsPath = path.join(rootDir, 'blogs-data.js');

const decodeHtml = (s = '') => s
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&middot;/g, '·')
  .trim();

const textContent = (html = '') => decodeHtml(html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());

const parseDateString = (dateStr) => {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const formatIsoDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const extract = (source, regex) => {
  const match = source.match(regex);
  return match && match[1] ? match[1].trim() : '';
};

const buildPostFromHtml = async (filename) => {
  const slug = filename.replace(/\.html$/i, '');
  const fullPath = path.join(blogDir, filename);
  const html = await fs.readFile(fullPath, 'utf8');

  const title = decodeHtml(
    extract(html, /<article[^>]*>[\s\S]*?<h1>([\s\S]*?)<\/h1>/i) ||
    extract(html, /<title>([\s\S]*?)\|\s*Trosyn AI Blog<\/title>/i)
  );

  const dateLabel = decodeHtml(extract(html, /<p class="post-meta">[\s\S]*?<span>([^<]+)<\/span>/i));
  const parsedDate = parseDateString(dateLabel);
  const date = parsedDate ? formatIsoDate(parsedDate) : '1970-01-01';

  const excerptHtml = extract(html, /<div class="post-content">[\s\S]*?<p>([\s\S]*?)<\/p>/i);
  const excerpt = textContent(excerptHtml);

  const image = extract(html, /<article[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"/i);
  const readTime = decodeHtml(extract(html, /<span id="post-read-time">([^<]+)<\/span>/i)) || '8 min read';

  return {
    title: title || slug,
    date,
    excerpt,
    slug,
    image: image || './images/1IMoaEYiohYWzTcLmdV_SHg.webp',
    category: 'featured',
    readTime
  };
};

const main = async () => {
  const files = await fs.readdir(blogDir);
  const htmlFiles = files
    .filter((name) => name.endsWith('.html'))
    .filter((name) => name !== 'index.html');

  const posts = await Promise.all(htmlFiles.map((name) => buildPostFromHtml(name)));

  posts.sort((a, b) => {
    const left = new Date(a.date).getTime();
    const right = new Date(b.date).getTime();
    return right - left;
  });

  await fs.writeFile(outputPath, `${JSON.stringify(posts, null, 2)}\n`, 'utf8');
  await fs.writeFile(
    dataJsPath,
    `window.TROSYN_BLOG_POSTS = ${JSON.stringify(posts, null, 2)};\n`,
    'utf8'
  );
  console.log(`Synced ${posts.length} posts to ${path.relative(rootDir, outputPath)}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
