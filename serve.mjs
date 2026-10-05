/**
 * 前端独立开发服务器（零依赖）。
 *
 * 存在意义：证明本项目确实是「前后端分离」的。
 * 这个服务器只做一件事 —— 把 src/ 目录当作静态网站提供出去，
 * 它完全不认识任何计算逻辑，所有数据都通过 HTTP 请求后端 API 获得。
 *
 * 用法：
 *   node serve.mjs            # 默认 http://localhost:5173，API 指向 http://localhost:3000
 *   node serve.mjs 8080       # 自定义端口
 *
 * 生产环境不需要这个文件：届时把 src/ 目录部署到任意静态托管即可
 * （Render Static Site / Nginx / GitHub Pages / 对象存储）。
 */

import { createReadStream, promises as fs } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('./src', import.meta.url)));
const PORT = Number.parseInt(process.argv[2] || process.env.PORT || '5173', 10);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

/**
 * 把 URL 路径解析为磁盘上的安全文件路径。
 *
 * @param {string} urlPath URL 路径。
 * @returns {Promise<string|null>} 文件绝对路径或 null。
 */
async function resolveFile(urlPath) {
  const relative = normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, '');
  const candidates = relative === '' || relative === '.'
    ? [join(ROOT, 'index.html')]
    : [join(ROOT, relative), join(ROOT, relative, 'index.html')];

  for (const candidate of candidates) {
    const absolute = resolve(candidate);
    // 防目录穿越：解析后的路径必须仍在 ROOT 之内。
    if (absolute !== ROOT && !absolute.startsWith(ROOT + sep)) {
      continue;
    }
    try {
      const stat = await fs.stat(absolute);
      if (stat.isFile()) {
        return absolute;
      }
    } catch {
      // 继续尝试下一个候选路径
    }
  }
  return null;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const filePath = await resolveFile(url.pathname);

  if (filePath === null) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }

  res.writeHead(200, {
    'Content-Type': MIME_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-cache',
  });
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  process.stdout.write(
    `前端静态服务器已启动：http://localhost:${PORT}\n`
    + '请确保后端已在 http://localhost:3000 运行（前端会自动把 /api 请求指向它）。\n',
  );
});
