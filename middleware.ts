import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // IAP ヘッダーからユーザー情報を取得
  const emailHeader = request.headers.get('x-goog-authenticated-user-email');
  const idHeader = request.headers.get('x-goog-authenticated-user-id');

  // 開発環境では認証をスキップ
  const isDevelopment = process.env.NODE_ENV === 'development';

  // IAP ヘッダーがない場合（本番環境のみチェック）
  if (!isDevelopment && (!emailHeader || !idHeader)) {
    // ルートパス以外へのアクセスはルートにリダイレクト
    if (request.nextUrl.pathname !== '/') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: [
    /*
     * 以下のパスを除くすべてのパスにマッチ:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
