const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authorize } = require('../middlewares/auth');
const {
    createPassport,
    getPassportById,
    listPassports,
    updatePassport,
    deletePassport,
    downloadPassportPDF
} = require('../controllers/passportController');

const router = express.Router();

// Validation middleware
const validatePassport = [
    body('patient_name')
        .trim()
        .notEmpty()
        .withMessage('Inserisci il nome del paziente'),
    
    body('date_of_birth')
        .isISO8601()
        .withMessage('Inserisci una data di nascita valida'),
    
    body('implant_type')
        .trim()
        .notEmpty()
        .withMessage('Inserisci il tipo di impianto')
        .isIn(['Titanio Standard', 'Titanio Premium', 'Ceramica', 'Zirconia'])
        .withMessage('Tipo di impianto non valido'),
    
    body('implant_details')
        .notEmpty()
        .withMessage('Inserisci i dettagli dell\'impianto')
        .isObject()
        .withMessage('Formato dettagli impianto non valido'),
    
    body('implant_details.brand')
        .if(body('implant_details').exists())
        .trim()
        .notEmpty()
        .withMessage('Inserisci la marca dell\'impianto'),
    
    body('implant_details.lot_number')
        .if(body('implant_details').exists())
        .trim()
        .notEmpty()
        .withMessage('Inserisci il numero di lotto'),
    
    body('implant_details.implant_date')
        .if(body('implant_details').exists())
        .isISO8601()
        .withMessage('Inserisci una data di impianto valida'),
    
    body('implant_details.position')
        .if(body('implant_details').exists())
        .trim()
        .notEmpty()
        .withMessage('Inserisci la posizione dell\'impianto'),
    
    body('implant_details.diameter')
        .if(body('implant_details').exists())
        .isFloat({ min: 0.1 })
        .withMessage('Inserisci un diametro valido (minimo 0.1 mm)'),
    
    body('implant_details.length')
        .if(body('implant_details').exists())
        .isFloat({ min: 0.5 })
        .withMessage('Inserisci una lunghezza valida (minimo 0.5 mm)'),
    
    body('status')
        .optional()
        .isIn(['Active', 'Archived'])
        .withMessage('Stato non valido')
];

// Routes
// All routes require authentication
router.use(authenticateToken);

// Create passport (Dentist only)
router.post(
    '/',
    authorize('Dentist'),
    validatePassport,
    createPassport
);

// Get passport by ID (Admin, creator Dentist)
router.get(
    '/:id',
    authorize('Admin', 'Dentist'),
    getPassportById
);

// List passports (role-based filtering applied in controller)
router.get(
    '/',
    authorize('Admin', 'Dentist'),
    listPassports
);

// Update passport (Admin or creator Dentist)
router.put(
    '/:id',
    authorize('Admin', 'Dentist'),
    validatePassport,
    updatePassport
);

// Delete passport (Admin only)
router.delete(
    '/:id',
    authorize('Admin'),
    deletePassport
);

// Download passport PDF
router.get(
    '/:id/pdf',
    authorize('Admin', 'Dentist'),
    downloadPassportPDF
);

module.exports = router;
