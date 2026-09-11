import type { Project } from "@/types/projects";

export const projects: Project[] = [
  {
    id: 1,
    name: "AI语音Agent后端v1",
    description:
      "基于 Node.js 开发的基础语音 AI Agent 后端，支持接入本地或线上 API，现已实现文本对话、语音输出及文字转语音等功能。",
    url: "http://live2d.zhengsongrui.life/",
    github:
      "https://github.com/zhengsongrui/live2dAssistant/tree/main/live2dNode",
    writeStatus: "已完成",
  },
  {
    id: 10,
    name: "三角洲数据实验室",
    description:
      "专注于三角洲行动枪械数据分析，提供 DPS、TTK、BTK、伤害、射程等核心数据的计算与可视化，帮助玩家直观了解枪械性能，科学选择武器与配装。",
    url: "http://deltaLab.zhengsongrui.life/",
    github: "https://github.com/zhengsongrui/DeltaLab",
    writeStatus: "开发中",
  },
  {
    id: 2,
    name: "字体压缩工具",
    description:
      "面向 Web 前端的 OTF 字体压缩工具，可将字体转换为体积更小的 WOFF2 格式，并支持自定义压缩字符集，有效减小字体体积、提升页面加载速度。",
    url: "http://fontc.zhengsongrui.life/",
    github: "https://github.com/zhengsongrui/font-compression",
    writeStatus: "已完成",
  },
  {
    id: 3,
    name: "芋道react前端",
    description:
      "自研的 AI 工程化芋道 React 前端框架，已对接大部分系统管理接口，需搭配芋道后端服务使用。",
    github: "https://github.com/zhengsongrui/yudao-react",
    writeStatus: "已完成",
  },

  {
    id: 4,
    name: "AI阅读器",
    description:
      "基于 UniApp X 开发的安卓阅读器，已接入 index-TTS 实现克隆音色的有声阅读功能；后续计划加入 AI 文本分析，自动切换角色与旁白音色。",
    github: "hhttps://github.com/zhengsongrui/TTS-Reader",
    writeStatus: "已完成",
  },
  {
    id: 5,
    name: "index-tts文字转语音",
    description:
      "基于 FastAPI 封装的文字转语音（TTS）后端服务，提供规范的 HTTP 接口。考虑到法律道德相关问题，源码暂不开放。",
    // url: "http://f5tts.zhengsongrui.life/",
    // github: "https://github.com/zhengsongrui/f5-tts-server",
    writeStatus: "已完成",
  },
  {
    id: 6,
    name: "远程开机助手",
    description:
      "远程开机工具，服务端基于 Node.js、App 端基于 Kotlin 开发，支持对具备 PCIe 网络唤醒（Wake-on-LAN）功能的主板进行远程开机。",
    github: "https://github.com/zhengsongrui/wakeComputer",
    writeStatus: "已完成",
  },
  {
    id: 7,
    name: "live2d语音助手前端",
    description:
      "基于 Kotlin 开发的前端语音助手，集成 Live2D 虚拟形象，用于对接 AI 语音 Agent 后端。",
    github:
      "https://github.com/zhengsongrui/live2dAssistant/tree/main/live2dOfficial",
    writeStatus: "开发中",
  },
  {
    id: 8,
    name: "个人博客v2",
    description:
      "用于探索 AI 全自动开发能力上限的 Demo 博客，由开发者提出需求，AI 主导完成开发流程。",
    url: "http://zhengsongrui.life/frp/blog-v2",
    github: "https://github.com/zhengsongrui/blog-ts-v2",
    writeStatus: "维护中",
  },
  {
    id: 9,
    name: "AI生图/美化工具demo",
    description: "AI文生图，一键抠图，图片编辑美化等功能。",
    url: "http://AiPic.zhengsongrui.life/",
    github: "https://github.com/zhengsongrui/AiPicture",
    writeStatus: "开发中",
  },
];

export default projects;
