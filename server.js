require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const db = require('./database');
const psychology = require('./psychology');

const app = express();
const PORT = process.env.PORT || 3000;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// ============ AUTH ROUTES ============

// Sign up
app.post('/api/auth/signup', (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = db.createUser(email, password, name);
    if (!user) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = db.loginUser(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get user
app.get('/api/auth/user/:userId', (req, res) => {
  try {
    const user = db.getUser(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// ============ MEMBERSHIP ROUTES ============

// Update membership
app.post('/api/membership/update', (req, res) => {
  try {
    const { userId, membership } = req.body;

    if (!['free', 'basic', 'pro'].includes(membership)) {
      return res.status(400).json({ error: 'Invalid membership tier' });
    }

    db.updateMembership(userId, membership);
    res.json({ success: true, membership });
  } catch (error) {
    console.error('Membership update error:', error);
    res.status(500).json({ error: 'Failed to update membership' });
  }
});

// Get membership tiers info
app.get('/api/membership/tiers', (req, res) => {
  res.json({
    tiers: [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        features: [
          'Basic AI tutoring',
          'Text-based learning',
          'Learning style assessment',
          '5 sessions per day'
        ]
      },
      {
        id: 'basic',
        name: 'Basic',
        price: 9.99,
        features: [
          'Everything in Free',
          'Unlimited sessions',
          'File uploads (PDFs, docs)',
          'Session history',
          'Priority responses'
        ]
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 29.99,
        features: [
          'Everything in Basic',
          'Video explanations',
          'Image generation',
          'API access',
          'Trend search',
          'Advanced learning analytics',
          'Multi-AI integration'
        ]
      }
    ]
  });
});

// ============ ONBOARDING ROUTES ============

app.get('/api/onboarding/questions', (req, res) => {
  res.json(psychology.getOnboardingQuestions());
});

app.post('/api/onboarding/complete', (req, res) => {
  try {
    const { userId, answers } = req.body;

    if (!userId || !answers) {
      return res.status(400).json({ error: 'Missing userId or answers' });
    }

    const profile = {
      learningStyle: { primary: answers.learning_style },
      cognitiveProfile: {
        primary: Array.isArray(answers.cognitive_profile) ? answers.cognitive_profile[0] : answers.cognitive_profile,
        all: answers.cognitive_profile
      },
      personalityPreferences: { style: answers.personality },
      sessionLength: answers.session_length,
      experienceLevel: answers.experience_level,
      motivation: answers.motivation || [],
      stuckBehavior: answers.stuck_behavior,
      challenges: answers.challenges || [],
      goals: answers.goal ? [answers.goal] : [],
      // Learning conditions
      adhd: answers.learning_conditions?.includes('adhd'),
      dyslexia: answers.learning_conditions?.includes('dyslexia'),
      readingDifficulty: answers.learning_conditions?.includes('reading'),
      // Learning style specifics
      visualLearner: answers.learning_method?.includes('visual'),
      audioLearner: answers.learning_method?.includes('audio'),
      handsOnLearner: answers.learning_method?.includes('hands_on'),
      keywordLearner: answers.learning_method?.includes('keyword'),
      discussionLearner: answers.learning_method?.includes('discussion')
    };

    const profileId = db.saveProfile(userId, profile);
    res.json({ profileId, profile });
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

app.get('/api/users/:userId/profile', (req, res) => {
  try {
    const profile = db.getProfile(req.params.userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// ============ SESSION ROUTES ============

app.post('/api/sessions', (req, res) => {
  try {
    const { userId, topic } = req.body;

    if (!userId || !topic) {
      return res.status(400).json({ error: 'Missing userId or topic' });
    }

    const sessionId = db.createSession(userId, topic);
    res.json({ sessionId });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

app.get('/api/sessions/:sessionId', (req, res) => {
  try {
    const session = db.getSession(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

app.post('/api/sessions/:sessionId/chat', async (req, res) => {
  try {
    const { message, fileContent } = req.body;
    const sessionId = req.params.sessionId;

    if (!message) {
      return res.status(400).json({ error: 'Missing message' });
    }

    const session = db.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const profile = db.getProfile(session.user_id);
    if (!profile) {
      return res.status(400).json({ error: 'User profile not found. Complete onboarding first.' });
    }

    const user = db.getUser(session.user_id);

    const systemPrompt = psychology.buildSystemPrompt(profile, session.topic, user?.membership || 'free');

    const messages = session.messages || [];

    let userMessage = message;
    if (fileContent) {
      userMessage = `[User uploaded a file with the following content:]\n\n${fileContent}\n\n[User's message:] ${message}`;
    }

    messages.push({ role: 'user', content: userMessage });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    });

    const assistantMessage = response.content[0].text;
    messages.push({ role: 'assistant', content: assistantMessage });
    db.updateSessionMessages(sessionId, messages);

    res.json({
      message: assistantMessage,
      sessionId
    });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Failed to get response from tutor' });
  }
});

app.get('/api/users/:userId/sessions', (req, res) => {
  try {
    const sessions = db.getUserSessions(req.params.userId);
    res.json(sessions);
  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

// ============ FILE UPLOAD ============

app.post('/api/files/upload', (req, res) => {
  try {
    const { userId, sessionId, filename, content } = req.body;

    if (!userId || !filename || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const fileId = db.saveUploadedFile(userId, sessionId, filename, content);
    res.json({ fileId, filename });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// ============ HEALTH CHECK ============

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Learn AI server running on http://localhost:${PORT}`);
});
