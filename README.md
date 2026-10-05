# 832402207_calculator_frontend

前后端分离计算器系统 —— **前端单页应用**

学号：832402207 · 姓名：Zhijun Chen · 课程：软件工程（第一次作业）

> 本仓库只包含前端。后端仓库为 `832402207_calculator_backend`。
> 前端与后端之间**只通过 HTTP / JSON 接口通信**，没有任何代码耦合。

---

## 一、项目介绍

一个零第三方依赖的计算器 Web 客户端，职责严格限定为「展示与交互」：

| 职责 | 实现位置 |
| --- | --- |
| 界面呈现（计算器、历史、统计、单位换算） | `src/index.html` + `src/css/` |
| 按键与表达式输入交互 | `src/js/calculator.js` |
| 发送计算请求、展示后端返回的结果 | `src/js/api.js` + `src/js/calculator.js` |
| 展示计算历史、分页、检索、筛选 | `src/js/history.js` |
| 发送删除 / 收藏请求并刷新列表 | `src/js/history.js` |
| 展示统计图表 | `src/js/stats.js` |
| 展示单位换算结果 | `src/js/converter.js` |
| 展示后端返回的错误信息 | `src/js/toast.js` + 各视图 |

### 最重要的约束

**前端不包含任何数值计算逻辑，也不会计算任何表达式的结果。**

界面上所有结果的唯一来源是 `POST /api/calculate` 的响应。
把后端服务停掉后，页面依然可以正常点击、输入、切换标签页，
但结果区只会显示「—」和错误提示，**不可能**独立得出一个新的计算结果。

这是作业的硬性要求，也是本项目在架构上刻意保证的一点：

- `src/js/` 下没有任何表达式解析或求值代码；
- `formatNumber()` 等函数只对**后端已经算好的数值**做千分位与科学计数法格式化；
- 按下 `±` 键只在文本层面给表达式加/去负号，不做求值。

---

## 二、技术栈

| 项目 | 选型 | 说明 |
| --- | --- | --- |
| 语言 | 原生 JavaScript（ES Module） | 无框架、无构建工具、无转译 |
| 样式 | 原生 CSS（自定义属性 + BEM 命名） | 深色 / 浅色双主题，响应式布局 |
| 图形 | 内联 SVG + Canvas 无关的纯 CSS 柱状图 | 不依赖任何图表库 |
| 依赖 | **无** | 不引用任何 CDN，断网/内网环境同样可用 |
| 开发服务器 | `serve.mjs`（Node 标准库实现） | 仅用于本地独立运行前端 |

选择原生实现而不是引入框架，理由有三：

1. 作业明确要求体现「前后端分离」，前端框架会掩盖这一点，原生代码让 AJAX 调用一目了然；
2. 零依赖意味着在任何环境（包括助教的电脑）打开即可运行，不受 npm 源影响；
3. 手写状态同步与 DOM 渲染，能够真实体现对前端基础知识的掌握。

---

## 三、运行环境

- **运行前端页面**：任意现代浏览器（Chrome / Edge / Firefox / Safari 最近两个大版本）
- **运行本地静态服务器（可选）**：Node.js ≥ 18

前端本身不需要 Node.js —— `src/` 目录是一个纯静态站点，直接用浏览器打开 `index.html`
（或部署到任意静态托管）就能运行。

---

## 四、安装方法

```bash
git clone https://github.com/upupup-abc/832402207_calculator_frontend.git
cd 832402207_calculator_frontend
npm install      # 没有任何依赖，可跳过
```

---

## 五、启动方法

### 方式一：由后端一起托管（最简单，推荐）

先在 `832402207_calculator_backend` 目录执行 `npm start`，然后访问：

```
http://localhost:3000
```

后端会自动托管本仓库 `src/` 目录下的静态资源，前端用相对路径 `/api/**` 请求接口，
同源、无跨域问题。

### 方式二：前端独立运行（用于演示前后端分离）

**终端 1** —— 启动后端：

```bash
cd 832402207_calculator_backend
npm start                       # 监听 3000 端口
```

**终端 2** —— 启动前端静态服务器：

