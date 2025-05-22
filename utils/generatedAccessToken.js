import jwt from 'jsonwebtoken';

export default function generateAccessToken(userId, email) {
  return jwt.sign(
    { userId, email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );
}
