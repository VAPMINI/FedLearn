const { Request, Response } = require( 'express');
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET; 

export const signup = async (req, res) => {
  const { name, username, email, password }= req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'User registration failed'});
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '20h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

export const fuzzyFindUsernames = async (req, res) => {
  const { query } = req.params;

  try {
    const regex = new RegExp(query, 'i'); // 'i' for case-insensitive
    const users = await User.find({ username: { $regex: regex } }).select('username -_id');
    const usernames = users.map(user => user.username);

    res.status(200).json({ usernames });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching usernames', details: error.message });
  }
};
