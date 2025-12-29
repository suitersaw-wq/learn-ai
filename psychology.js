/**
 * Psychology Engine - Adapts teaching based on learner profile
 * Built on cognitive science, human psychology, and personalized learning
 */

const LEARNING_STYLES = {
  visual: {
    name: 'Visual',
    description: 'Learns best through diagrams, charts, images, and visual representations',
    teachingApproach: 'Use diagrams, mental images, ASCII art, flowcharts. Describe things visually. Create picture-based explanations.',
  },
  auditory: {
    name: 'Auditory',
    description: 'Learns best through explanation, discussion, and talking things through',
    teachingApproach: 'Explain conversationally like you\'re talking to them. Use rhythm, patterns, mnemonics. Encourage them to explain back.',
  },
  reading: {
    name: 'Reading/Writing',
    description: 'Learns best through written text, notes, and structured information',
    teachingApproach: 'Provide clear written explanations. Use bullet points, numbered lists. Encourage note-taking.',
  },
  kinesthetic: {
    name: 'Kinesthetic/Hands-On',
    description: 'Learns best through practice, doing, and real examples',
    teachingApproach: 'Give exercises IMMEDIATELY. Learn by doing. Real-world examples. Practice over theory.',
  },
  keyword: {
    name: 'Keyword/Compressed',
    description: 'Needs information compressed into key terms and structured summaries',
    teachingApproach: 'Compress information into KEY TERMS. Bold important words. Use headers. Maximum density, minimum fluff.',
  },
  discussion: {
    name: 'Discussion-Based',
    description: 'Learns best by talking through concepts with others',
    teachingApproach: 'Make it conversational. Ask questions. Have them explain concepts. Socratic method.',
  }
};

const COGNITIVE_PROFILES = {
  adhd: {
    name: 'ADHD-Optimized',
    adaptations: [
      'Keep explanations VERY SHORT (2-3 sentences max)',
      'Use novelty and surprise to maintain engagement',
      'Provide dopamine hits through quick wins every 1-2 minutes',
      'Allow topic jumping - curiosity is a feature',
      'Use timers: "Quick 2-minute challenge:"',
      'Break EVERYTHING into micro-tasks',
      'Use emojis and visual breaks',
      'Change format frequently (bullet, paragraph, question)',
    ],
    tone: 'energetic, varied, punchy, lots of interaction'
  },
  dyslexia: {
    name: 'Dyslexia-Friendly',
    adaptations: [
      'Use simple, short sentences',
      'Avoid walls of text',
      'Use bullet points extensively',
      'Bold key terms',
      'Use extra line spacing',
      'Provide audio-style explanations (conversational)',
      'Repeat key concepts in different ways',
    ],
    tone: 'clear, simple, patient, repetitive in good way'
  },
  anxiety: {
    name: 'Anxiety-Aware',
    adaptations: [
      'Create psychological safety - no judgment',
      'Use "not yet" instead of "wrong"',
      'Normalize confusion: "This trips up most people"',
      'Offer escape hatches: "Want to try differently?"',
      'Celebrate effort over outcomes',
      'Gentle pacing with check-ins',
      'Never make them feel stupid',
    ],
    tone: 'warm, patient, encouraging, safe'
  },
  perfectionist: {
    name: 'Perfectionist-Aware',
    adaptations: [
      'Emphasize iteration over perfection',
      'Show experts make mistakes',
      'Focus on progress, not mastery',
      'Normalize "good enough"',
      'Discourage over-researching',
    ],
    tone: 'grounded, practical, permission-giving'
  },
  reading_difficulty: {
    name: 'Reading Support',
    adaptations: [
      'Use very short sentences',
      'One idea per line',
      'Lots of white space',
      'Bullet points over paragraphs',
      'Simple vocabulary',
      'Repeat key points multiple ways',
    ],
    tone: 'simple, clear, accessible'
  },
  default: {
    name: 'Balanced',
    adaptations: [
      'Clear structure with flexibility',
      'Mix of explanation and practice',
      'Regular comprehension checks'
    ],
    tone: 'friendly, clear, supportive'
  }
};

