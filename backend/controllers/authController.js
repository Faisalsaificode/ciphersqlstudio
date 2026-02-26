const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already in use.' });

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const token = signToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
};

exports.saveAttempt = async (req, res) => {
  const { assignmentId, query, wasSuccessful } = req.body;
  try {
    await User.findByIdAndUpdate(req.userId, {
      $push: { attempts: { assignmentId, query, wasSuccessful } }
    });
    res.json({ message: 'Attempt saved.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save attempt.' });
  }
};

exports.submitAssignment = async (req, res) => {
  const { assignmentId, finalQuery } = req.body;
  if (!assignmentId || !finalQuery) {
    return res.status(400).json({ error: 'assignmentId and finalQuery are required.' });
  }
  try {
    const user = await User.findById(req.userId);
    
    const alreadyDone = user.completedAssignments.some(
      c => c.assignmentId.toString() === assignmentId
    );
    if (alreadyDone) {
      return res.json({ message: 'Already completed.', alreadyCompleted: true });
    }
    await User.findByIdAndUpdate(req.userId, {
      $push: { completedAssignments: { assignmentId, finalQuery } }
    });
    res.json({ message: 'Assignment submitted successfully!', alreadyCompleted: false });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit assignment.' });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('completedAssignments');
    const completedIds = user.completedAssignments.map(c => c.assignmentId.toString());
    res.json({ completedIds });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch progress.' });
  }
};
