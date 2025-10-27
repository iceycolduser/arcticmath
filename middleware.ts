import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of blocked user-agent keywords (expand as needed)
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

// List of allowed browsers (for stricter checks, optional)
const ALLOWED_BROWSERS = [
  'mozilla',
  'chrome',
  'safari',
  'firefox',
  'edge',
  'opera',
  // Add more if needed
];

export function middleware(req: NextRequest) {
  const userAgentRaw = req.headers.get('user-agent') || '';
  const userAgent = userAgentRaw.toLowerCase();

  // Block requests with no or empty User-Agent (usually bots)
  if (!userAgentRaw || userAgentRaw.trim() === '') {
    return new Response('Blocked: No User-Agent', { status: 403 });
  }

  // Block if User-Agent contains known bad keywords
  for (const blockedAgent of BLOCKED_AGENTS) {
    if (userAgent.includes(blockedAgent.toLowerCase())) {
      return new Response('Blocked: Suspicious User-Agent', { status: 403 });
    }
  }

  // Optional: block if User-Agent doesn't contain allowed browser keywords
  // This helps block some bots masquerading with weird UAs
  const allowed = ALLOWED_BROWSERS.some(browser => userAgent.includes(browser));
  if (!allowed) {
    // You can comment this out if too aggressive
    return new Response('Blocked: Unknown Browser', { status: 403 });
  }

  // Optionally block requests to suspicious paths or query params (if you want)
  // const url = req.nextUrl;
  // if (url.pathname.includes('/proxy') || url.search.includes('unblock')) {
  //   return new Response('Blocked: Suspicious Path', { status: 403 });
  // }

  // Passed all checks — allow request
  return NextResponse.next();
}