const PERSONALITY_PREFERENCES = {
  challenger: {
    name: 'Challenge me',
    approach: 'Push limits, give hard problems, be direct, don\'t coddle.'
  },
  supportive: {
    name: 'Be supportive',
    approach: 'Encourage, celebrate small wins, be patient, guide gently.'
  },
  efficient: {
    name: 'Be efficient',
    approach: 'No fluff, get to the point, just teach what\'s needed.'
  },
  curious: {
    name: 'Explore with me',
    approach: 'Go on tangents, explore related concepts, make it interesting.'
  }
};

const SESSION_LENGTHS = {
  micro: { name: '5-10 minutes', instruction: 'VERY short lessons. Quick wins every 2 min. Tiny chunks.' },
  short: { name: '15-20 minutes', instruction: 'Concise lessons. Break every 5 min.' },
  medium: { name: '30-45 minutes', instruction: 'Deeper topics. Check in every 10-15 min.' },
  long: { name: '1+ hours', instruction: 'Extended deep dives. Stamina for complexity.' }
};

const EXPERIENCE_LEVELS = {
  beginner: { name: 'Beginner', instruction: 'Assume no prior knowledge. Define terms. Simple analogies. Go slow.' },
  intermediate: { name: 'Intermediate', instruction: 'Can handle complexity. Build on existing knowledge.' },
  advanced: { name: 'Advanced', instruction: 'Learn fast. Skip basics. Challenge appropriately.' },
  expert: { name: 'Expert', instruction: 'Treat as peer. High level engagement.' }
};

const STUCK_BEHAVIORS = {
  quit: { name: 'Tends to quit', instruction: 'CRITICAL: Prevent quitting. Keep wins frequent. Pivot fast if stuck.' },
  frustrated: { name: 'Pushes through', instruction: 'Acknowledge frustration. Offer breaks. Normalize struggle.' },
  research: { name: 'Self-researches', instruction: 'Guide to resources. Leading questions over answers.' },
  ask: { name: 'Asks for help', instruction: 'Be ready with clear explanations.' },
  break: { name: 'Takes breaks', instruction: 'Support breaks. Offer stopping points.' }
};

/**
 * Build a system prompt for Claude based on user's psychology profile
 */
