import { z, type ZodTypeAny } from 'zod'
import { entityConfig, type EntityField, type FieldType } from '@/config/entity'

function fieldToZodSchema(field: EntityField): ZodTypeAny {
  const typeMap: Record<FieldType, () => ZodTypeAny> = {
    text: () => z.string().min(1, `${field.label} is required`),
    'rich-text': () => z.string().min(1, `${field.label} is required`),
    number: () => z.coerce.number(),
    currency: () => z.coerce.number().min(0),
    date: () => z.string().min(1),
    datetime: () => z.string().min(1),
    boolean: () => z.boolean(),
    select: () =>
      field.options
        ? z.enum(field.options as [string, ...string[]])
        : z.string(),
    'multi-select': () => z.array(z.string()),
    tags: () => z.array(z.string()),
    url: () => z.string().url(`${field.label} must be a valid URL`),
    email: () => z.string().email(`${field.label} must be a valid email`),
  }

  let schema: ZodTypeAny = (typeMap[field.type] || (() => z.string()))()

  if (!field.required) {
    if (['text', 'rich-text', 'url', 'email', 'date', 'datetime'].includes(field.type)) {
      schema = z.union([z.string(), z.literal('')]).optional()
    } else {
      schema = schema.optional()
    }
  }

  return schema
}

// Build Zod schema dynamically from entity config
export function buildEntitySchema() {
  const shape: Record<string, ZodTypeAny> = {}

  for (const field of entityConfig.fields) {
    if (field.showInForm === false) continue
    shape[field.name] = fieldToZodSchema(field)
  }

  return z.object(shape)
}

// Pre-built schema for use in server actions
export const entitySchema = buildEntitySchema()

// Type from the schema
export type EntityFormData = z.infer<typeof entitySchema>