```bash
cd 832402207_calculator_frontend
npm run dev                     # 等价于 node serve.mjs，监听 5173 端口
```

**浏览器** 访问 <http://localhost:5173>。

此时前端运行在 `5173` 端口、后端运行在 `3000` 端口，是**两个不同的源**。
前端检测到自己在 5173 端口后，会自动把 API 基地址指向 `http://localhost:3000`，
跨域请求由后端的 CORS 支持完成。

### 方式三：指定后端地址

如果后端部署在别处，可以用 URL 参数临时指定：

```
http://localhost:5173/?api=https://832402207-calculator-api.onrender.com
```

`api` 参数会在当前会话内生效，便于联调不同环境的后端。

---

## 六、配置说明

前端的配置集中在 `src/js/config.js`，API 基地址按以下**优先级**解析：

| 优先级 | 来源 | 适用场景 |
| --- | --- | --- |
| 1 | URL 参数 `?api=https://...` | 临时指向任意后端联调 |
| 2 | 全局变量 `window.__API_BASE__` | 部署平台在 HTML 中注入 |
| 3 | 页面端口为 `5173` → `http://localhost:3000` | 前端独立开发模式 |
| 4 | 空字符串（同源） | 生产默认值，请求相对路径 `/api/**` |

**默认使用同源**是刻意的选择：生产部署时前端始终请求 `/api/**`，
由部署平台（Render Rewrite、Nginx 反向代理）转发到后端，
从而完全避免跨域配置和硬编码域名。

其它可在 URL 上使用的参数：

| 参数 | 作用 | 示例 |
| --- | --- | --- |
| `expr` | 预填表达式（深链分享） | `?expr=(1%2B2)*3` |
| `auto=1` | 打开页面后自动提交计算 | `?expr=12%2B8&auto=1` |
| `theme` | 强制深色 / 浅色主题 | `?theme=light` |
| `api` | 指定后端地址 | `?api=http://localhost:3000` |

「分享此算式」按钮生成的就是带 `expr` 的链接，对方打开后可以直接看到同一算式的计算结果。

---

## 七、项目目录结构

```
832402207_calculator_frontend/
├── src/
│   ├── index.html                # 唯一的 HTML 页面（单页应用外壳）
│   ├── css/
│   │   ├── theme.css             # 设计令牌：颜色、圆角、阴影、双主题变量
│   │   └── styles.css            # 布局与组件样式（BEM 命名）
│   └── js/
│       ├── main.js               # 应用入口：装配各视图、主题、标签页、深链
│       ├── config.js             # API 基地址与全局常量解析
│       ├── api.js                # ★ 与后端通信的唯一出口（含统一错误处理）
│       ├── calculator.js         # 计算器视图：输入、按键、结果与错误展示
│       ├── history.js            # 历史视图：列表、分页、检索、收藏、删除
│       ├── stats.js              # 统计视图：指标卡、7 天趋势图、Top5 排行
│       ├── converter.js          # 单位换算视图
│       ├── keyboard.js           # 全局快捷键
│       ├── toast.js              # 提示气泡
│       ├── format.js             # 展示层格式化（数字、时间）
│       └── dom.js                # DOM 辅助（查询、创建、生成 SVG 图标）
├── serve.mjs                     # 零依赖本地静态服务器（仅开发用）
├── package.json
├── codestyle.md
└── README.md
```

模块依赖是**单向**的：`main.js` 引用各视图，各视图引用 `api.js` 与工具模块，
视图之间**不互相引用**，跨视图协作通过 `main.js` 传入的回调完成，
避免循环依赖与散落的隐式状态。

---

## 八、与后端的接口约定

前端只调用以下接口（完整定义见后端仓库 README）：

