// URL collection name -> content kind (05-api.yaml paths /orgs/{orgId}/{collection}).
import type { KindDef } from './engine';
import { EVENT_KIND } from './events';
import { PERSON_KIND } from './people';
import { PRODUCT_KIND } from './products';
import { STORY_KIND } from './stories';

export const KINDS: Record<string, KindDef> = { stories: STORY_KIND, events: EVENT_KIND, people: PERSON_KIND, products: PRODUCT_KIND };
export type Collection = keyof typeof KINDS;
