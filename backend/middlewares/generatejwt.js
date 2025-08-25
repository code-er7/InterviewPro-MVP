import jwt from 'jsonwebtoken'

function generateToken(user) {
  const payload = {
    id: user._id.toString(),
    role: user.role,
    name: user.name,
    email: user.email,
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");

  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export default  generateToken ;
