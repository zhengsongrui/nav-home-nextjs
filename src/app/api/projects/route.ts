// 项目信息接口 - 返回个人项目信息（含地址）及其实时服务状态
// 由 Express demo（demo.js）的 GET /api/projects 转换而来
import { NextResponse } from 'next/server';
import { projects } from '@/config/projects';
import type {
  ServiceStatus,
  ServiceStatusDown,
  ProjectWithStatus,
  ProjectsApiResponse,
  ProjectsApiErrorResponse,
} from '@/types/projects';

// 实时健康检查接口，禁止被 Next.js 静态优化/缓存，确保每次请求都执行最新检查
export const dynamic = 'force-dynamic';

// 状态码百位 → 服务状态映射（2xx=up，3xx=redirect，4xx=client_error，5xx=server_error）
const STATUS_MAP: Record<number, string> = {
  2: 'up',
  3: 'redirect',
  4: 'client_error',
  5: 'server_error',
};

// 服务不可用的公共返回结构，error 为可选字段（网络失败时附带失败原因）
const downStatus = (errorText?: string): ServiceStatusDown => ({
  online: false,
  status: 'down',
  statusCode: null,
  responseTime: null,
  checkedAt: new Date().toISOString(),
  ...(errorText ? { errorText } : {}),
});

// 安全提取错误信息，兼容 Error 对象、带 code 的对象及普通字符串
const getErrorMessage = (error: unknown) => {
  const e = error as { code?: string; message?: string } | null;
  return e?.code || e?.message || '未知错误';
};

// 服务检查函数 - 检查 URL 是否在线（用原生 fetch 替代 axios，超时与错误语义保持一致）
async function checkServiceStatus(url?: string): Promise<ServiceStatus> {
  try {
    // 无地址时直接判定为不可用，避免 fetch(undefined) 报错
    if (!url) return downStatus();

    const startTime = Date.now();
    // fetch 不会因 HTTP 错误状态码 reject，天然等价于 axios 的 validateStatus(200-499)
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000), // 5 秒超时
    });
    return {
      online: response.status < 400, // 400 以下认为在线
      status: STATUS_MAP[Math.floor(response.status / 100)] || 'unknown',
      statusCode: response.status,
      responseTime: Date.now() - startTime,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    // 请求失败，服务不可用
    return downStatus(getErrorMessage(error));
  }
}

// 处理 GET /api/projects 请求 - 并行检查所有项目的服务状态并返回汇总信息
export async function GET(): Promise<NextResponse<ProjectsApiResponse | ProjectsApiErrorResponse>> {
  try {
    // 并行检查所有项目的服务状态
    const projectsWithStatus: ProjectWithStatus[] = await Promise.all(
      projects.map(async (project) => ({
        ...project,
        serviceStatus: await checkServiceStatus(project.url),
      }))
    );

    // 计算总体服务状态
    const online = projectsWithStatus.filter((p) => p.serviceStatus.online).length;
    const total = projectsWithStatus.length;
    const overallStatus = online === total ? 'healthy' : online > 0 ? 'degraded' : 'unhealthy';

    return NextResponse.json({
      projects: projectsWithStatus,
      total,
      timestamp: new Date().toISOString(),
      serviceSummary: {
        overallStatus,
        online,
        offline: total - online,
        total,
        healthPercentage: Math.round((online / total) * 100),
      },
    });
  } catch (error) {
    console.error('获取项目信息时出错:', error);
    return NextResponse.json(
      { error: '获取项目信息时出错', message: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
