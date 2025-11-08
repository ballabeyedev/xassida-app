const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const { User: Utilisateur, Xassida, Favori } = require('../models');
const { Op } = require('sequelize');
const SECRET_KEY = process.env.JWT_SECRET;

// -------------------- INSCRIPTION --------------------
exports.inscriptionUser = async (req, res) => {
  const { nom, prenom, email, mot_de_passe } = req.body;
  const photoProfil = req.file ? '/image_profils/' + req.file.filename : null;

  const t = await sequelize.transaction();
  try {
    const exist = await Utilisateur.findOne({ where: { email }, transaction: t });
    if (exist) {
      await t.rollback();
      return res.status(400).json({ message: 'Cet utilisateur existe déjà.' });
    }

    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    const utilisateur = await Utilisateur.create({
      nom,
      prenom,
      email,
      mot_de_passe: hashedPassword,
      photoProfil,
    }, { transaction: t });

    await t.commit();

    return res.status(201).json({
      message: 'Inscription réussie',
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        photoProfil: utilisateur.photoProfil,
        role: utilisateur.role
      }
    });

  } catch (err) {
    await t.rollback();
    console.error('Erreur lors de l’inscription :', err);
    return res.status(500).json({
      message: 'Erreur serveur lors de l’inscription',
      erreur: err.message
    });
  }
};

// -------------------- CONNEXION --------------------
exports.login = async (req, res) => {
  const { identifiant, mot_de_passe } = req.body;
  try {
    const isEmail = /\S+@\S+\.\S+/.test(identifiant);

    const utilisateur = await Utilisateur.findOne({
      where: isEmail ? { email: identifiant } : { telephone: identifiant },
    });

    if (!utilisateur) return res.status(404).json({ message: 'Email ou numéro ou mot de passe incorrect' });
    if (utilisateur.statut !== 'actif') return res.status(403).json({ message: `Compte ${utilisateur.statut}` });

    const valid = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
    if (!valid) return res.status(401).json({ message: 'Mot de passe incorrect' });

    const token = jwt.sign({
      id: utilisateur.id,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      photoProfil: utilisateur.photoProfil,
      role: utilisateur.role
    }, SECRET_KEY, { expiresIn: '1h' });

    return res.status(200).json({ token, utilisateur });

  } catch (err) {
    console.error('Erreur connexion:', err);
    return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// -------------------- MODIFIER PROFIL --------------------
exports.modifierProfil = async (req, res) => {
  const utilisateurId = req.params.id;
  const { nom, prenom, email, telephone, adresse, photoProfil } = req.body;

  try {
    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) return res.status(404).json({ message: "Utilisateur non trouvé" });

    if (email && email !== utilisateur.email) {
      const existEmail = await Utilisateur.findOne({ where: { email } });
      if (existEmail) return res.status(400).json({ message: "Cet email est déjà utilisé" });
      utilisateur.email = email;
    }

    if (telephone && telephone !== utilisateur.telephone) {
      const existTel = await Utilisateur.findOne({ where: { telephone } });
      if (existTel) return res.status(400).json({ message: "Ce numéro de téléphone est déjà utilisé" });
      utilisateur.telephone = telephone;
    }

    if (nom) utilisateur.nom = nom;
    if (prenom) utilisateur.prenom = prenom;
    if (adresse !== undefined) utilisateur.adresse = adresse;
    if (photoProfil) utilisateur.photoProfil = photoProfil;

    await utilisateur.save();
    return res.status(200).json({ message: "Profil modifié avec succès", utilisateur });

  } catch (error) {
    console.error("Erreur modifier profil:", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// -------------------- MODIFIER MOT DE PASSE --------------------
exports.modifierPassword = async (req, res) => {
  const utilisateurId = req.params.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const utilisateur = await Utilisateur.findByPk(utilisateurId);
    if (!utilisateur) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const isMatch = await bcrypt.compare(currentPassword, utilisateur.mot_de_passe);
    if (!isMatch) return res.status(400).json({ message: "Mot de passe actuel incorrect" });

    if (!newPassword || newPassword.length < 8)
      return res.status(400).json({ message: "Le nouveau mot de passe doit contenir au moins 8 caractères." });

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!regex.test(newPassword))
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre." });

    utilisateur.mot_de_passe = await bcrypt.hash(newPassword, 10);
    await utilisateur.save();

    return res.status(200).json({ message: "Mot de passe modifié avec succès" });

  } catch (error) {
    console.error("Erreur modifier mot de passe:", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// -------------------- LISTER XASSIDAS AVEC FAVORIS --------------------
exports.listeXassida = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.user.id, {
      include: [{ model: Xassida, as: 'favoris', attributes: ['id'] }]
    });

    if (!utilisateur || utilisateur.statut !== 'actif') 
      return res.status(403).json({ message: "Accès refusé" });

    const xassidas = await Xassida.findAll({ where: { statut: 'actif' } });
    const favorisIds = utilisateur.favoris.map(f => f.id);

    const xassidasAvecFavori = xassidas.map(x => ({
      ...x.toJSON(),
      favori: favorisIds.includes(x.id)
    }));

    return res.status(200).json({ xassidas: xassidasAvecFavori });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
  }
};

// -------------------- LISTER LES XASSIDAS FAVORIS --------------------
exports.listeXassidaFavoris = async (req, res) => {
  try {
    // Récupérer l'utilisateur avec ses favoris
    const utilisateur = await Utilisateur.findByPk(req.user.id, {
      include: [{
        model: Xassida,
        as: 'favoris',
        attributes: ['id', 'titre', 'pdfUrl', 'audioUrl', 'nombre_telechargements', 'statut']
      }]
    });

    if (!utilisateur || utilisateur.statut !== 'actif') 
      return res.status(403).json({ message: "Accès refusé" });

    // Filtrer uniquement les Xassida actifs
    const favorisActifs = utilisateur.favoris.filter(x => x.statut === 'actif');

    return res.status(200).json({ favoris: favorisActifs });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
  }
};


// -------------------- TELECHARGER XASSIDA --------------------
exports.telechargerXassida = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.user.id);
    if (!utilisateur || utilisateur.statut !== 'actif') return res.status(403).json({ message: "Accès refusé" });

    const { xassidaId } = req.params;
    const xassida = await Xassida.findByPk(xassidaId);
    if (!xassida) return res.status(404).json({ message: "Xassida introuvable" });

    const pdfPath = path.join(__dirname, '..', xassida.pdfUrl);
    if (!fs.existsSync(pdfPath)) return res.status(404).json({ message: "Fichier PDF introuvable" });

    xassida.nombre_telechargements += 1;
    await xassida.save();

    res.download(pdfPath, `${xassida.titre}.pdf`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
  }
};

