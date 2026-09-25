import createMiddleware from 'next-intl/middleware';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, NextRequest } from 'next/server'; // BUG-03 : import de valeur — NextRequest est instancié (l.53) ; `import type` l'effaceait au runtime
import { routing } from '@/i18n/routing';

const COUNTRY_TO_LOCALE: Record<string, string> = {
  'CN': 'zh', 'TW': 'zh', 'HK': 'zh', 'SG': 'zh',
  'FR': 'fr', 'BE': 'fr', 'CH': 'fr', 'CA': 'fr',
  'US': 'en', 'GB': 'en', 'AU': 'en', 'IN': 'en',
  'MA': 'ar', 'DZ': 'ar', 'TN': 'ar', 'SA': 'ar',
  'AE': 'ar', 'EG': 'ar', 'QA': 'ar', 'KW': 'ar',
  'RU': 'ru', 'BY': 'ru', 'KZ': 'ru', 'KG': 'ru',
  'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'PE': 'es', 'CL': 'es', 'VE': 'es', 'EC': 'es', 'GT': 'es', 'CU': 'es', 'BO': 'es', 'DO': 'es', 'HN': 'es', 'PY': 'es', 'NI': 'es', 'SV': 'es', 'CR': 'es', 'PA': 'es', 'UY': 'es',
  'IR': 'fa', 'AF': 'fa', 'TJ': 'fa',
};

async function getLocaleFromIP(request: NextRequest): Promise<string | null> {
  const vercelCountry = request.headers.get('x-vercel-ip-country');
  if (vercelCountry && COUNTRY_TO_LOCALE[vercelCountry]) {
    return COUNTRY_TO_LOCALE[vercelCountry];
  }
  return null;
}

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasLocaleInUrl = routing.locales.some(
    l => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );
  const hasCookie = request.cookies.has('NEXT_LOCALE');

  let response: NextResponse;

  if (!hasLocaleInUrl && !hasCookie) {
    const ipLocale = await getLocaleFromIP(request);
    if (ipLocale) {
      const newHeaders = new Headers(request.headers);
      const existing = newHeaders.get('accept-language') || '';
      newHeaders.set('accept-language', `${ipLocale},${existing}`);
      const newRequest = new NextRequest(request.url, {
        headers: newHeaders,
        method: request.method,
      });
      response = intlMiddleware(newRequest);
    } else {
      response = intlMiddleware(request);
    }
  } else {
    response = intlMiddleware(request);
  }

  // Then handle Supabase auth for admin routes
  let supabaseResponse = response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if request is for admin dashboard (with or without locale prefix)
  const isDashboard = routing.locales.some(locale => pathname.startsWith(`/${locale}/dashboard`)) || pathname === '/dashboard';
  const isLogin = routing.locales.some(locale => pathname === `/${locale}/login`) || pathname === '/login';

  if (isDashboard && !user) {
    const url = request.nextUrl.clone();
    let locale = routing.locales.find(l => pathname.startsWith(`/${l}/`));
    if (!locale) {
      // Handle /dashboard or /login without locale prefix
      locale = routing.defaultLocale;
      // Redirect to locale-prefixed login with locale-prefixed dashboard as redirect target
      url.pathname = `/${locale}/login`;
      url.searchParams.set('redirect', `/${locale}/dashboard`);
    } else {
      url.pathname = `/${locale}/login`;
      url.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(url);
  }

  if (isLogin && user) {
    const url = request.nextUrl.clone();
    let locale = routing.locales.find(l => pathname.startsWith(`/${l}/`));
    if (!locale) {
      locale = routing.defaultLocale;
    }
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};