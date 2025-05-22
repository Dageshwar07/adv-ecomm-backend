import jwt from 'jsonwebtoken';

export default function generateRefreshToken(userId, email) {
  return jwt.sign(
    { userId, email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
}
