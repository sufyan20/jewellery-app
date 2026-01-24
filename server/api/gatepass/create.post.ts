import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { passNumber, customerName, calculationId } = body

    try {
        const gatePass = await prisma.gatePass.create({
            data: {
                passNumber,
                customerName,
                calculationId
            },
            include: {
                calculation: {
                    include: {
                        colours: {
                            include: {
                                customMotis: true
                            }
                        },
                        motiRequirements: true
                    }
                }
            }
        })

        return gatePass
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }
})
