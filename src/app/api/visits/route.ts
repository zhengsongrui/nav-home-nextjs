// 访问记录接口 - 记录访问者的 IP、时间与访问位置，并追加写入 JSON 文件
// 由前端在"进入首页"、"点击访问某项目"时调用（POST /api/visits）
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// 强制动态渲染：写入文件必须每次实时执行，避免路由被静态优化缓存
export const dynamic = 'force-dynamic';

// 访问记录 JSON 文件路径（项目根目录下 data/visits.json）
const VISITS_FILE = path.join(process.cwd(), 'data', 'visits.json');

// 安全提取错误信息，兼容 Error 对象
const getErrorMessage = (error: unknown) => {
  const e = error as { message?: string } | null;
  return e?.message || '未知错误';
};

// 获取当前北京时间（UTC+8），返回带时区标识的 ISO 格式字符串
const getBeijingTime = (): string => {
  // 在 UTC 时间戳上增加 8 小时，并补上 +08:00 时区标识
  return new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('Z', '+08:00');
};

// 从请求头中提取访问者 IP（兼容反向代理转发的 x-forwarded-for）
const getClientIp = (request: NextRequest): string => {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
};

// 处理 POST /api/visits - 记录一次访问（IP、时间、位置）并写入 JSON 文件
export async function POST(request: NextRequest) {
  try {
    // 解析请求体，获取访问位置（网页内位置，如"进入首页"、"访问项目：xxx"）
    const body = await request.json().catch(() => null);
    const location = typeof body?.location === 'string' ? body.location.trim() : '未知位置';

    // 组装单条访问记录
    const record = {
      ip: getClientIp(request), // 访问者 IP
      time: getBeijingTime(), // 访问时间（北京时间，ISO 格式）
      location, // 访问位置
    };

    // 确保数据目录存在（首次写入时自动创建）
    await fs.mkdir(path.dirname(VISITS_FILE), { recursive: true });

    // 读取已有记录（文件不存在或内容损坏时按空数组处理）
    let records: typeof record[] = [];
    try {
      const content = await fs.readFile(VISITS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) records = parsed;
    } catch {
      records = [];
    }

    // 追加新记录并写回文件（缩进 2 便于人工查看）
    records.push(record);
    await fs.writeFile(VISITS_FILE, JSON.stringify(records, null, 2), 'utf-8');

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('写入访问记录时出错:', error);
    return NextResponse.json(
      { success: false, error: '写入访问记录时出错', message: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
