// AI 聊天接口 - 代理第三方 AI 服务（demo 用途）
// 接口相关配置统一收口在本 api 目录，前端只请求 /api/ai/chat
// 上游已支持流式/非流式，本接口仅做转发：
//   - chatStream=true  透传上游 SSE 流（Content-Type: text/event-stream），前端打字机效果
//   - 默认（非流式）    返回纯文本回复
import { NextRequest } from 'next/server';

// 强制动态渲染：流式响应必须实时透传，避免路由被静态优化缓存
export const dynamic = 'force-dynamic';

// 第三方 AI 服务地址与超时时间（接口配置）
// AI_API_URL 从项目 env 文件（如 .env.local）读取，未配置时回退到默认地址
const AI_API_URL = process.env.AI_API_URL || 'http://live2d.zhengsongrui.life/asrText';
const AI_TIMEOUT = 15000;

// 安全提取错误信息，兼容 Error 对象、带 code 的对象及普通字符串
const getErrorMessage = (error: unknown) => {
  const e = error as { code?: string; message?: string } | null;
  return e?.code || e?.message || '未知错误';
};

// 兼容第三方接口各种返回格式（纯文本或 JSON），统一提取回复文本
const extractReply = (result: string): string => {
  try {
    const json = JSON.parse(result);
    if (typeof json === 'string') return json;
    return (
      json?.data ?? json?.reply ?? json?.content ?? json?.message ?? JSON.stringify(json)
    );
  } catch {
    return result || 'AI 没有返回内容';
  }
};

// 处理 GET /api/ai/chat?text=...&chatStream=true - 转发上游并透传结果
export async function GET(request: NextRequest) {
  // 读取参数：text 默认"你好"，chatStream 默认关闭（未传或非 true 均视为非流式）
  const text = request.nextUrl.searchParams.get('text')?.trim() || '你好';
  const chatStream = request.nextUrl.searchParams.get('chatStream') === 'true';

  // 组装上游请求地址：流式时同步透传 chatStream=true，非流式不带该参数
  const upstreamUrl = `${AI_API_URL}?text=${encodeURIComponent(text)}${
    chatStream ? '&chatStream=true' : ''
  }`;

  try {
    const upstream = await fetch(upstreamUrl, {
      signal: AbortSignal.timeout(AI_TIMEOUT),
    });

    // 本项目约定：上游返回 404 即视为 AI 服务未启动，返回 503 供前端弹出提示
    if (upstream.status === 404) {
      return new Response('服务未启动，请联系开发者启动AI语音Agent后端。', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // 其他上游异常状态统一返回 500 纯文本文案
    if (!upstream.ok) {
      return new Response(`哎呀，出错了：上游返回 ${upstream.status}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // 流式：直接透传上游 SSE 响应体，前端逐块读取实现打字机效果
    if (chatStream) {
      if (!upstream.body) {
        return new Response('哎呀，出错了：上游无响应流', {
          status: 500,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }
      return new Response(upstream.body, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      });
    }

    // 非流式：读取上游文本并提取回复，返回纯文本
    const result = await upstream.text();
    return new Response(extractReply(result), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    // 上游 AI 服务无法调通（未启动 / 网络异常 / 超时）：返回 503，前端据此弹出"服务未启动"提示
    console.error('调用 AI 服务失败:', getErrorMessage(error));
    return new Response('服务未启动，请联系开发者启动AI语音Agent后端。', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
