import { getAttributesByStore } from '@/lib/actions/attribute.actions'
import { AttributeClient } from './client'

export default async function AttributesPage(props: {
    params: Promise<{ store: string }>
}) {
    const params = await props.params
    const attributes = await getAttributesByStore(params.store, false) // Only store-specific for the management view

    return (
        <div className="flex-1 space-y-4 md:p-6">
            <AttributeClient data={attributes} storeId={params.store} />
        </div>
    )
}
