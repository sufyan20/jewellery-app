import { defineEventHandler, createError } from 'h3'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    try {
        // Check if prisma is initialized and connected
        const calculations = await prisma.calculation.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                motiRequirements: true,
                colours: {
                    include: {
                        customMotis: true
                    }
                },
                _count: {
                    select: { gatePasses: true }
                }
            }
        })

        return calculations
    } catch (error: any) {
        console.error('Database Error:', error.message)

        // Return empty array instead of 500 if DB is down during dev/setup
        // But still log the error
        return []
    }
})
