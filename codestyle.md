# 前端代码规范（codestyle.md）

## 规范来源

本项目的前端代码规范依据以下主流官方/社区规范裁剪而成，并结合
「原生 HTML / CSS / ES Module + 零第三方依赖」的技术栈做了取舍：

| 来源 | 采纳内容 |
| --- | --- |
| [Google HTML/CSS Style Guide](https://google.github.io/styleguide/htmlcssguide.html) | HTML 语义化与缩进、CSS 类名小写连字符、属性顺序、避免 `!important`（除非必要） |
| [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html) | 命名规则、ES Module、`const` 优先、JSDoc 注释 |
| [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) | 避免直接操作 DOM 的隐式全局、优先 `textContent` 防 XSS、事件处理规范 |
| [MDN Web Docs](https://developer.mozilla.org/zh-CN/) | 使用标准 DOM API、Web 无障碍（a11y）实践 |
| [BEM 命名方法论](https://getbem.com/) | CSS 类名采用「块__元素--修饰符」结构 |

**对 Google 规范的有意偏离**（已在代码注释中说明）：

1. Google 规范建议 HTML 属性按字母序排列。本项目按**语义分组**排列
   （`id` → `class` → `data-*` → 无障碍属性），更符合阅读直觉。
2. Google 规范建议行宽 80 字符。本项目放宽到 **100 字符**，避免中文注释频繁折行。

---

## 一、文件组织

```
src/
├── index.html          单页应用外壳
├── css/
│   ├── theme.css       仅放设计令牌（CSS 自定义属性）
│   └── styles.css      仅放布局与组件样式
└── js/
    ├── main.js         入口，负责装配与跨模块协调
    ├── config.js       配置解析
    ├── api.js          网络层
    └── <视图>.js        每个视图一个模块
```

**硬性规则：**

1. **一个模块只做一件事**。网络请求只写在 `api.js`，格式化只写在 `format.js`，
   DOM 辅助只写在 `dom.js`。
2. **视图模块之间禁止互相 import**。跨视图协作一律通过 `main.js` 传入的回调函数完成。
   这样可以避免循环依赖，也让数据流方向唯一。
3. **`main.js` 之外的文件不得直接调用 `document.querySelector` 去操作别的模块的元素**。
4. CSS 分两个文件：`theme.css` 只放变量，`styles.css` 只放规则，不混用。

---

## 二、命名规范

| 类别 | 规则 | 示例 |
| --- | --- | --- |
| JS 文件 | 小写驼峰 | `calculator.js`、`history.js` |
| JS 变量 / 函数 | `camelCase` | `normalizedExpression`、`renderItem()` |
| JS 模块级常量 | `UPPER_SNAKE_CASE` | `PAGE_SIZE`、`HEALTH_INTERVAL` |
| ES Module 导出的单例 | 小写 | `export const api = ...`、`export const config = ...` |
| CSS 类名 | 块 `block`、元素 `block__element`、修饰符 `block--modifier` | `.screen__result`、`.key--equals` |
| CSS 状态类 | `is-` 前缀 | `.is-active`、`.is-error`、`.is-loading` |
| CSS 自定义属性 | `--kebab-case` | `--surface-1`、`--accent-glow` |
| HTML `id` | `camelCase` | `expressionInput`、`historyList` |
| `data-*` 属性 | `kebab-case` | `data-tab`、`data-insert`、`data-panel` |

### BEM 使用说明

```css
.keypad { }                 /* 块 */
.keypad__row { }            /* 元素 */
.key--equals { }            /* 修饰符（同一块的变体） */
```

不使用嵌套超过一层的选择器，避免特异性膨胀。选择器最大特异性控制在
「一个类」级别，需要覆盖时通过增加类名而不是叠加选择器。

---

## 三、HTML 规范

1. 使用**语义化标签**：`header` / `main` / `section` / `aside` / `footer` / `nav` / `output` / `dialog`。
2. 缩进 2 个空格；属性用双引号；自闭合标签统一写成 `<meta ... />`。
3. **可访问性要求（强制）**：
   - 所有纯图标按钮必须有 `aria-label` 或 `title`；
   - 装饰性元素必须加 `aria-hidden="true"`；
   - 动态更新的区域使用 `aria-live="polite"`（如结果区、历史列表、提示气泡）；
   - 表单控件必须有配对的 `<label>`（可用 `.visually-hidden` 隐藏文本）；
   - 标签页使用 `role="tablist"` / `role="tab"` / `role="tabpanel"` 与 `aria-selected`。
4. 不在 HTML 中写内联事件（`onclick="..."`），事件绑定一律在 JS 中进行。
5. 页面中所有文本使用**中文**，`<html lang="zh-CN">`。

---

## 四、CSS 规范

1. 所有颜色、圆角、阴影、字体、间距**必须使用 `theme.css` 中的自定义属性**，
   组件样式里不允许出现硬编码的颜色值（`#fff`、`rgba(...)`）。这是双主题能正常工作的前提。
2. 主题切换只通过 `:root[data-theme="dark|light"]` 替换变量，组件样式一行都不用改。
3. 布局优先使用 Flexbox 与 Grid，避免使用 `float` 与绝对定位做布局。
4. 需要多处覆盖浏览器默认样式时，允许使用少量 `!important`，
   但必须写明注释说明原因。例如：

```css
/* 注意：类选择器（如 .empty { display: flex }）优先级高于浏览器默认的
   [hidden] { display: none }，直接给元素加 hidden 属性会被覆盖。
   这里用 !important 兜底，保证 hidden 属性在任何组件里都真正生效。 */
[hidden] { display: none !important; }
```

5. 动画必须尊重 `prefers-reduced-motion`：

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

6. 交互元素必须有 `:hover`、`:active`、`:focus-visible` 三种状态，
   并且**焦点样式不能仅靠颜色区分**（使用 `outline`）。
7. 不引入任何网络字体与 CDN 资源，字体使用系统字体栈。

---

## 五、JavaScript 规范

### 5.1 语法

- 统一使用 **ES Module**（`import` / `export`），不使用 `require`。
- 禁止 `var`；能 `const` 就不 `let`。
- 使用 `===` / `!==`；字符串用单引号；语句末尾带分号。
- 优先使用 `?.` 与 `??`，但不叠加超过两级可选链。
- 使用 `async / await`，不用 `.then()` 链式写法（顶层启动流程除外）。

### 5.2 安全（本项目强制）

1. **禁止使用 `innerHTML` / `outerHTML` / `insertAdjacentHTML` 插入任何来自后端的文本。**
   历史记录里的表达式是用户输入，直接拼 HTML 会造成 XSS。
   一律使用 `document.createElement` + `textContent`（封装在 `dom.js` 的 `h()` 函数中）。
2. 用户输入不得进入 URL 拼接而不做编码，必须使用 `URLSearchParams`。
3. 校验与过滤只在展示层做最低限度的处理，**业务校验以后端为准**。

### 5.3 注释与文档

- **所有导出的函数必须有 JSDoc**，包含 `@param` 与 `@returns`。
- 每个模块顶部必须有**文件级块注释**，说明这个模块的职责边界与关键设计取舍。
- 注释解释**为什么**。例如：

```javascript
/**
 * 创建历史视图。
 * ...
 * 关键要求：列表数据只能来自 GET /api/history，
 * 前端不使用 localStorage / 内存缓存来「假装」历史记录还在。
 */
```

### 5.4 事件与状态

- 事件监听器统一集中绑定在模块末尾的「事件绑定」小节，便于审阅。
- 需要频繁触发后端请求的输入（搜索框）必须**防抖**（250ms 左右）。
- 模块内部状态放在一个 `state` 对象里，不使用散落的模块级变量。
- **不使用全局变量**，模块间的共享只通过函数参数与回调传递。

### 5.5 网络

- 所有 fetch 调用集中在 `api.js`，其他模块不得直接调用 `fetch`。
- `fetch` 必须包在 `try/catch` 中，并把网络层失败与业务层失败区分开
  （见 `ApiError.isConnectionError`）。
- 请求必须有明确的超时或失败反馈，不允许静默失败。

---

## 六、无障碍（a11y）要求

- 键盘可访问：所有可点击元素必须是 `<button>`，不使用 `<div onclick>`。
- 提供全局快捷键，并且**在输入框聚焦时不拦截普通字符键**，避免影响正常打字。
- 模态对话框使用原生 `<dialog>`，自动获得焦点陷阱与 `Esc` 关闭能力。
- 颜色对比度：正文文字与背景的对比度不低于 WCAG AA 标准。
- 不允许仅用颜色传达信息（错误状态同时使用颜色 + 文字提示）。

---

## 七、性能规范

- 不引入任何第三方库，页面总资源体积保持在 100 KB 以内（gzip 前）。
- 列表渲染使用 `replaceChildren()` 一次性替换，避免逐条 append 造成多次重排。
- 避免在滚动/输入事件中做重计算；搜索输入做防抖。
- 动画只使用 `transform` 与 `opacity`，不触发 layout。

---

## 八、提交前自检清单

- [ ] 新增的导出函数都有 JSDoc 注释
- [ ] 没有出现 `innerHTML` 拼接后端数据
- [ ] 没有硬编码的颜色值，全部走 CSS 自定义属性
- [ ] 新元素有 `aria-label`（若是纯图标按钮）
- [ ] 深浅两套主题下都检查过显示效果
- [ ] 在窄屏（≤ 720px）下检查过布局
- [ ] 断网 / 后端停止时，界面给出的是明确提示而不是白屏
