import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '~/server/utils/prisma'


export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    console.log(`[${new Date().toISOString()}] Request:`, body)
    const { setName, labourPerSet, setImageUrl, notes, motiRequirements, colours } = body

    try {
        const calculation = await prisma.calculation.create({
            data: {
                setName: setName || 'Unnamed Set',
                labourPerSet: parseFloat(labourPerSet) || 0,
                setImageUrl,
                notes: notes || '',
                motiRequirements: {
                    create: (motiRequirements || []).map((moti: any) => ({
                        type: moti.type || 'Standard',
                        lariPerSet: parseFloat(moti.lariPerSet) || 0,
                        ratePerLari: parseFloat(moti.ratePerLari) || 0
                    }))
                },
                colours: {
                    create: (colours || []).map((colour: any) => ({
                        name: colour.name || 'Unnamed Colour',
                        qty: parseInt(colour.qty) || 0,
                        hasCustom: !!colour.hasCustom,
                        customMotis: {
                            create: colour.hasCustom && colour.customMoti ? colour.customMoti.map((moti: any) => ({
                                type: moti.type || 'Custom',
                                lariPerSet: parseFloat(moti.lariPerSet) || 0,
                                ratePerLari: parseFloat(moti.ratePerLari) || 0
                            })) : []
                        }
                    }))
                }
            },
            include: {
                motiRequirements: true,
                colours: {
                    include: {
                        customMotis: true
                    }
                }
            }
        })

        return calculation
    } catch (error: any) {

        console.error('Prisma Create Error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }
})
