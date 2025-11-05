require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./config/db');
const Utilisateur = require('./models/User'); // ton modèle User

(async () => {
  try {
    await sequelize.sync();

    // Vérifier si un admin existe déjà
    const adminExist = await Utilisateur.findOne({ where: { email: process.env.ADMIN_EMAIL } });
    if (adminExist) {
      console.log('✅ Un admin existe déjà');
      process.exit(0);
    }

    // Créer le mot de passe hashé
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    // Créer l'admin
    const admin = await Utilisateur.create({
        nom: process.env.ADMIN_NOM || 'SuperAdmin',      // <-- utiliser ADMIN_NOM
        prenom: process.env.ADMIN_PRENOM || 'Admin',     // <-- utiliser ADMIN_PRENOM
        email: process.env.ADMIN_EMAIL,
        mot_de_passe: hashedPassword,
        role: 'Admin',
        photoProfil: null,
    });


    console.log('✅ Admin créé avec succès :', admin.email);
    process.exit(0);

  } catch (err) {
    console.error('❌ Erreur lors de la création de l’admin :', err);
    process.exit(1);
  }
})();
