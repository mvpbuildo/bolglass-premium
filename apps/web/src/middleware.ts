import createMiddleware from 'next-intl/middleware';
import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

const intlMiddleware = createMiddleware({
  locales: ['pl', 'en', 'de'],
  defaultLocale: 'pl'
});

export default auth((req) => {
  const isAuth = !!req.auth;
  const role = req.auth?.user?.role;
  const isAdminPath = req.nextUrl.pathname.includes('/admin');

  if (isAdminPath) {
    if (!isAuth) {
      return Response.redirect(new URL('/login', req.nextUrl));
    }
    if (role !== 'ADMIN') {
      // Jeśli zalogowany, ale nie jest adminem - przekieruj na stronę informacyjną
      return Response.redirect(new URL('/unauthorized', req.nextUrl));
    }
  }

  return intlMiddleware(req);
});

export const config = {
  // Skip all paths that should not be internationalized.
  // This skips the folders "api", "_next" and all files with an extension (e.g. favicon.ico)
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
