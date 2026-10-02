import 'server-only';
import { getDb } from '@nexture/db';

/** Atlas connects as atlas_reader: SELECT on schema atlas only, no access to core. */
export const db = () => getDb(process.env.DATABASE_URL_ATLAS!);
