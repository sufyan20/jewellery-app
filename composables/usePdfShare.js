// Composable for Native PDF Sharing using jsPDF and jspdf-autotable
// This approach is more robust than html2pdf for complex layouts and Nuxt environments

export const usePdfShare = () => {
    const isSharing = ref(false)

    const loadLibraries = () => {
        return new Promise((resolve, reject) => {
            // Check if both libraries are already loaded and attached
            if (window.jspdf && window.jspdf.jsPDF && typeof window.jspdf.jsPDF.API.autoTable === 'function') {
                resolve()
                return
            }

            // Load sequentially to ensure jspdf-autotable can attach to jspdf
            const jspdfScript = document.createElement('script')
            jspdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'

            jspdfScript.onload = () => {
                const autotableScript = document.createElement('script')
                autotableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js'

                autotableScript.onload = () => {
                    // Give it a tiny bit of time to attach to the prototype
                    setTimeout(() => resolve(), 100)
                }
                autotableScript.onerror = () => reject(new Error('Failed to load jspdf-autotable'))
                document.head.appendChild(autotableScript)
            }

            jspdfScript.onerror = () => reject(new Error('Failed to load jsPDF'))
            document.head.appendChild(jspdfScript)
        })
    }

    const formatNumber = (num) => {
        return parseFloat(num || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    const formatCurrency = (num) => {
        return `Rs ${formatNumber(num)}`
    }

    const addImageToDoc = async (doc, imgUrl, x, y, w, h) => {
        if (!imgUrl) return y
        try {
            const img = new Image()
            img.src = imgUrl
            await new Promise((resolve) => {
                img.onload = resolve
                img.onerror = resolve
            })
            if (img.complete && img.naturalWidth !== 0) {
                doc.addImage(img, 'JPEG', x, y, w, h)
                return y + h + 10
            }
        } catch (e) {
            console.error('Error adding image to PDF:', e)
        }
        return y
    }

    // Helper to add the app logo to the document
    const addAppLogo = async (doc, yPos) => {
        // Using common logo path
        const logoUrl = '/logo.png'
        const imgWidth = 40
        const imgHeight = 25
        const imgX = (doc.internal.pageSize.width - imgWidth) / 2
        return await addImageToDoc(doc, logoUrl, imgX, yPos, imgWidth, imgHeight)
    }

    const generateCalculationPDF = async (doc, data) => {
        let yPos = 15

        // Add App Logo
        yPos = await addAppLogo(doc, yPos)

        // Title
        doc.setFontSize(20)
        doc.setTextColor(71, 118, 230) // Primary Blue
        doc.text('MOTI CALCULATION REPORT', 105, yPos, { align: 'center' })
        yPos += 15

        // Set Image (if available)
        if (data.setImageUrl || data.setImage) {
            const imgUrl = data.setImageUrl || data.setImage
            const imgWidth = 50
            const imgHeight = 50
            const imgX = (doc.internal.pageSize.width - imgWidth) / 2
            yPos = await addImageToDoc(doc, imgUrl, imgX, yPos, imgWidth, imgHeight)
        }

        // Set Info
        doc.setFontSize(14)
        doc.setTextColor(0, 0, 0)
        doc.text(`Set Name: ${data.setName || 'N/A'}`, 25, yPos)
        yPos += 8
        doc.text(`Labour per Set: ${formatCurrency(data.labourPerSet)}`, 25, yPos)
        yPos += 15

        // Timestamp
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        const date = data.createdAt ? new Date(data.createdAt) : new Date()
        doc.text(`Generated on: ${date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 25, yPos)
        yPos += 10

        // Colour Details
        if (data.colours && data.colours.length > 0) {
            data.colours.forEach((colour, index) => {
                if (yPos > 230) { doc.addPage(); yPos = 20; }

                doc.setFontSize(13)
                doc.setFont(undefined, 'bold')
                doc.setTextColor(71, 118, 230)
                doc.text(`COLOUR: ${colour.name} - ${colour.qty} Sets`, 25, yPos)
                doc.setFont(undefined, 'normal')
                yPos += 6

                const headers = ['Moti Type', 'Lari/Set', 'Total Lari', 'Rate/Lari', 'Moti Cost']
                const rows = colour.motiDetails.map(moti => [
                    moti.type,
                    formatNumber(moti.lariPerSet),
                    formatNumber(moti.totalLari),
                    formatCurrency(moti.ratePerLari),
                    formatCurrency(moti.motiCost)
                ])

                // Subtotal and Labour rows
                rows.push([
                    { content: 'Colour Totals', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
                    { content: formatNumber(colour.subtotals.totalLari), styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
                    { content: 'Labour', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
                    { content: formatCurrency(colour.subtotals.labour), styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }
                ])
                rows.push([
                    { content: 'Total for this Colour', colSpan: 4, styles: { fontStyle: 'bold', halign: 'right', fillColor: [220, 230, 255] } },
                    { content: formatCurrency(colour.subtotals.total), styles: { fontStyle: 'bold', fillColor: [220, 230, 255] } }
                ])

                doc.autoTable({
                    head: [headers],
                    body: rows,
                    startY: yPos,
                    theme: 'grid',
                    headStyles: { fillColor: [71, 118, 230], textColor: [255, 255, 255] },
                    margin: { left: 25, right: 25 },
                    styles: { fontSize: 10 }
                })
                yPos = doc.lastAutoTable.finalY + 12
            })
        }

        // Summary
        if (yPos > 220) { doc.addPage(); yPos = 20; }
        doc.setFontSize(15)
        doc.setFont(undefined, 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text('GRAND SUMMARY', 25, yPos)
        yPos += 8

        const summaryData = [
            ['Total Sets', data.totals.totalSets.toString()],
            ['Total Lari (All Colours)', formatNumber(data.totals.totalLari)],
            ['Total Moti Cost', formatCurrency(data.totals.totalMotiCost)],
            ['Total Labour Cost', formatCurrency(data.totals.totalLabour)],
            [{ content: 'GRAND TOTAL', styles: { fontStyle: 'bold', fontSize: 13, fillColor: [71, 118, 230], textColor: [255, 255, 255] } },
            { content: formatCurrency(data.totals.grandTotal), styles: { fontStyle: 'bold', fontSize: 13, fillColor: [71, 118, 230], textColor: [255, 255, 255] } }],
            ['Cost per Individual Set', formatCurrency(data.totals.costPerSet)]
        ]

        doc.autoTable({
            body: summaryData,
            startY: yPos,
            theme: 'grid',
            styles: { fontSize: 11 },
            columnStyles: { 0: { cellWidth: 100 }, 1: { halign: 'right', fontStyle: 'bold' } },
            margin: { left: 25, right: 25 }
        })

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
        }
    }

    const generateGatePassPDF = async (doc, data) => {
        let yPos = 20

        // App Logo
        yPos = await addAppLogo(doc, yPos)

        // Header
        doc.setFontSize(24)
        doc.setTextColor(71, 118, 230)
        doc.text('GATE PASS', 105, yPos, { align: 'center' })
        yPos += 10

        doc.setFontSize(15)
        doc.setTextColor(100, 100, 100)
        doc.text(`ID: ${data.passNumber || 'N/A'}`, 105, yPos, { align: 'center' })
        yPos += 20

        // Customer & Date
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.setFont(undefined, 'bold')
        doc.text('Customer:', 25, yPos)
        doc.text('Date:', 125, yPos)
        doc.setFont(undefined, 'normal')
        doc.text(data.customerName || 'N/A', 50, yPos)
        const date = data.createdAt ? new Date(data.createdAt) : new Date()
        doc.text(date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), 140, yPos)
        yPos += 14

        // Set Info
        doc.setFont(undefined, 'bold')
        doc.text('Set Name:', 25, yPos)
        doc.setFont(undefined, 'normal')
        doc.text(data.calculation.setName || 'N/A', 50, yPos)
        yPos += 16

        // Calculate columns for Gate Pass (Lari totals only)
        const types = new Set()
        data.calculation.motiRequirements.forEach(m => types.add(m.type))
        data.calculation.colours.forEach(c => {
            if (c.hasCustom) {
                const customMotis = c.customMotis || c.customMoti || []
                customMotis.forEach(m => types.add(m.type))
            }
        })
        const allMotiTypes = Array.from(types).sort()

        // Table
        const headers = ['Colour', 'Sets', ...allMotiTypes.map(t => `${t} (Lari)`)]
        const rows = data.calculation.colours.map(colour => {
            const row = [colour.name, colour.qty.toString()]
            allMotiTypes.forEach(type => {
                const motis = colour.hasCustom ? (colour.customMotis || colour.customMoti) : data.calculation.motiRequirements
                const moti = motis.find(m => m.type === type)
                row.push(moti ? Math.round(moti.lariPerSet * colour.qty).toString() : '0')
            })
            return row
        })

        // Total Row
        const totalSets = data.calculation.colours.reduce((sum, c) => sum + c.qty, 0)
        const totalLariByType = {}
        allMotiTypes.forEach(type => {
            totalLariByType[type] = 0
            data.calculation.colours.forEach(c => {
                const motis = c.hasCustom ? (c.customMotis || c.customMoti) : data.calculation.motiRequirements
                const moti = motis.find(m => m.type === type)
                if (moti) totalLariByType[type] += (moti.lariPerSet * c.qty)
            })
        })
        const totalRow = ['TOTAL', totalSets.toString(), ...allMotiTypes.map(t => Math.round(totalLariByType[t]).toString())]
        rows.push(totalRow.map(cell => ({ content: cell, styles: { fontStyle: 'bold', fillColor: [240, 244, 255] } })))

        doc.autoTable({
            head: [headers],
            body: rows,
            startY: yPos,
            theme: 'grid',
            headStyles: { fillColor: [71, 118, 230], textColor: [255, 255, 255] },
            margin: { left: 25, right: 25 },
            styles: { fontSize: 11 }
        })

        yPos = doc.lastAutoTable.finalY + 30
        if (yPos > 270) { doc.addPage(); yPos = 30; }

        doc.setFontSize(11)
        doc.setTextColor(150, 150, 150)
        doc.text('Generated by Moti Calculator App', 105, yPos, { align: 'center' })
    }

    const shareOrDownloadPDF = async (data, type = 'calculation', filename = 'document.pdf') => {
        if (import.meta.server) return
        if (!data) {
            console.error('PDF Share Error: No data provided')
            return
        }

        isSharing.value = true

        try {
            await loadLibraries()
            const { jsPDF } = window.jspdf
            const doc = new jsPDF()

            if (type === 'calculation') {
                await generateCalculationPDF(doc, data)
            } else if (type === 'gatepass') {
                await generateGatePassPDF(doc, data)
            }

            const pdfBlob = doc.output('blob')
            const file = new File([pdfBlob], filename, { type: 'application/pdf' })

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: filename,
                        text: `Sharing ${type === 'calculation' ? 'Moti Calculation' : 'Gate Pass'}`
                    })
                } catch (shareError) {
                    console.log('Share canceled or failed, falling back to download', shareError)
                    doc.save(filename)
                }
            } else {
                doc.save(filename)
            }
        } catch (error) {
            console.error('PDF Generation Error:', error)
            alert('Failed to generate PDF. Please try again.')
        } finally {
            isSharing.value = false
        }
    }

    return {
        shareOrDownloadPDF,
        isSharing
    }
}
