# Passaporto Implantare

Un'applicazione web per la gestione dei passaporti implantari dentali.

## Caratteristiche

- Gestione completa dei passaporti implantari
- Interfaccia utente intuitiva e responsive
- Sistema di autenticazione con ruoli (Admin, Dentista, Paziente)
- Generazione PDF dei passaporti
- Dashboard personalizzata per ogni ruolo

## Tecnologie Utilizzate

### Frontend
- React
- TypeScript
- Material-UI
- React Router
- Context API per la gestione dello stato

### Backend
- Node.js
- Express
- MongoDB con Mongoose
- JWT per l'autenticazione
- PDFKit per la generazione dei PDF

## Prerequisiti

- Node.js (v14 o superiore)
- MongoDB
- npm o yarn

## Installazione

1. Clona il repository:
```bash
git clone https://github.com/yourusername/passaporto-implantare.git
cd passaporto-implantare
```

2. Installa le dipendenze del backend:
```bash
cd backend
npm install
```

3. Installa le dipendenze del frontend:
```bash
cd ../frontend
npm install
```

4. Crea un file `.env` nella cartella backend con le seguenti variabili:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=15m
PORT=4000
```

## Avvio dell'applicazione

1. Avvia il backend:
```bash
cd backend
npm run dev
```

2. In un nuovo terminale, avvia il frontend:
```bash
cd frontend
npm start
```

L'applicazione sarà disponibile su `http://localhost:3000`

## Struttura del Progetto

```
passaporto-implantare/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middlewares/
│   │   └── app.js
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── context/
    │   └── types/
    └── public/
```

## Funzionalità

### Admin
- Visualizzazione di tutti i passaporti
- Eliminazione dei passaporti
- Gestione degli utenti

### Dentista
- Creazione di nuovi passaporti
- Visualizzazione dei propri passaporti
- Generazione PDF dei passaporti

### Paziente
- Visualizzazione dei propri passaporti
- Download dei PDF dei propri passaporti

## Sicurezza

- Autenticazione JWT
- Password criptate con bcrypt
- Validazione dei dati in input
- Protezione delle route basata sui ruoli

## Licenza

MIT
