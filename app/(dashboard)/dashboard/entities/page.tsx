import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { entityConfig } from '@/config/entity'
import { listEntities } from '@/lib/actions/entity'
import { EntityList } from '@/components/entity/entity-list'

export default async function EntitiesPage() {
  const items = await listEntities()
  const Icon = entityConfig.icon

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{entityConfig.pluralName}</h1>
          <p className="text-muted-foreground">
            Manage your {entityConfig.pluralName.toLowerCase()}.
          </p>
        </div>
        {entityConfig.allowCreate && (
          <Link href="/dashboard/entities/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New {entityConfig.name}
            </Button>
          </Link>
        )}
      </div>

      <EntityList items={items} />
    </div>
  )
}