// -------------------- AJOUTER FAVORI --------------------
exports.ajouterFavori = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.user.id);
    if (!utilisateur || utilisateur.statut !== 'actif') return res.status(403).json({ message: "Accès refusé" });

    const { xassidaId } = req.params;
    const xassida = await Xassida.findByPk(xassidaId);
    if (!xassida) return res.status(404).json({ message: "Xassida introuvable" });

    const exists = await utilisateur.hasFavoris(xassida);
    if (exists) return res.status(400).json({ message: "Xassida déjà en favoris" });

    await utilisateur.addFavoris(xassida);
    return res.status(200).json({ message: "Xassida ajouté aux favoris" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
  }
};

// -------------------- SUPPRIMER FAVORI --------------------
exports.supprimerFavori = async (req, res) => {
  try {
    // Récupérer l'utilisateur connecté
    const utilisateur = await Utilisateur.findByPk(req.user.id);
    if (!utilisateur || utilisateur.statut !== 'actif') {
      return res.status(403).json({ message: "Accès refusé" });
    }

    // Récupérer le Xassida à supprimer
    const { xassidaId } = req.params;
    const xassida = await Xassida.findByPk(xassidaId);
    if (!xassida) {
      return res.status(404).json({ message: "Xassida introuvable" });
    }

    // Vérifier si le Xassida est dans les favoris
    const exists = await utilisateur.hasFavoris(xassida);
    if (!exists) {
      return res.status(400).json({ message: "Xassida n'est pas dans les favoris" });
    }

    // Supprimer le favori
    await utilisateur.removeFavoris(xassida);

    return res.status(200).json({ message: "Xassida retiré des favoris" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
  }
};


// -------------------- RECHERCHER ET FILTRER XASSIDAS --------------------
exports.rechercherXassidas = async (req, res) => {
  try {
    const { titre, categorie, auteur } = req.query;

    // Conditions principales pour Xassida
    const conditions = { statut: 'actif' };

    if (titre) conditions.titre = { [Op.iLike]: `%${titre}%` };
    if (auteur) conditions.auteur = { [Op.iLike]: `%${auteur}%` };

    // Construction de la requête
    const include = [];
    if (categorie) {
      include.push({
        model: Categorie,
        where: { nom: categorie, statut: 'actif' },
        through: { attributes: [] } // ne pas récupérer les infos de la table pivot
      });
    }

    const xassidas = await Xassida.findAll({
      where: conditions,
      include,
      order: [['nombre_telechargements', 'DESC']],
    });

    return res.status(200).json({ xassidas });
  } catch (err) {
    console.error('Erreur recherche xassidas:', err);
    return res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};


// -------------------- LECTURE EN LIGNE XASSIDA --------------------
exports.lireXassida = async (req, res) => {
  try {
    const { xassidaId } = req.params;

    const xassida = await Xassida.findByPk(xassidaId);
    if (!xassida || xassida.statut !== 'actif') {
      return res.status(404).json({ message: "Xassida introuvable" });
    }

    // Déterminer le type de fichier
    const filePath = xassida.pdfUrl || xassida.audioUrl;
    if (!filePath) return res.status(404).json({ message: "Fichier introuvable" });

    const fullPath = path.join(__dirname, '..', filePath);
    if (!fs.existsSync(fullPath)) return res.status(404).json({ message: "Fichier introuvable sur le serveur" });

    const fileExt = path.extname(fullPath).toLowerCase();
    const mimeType = fileExt === '.pdf' ? 'application/pdf' : 'audio/mpeg';

    // Envoi en streaming
    res.setHeader('Content-Type', mimeType);
    const stream = fs.createReadStream(fullPath);
    stream.pipe(res);

  } catch (err) {
    console.error('Erreur lecture xassida:', err);
    return res.status(500).json({ message: "Erreur serveur", erreur: err.message });
  }
};

// -------------------- OUVRIR XASSIDA PDF --------------------
exports.ouvrirXassidaPDF = async (req, res) => {
  try {
    const { xassidaId } = req.params;

    // Récupérer la Xassida
    const xassida = await Xassida.findByPk(xassidaId);
    if (!xassida) {
      return res.status(404).json({ message: "Xassida introuvable" });
    }

    // Vérifier que le fichier PDF existe
    const filePath = path.join(__dirname, '..', xassida.pdfUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Fichier PDF introuvable sur le serveur" });
    }

    // Définir les bons en-têtes HTTP pour afficher dans le navigateur
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${path.basename(filePath)}"`
    );

    // Stream du fichier PDF directement au client
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (err) {
    console.error('Erreur ouverture Xassida PDF:', err);
    return res.status(500).json({
      message: "Erreur serveur lors de l’ouverture du PDF",
      erreur: err.message
    });
  }
};

