import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { entityConfig } from '@/config/entity'
import { getEntity } from '@/lib/actions/entity'
import { EntityForm } from '@/components/entity/entity-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditEntityPage({ params }: Props) {
  const { id } = await params
  const entity = await getEntity(id)

  if (!entity) {
    notFound()
  }

  const title = String(entity[entityConfig.titleField] || entityConfig.name)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit {entityConfig.name}</h1>
        <p className="text-muted-foreground">
          Editing &ldquo;{title}&rdquo;
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>
            Update the details for this {entityConfig.name.toLowerCase()}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EntityForm entity={entity} />
        </CardContent>
      </Card>
    </div>
  )
}
