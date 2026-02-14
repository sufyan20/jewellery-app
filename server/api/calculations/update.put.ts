import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { id, setName, labourPerSet, setImageUrl, notes, motiRequirements, colours } = body

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Calculation ID is required'
        })
    }

    try {
        // We use a transaction to ensure atomicity
        const updatedCalculation = await prisma.$transaction(async (tx) => {
            // 1. Update the main calculation fields
            const calculation = await tx.calculation.update({
                where: { id },
                data: {
                    setName,
                    labourPerSet: parseFloat(labourPerSet) || 0,
                    setImageUrl,
                    notes: notes || ''
                }
            })

            // 2. Handle Moti Requirements (Standard)
            // Strategy: Delete all existing linked standard motis and recreate
            // This is simpler than diffing for this scale
            await tx.motiRequirement.deleteMany({
                where: { calculationId: id }
            })

            if (motiRequirements && motiRequirements.length > 0) {
                await tx.motiRequirement.createMany({
                    data: motiRequirements.map((moti: any) => ({
                        type: moti.type || 'Standard',
                        lariPerSet: parseFloat(moti.lariPerSet) || 0,
                        ratePerLari: parseFloat(moti.ratePerLari) || 0,
                        calculationId: id
                    }))
                })
            }

            // 3. Handle Colours
            // Strategy: Delete all existing colours (and their cascaded custom motis) and recreate
            await tx.colour.deleteMany({
                where: { calculationId: id }
            })

            for (const colour of (colours || [])) {
                await tx.colour.create({
                    data: {
                        name: colour.name || 'Unnamed Colour',
                        qty: parseInt(colour.qty) || 0,
                        hasCustom: !!colour.hasCustom,
                        calculationId: id,
                        customMotis: {
                            create: colour.hasCustom && colour.customMoti ? colour.customMoti.map((moti: any) => ({
                                type: moti.type || 'Custom',
                                lariPerSet: parseFloat(moti.lariPerSet) || 0,
                                ratePerLari: parseFloat(moti.ratePerLari) || 0
                            })) : []
                        }
                    }
                })
            }

            // Return the fully updated object
            return await tx.calculation.findUnique({
                where: { id },
                include: {
                    motiRequirements: true,
                    colours: {
                        include: {
                            customMotis: true
                        }
                    }
                }
            })
        })

        return updatedCalculation

    } catch (error: any) {
        console.error('Prisma Update Error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }
})
