const { validationResult } = require('express-validator');
const Passport = require('../models/Passport');
const { generatePassportPDF } = require('../services/pdfService');

/**
 * Create a new passport
 * @route POST /api/passport
 * @access Private (Dentist only)
 */
const createPassport = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        console.log('Received passport data:', JSON.stringify(req.body, null, 2)); // Debug log

        // Map the incoming data to match our schema
        const passportData = {
            patient_name: req.body.patient_name,
            date_of_birth: req.body.date_of_birth,
            implant_type: req.body.implant_type,
            implant_details: {
                brand: req.body.implant_details?.brand,
                lot_number: req.body.implant_details?.lot_number,
                implant_date: req.body.implant_details?.implant_date,
                position: req.body.implant_details?.position,
                diameter: Number(req.body.implant_details?.diameter),
                length: Number(req.body.implant_details?.length),
                notes: req.body.implant_details?.notes
            },
            status: req.body.status || 'Active',
            dentist_id: req.user._id
        };

        console.log('Mapped passport data:', JSON.stringify(passportData, null, 2)); // Debug log

        // Validate required fields
        if (!passportData.implant_details?.brand || 
            !passportData.implant_details?.lot_number || 
            !passportData.implant_details?.implant_date || 
            !passportData.implant_details?.position || 
            !passportData.implant_details?.diameter || 
            !passportData.implant_details?.length) {
            throw new Error('Mancano alcuni dettagli dell\'impianto richiesti');
        }

        const passport = new Passport(passportData);
        await passport.save();

        // Populate and transform for response
        const populatedPassport = await passport.populate('dentist_id', 'email');
        const responsePassport = populatedPassport.toObject();

        res.status(201).json({
            message: 'Passaporto creato con successo',
            passport: responsePassport
        });
    } catch (error) {
        console.error('Error creating passport:', error);
        res.status(500).json({
            message: 'Errore durante la creazione del passaporto: ' + error.message,
            error: error.message,
            details: error.errors ? Object.values(error.errors).map(e => e.message) : undefined
        });
    }
};

/**
 * Get passport by ID
 * @route GET /api/passport/:id
 * @access Private (Admin, creator Dentist, or associated Patient)
 */
const getPassportById = async (req, res) => {
    try {
        const passport = await Passport.findById(req.params.id)
            .populate('dentist_id', 'email role');

        if (!passport) {
            return res.status(404).json({ message: 'Passaporto non trovato' });
        }

        // Check if user has permission to view this passport
        if (req.user.role !== 'Admin' && 
            passport.dentist_id._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Accesso negato' });
        }

        res.json(passport);
    } catch (error) {
        res.status(500).json({
            message: 'Errore durante il recupero del passaporto',
            error: error.message
        });
    }
};

/**
 * List passports with role-based filtering
 * @route GET /api/passport
 * @access Private
 */
const listPassports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = {};
        
        // Role-based filtering
        if (req.user.role === 'Dentist') {
            query.dentist_id = req.user._id;
        }
        // For Admin, no filter needed (can see all)
        // For Patient, implement patient-specific filtering here

        const passports = await Passport.find(query)
            .populate('dentist_id', 'email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Passport.countDocuments(query);

        res.json({
            passports,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Errore durante il recupero dei passaporti',
            error: error.message
        });
    }
};

/**
 * Update passport
 * @route PUT /api/passport/:id
 * @access Private (Admin or creator Dentist)
 */
const updatePassport = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const passport = await Passport.findById(req.params.id);
        
        if (!passport) {
            return res.status(404).json({ message: 'Passaporto non trovato' });
        }

        // Check if user has permission to update
        if (req.user.role !== 'Admin' && 
            passport.dentist_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Accesso negato' });
        }

        // Update passport
        Object.assign(passport, req.body);
        await passport.save();

        res.json({
            message: 'Passaporto aggiornato con successo',
            passport: await passport.populate('dentist_id', 'email')
        });
    } catch (error) {
        res.status(500).json({
            message: 'Errore durante l\'aggiornamento del passaporto',
            error: error.message
        });
    }
};

/**
 * Delete passport
 * @route DELETE /api/passport/:id
 * @access Private (Admin only)
 */
const deletePassport = async (req, res) => {
    try {
        const passport = await Passport.findById(req.params.id);
        
        if (!passport) {
            return res.status(404).json({ message: 'Passaporto non trovato' });
        }

        // Only Admin can delete passports
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Accesso negato' });
        }

        await passport.deleteOne();

        res.json({ message: 'Passaporto eliminato con successo' });
    } catch (error) {
        res.status(500).json({
            message: 'Errore durante l\'eliminazione del passaporto',
            error: error.message
        });
    }
};

/**
 * Generate and download PDF for a passport
 * @route GET /api/passport/:id/pdf
 * @access Private (Admin, creator Dentist)
 */
const downloadPassportPDF = async (req, res) => {
    try {
        const passport = await Passport.findById(req.params.id)
            .populate('dentist_id', 'email role');

        console.log('Generating PDF for passport:', passport); // Debug log

        if (!passport) {
            return res.status(404).json({ message: 'Passaporto non trovato' });
        }

        // Check if user has permission to access this passport
        if (req.user.role !== 'Admin' && 
            passport.dentist_id._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Accesso negato' });
        }

        try {
            // Generate PDF
            const pdfBuffer = await generatePassportPDF(passport);

            // Set response headers for PDF download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="passaporto-implantare-${passport._id}.pdf"`
            );

            // Send PDF
            res.send(pdfBuffer);
        } catch (pdfError) {
            console.error('Error generating PDF:', pdfError);
            throw new Error('Errore durante la generazione del PDF: ' + pdfError.message);
        }
    } catch (error) {
        res.status(500).json({
            message: 'Errore durante la generazione del PDF',
            error: error.message
        });
    }
};

module.exports = {
    createPassport,
    getPassportById,
    listPassports,
    updatePassport,
    deletePassport,
    downloadPassportPDF
};
