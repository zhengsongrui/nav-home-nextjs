import { useState } from "react";

// 是否开启流式请求（chatStream=true，打字机效果）。改为 false 则走非流式接口直接显示
const USE_CHAT_STREAM = true;
// 打字机速度：每追加一个字符的间隔（毫秒）
const TYPE_INTERVAL = 30;

// 通用 SSE 解析：收集 data: 消息中的 content，返回完整回复文本
// 兼容 /api/ai/chat 流式响应：data: {"content":"..."} 与结束标记 data: {"done":true}
async function readSseContent(res: Response): Promise<string> {
  const reader = res.body!.getReader(); // 读取响应数据流
  const decoder = new TextDecoder("utf-8");
  let buffer = ""; // 缓存可能被截断的半行
  let reply = ""; // 累积的回复内容

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE 消息以空行分隔，逐条取出 "data:" 行
    const lines = buffer.split("\n");
    buffer = lines.pop()!; // 末尾半行留到下一轮
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const msg = JSON.parse(line.slice(5)); // 形如 {"content":"今天"}
      if (msg.done) {
        reader.cancel(); // {done:true} 表示结束，提前关闭连接
        return reply;
      }
      reply += msg.content; // 累积内容
    }
  }
  return reply;
}

// 打字机效果：按固定节奏逐字符追加渲染完整文本，保证打字机效果可感知
const typewriter = (text: string, setText: (t: string) => void) =>
  new Promise<void>((resolve) => {
    let shown = 0;
    const timer = setInterval(() => {
      shown += 1;
      setText(text.slice(0, shown)); // 显示前 shown 个字符
      if (shown >= text.length) {
        clearInterval(timer);
        resolve();
      }
    }, TYPE_INTERVAL);
  });

// 自定义 Hook：AI 聊天——管理回复文案，封装流式/非流式接口请求逻辑
export default function useAiChat() {
  // AI 回复文案（初始为欢迎语）
  const [aiReply, setAiReply] = useState("您好，我是您的AI小助手，有问题可以点我。");
  // AI 后端服务是否未启动（true 时由 Helper 弹出提示）
  const [serviceDown, setServiceDown] = useState(false);

  // 调用后端 AI 聊天接口（接口配置收口在 /api/ai/chat），返回值填入气泡
  const fetchAiReply = async (text: string) => {
    setAiReply("思考中…");
    setServiceDown(false); // 每次请求前重置服务状态
    try {
      // 流式：携带 chatStream=true，先收集完整回复再打字机渲染
      if (USE_CHAT_STREAM) {
        const response = await fetch(
          `/api/ai/chat?text=${encodeURIComponent(text)}&chatStream=true`,
        );
        // 503：/api/ai/chat 判定上游 AI 服务无法调通，弹出"服务未启动"提示
        if (response.status === 503) {
          setServiceDown(true);
          setAiReply("AI 服务未启动");
          return;
        }
        if (!response.ok) {
          setAiReply("哎呀，出错了：" + (await response.text()));
          return;
        }
        const reply = await readSseContent(response); // 收集 SSE 完整回复
        if (!reply) {
          setAiReply("AI 没有返回内容"); // 兜底：无任何内容时提示
          return;
        }
        setAiReply(""); // 清空占位文案，开始打字机
        await typewriter(reply, setAiReply); // 逐字符追加，打字机效果
        return;
      }

      // 非流式：直接读取纯文本回复，无打字机效果
      const response = await fetch(`/api/ai/chat?text=${encodeURIComponent(text)}`);
      // 503：/api/ai/chat 判定上游 AI 服务无法调通，弹出"服务未启动"提示
      if (response.status === 503) {
        setServiceDown(true);
        setAiReply("AI 服务未启动");
        return;
      }
      if (!response.ok) {
        setAiReply("哎呀，出错了：" + (await response.text()));
        return;
      }
      const reply = await response.text();
      setAiReply(reply || "AI 没有返回内容");
    } catch {
      // fetch 抛错说明后端服务无法调通，弹出"服务未启动"提示
      setServiceDown(true);
      setAiReply("AI 服务未启动");
    }
  };

  return {
    aiReply,
    fetchAiReply,
    serviceDown, // AI 后端是否未启动
    closeServiceDown: () => setServiceDown(false), // 关闭提示弹窗
  };
}