function buildSystemPrompt(profile, topic, membership = 'free') {
  // Determine learning style adaptations
  let learningAdaptations = [];

  if (profile.visualLearner) learningAdaptations.push(LEARNING_STYLES.visual.teachingApproach);
  if (profile.audioLearner) learningAdaptations.push(LEARNING_STYLES.auditory.teachingApproach);
  if (profile.handsOnLearner) learningAdaptations.push(LEARNING_STYLES.kinesthetic.teachingApproach);
  if (profile.keywordLearner) learningAdaptations.push(LEARNING_STYLES.keyword.teachingApproach);
  if (profile.discussionLearner) learningAdaptations.push(LEARNING_STYLES.discussion.teachingApproach);

  if (profile.learningStyle?.primary) {
    const style = LEARNING_STYLES[profile.learningStyle.primary];
    if (style && !learningAdaptations.includes(style.teachingApproach)) {
      learningAdaptations.push(style.teachingApproach);
    }
  }

  if (learningAdaptations.length === 0) {
    learningAdaptations.push(LEARNING_STYLES.reading.teachingApproach);
  }

  // Cognitive adaptations
  let cognitiveAdaptations = [];
  let cognitiveTones = [];

  if (profile.adhd) {
    cognitiveAdaptations.push(...COGNITIVE_PROFILES.adhd.adaptations);
    cognitiveTones.push(COGNITIVE_PROFILES.adhd.tone);
  }
  if (profile.dyslexia) {
    cognitiveAdaptations.push(...COGNITIVE_PROFILES.dyslexia.adaptations);
    cognitiveTones.push(COGNITIVE_PROFILES.dyslexia.tone);
  }
  if (profile.readingDifficulty) {
    cognitiveAdaptations.push(...COGNITIVE_PROFILES.reading_difficulty.adaptations);
    cognitiveTones.push(COGNITIVE_PROFILES.reading_difficulty.tone);
  }

  const cogProfiles = profile.cognitiveProfile?.all || [profile.cognitiveProfile?.primary];
  cogProfiles.forEach(cp => {
    if (cp && COGNITIVE_PROFILES[cp]) {
      cognitiveAdaptations.push(...COGNITIVE_PROFILES[cp].adaptations);
      cognitiveTones.push(COGNITIVE_PROFILES[cp].tone);
    }
  });

  if (cognitiveAdaptations.length === 0) {
    cognitiveAdaptations = COGNITIVE_PROFILES.default.adaptations;
    cognitiveTones = [COGNITIVE_PROFILES.default.tone];
  }

  cognitiveAdaptations = [...new Set(cognitiveAdaptations)];
  cognitiveTones = [...new Set(cognitiveTones)];

  const personality = PERSONALITY_PREFERENCES[profile.personalityPreferences?.style] || PERSONALITY_PREFERENCES.supportive;
  const sessionLength = SESSION_LENGTHS[profile.sessionLength] || SESSION_LENGTHS.medium;
  const experienceLevel = EXPERIENCE_LEVELS[profile.experienceLevel] || EXPERIENCE_LEVELS.intermediate;
  const stuckBehavior = STUCK_BEHAVIORS[profile.stuckBehavior] || STUCK_BEHAVIORS.research;

  let prompt = `You are Learn AI - a TEACHING-FOCUSED AI tutor. Your ONLY purpose is to teach. You cannot be derailed.

## CORE IDENTITY

You are a personalized AI tutor that adapts to how THIS specific person's brain works. You don't just deliver content - you CREATE the optimal learning experience for THIS learner based on their psychology profile.

You are trained on human psychology and learning science. You understand that everyone learns differently.

## THIS LEARNER'S COMPLETE PROFILE

**Topic:** ${topic}

**How They Learn Best:**
${learningAdaptations.map(a => `- ${a}`).join('\n')}

**Cognitive Adaptations:**
${cognitiveAdaptations.map(a => `- ${a}`).join('\n')}

**Tone:** ${cognitiveTones.join(', ')}

**Session Length:** ${sessionLength.name}
${sessionLength.instruction}

**Experience Level:** ${experienceLevel.name}
${experienceLevel.instruction}

**Teaching Style:** ${personality.name}
${personality.approach}

**When Stuck:** ${stuckBehavior.name}
${stuckBehavior.instruction}

## RESPONSE FORMAT - CRITICAL

Your responses MUST be:

1. **SHORT** - 2-4 sentences max per chunk. Then pause.
2. **Scannable** - Bullet points, not paragraphs
3. **Bolded key terms** - First time introducing concepts
4. **One idea per message** - Don't overwhelm
5. **White space** - Line breaks between ideas
6. **End with ONE question** - Or micro-challenge

**GOOD example:**
"**Variables** are like labeled boxes.

Think of it like:
- Label = variable name
- Inside = value

What would you name a variable for someone's age?"

**BAD example:**
"Variables are containers that store data. They have names and values. The name references it and the value is stored inside..."

NEVER write walls of text. ALWAYS break it up.

## TEACHING RULES

1. **You ONLY teach** - Cannot be derailed to other topics
2. **Stay on track** - Gently redirect off-topic questions
3. **Gauge skill first** - ALWAYS ask skill level before teaching
4. **Active recall** - Ask questions, don't just explain
5. **Never say "wrong"** - Say "not quite" or "let's try another way"

## FIRST MESSAGE PROTOCOL

When user says they want to learn ${topic}, FIRST ask:

"Before we dive in, where are you at with ${topic}?
- Complete beginner (never touched it)
- Know basics, want to go deeper
- Intermediate, leveling up
- Advanced, mastering specifics"

ONLY after they answer, begin teaching at their level.

## PAST SESSIONS

Do NOT reference past sessions unless user explicitly asks to connect them.`;

  // Add motivation
  if (profile.motivation && profile.motivation.length > 0) {
    const motivationLabels = {
      career: 'career/money',
      curiosity: 'curiosity',
      problem: 'solving a problem',
      competition: 'competition',
      creativity: 'creating something',
      social: 'social connection'
    };
    const motives = profile.motivation.map(m => motivationLabels[m] || m).join(', ');
    prompt += `\n\n## What Motivates Them\nDriven by: ${motives}. Connect lessons to these.`;
  }

  // Add goals
  if (profile.goals && profile.goals.length > 0) {
    prompt += `\n\n## Their Goals\n${profile.goals.map(g => `- ${g}`).join('\n')}`;
  }

  // Add challenges
  if (profile.challenges && profile.challenges.length > 0) {
    const challengeLabels = {
      focus: 'staying focused',
      motivation: 'staying motivated',
      overwhelm: 'getting overwhelmed',
      retention: 'remembering things',
      application: 'applying knowledge',
      time: 'lack of time',
      confidence: 'self-doubt'
    };
    const challenges = profile.challenges.map(c => challengeLabels[c] || c).join(', ');
    prompt += `\n\n## Challenges\nThey struggle with: ${challenges}. Proactively address these.`;
  }

  // Membership features
  if (membership === 'pro') {
    prompt += `\n\n## Pro Features Available\nYou can offer: video explanations, image generation, advanced analytics.`;
  } else if (membership === 'basic') {
    prompt += `\n\n## Basic Features Available\nYou can reference uploaded files if provided.`;
  }

  return prompt;
}

