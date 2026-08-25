// 健康检查路由，判断该后端服务是否能成功访问
import { NextResponse } from 'next/server';

/**
 * 处理 GET /api/health 请求
 * 用于监控/部署平台探测服务是否存活，成功访问即返回 200 与状态信息
 */
export async function GET() {
  // 返回健康状态，status 为 ok 表示服务运行正常
  // NextResponse.json 默认返回 HTTP 200，且 JSON 为 UTF-8 编码，可直接输出中文字符串
  return NextResponse.json({ status: 'ok', message: '服务运行正常' });
}
