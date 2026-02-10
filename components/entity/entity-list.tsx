'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { entityConfig, getListFields, type EntityField } from '@/config/entity'
import { deleteEntity, type EntityRecord } from '@/lib/actions/entity'
import { Pencil, Trash2, Plus } from 'lucide-react'

function CellValue({ field, value }: { field: EntityField; value: unknown }) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-muted-foreground">—</span>
  }

  switch (field.type) {
    case 'boolean':
      return <Badge variant={value ? 'default' : 'secondary'}>{value ? 'Yes' : 'No'}</Badge>
    case 'select':
      return (
        <Badge variant="outline" className="capitalize">
          {String(value)}
        </Badge>
      )
    case 'currency':
      return <span>${Number(value).toFixed(2)}</span>
    case 'url':
      return (
        <a
          href={String(value)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-4 hover:underline truncate max-w-[200px] inline-block"
        >
          {String(value)}
        </a>
      )
    case 'date':
    case 'datetime':
      return <span>{new Date(String(value)).toLocaleDateString()}</span>
    case 'tags':
    case 'multi-select':
      return (
        <div className="flex flex-wrap gap-1">
          {(value as string[]).map((v) => (
            <Badge key={v} variant="secondary" className="text-xs">
              {v}
            </Badge>
          ))}
        </div>
      )
    default:
      return <span className="truncate max-w-[250px] inline-block">{String(value)}</span>
  }
}

interface EntityListProps {
  items: EntityRecord[]
}

export function EntityList({ items }: EntityListProps) {
  const router = useRouter()
  const listFields = getListFields()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeleting(id)
    const result = await deleteEntity(id)
    setDeleting(null)
    if (result.success) {
      router.refresh()
    }
  }

  if (items.length === 0) {
    const Icon = entityConfig.icon
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">
            No {entityConfig.pluralName.toLowerCase()} yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first {entityConfig.name.toLowerCase()}.
          </p>
          {entityConfig.allowCreate && (
            <Link href={`/dashboard/${entityConfig.slug}/new`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create {entityConfig.name}
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {listFields.map((field) => (
              <TableHead key={field.name}>{field.label}</TableHead>
            ))}
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              {listFields.map((field) => (
                <TableCell key={field.name}>
                  <CellValue field={field} value={item[field.name]} />
                </TableCell>
              ))}
              <TableCell>
                <div className="flex items-center gap-1">
                  {entityConfig.allowEdit && (
                    <Link href={`/dashboard/${entityConfig.slug}/${item.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  {entityConfig.allowDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          disabled={deleting === item.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {entityConfig.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete &ldquo;{String(item[entityConfig.titleField] || 'this item')}&rdquo;. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
