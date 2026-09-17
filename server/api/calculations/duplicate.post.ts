import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { id } = body

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID is required' })
    }

    try {
        // Fetch original record with all relations
        const original = await prisma.calculation.findUnique({
            where: { id },
            include: {
                motiRequirements: true,
                colours: {
                    include: { customMotis: true }
                }
            }
        })

        if (!original) {
            throw createError({ statusCode: 404, statusMessage: 'Calculation not found' })
        }

        // Create duplicate with "Copy of" prefix
        const duplicate = await prisma.calculation.create({
            data: {
                setName: `Copy of ${original.setName}`,
                labourPerSet: original.labourPerSet,
                setImageUrl: original.setImageUrl,
                notes: original.notes,
                motiRequirements: {
                    create: original.motiRequirements.map((m) => ({
                        type: m.type,
                        lariPerSet: m.lariPerSet,
                        ratePerLari: m.ratePerLari
                    }))
                },
                colours: {
                    create: original.colours.map((c) => ({
                        name: c.name,
                        qty: c.qty,
                        hasCustom: c.hasCustom,
                        customMotis: {
                            create: c.customMotis.map((cm) => ({
                                type: cm.type,
                                lariPerSet: cm.lariPerSet,
                                ratePerLari: cm.ratePerLari
                            }))
                        }
                    }))
                }
            },
            include: {
                motiRequirements: true,
                colours: { include: { customMotis: true } },
                _count: { select: { gatePasses: true } }
            }
        })

        return duplicate
    } catch (error: any) {
        if (error.statusCode) throw error
        throw createError({ statusCode: 500, statusMessage: error.message })
    }
})
