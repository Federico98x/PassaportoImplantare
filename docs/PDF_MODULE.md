## **1. Introduction**  
This document details how the **digital “Passaporto Implantare”** PDFs are generated, stored, and accessed within the Passaporto Implantare Digital platform. The goal is to create a **professional, secure** PDF output that can be easily downloaded or shared.

---

## **2. Technology Options**  
1. **pdfkit**  
   - Programmatic PDF creation (pure Node.js).  
   - Great for dynamic text, shapes, and basic layouts.  
2. **Puppeteer**  
   - Headless Chrome for generating PDFs from **HTML/CSS** templates.  
   - Excellent for more complex designs, branding, or if consistent print layout is paramount.  

For the MVP (Phase 1), **pdfkit** is typically simpler. For Phase 2 or beyond, **Puppeteer** may be adopted for advanced design.

---

## **3. Passport PDF Generation Flow**  
1. **Retrieve Passport Data**  
   - Endpoint: `GET /passport/:id/pdf`.  
   - The server fetches the “Passaporto Implantare” from the database (via `Passport` model).  

2. **Generate PDF**  
   - If using **pdfkit**:  
     - Initialize a `PDFDocument`, set fonts, add text/images.  
     - Pipe to a writable stream (or buffer).  
   - If using **Puppeteer**:  
     - Render a template (HTML page) with the passport data.  
     - Use `page.pdf()` to generate the PDF buffer.  

3. **Return or Store File**  
   - **On-Demand Download**: Stream the PDF directly to the client.  
   - **Persistent Storage**: Optionally save to disk or a remote storage (AWS S3).  
   - If stored remotely, keep a **reference URL** in the `Passport` document.

---

## **4. Example with pdfkit**  
```js
// services/pdfService.js
const PDFDocument = require('pdfkit');

async function generatePassportPDF(passportData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
  
      // Collect data as the PDF is generated
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
  
      // Title
      doc.fontSize(18).text('Passaporto Implantare', { align: 'center' });
      doc.moveDown();

      // Patient Info
      doc.fontSize(14).text(`Paziente: ${passportData.patientName || 'N/A'}`);
      doc.text(`Data di Nascita: ${passportData.dateOfBirth || 'N/A'}`);
      doc.text(`Dentista: ${passportData.createdByName || 'N/A'}`);
      doc.moveDown();

      // Implant Details
      doc.text(`Marca Impianto: ${passportData.implantDetails?.brand || 'N/A'}`);
      doc.text(`Numero Lotto: ${passportData.implantDetails?.lotNumber || 'N/A'}`);
      // Add more fields as needed

      // Footer
      doc.moveDown();
      doc.fontSize(10).text('Generato digitalmente da Passaporto Implantare Digital.', { align: 'center' });
  
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generatePassportPDF };
```

**Usage**:
```js
// controllers/passportController.js
const { generatePassportPDF } = require('../services/pdfService');

async function getPassportPDF(req, res) {
  try {
    const passportData = await Passport.findById(req.params.id).lean();
    if (!passportData) {
      return res.status(404).json({ message: 'Passport not found' });
    }

    const pdfBuffer = await generatePassportPDF(passportData);

    // Return as a downloadable file
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="passport.pdf"',
    });
    return res.send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({ message: 'Error generating PDF', error });
  }
}

module.exports = { getPassportPDF };
```

---

## **5. Handling Digital Wallet Passes**  
1. **Apple Wallet (`.pkpass`)**  
   - Requires signing with Apple certificates.  
   - Typically, embed minimal info in the pass, link out to the full PDF.  
2. **Google Wallet**  
   - Similar approach with templates.  
   - More complex to implement but beneficial for advanced digital capabilities.  

**Note**: This can be developed in later phases once PDF generation is stable.

---

## **6. Security & Compliance**  
1. **GDPR**:  
   - Only store minimal patient data in the PDF.  
   - Ensure that stored PDFs are **encrypted at rest** (if possible).  
2. **Access Controls**:  
   - Only **Dentist** (who created it) or **Patient** (the subject) should view the PDF.  
   - **Admin** can access for compliance audits.  
3. **Logging**:  
   - Log PDF generation events (when, who generated it).  
4. **HTTPS**:  
   - PDFs transferred securely over encrypted connections.

---

## **7. Testing & Maintenance**  
- **Unit Tests**:  
  - Test the `generatePassportPDF` function with sample data.  
- **Integration Tests**:  
  - Ensure the `/passport/:id/pdf` route properly fetches data, calls the PDF service, and returns a valid PDF.  
- **Performance**:  
  - If large volumes of PDFs are generated, consider caching or background jobs.  

---

## **8. Conclusion**  
This **PDF_MODULE.md** describes the essential steps to generate and serve the digital Passaporto Implantare documents. Whether using **pdfkit** or **Puppeteer**, the goal is to provide a **clean, consistent**, and **secure** output that aligns with the platform’s motto: *“Niente più carta e penna, crea il tuo passaporto implantare in un clic.”*