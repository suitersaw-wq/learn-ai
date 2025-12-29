# Learn AI - Run Plan

## Overview
AI tutor that adapts to how your brain works. Psychology-first approach to personalized learning.

---

## Product Vision

### Core Value Proposition
- AI tutoring that adapts to individual learning psychology
- Supports ADHD, dyslexia, anxiety, and different learning styles
- Teaching-focused AI that cannot be derailed
- Research-backed techniques (spaced repetition, active recall, metacognition)

### Target Users
- People who learn differently
- Students with ADHD/dyslexia/anxiety
- Self-learners who've struggled with traditional methods
- Anyone wanting personalized education

---

## Monetization

### Membership Tiers

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | Basic AI tutoring, 5 sessions/day, learning style assessment |
| Basic | $9.99/mo | Unlimited sessions, file uploads, session history, priority responses |
| Pro | $29.99/mo | Video explanations, image generation, API access, trend search, advanced analytics |

### Revenue Projections
- Target: 1000 users in first 3 months
- Conversion to paid: 5-10%
- MRR Goal: $500-$3000

---

## Technical Stack

- **Backend:** Node.js, Express
- **Database:** SQLite (better-sqlite3)
- **AI:** Anthropic Claude API
- **Frontend:** Vanilla HTML/CSS/JS
- **Hosting:** Railway or Render
- **Auth:** Custom (pbkdf2 password hashing)

---

## Psychology Engine

### Learning Styles Supported
1. Visual - diagrams, charts, mental images
2. Auditory - conversational, explanations
3. Reading/Writing - text, notes, structured info
4. Kinesthetic - hands-on, practice, real examples
5. Keyword - compressed, key terms, summaries
6. Discussion - Socratic method, talking through

### Cognitive Profiles
1. ADHD-Optimized - short chunks, novelty, quick wins, micro-tasks
2. Dyslexia-Friendly - simple sentences, bullet points, repetition
3. Anxiety-Aware - psychological safety, "not yet" vs "wrong", gentle pacing
4. Perfectionist-Aware - iteration over perfection, normalize mistakes
5. Reading Support - very short sentences, white space, simple vocabulary

### Personalization Factors
- Session length preference (5min to 1hr+)
- Experience level (beginner to expert)
- Stuck behavior (quit, push through, research, ask, break)
- Teaching style preference (challenger, supportive, efficient, curious)
- Motivation (career, curiosity, problem-solving, creativity, competition)

---

## User Flow

1. **Landing Page** - Value props, CTA
2. **Sign Up** - Email/password
3. **Membership Selection** - Free/Basic/Pro
4. **Psychology Onboarding** - 7 questions (~2 min)
5. **Learn** - Pick topic, start session
6. **Chat** - AI teaches based on profile

---

## AI Teaching Rules

1. ONLY teaches - cannot be derailed to other topics
2. Gauges skill level FIRST before teaching
3. Short responses (2-4 sentences max)
4. Scannable format (bullets, bold key terms)
5. Ends with ONE question or micro-challenge
6. Never says "wrong" - says "not quite" or "let's try another way"
7. Only references past sessions if user asks

---

## Current Status

### Completed
- [x] Auth system (signup/login)
- [x] Membership tiers page
- [x] Psychology-based onboarding (7 questions)
- [x] Personalized AI tutor
- [x] File upload (Basic/Pro only)
- [x] User account menu with membership badge
- [x] Apple-style UI with rainbow gradients
- [x] GitHub repo: https://github.com/suitersaw-wq/learn-ai

### To Deploy
1. Go to https://railway.app or https://render.com
2. Connect GitHub repo
3. Add env variable: `ANTHROPIC_API_KEY`
4. Deploy

---

## Growth Strategy

### Phase 1: Launch (Month 1)
- Deploy MVP
- Share on social media
- Get 50-100 beta users
- Collect feedback

### Phase 2: Iterate (Month 2-3)
- Improve based on feedback
- Add more cognitive profiles
- Implement payment (Stripe)
- Target 500+ users

### Phase 3: Scale (Month 4-5)
- Content marketing (TikTok, YouTube)
- SEO optimization
- Partnerships with educators
- Target 1000+ users, $1000+ MRR

---

## Future Features

- [ ] Stripe payment integration
- [ ] Video explanations (Pro)
- [ ] Image generation for visual learners (Pro)
- [ ] Session history and progress tracking
- [ ] Spaced repetition reminders
- [ ] Mobile app
- [ ] Multi-language support
- [ ] API for third-party integrations
- [ ] Learning analytics dashboard

---

## Key Metrics to Track

- Daily Active Users (DAU)
- Session completion rate
- Free to paid conversion
- Churn rate
- Average session length
- NPS score

---

## Resources

- **GitHub:** https://github.com/suitersaw-wq/learn-ai
- **Anthropic API:** https://console.anthropic.com
- **Railway:** https://railway.app
- **Render:** https://render.com
