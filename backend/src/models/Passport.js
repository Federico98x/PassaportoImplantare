const mongoose = require('mongoose');

const implantDetailsSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: [true, 'Inserisci la marca dell\'impianto']
    },
    lot_number: {
        type: String,
        required: [true, 'Inserisci il numero di lotto']
    },
    implant_date: {
        type: Date,
        required: [true, 'Inserisci la data dell\'impianto']
    },
    position: {
        type: String,
        required: [true, 'Inserisci la posizione dell\'impianto']
    },
    diameter: {
        type: Number,
        required: [true, 'Inserisci il diametro dell\'impianto']
    },
    length: {
        type: Number,
        required: [true, 'Inserisci la lunghezza dell\'impianto']
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    _id: false // Prevent Mongoose from creating _id for subdocument
});

const passportSchema = new mongoose.Schema({
    patient_name: {
        type: String,
        required: [true, 'Inserisci il nome del paziente'],
        trim: true
    },
    date_of_birth: {
        type: Date,
        required: [true, 'Inserisci la data di nascita']
    },
    implant_details: {
        type: implantDetailsSchema,
        required: [true, 'Inserisci i dettagli dell\'impianto']
    },
    implant_type: {
        type: String,
        required: [true, 'Inserisci il tipo di impianto']
    },
    status: {
        type: String,
        enum: ['Active', 'Archived'],
        default: 'Active',
        required: [true, 'Stato richiesto']
    },
    dentist_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'ID del dentista richiesto']
    },
    patient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // Optional, will be set if the patient has an account
    },
    pdf_url: {
        type: String,
        // Optional, will be set when PDF is generated and stored
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Virtual for patient's age
passportSchema.virtual('patient_age').get(function() {
    if (!this.date_of_birth) return null;
    const today = new Date();
    const birthDate = new Date(this.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

// Ensure virtuals are included when converting to JSON
passportSchema.set('toJSON', { virtuals: true });
passportSchema.set('toObject', { virtuals: true });

// Add index for efficient queries
passportSchema.index({ patient_name: 1, dentist_id: 1 });
passportSchema.index({ created_at: -1 });
passportSchema.index({ patient_id: 1 });

const Passport = mongoose.model('Passport', passportSchema);

module.exports = Passport;
