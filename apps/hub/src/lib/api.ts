import 'server-only';
import { NextResponse } from 'next/server';
import { AppError, type Ctx } from '@nexture/core';
import { db } from './db';
import { actorOf, getSession } from './session';
import { atlasNotifier, storage } from './storage';

type Params = Promise<Record<string, string>>;
type Handler<P> = (args: { req: Request; params: P; ctx: Ctx; email: string }) => Promise<unknown>;

const errorResponse = (e: AppError) => NextResponse.json(e.toJSON(), { status: e.status });

/** Wraps a /api/v1 route: session -> Ctx, AppError -> JSON error body (05-api-ghi-chu §3). */
export function route<P extends Record<string, string>>(fn: Handler<P>, opts: { status?: number; auth?: boolean } = {}) {
  return async (req: Request, { params }: { params: Params }) => {
    try {
      const s = await getSession();
      if (opts.auth !== false && !s) throw new AppError('UNAUTHENTICATED');
      const ctx: Ctx = { db: db(), actor: s ? actorOf(s.user) : { userId: '', platformRole: 'USER' }, storage: storage(), atlas: atlasNotifier() };
      const out = await fn({ req, params: (await params) as P, ctx, email: s?.user.email ?? '' });
      if (out === undefined) return new NextResponse(null, { status: 204 });
      return NextResponse.json(out, { status: opts.status ?? 200 });
    } catch (e) {
      if (e instanceof AppError) return errorResponse(e);
      console.error(e);
      return errorResponse(new AppError('INTERNAL'));
    }
  };
}

export async function body(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new AppError('VALIDATION_FAILED', { fields: { _: 'Body phải là JSON' } });
  }
}
