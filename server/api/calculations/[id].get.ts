import { defineEventHandler, createError, getRouterParam } from 'h3'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID is required'
        })
    }

    try {
        const calculation = await prisma.calculation.findUnique({
            where: { id },
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

        if (!calculation) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Calculation not found'
            })
        }

        return calculation
    } catch (error: any) {
        if (error.statusCode) throw error

        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }
})
