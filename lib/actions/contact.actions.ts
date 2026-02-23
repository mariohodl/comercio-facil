'use server'

import { connectToDatabase } from '../db'
import Contact from '../db/models/contact.model'
import { ContactInputSchema } from '../validator'
import { formatError } from '../utils'
import { z } from 'zod'

export async function createContact(data: z.infer<typeof ContactInputSchema>) {
    try {
        const contact = ContactInputSchema.parse(data)
        await connectToDatabase()
        const newContact = await Contact.create(contact)
        return {
            success: true,
            data: JSON.parse(JSON.stringify(newContact)),
        }
    } catch (error) {
        return { success: false, error: formatError(error) }
    }
}
