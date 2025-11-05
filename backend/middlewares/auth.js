// 📂 backend/middlewares/auth.js
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'Test@123_locationvoiture';

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token manquant' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // id, nom, email, role, etc.
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};