| 前端调用 | 接口 |
| --- | --- |
| `api.calculate(expression)` | `POST /api/calculate` |
| `api.listHistory({page, pageSize, keyword, favoriteOnly})` | `GET /api/history` |
| `api.deleteHistory(id)` | `DELETE /api/history/:id` |
| `api.clearHistory()` | `DELETE /api/history` |
| `api.setFavorite(id, isFavorite)` | `PATCH /api/history/:id/favorite` |
| `api.statistics()` | `GET /api/history/stats` |
| `api.exportUrl(query)` | `GET /api/history/export` |
| `api.health()` | `GET /api/health` |
| `api.grammar()` | `GET /api/grammar` |
| `api.convertUnits()` | `GET /api/convert/units` |
| `api.convert(payload)` | `POST /api/convert` |

### 错误处理约定

`api.js` 把所有失败统一转换为 `ApiError`，并区分两类：

- **连接失败**（`code === 'CONNECTION_ERROR'`）：后端没启动、端口不通、被防火墙拦截。
  界面会提示「无法连接到后端服务」，并明确告诉用户前端不会自行计算。
- **业务失败**：后端返回 `success: false`，`ApiError.code` 携带后端的错误码
  （如 `DIVISION_BY_ZERO`），`message` 直接使用后端返回的中文提示，
  `position` 可用于定位错误字符。

---

## 九、功能清单

### 基础功能（对应作业要求）

- 四则运算、复合表达式、括号、一元正负号、小数
- 表达式输入框 + 数字/运算符按键双通道输入
- 后端返回的结果展示、后端返回的错误信息展示
- 计算历史列表（表达式、结果、时间），全部来自后端数据库
- 删除指定历史记录，删除后重新查询保证与数据库一致

### 附加功能

- 科学函数快捷区（sin / cos / tan / ln / log / √ / |x| / π / e / xʸ / n! / mod）
- 历史记录检索（关键词搜索表达式与结果）
- 分页浏览（每页 8 条）
- 收藏 / 取消收藏，以及「仅看收藏」筛选
- 统计面板：累计计算、今日计算、收藏数、不重复算式数、最近 7 天趋势图、最常用算式 Top5
- 单位换算（7 大类，全部由后端 `POST /api/convert` 计算）
- 深色 / 浅色主题切换（记忆用户选择，也支持 `?theme=` 强制指定）
- 键盘快捷键（数字与运算符直接输入、Enter 计算、Esc 清空、/ 聚焦搜索、Ctrl+D 切换主题）
- 一键复制结果 / 复制表达式
- 历史记录导出 CSV（内容由后端生成）
- 算式分享深链（`?expr=` 让链接自带算式）
- 清空全部历史
- 后端健康状态指示（每 30 秒探活一次）
- 响应式布局，适配手机 / 平板 / 桌面

---

## 十、部署

前端是一个纯静态站点，可以部署到任意静态托管。

### Render Static Site

1. 把本仓库推送到 GitHub；
2. Render 控制台 → New → Static Site → 选择本仓库；
3. 配置：
   - **Build Command**：留空（没有构建步骤）
   - **Publish Directory**：`src`
4. 添加一条 **Rewrite** 规则，把 API 请求转发给后端，这样前端仍然使用相对路径：

   | Source | Destination |
   | --- | --- |
   | `/api/*` | `https://832402207-calculator-api.onrender.com/api/*` |

5. 部署完成后访问 `https://<站点名>.onrender.com`。

### 只部署后端（更简单）

如果不想维护两个服务，也可以只部署后端，由后端托管前端资源
（后端仓库提供 `npm run sync:public` 把 `src/` 同步到 `public/`）。
此时访问后端地址即可，只需要一个链接。

详细步骤见后端仓库同级的 `docs/DEPLOYMENT.md`。

---

## 十一、浏览器兼容性说明

- 使用了 ES Module、可选链、`??`、`navigator.clipboard`、`<dialog>` 等较新的 API，
  要求 Chrome / Edge 100+、Firefox 98+、Safari 15.4+。
- `navigator.clipboard` 在非 HTTPS 环境（`http://localhost` 除外）不可用，
  此时复制功能会提示失败而不是静默出错。
- 遵循 `prefers-reduced-motion`，系统开启「减少动态效果」时会关闭所有动画。
- 使用 `prefers-color-scheme` 作为首次访问时的主题默认值。

---

## 十二、代码规范

见 [codestyle.md](./codestyle.md)。

---

## 十三、许可证

MIT
