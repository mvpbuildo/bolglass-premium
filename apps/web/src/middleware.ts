import createMiddleware from 'next-intl/middleware';
import { auth } from "@/auth";

const intlMiddleware = createMiddleware({
  locales: ['pl', 'en', 'de'],
  defaultLocale: 'pl'
});

export default auth((req) => {
  const isAuth = !!req.auth;
  const isAdminPath = req.nextUrl.pathname.includes('/admin');

  if (isAdminPath && !isAuth) {
    return Response.redirect(new URL('/login', req.nextUrl));
  }

  return intlMiddleware(req);
});

export const config = {
  // Skip all paths that should not be internationalized.
  // This skips the folders "api", "_next" and all files with an extension (e.g. favicon.ico)
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
