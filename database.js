const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const db = new Database(path.join(__dirname, 'learn-ai.db'));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    membership TEXT DEFAULT 'free',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    learning_style TEXT,
    cognitive_profile TEXT,
    personality_preferences TEXT,
    challenges TEXT,
    goals TEXT,
    adhd INTEGER DEFAULT 0,
    dyslexia INTEGER DEFAULT 0,
    reading_difficulty INTEGER DEFAULT 0,
    visual_learner INTEGER DEFAULT 0,
    audio_learner INTEGER DEFAULT 0,
    hands_on_learner INTEGER DEFAULT 0,
    keyword_learner INTEGER DEFAULT 0,
    discussion_learner INTEGER DEFAULT 0,
    session_length TEXT,
    experience_level TEXT,
    motivation TEXT,
    stuck_behavior TEXT,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    topic TEXT,
    messages TEXT,
    files TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS uploaded_files (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_id TEXT,
    filename TEXT,
    content TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Password hashing
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

// User functions
function createUser(email, password, name = '') {
  const id = uuidv4();
  const passwordHash = hashPassword(password);
  try {
    db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)').run(id, email.toLowerCase(), passwordHash, name);
    return { id, email: email.toLowerCase(), name, membership: 'free' };
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return null; // Email already exists
    }
    throw error;
  }
}

function loginUser(email, password) {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) return null;
  if (!verifyPassword(password, user.password_hash)) return null;
  return { id: user.id, email: user.email, name: user.name, membership: user.membership };
}

function getUser(id) {
  const user = db.prepare('SELECT id, email, name, membership, created_at FROM users WHERE id = ?').get(id);
  return user;
}

function updateMembership(userId, membership) {
  db.prepare('UPDATE users SET membership = ? WHERE id = ?').run(membership, userId);
}

function saveProfile(userId, profileData) {
  const id = uuidv4();
  db.prepare(`
    INSERT INTO profiles (
      id, user_id, learning_style, cognitive_profile, personality_preferences,
      challenges, goals, adhd, dyslexia, reading_difficulty, visual_learner,
      audio_learner, hands_on_learner, keyword_learner, discussion_learner,
      session_length, experience_level, motivation, stuck_behavior
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    userId,
    JSON.stringify(profileData.learningStyle || {}),
    JSON.stringify(profileData.cognitiveProfile || {}),
    JSON.stringify(profileData.personalityPreferences || {}),
    JSON.stringify(profileData.challenges || []),
    JSON.stringify(profileData.goals || []),
    profileData.adhd ? 1 : 0,
    profileData.dyslexia ? 1 : 0,
    profileData.readingDifficulty ? 1 : 0,
    profileData.visualLearner ? 1 : 0,
    profileData.audioLearner ? 1 : 0,
    profileData.handsOnLearner ? 1 : 0,
    profileData.keywordLearner ? 1 : 0,
    profileData.discussionLearner ? 1 : 0,
    profileData.sessionLength || 'medium',
    profileData.experienceLevel || 'intermediate',
    JSON.stringify(profileData.motivation || []),
    profileData.stuckBehavior || 'research'
  );
  return id;
}

function getProfile(userId) {
  const row = db.prepare('SELECT * FROM profiles WHERE user_id = ? ORDER BY completed_at DESC LIMIT 1').get(userId);
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    learningStyle: JSON.parse(row.learning_style || '{}'),
    cognitiveProfile: JSON.parse(row.cognitive_profile || '{}'),
    personalityPreferences: JSON.parse(row.personality_preferences || '{}'),
    challenges: JSON.parse(row.challenges || '[]'),
    goals: JSON.parse(row.goals || '[]'),
    adhd: !!row.adhd,
    dyslexia: !!row.dyslexia,
    readingDifficulty: !!row.reading_difficulty,
    visualLearner: !!row.visual_learner,
    audioLearner: !!row.audio_learner,
    handsOnLearner: !!row.hands_on_learner,
    keywordLearner: !!row.keyword_learner,
    discussionLearner: !!row.discussion_learner,
    sessionLength: row.session_length,
    experienceLevel: row.experience_level,
    motivation: JSON.parse(row.motivation || '[]'),
    stuckBehavior: row.stuck_behavior
  };
}

function createSession(userId, topic) {
  const id = uuidv4();
  db.prepare('INSERT INTO sessions (id, user_id, topic, messages, files) VALUES (?, ?, ?, ?, ?)').run(id, userId, topic, '[]', '[]');
  return id;
}

function getSession(sessionId) {
  const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
  if (!row) return null;
  return {
    ...row,
    messages: JSON.parse(row.messages || '[]'),
    files: JSON.parse(row.files || '[]')
  };
}

function updateSessionMessages(sessionId, messages) {
  db.prepare('UPDATE sessions SET messages = ? WHERE id = ?').run(JSON.stringify(messages), sessionId);
}

function getUserSessions(userId) {
  const rows = db.prepare('SELECT * FROM sessions WHERE user_id = ? ORDER BY started_at DESC').all(userId);
  return rows.map(row => ({
    ...row,
    messages: JSON.parse(row.messages || '[]'),
    files: JSON.parse(row.files || '[]')
  }));
}

function saveUploadedFile(userId, sessionId, filename, content) {
  const id = uuidv4();
  db.prepare('INSERT INTO uploaded_files (id, user_id, session_id, filename, content) VALUES (?, ?, ?, ?, ?)').run(id, userId, sessionId, filename, content);
  return id;
}

function getSessionFiles(sessionId) {
  return db.prepare('SELECT * FROM uploaded_files WHERE session_id = ?').all(sessionId);
}

module.exports = {
  createUser,
  loginUser,
  getUser,
  updateMembership,
  saveProfile,
  getProfile,
  createSession,
  getSession,
  updateSessionMessages,
  getUserSessions,
  saveUploadedFile,
  getSessionFiles
};
