import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { entityConfig } from '@/config/entity'
import { EntityForm } from '@/components/entity/entity-form'

export default function NewEntityPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New {entityConfig.name}</h1>
        <p className="text-muted-foreground">
          Create a new {entityConfig.name.toLowerCase()}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>
            Fill in the details for this {entityConfig.name.toLowerCase()}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EntityForm />
        </CardContent>
      </Card>
    </div>
  )
}
