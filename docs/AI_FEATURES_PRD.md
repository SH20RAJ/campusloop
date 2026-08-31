# 🤖 Campus AI & Intelligent Campus Systems PRD

## 1. Overview & Vision
CampusLoop AI is the native conversational intelligence layer built directly into the student experience at [`/app/ai`](https://campusloop.space/app/ai). Rather than a generic chatbot, Campus AI is context-aware of the student's campus, course, student feed velocity, marketplace deals, and academic schedule.

---

## 2. Core Intelligent Modalities

### 2.1 🏫 Campus Context Mode (`mode: "campus"`)
- Answers questions regarding campus events, trending confessions, club auditions, mess schedules, and campus lore.
- Grounded in real-time institutional feed data and college hub activity.

### 2.2 ⚡ Personal Feed Recap (`mode: "personal"`)
- Summarizes missed posts, viral discussions, and replies from friends and followed students across the campus timeline.
- Eliminates FOMO without requiring hours of manual feed scrolling.

### 2.3 📚 Academic & Study Copilot (`mode: "study"`)
- Analyzes branch-specific notes, end-sem question papers, and course syllabus tips.
- Direct links into handwritten notes available on [`/app/academics`](https://campusloop.space/app/academics).

### 2.4 🛍️ Campus Marketplace Discovery (`mode: "search"`)
- Natural language product and rental discovery across student listings, bicycle fleets, and local merchant stores.
- Instant matching for queries like *"Need a cycle for 2 days near hostel 7"* or *"Engineering maths book for 2nd semester"*.

### 2.5 ✍️ Post Enhancer & Content Studio (`mode: "create"`)
- Polishes grammar, optimizes hashtag reach, and adds engaging campus voice without fabricating facts.

---

## 3. Architecture & Data Ingestion
- **Route**: `POST /api/ai/chat` (Edge Worker compatible).
- **Fast User Behavioral Affinity**: Integrated with Upstash Redis (`user:<id>:interests`) to personalize responses according to students' actual reading habits.
- **Vector Retrieval**: Resilient 384-dimensional dense semantic vectors generated for campus queries, with fallback to Postgres relational tables.
