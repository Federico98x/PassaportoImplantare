const PDFDocument = require('pdfkit');

/**
 * Generate a PDF document for a Passaporto Implantare
 * @param {Object} passportData - The passport data from MongoDB
 * @returns {Promise<Buffer>} PDF document as a buffer
 */
const generatePassportPDF = (passportData) => {
    return new Promise((resolve, reject) => {
        try {
            // Create a new PDF document
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
                info: {
                    Title: 'Passaporto Implantare',
                    Author: 'Passaporto Implantare Digital',
                    Subject: `Passaporto Implantare per ${passportData.patient_name}`
                }
            });

            // Collect data chunks
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            // Add header
            doc.fontSize(24)
               .font('Helvetica-Bold')
               .text('PASSAPORTO IMPLANTARE', { align: 'center' });
            
            doc.moveDown();
            doc.fontSize(12)
               .font('Helvetica')
               .text('Documento Digitale', { align: 'center' });

            doc.moveDown();
            doc.moveTo(50, doc.y)
               .lineTo(545, doc.y)
               .stroke();
            doc.moveDown();

            // Patient Information Section
            doc.fontSize(16)
               .font('Helvetica-Bold')
               .text('INFORMAZIONI PAZIENTE');
            
            doc.fontSize(12)
               .font('Helvetica')
               .text(`Nome: ${passportData.patient_name}`)
               .text(`Data di Nascita: ${new Date(passportData.date_of_birth).toLocaleDateString('it-IT')}`)
               .text(`Età: ${passportData.patient_age} anni`);

            doc.moveDown();

            // Implant Details Section
            doc.fontSize(16)
               .font('Helvetica-Bold')
               .text('DETTAGLI IMPIANTO');

            doc.fontSize(12)
               .font('Helvetica')
               .text(`Marca: ${passportData.implant_details.brand}`)
               .text(`Numero di Lotto: ${passportData.implant_details.lot_number}`)
               .text(`Data Impianto: ${new Date(passportData.implant_details.implant_date).toLocaleDateString('it-IT')}`)
               .text(`Posizione: ${passportData.implant_details.position}`)
               .text(`Diametro: ${passportData.implant_details.diameter} mm`)
               .text(`Lunghezza: ${passportData.implant_details.length} mm`);

            if (passportData.implant_details.notes) {
                doc.moveDown()
                   .text('Note:', { underline: true })
                   .text(passportData.implant_details.notes);
            }

            doc.moveDown();
            doc.moveTo(50, doc.y)
               .lineTo(545, doc.y)
               .stroke();
            doc.moveDown();

            // Dentist Information
            doc.fontSize(16)
               .font('Helvetica-Bold')
               .text('INFORMAZIONI DENTISTA');

            doc.fontSize(12)
               .font('Helvetica')
               .text(`Dentista: ${passportData.dentist_id.email}`)
               .text(`Data Creazione: ${new Date(passportData.created_at).toLocaleDateString('it-IT')}`);

            // Footer
            doc.fontSize(10)
               .text(
                   'Questo documento è stato generato digitalmente da Passaporto Implantare Digital.',
                   50,
                   doc.page.height - 50,
                   { align: 'center' }
               );

            // Finalize the PDF
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generatePassportPDF
};
