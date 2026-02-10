import { Rocket } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type FieldType =
  | 'text'
  | 'rich-text'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'select'
  | 'multi-select'
  | 'tags'
  | 'url'
  | 'email'

export interface EntityField {
  name: string
  label: string
  type: FieldType
  required: boolean
  placeholder?: string
  description?: string
  options?: string[]
  defaultValue?: string | number | boolean
  showInList?: boolean
  showInForm?: boolean
}

export interface EntityConfig {
  name: string
  pluralName: string
  slug: string
  icon: LucideIcon
  fields: EntityField[]
  titleField: string
  descriptionField?: string
  defaultSort: { field: string; direction: 'asc' | 'desc' }
  allowCreate: boolean
  allowEdit: boolean
  allowDelete: boolean
  allowExport: boolean
}

export const entityConfig: EntityConfig = {
  name: 'Waitlist Page',
  pluralName: 'Waitlist Pages',
  slug: 'waitlist_pages',
  icon: Rocket,

  fields: [
    {
      name: 'page_name',
      label: 'Page Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., My Awesome Product Launch',
      showInList: true,
      showInForm: true,
    },
    {
      name: 'subdomain',
      label: 'Subdomain',
      type: 'text',
      required: true,
      placeholder: 'e.g., myproduct',
      showInList: true,
      showInForm: true,
    },
    {
      name: 'custom_domain',
      label: 'Custom Domain',
      type: 'url',
      required: false,
      placeholder: 'e.g., https://www.myproduct.com',
      showInList: true,
      showInForm: true,
    },
    {
      name: 'headline',
      label: 'Headline',
      type: 'text',
      required: true,
      placeholder: 'e.g., Get early access to My Awesome Product!',
      showInList: true,
      showInForm: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'rich-text',
      required: false,
      placeholder: 'Tell visitors about your product and why they should sign up.',
      showInList: false,
      showInForm: true,
    },
    {
      name: 'launch_date',
      label: 'Launch Date',
      type: 'date',
      required: false,
      showInList: false,
      showInForm: true,
    },
    {
      name: 'referral_tracking_enabled',
      label: 'Referral Tracking Enabled',
      type: 'boolean',
      required: true,
      defaultValue: 'true',
      showInList: false,
      showInForm: true,
    },
    {
      name: 'signup_count',
      label: 'Signups',
      type: 'number',
      required: true,
      defaultValue: '0',
      showInList: false,
      showInForm: false,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: ['draft', 'live', 'launched', 'archived'],
      defaultValue: 'draft',
      showInList: true,
      showInForm: true,
    }
  ],

  titleField: 'page_name',
  descriptionField: 'headline',
  defaultSort: { field: 'created_at', direction: 'desc' },

  allowCreate: true,
  allowEdit: true,
  allowDelete: true,
  allowExport: true,
}

export function getListFields(): EntityField[] {
  return entityConfig.fields.filter((f) => f.showInList !== false)
}

export function getFormFields(): EntityField[] {
  return entityConfig.fields.filter((f) => f.showInForm !== false)
}

export function fieldTypeToSql(type: FieldType): string {
  const mapping: Record<FieldType, string> = {
    text: 'TEXT',
    'rich-text': 'TEXT',
    number: 'INTEGER',
    currency: 'NUMERIC(10,2)',
    date: 'DATE',
    datetime: 'TIMESTAMPTZ',
    boolean: 'BOOLEAN DEFAULT FALSE',
    select: 'TEXT',
    'multi-select': 'TEXT[]',
    tags: 'TEXT[]',
    url: 'TEXT',
    email: 'TEXT',
  }
  return mapping[type] || 'TEXT'
}

export function fieldTypeToZod(field: EntityField): string {
  const base: Record<FieldType, string> = {
    text: 'z.string()',
    'rich-text': 'z.string()',
    number: 'z.coerce.number()',
    currency: 'z.coerce.number()',
    date: 'z.string()',
    datetime: 'z.string()',
    boolean: 'z.boolean()',
    select: `z.enum([${field.options?.map((o) => `'${o}'`).join(', ') || "'draft'"}])`,
    'multi-select': 'z.array(z.string())',
    tags: 'z.array(z.string())',
    url: 'z.string().url()',
    email: 'z.string().email()',
  }
  let schema = base[field.type] || 'z.string()'
  if (!field.required) {
    schema += '.optional()'
  }
  return schema
}
