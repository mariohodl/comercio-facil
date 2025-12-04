import { getAttributesByStore } from '@/lib/actions/attribute.actions'
import { AttributeClient } from './client'

export default async function AttributesPage(props: {
    params: Promise<{ store: string }>
}) {
    const params = await props.params
    const attributes = await getAttributesByStore(params.store)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <AttributeClient data={attributes} storeId={params.store} />
        </div>
    )
}
