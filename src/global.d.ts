// 全局 SCSS 样式模块类型声明
// Next.js 内置类型仅覆盖 *.css 与 *.module.scss，
// 这里为全局（非 module）的 *.scss 副作用导入补充声明，避免 ts(2882)
declare module "*.scss";
