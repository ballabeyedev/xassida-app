const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
dotenv.config();

// Routes
const utilisateurRoutes = require('./routes/utilisateurRoutes');
const xassidaRoutes = require('./routes/xassidaRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Modèles
const User = require('./models/User');
const Xassida = require('./models/Xassida');
const Favori = require('./models/Favori');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Définition des routes
app.use('/xassida_app/users', utilisateurRoutes);
app.use('/xassida_app/users', xassidaRoutes);
app.use('/xassida_app/users', adminRoutes);

// Synchronisation de la base et lancement du serveur
(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Base synchronisée avec succès');

    const PORT = process.env.PORT || 2025;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Serveur lancé sur le port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Erreur lors de la synchronisation de la base :', err);
  }
})();
