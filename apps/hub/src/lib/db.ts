import 'server-only';
import { getDb } from '@nexture/db';

export const db = () => getDb(process.env.DATABASE_URL!);
