import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, gmail: user.gmail },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  )
}

export const loginUser = async (req, res) => {
  const {  gmail, password } = req.body;

  if ( !gmail || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const user = await User.findOne({ gmail });

  if (!user) {
    return res.status(404).json({ message: 'User does not exist. Please register first.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  const token = generateToken(user);
  res.json({ token });
};

export const registerUser = async (req, res) => {
  const { name, gmail, password } = req.body;

  if (!name || !gmail || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const existingUser = await User.findOne({ gmail });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({ name, gmail, password: hashedPassword });

  const token = generateToken(user);
  res.status(201).json({ token });
};

export const googleLogin = async (req, res) => {
  const { token } = req.body

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const { name, email, picture } = payload // ✅ picture is available here

    let user = await User.findOne({ gmail: email })
    if (!user) {
      user = await User.create({ name, gmail: email, password: '', picture }) // ✅ store picture
    } else if (!user.picture) {
      user.picture = picture
      await user.save()
    }

    const jwtToken = jwt.sign(
      {
        id: user._id,
        name: user.name,
        gmail: user.gmail,
        picture: user.picture, // ✅ Include in JWT payload
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    )

    res.json({ token: jwtToken })
  } catch (error) {
    console.error('Google login failed:', error)
    res.status(401).json({ message: 'Invalid Google token' })
  }
}


export const getUser = (req, res) => {
  res.json({ user: req.user })
}