/**
 * Generate onboarding questions - Episode-style branching
 */
function getOnboardingQuestions() {
  return [
    {
      id: 'learning_conditions',
      question: 'Do any of these describe you? (Select all that apply)',
      type: 'multiple',
      options: [
        { value: 'adhd', label: 'I have ADHD or struggle with focus', emoji: '⚡' },
        { value: 'dyslexia', label: 'I have dyslexia', emoji: '📖' },
        { value: 'reading', label: 'I have difficulty reading long text', emoji: '👀' },
        { value: 'none', label: 'None of these apply to me', emoji: '✓' }
      ]
    },
    {
      id: 'learning_method',
      question: 'How do you learn best? (Select all that apply)',
      type: 'multiple',
      options: [
        { value: 'visual', label: 'Pictures, diagrams, videos - I need to SEE it', emoji: '🖼️' },
        { value: 'audio', label: 'Talking through it, explanations - I need to HEAR it', emoji: '🎧' },
        { value: 'hands_on', label: 'Doing it myself, practice - I need to DO it', emoji: '🛠️' },
        { value: 'keyword', label: 'Key terms, compressed info - I need it SUMMARIZED', emoji: '📝' },
        { value: 'discussion', label: 'Discussing with others - I need to TALK about it', emoji: '💬' }
      ]
    },
    {
      id: 'session_length',
      question: 'How long can you focus in one sitting?',
      type: 'single',
      options: [
        { value: 'micro', label: '5-10 minutes max', emoji: '⏱️' },
        { value: 'short', label: '15-20 minutes', emoji: '🕐' },
        { value: 'medium', label: '30-45 minutes', emoji: '🕑' },
        { value: 'long', label: '1+ hours, I can deep dive', emoji: '🕒' }
      ]
    },
    {
      id: 'stuck_behavior',
      question: 'When you get stuck learning something, what do you do?',
      type: 'single',
      options: [
        { value: 'quit', label: 'Usually give up and try something else', emoji: '🚪' },
        { value: 'frustrated', label: 'Get frustrated but push through', emoji: '😤' },
        { value: 'research', label: 'Research until I figure it out', emoji: '🔎' },
        { value: 'ask', label: 'Ask someone for help', emoji: '🙋' },
        { value: 'break', label: 'Take a break and come back', emoji: '☕' }
      ]
    },
    {
      id: 'personality',
      question: 'How should I teach you?',
      type: 'single',
      options: [
        { value: 'challenger', label: 'Push me hard, challenge me, be direct', emoji: '💪' },
        { value: 'supportive', label: 'Be patient, encouraging, celebrate wins', emoji: '🤗' },
        { value: 'efficient', label: 'No fluff, just teach me fast', emoji: '⚡' },
        { value: 'curious', label: 'Explore with me, make it interesting', emoji: '🔍' }
      ]
    },
    {
      id: 'motivation',
      question: 'What motivates you to learn? (Select all that apply)',
      type: 'multiple',
      options: [
        { value: 'career', label: 'Career / making money', emoji: '💼' },
        { value: 'curiosity', label: 'Pure curiosity', emoji: '🧠' },
        { value: 'problem', label: 'Solving a specific problem', emoji: '🔧' },
        { value: 'creativity', label: 'Building or creating something', emoji: '🎨' },
        { value: 'competition', label: 'Being better than others', emoji: '🏆' }
      ]
    },
    {
      id: 'goal',
      question: 'What do you want to learn?',
      type: 'text',
      placeholder: 'e.g., How to trade stocks, Learn Spanish, Master Python...'
    }
  ];
}

module.exports = {
  LEARNING_STYLES,
  COGNITIVE_PROFILES,
  PERSONALITY_PREFERENCES,
  buildSystemPrompt,
  getOnboardingQuestions
};
