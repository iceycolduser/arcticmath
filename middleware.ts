import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BLOCKED_AGENTS = [
  'ContentKeeper',
  'CK-WEBFILTER',
  'contentkeeper',
  'bot',
  'crawler',
  'spider',
  'wget',
  'curl',
  'python-requests',
  'libwww-perl',
  'httpclient',
  'java',
];

const ALLOWED_BROWSERS = [
  'mozilla',
  'chrome',
  'safari',
  'firefox',
  'edge',
  'opera',
];

export function middleware(req: NextRequest) {
  const userAgentRaw = req.headers.get('user-agent') || '';
  const userAgent = userAgentRaw.toLowerCase();

  if (!userAgentRaw || userAgentRaw.trim() === '') {
    return new Response('Blocked: No User-Agent', { status: 403 });
  }

  for (const blockedAgent of BLOCKED_AGENTS) {
    if (userAgent.includes(blockedAgent.toLowerCase())) {
      return new Response('Blocked: Suspicious User-Agent', { status: 403 });
    }
  }

  const allowed = ALLOWED_BROWSERS.some(browser => userAgent.includes(browser));
  if (!allowed) {
    return new Response('Blocked: Unknown Browser', { status: 403 });
  }

  return NextResponse.next();
}
