import User from "../models/userSchema.js";
import generateToken from "../middlewares/generatejwt.js";



export async function signup(req, res) {
  try {
    const { name, email, password, role } = req.body || {};

    // Basic validation
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ error: "name, email, password, role are required" });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user = await User.create({
      name: name.trim(),
      email: String(email).toLowerCase(),
      password,
      role,
    });

    const token = generateToken(user);
    
    const safeUser = {
      id: user._id, 
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return res.status(201).json({
      message: "Signup successful",
      token,
      user  : safeUser,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Internal server error" , err });
  }
}



export async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (password !== user.password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user);

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return res.status(200).json({
      message: "Login successful",
      token,
      user : safeUser,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

