const User = require('./User');
const Xassida = require('./Xassida');
const Categorie = require('./Categorie');
const XassidaCategorie = require('./XassidaCategorie');
const Favori = require('./Favori');

// Associations Xassida ↔ Categorie
Xassida.belongsToMany(Categorie, {
  through: XassidaCategorie,
  foreignKey: 'xassida_id',
  otherKey: 'categorie_id',
});
Categorie.belongsToMany(Xassida, {
  through: XassidaCategorie,
  foreignKey: 'categorie_id',
  otherKey: 'xassida_id',
});

// Associations User ↔ Xassida (Favoris)
User.belongsToMany(Xassida, { through: Favori, as: 'favoris', foreignKey: 'user_id' });
Xassida.belongsToMany(User, { through: Favori, as: 'fans', foreignKey: 'xassida_id' });

module.exports = { User, Xassida, Categorie, XassidaCategorie, Favori };
