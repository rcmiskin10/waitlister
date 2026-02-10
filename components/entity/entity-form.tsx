'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { entityConfig, getFormFields, type EntityField } from '@/config/entity'
import { createEntity, updateEntity, type EntityRecord } from '@/lib/actions/entity'
import { Loader2 } from 'lucide-react'

interface EntityFormProps {
  entity?: EntityRecord | null
  onSuccess?: () => void
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: EntityField
  value: unknown
  onChange: (val: unknown) => void
}) {
  switch (field.type) {
    case 'rich-text':
      return (
        <Textarea
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
        />
      )

    case 'number':
    case 'currency':
      return (
        <Input
          type="number"
          value={(value as number) ?? ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
          placeholder={field.placeholder}
          step={field.type === 'currency' ? '0.01' : '1'}
        />
      )

    case 'date':
      return (
        <Input
          type="date"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    case 'datetime':
      return (
        <Input
          type="datetime-local"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    case 'boolean':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={!!value}
            onCheckedChange={(checked) => onChange(!!checked)}
          />
          <span className="text-sm text-muted-foreground">
            {field.description || field.label}
          </span>
        </div>
      )

    case 'select':
      return (
        <Select
          value={(value as string) || ''}
          onValueChange={(v) => onChange(v)}
        >
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case 'url':
    case 'email':
      return (
        <Input
          type={field.type === 'email' ? 'email' : 'url'}
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      )

    default:
      return (
        <Input
          type="text"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      )
  }
}

export function EntityForm({ entity, onSuccess }: EntityFormProps) {
  const router = useRouter()
  const fields = getFormFields()
  const isEditing = !!entity

  // Initialize form values from entity or defaults
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {}
    for (const field of fields) {
      initial[field.name] = entity
        ? (entity[field.name] ?? field.defaultValue ?? '')
        : (field.defaultValue ?? '')
    }
    return initial
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateField(name: string, value: unknown) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = isEditing
      ? await updateEntity(entity!.id, values)
      : await createEntity(values)

    setLoading(false)

    if (!result.success) {
      setError(result.error || 'Something went wrong')
      return
    }

    if (onSuccess) {
      onSuccess()
    } else {
      router.push(`/dashboard/${entityConfig.slug}`)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {field.description && field.type !== 'boolean' && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
          <FieldInput
            field={field}
            value={values[field.name]}
            onChange={(val) => updateField(field.name, val)}
          />
        </div>
      ))}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? `Update ${entityConfig.name}` : `Create ${entityConfig.name}`}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
