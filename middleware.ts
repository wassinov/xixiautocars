import createMiddleware from 'next-intl/middleware';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // First, run next-intl middleware for locale handling
  const intlResponse = intlMiddleware(request);
  if (intlResponse) return intlResponse;

  // Then handle Supabase auth for admin routes
  let supabaseResponse = NextResponse.next({ request });

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
  const pathname = request.nextUrl.pathname;
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