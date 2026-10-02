import { z } from 'zod';
import { EMPLOYEE_SIZES, INDUSTRIES, ORG_ROLES, PROVINCES } from './catalog';

// Server trims all strings; empty string on a nullable field means null (05-api-ghi-chu §1).
const trimmed = (max: number, min = 0) => z.string().trim().min(min).max(max);
const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v ? v : null));

export const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Chỉ dùng chữ thường không dấu, số và dấu gạch ngang');

const websiteSchema = z
  .string()
  .trim()
  .nullish()
  .transform((v) => (v ? (/^https?:\/\//.test(v) ? v : `https://${v}`) : null))
  .pipe(z.url().max(500).nullable());

export const orgProfileFields = {
  name: trimmed(200, 2),
  slug: slugSchema,
  logoMediaId: z.uuid().nullish(),
  foundedYear: z.number().int().min(1800).max(2100).nullish(),
  industryCode: z.enum(INDUSTRIES.map((i) => i.code) as [string, ...string[]]).nullish(),
  employeeSize: z.enum(EMPLOYEE_SIZES.map((s) => s.code) as [string, ...string[]]).nullish(),
  provinceCode: z.enum(PROVINCES.map((p) => p.code) as [string, ...string[]]).nullish(),
  website: websiteSchema,
  shortDescVi: nullableText(300),
  shortDescEn: nullableText(300),
  featuredStoryId: z.uuid().nullish(),
};

export const createOrgInput = z.object({
  ...orgProfileFields,
  slug: slugSchema.optional(),
  founderNames: z.array(trimmed(150, 1)).max(5).default([]),
  values: z
    .array(z.object({ nameVi: trimmed(100, 1), descriptionVi: nullableText(1000) }))
    .max(10)
    .default([]),
});
export type CreateOrgInput = z.input<typeof createOrgInput>;

export const updateOrgInput = z
  .object({ version: z.number().int(), ...orgProfileFields })
  .partial()
  .required({ version: true });
export type UpdateOrgInput = z.input<typeof updateOrgInput>;

export const orgRoleSchema = z.enum(ORG_ROLES);

export const createInviteInput = z.object({
  role: orgRoleSchema,
  email: z
    .string()
    .trim()
    .toLowerCase()
    .nullish()
    .transform((v) => (v ? v : null))
    .pipe(z.email().nullable()),
});

export const changeRoleInput = z.object({ role: orgRoleSchema });
