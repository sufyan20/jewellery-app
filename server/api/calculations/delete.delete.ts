import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const id = query.id as string

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Missing ID parameter'
        })
    }

    try {
        const deletedCalculation = await prisma.calculation.delete({
            where: {
                id: id
            }
        })
        return { success: true, id: deletedCalculation.id }
    } catch (error) {
        console.error('Delete error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete calculation'
        })
    }
})
