const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');
const errorHandler = require('./middleware/error.middleware');
const { validateUser, validateExercise, validateLogs } = require('./middleware/validation.middleware');
const User = require('./models/user.model');
const Exercise = require('./models/Exercise.model');

const app = express();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));

// Connect to MongoDB
connectDB();

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// API Routes
app.post('/api/users', validateUser, async (req, res, next) => {
  try {
    const user = await User.create({ username: req.body.username });
    res.json({ username: user.username, _id: user._id });
  } catch (err) {
    next(err);
  }
});

app.get('/api/users', async (req, res, next) => {
  try {
    const users = await User.find({}, 'username _id');
    res.json(users);
  } catch (err) {
    next(err);
  }
});

app.post('/api/users/:_id/exercises', validateExercise, async (req, res, next) => {
  try {
    const user = await User.findById(req.params._id);
    if (!user) throw new Error('User not found');

    const exercise = await Exercise.create({
      username: user.username,
      description: req.body.description,
      duration: parseInt(req.body.duration),
      date: req.body.date ? new Date(req.body.date) : new Date(),
      userId: user._id
    });

    res.json({
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
      _id: user._id
    });
  } catch (err) {
    next(err);
  }
});

app.get('/api/users/:_id/logs', validateLogs, async (req, res, next) => {
  try {
    const { _id } = req.params;
    const { from, to, limit } = req.query;

    const user = await User.findById(_id);
    if (!user) throw new Error('User not found');

    const filter = { userId: _id };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const count = await Exercise.countDocuments(filter);
    let query = Exercise.find(filter).sort({ date: 'asc' });
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const exercises = await query.exec();

    res.json({
      _id: user._id,
      username: user.username,
      count,
      log: exercises.map(ex => ({
        description: ex.description,
        duration: ex.duration,
        date: ex.date.toDateString()
      }))
    });
  } catch (err) {
    next(err);
  }
});

// Error handling middleware
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});