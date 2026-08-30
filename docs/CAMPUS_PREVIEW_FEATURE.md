Yes — this is actually a **very strong acquisition + retention loop** for CampusLoop. Your existing Viewer Mode already defines the concept as read-only access for aspirants exploring colleges, so I would **extend that architecture rather than create a separate aspirant product/account system**. 

The key is:

> **Viewer is an account state, not a separate account type.**

That means a JEE/NEET aspirant can start with Gmail today, build history/saved content, and years later connect their institutional email to the **same CampusLoop identity**.

---

# 🎓 The concept I'd build

## Name: **Campus Preview**

I like this more than simply "Viewer Mode" as the user-facing name.

Internally:

```text
account_mode = VIEWER
```

User-facing:

> **Campus Preview**

And after verification:

> **🎓 Campus Unlocked**

That gives you a very natural transformation:

**Preview → Unlocked**

It feels like the person has been waiting to enter something rather than merely upgrading an account.

Other names worth considering:

* **Campus Preview** ⭐
* **Campus Pass**
* **Campus Peek**
* **Future Student**
* **Campus Explorer**
* **Inside Campus**
* **Campus Preview → Campus Unlocked** ⭐
* **Aspirant → Student** — clear, but less exciting
* **Outside → Inside** — very memorable but less descriptive

My pick:

> **Campus Preview** for the mode
> **Campus Unlocked 🎓** for the conversion moment.

---

# The complete flow

## 1. Landing page

Instead of forcing institutional verification immediately, give two paths:

```text
Welcome to CampusLoop

Your campus. Before you even get there.

[ Continue with College Email ]
        ↓
   Student Mode

──────── OR ────────

[ Explore as an Aspirant ]
        ↓
   Campus Preview
```

For someone preparing for JEE/NEET:

> **Don't wait until college starts. See what campus life actually looks like.**

---

# 2. Gmail signup

Allow:

* Gmail
* other personal email providers

But **do NOT treat this email as student verification**.

Account:

```text
user_id: UUID

email: personal@gmail.com

verification_status:
    UNVERIFIED

account_mode:
    VIEWER
```

This is important architecturally.

You don't need:

```text
ViewerUser
StudentUser
```

as separate entities.

You have:

```text
User
 ├── personal_email
 ├── institutional_email
 ├── verification_status
 └── account_mode
```

---

# 3. Immediately ask: "Which colleges are you dreaming about?"

This could be your killer onboarding.

### 🎯 Pick your campuses

> Select colleges you want to explore.

Search:

```text
🔍 Search colleges...

BIT Mesra
IIT Bombay
IIT Delhi
NIT Trichy
VIT
BITS Pilani
...
```

Allow:

**Select up to 5**

Then personalize the entire Preview experience.

For example:

> **Your Campus Preview**

```text
BIT Mesra
├── What's happening
├── Student posts
├── Communities
├── Campus discussions
├── Events
└── College information
```

This gives the aspirant an emotional connection to a **specific future campus**.

---

# 4. What Viewer can see

Viewer Mode should essentially be:

### 👀 Read everything useful

They can see:

* Public campus feed
* Posts
* Comments/replies **as content**
* Communities
* Campus events
* Poll results
* College pages
* Stories where your existing visibility rules permit
* Campus discussions
* Marketplace discovery where appropriate
* Campus information
* Student conversations

But they **cannot become an active participant** yet.

---

# 5. Viewer permissions

I'd make the permission model extremely explicit.

| Feature                          | Viewer |
| -------------------------------- | -----: |
| Browse campus                    |      ✅ |
| Read posts                       |      ✅ |
| Read comments                    |      ✅ |
| Search campuses                  |      ✅ |
| Search public content            |      ✅ |
| Save posts                       |      ✅ |
| Share/copy link                  |      ✅ |
| View college communities         |      ✅ |
| View events                      |      ✅ |
| Like                             |      ❌ |
| Comment                          |      ❌ |
| Post                             |      ❌ |
| Join community                   |      ❌ |
| DM students                      |      ❌ |
| Match Mode                       |      ❌ |
| Secret Crush                     |      ❌ |
| Anonymous Mode                   |      ❌ |
| Marketplace ordering             |      ❌ |
| Campus leaderboard participation |      ❌ |

**Save is the one important exception.**

That gives aspirants a way to create a personal relationship with CampusLoop without compromising your students-only social layer.

---

# 6. 🔖 Saved Posts becomes extremely important

Don't make Save a student-only feature.

Create:

```text
POST
  ↓
🔖 Save
```

for both:

```text
Viewer
Student
```

Then create:

```text
Saved
```

in the user's account.

For a JEE aspirant:

> "What is hostel life like?"

They find an interesting post:

> "BIT Mesra hostel food is actually..."

🔖 **Save**

Six months later they have:

```text
My Saved Campus

🔖 Hostel experiences       14
🔖 Placement discussions    8
🔖 Campus memes             23
🔖 Clubs                    6
🔖 Food recommendations     11
🔖 Important discussions    19
```

Now CampusLoop isn't just a website they visited.

It becomes their **personal archive of their future college**.

That's the attachment mechanism you're looking for.

---

# 7. Make Saved Posts survive the upgrade

This is **critical**.

Suppose:

```text
2026
Viewer
↓
saves 47 posts

2027
gets admission

↓
connects college email

↓
Student Mode
```

Those 47 saves **must remain**.

Same:

```text
user_id
```

Same:

```text
saved_posts
```

Only the user's permissions change.

That is much cleaner architecturally.

---

# 8. The upgrade moment 🔥

This is where I'd make the experience special.

When they finally connect their institutional email:

```text
gmail@example.com
        ↓
College Email Verification
        ↓
OTP
        ↓
Verified
```

Don't simply show:

> "Email verified."

That's boring.

Instead, trigger a full-screen celebration.

---

# 🎓 **CAMPUS UNLOCKED**

Something like:

> **🎓 CAMPUS UNLOCKED**
>
> You're officially part of the campus now.

Then:

```text
🔓 Student Mode
✓ Posting unlocked
✓ Comments unlocked
✓ Communities unlocked
✓ Messaging unlocked
✓ Match Mode unlocked (18+)
✓ Campus interactions unlocked
✓ Anonymous Mode available
✓ Your saved posts are waiting for you
```

Then:

> **You weren't just exploring anymore.
> You made it here.**

That last line could be surprisingly powerful.

---

# 9. Make the transition feel personal

Show their journey:

```text
┌─────────────────────────────┐
│                             │
│       🎓 CAMPUS UNLOCKED    │
│                             │
│       BIT MESRA             │
│                             │
│  You started as an aspirant │
│  You saved 37 posts         │
│  You explored 4 communities │
│                             │
│  Today, you're officially   │
│  inside.                    │
│                             │
│       [ Enter Campus → ]    │
│                             │
└─────────────────────────────┘
```

The **37 saved posts** part is particularly good because it turns their history into a story.

---

# 10. Then change the navigation

Before verification:

```text
Home
Explore
Colleges
Saved
```

After verification:

```text
Home
Explore
Marketplace
Dating
Notifications
Messages
Communities
Profile
...
```

But don't rebuild the entire app shell.

Use the **same sidebar component** with permission-based navigation.

For example:

```ts
const navigation = {
  viewer: [...],
  student: [...]
}
```

or preferably a capability system rather than scattered checks.

---

# 11. Don't actually "switch accounts"

This is the most important architecture decision.

Avoid:

```text
Viewer Account
       ↓
Create Student Account
```

Instead:

```text
ONE USER
   │
   ├── personal email
   │
   ├── institutional email
   │
   ├── verification status
   │
   ├── campus
   │
   ├── saved posts
   │
   └── permissions
```

Before:

```text
verification_status = UNVERIFIED
role = VIEWER
```

After:

```text
verification_status = VERIFIED
role = STUDENT
campus_id = ...
```

Everything else stays attached to the same `user_id`.

---

# 12. Better: use capabilities instead of role checks

Since CampusLoop already has multiple modes, don't build the architecture around:

```text
if viewer
if student
if admin
```

everywhere.

Create capabilities.

For example:

```text
VIEW_PUBLIC_CONTENT
SAVE_POST
LIKE_POST
COMMENT
CREATE_POST
JOIN_COMMUNITY
SEND_MESSAGE
MATCH
SECRET_CRUSH
ANONYMOUS_POST
MARKETPLACE_ORDER
```

Viewer gets:

```text
VIEW_PUBLIC_CONTENT
SAVE_POST
```

Verified student gets:

```text
VIEW_PUBLIC_CONTENT
SAVE_POST
LIKE_POST
COMMENT
CREATE_POST
JOIN_COMMUNITY
SEND_MESSAGE
...
```

This will make future roles much easier.

---

# 13. One important safety rule

Don't expose **private student content** to Viewers.

Your current architecture says General Mode and Anonymous Mode are separate lenses, and anonymous content is deliberately excluded from General Mode to preserve feed integrity. 

So I'd define:

### Viewer sees

**Public campus content**

### Viewer does NOT see

* private communities
* private posts
* private conversations
* student profiles beyond what is intentionally public
* anonymous-mode-only interactions
* dating/match content
* Secret Crush
* personal information
* anything whose audience excludes viewers

This is important because otherwise "Viewer Mode" could accidentally become a backdoor into the private student network.

---

# 14. Create a subtle conversion system

Don't constantly annoy aspirants with:

> "Verify your college email!"

Instead, use **locked interactions**.

They see:

```text
❤️ 182 likes

💬 43 comments

🔖 Save
```

If they click Like:

> 🔒 **You're in Preview Mode**
>
> Likes unlock when you join your campus.
>
> **Already a student? Verify your college email →**

Same for commenting:

> 💬 **Want to join the conversation?**
>
> You're currently exploring this campus.
>
> Verify your college email to interact with students.

This makes the restriction feel like **something to unlock**, not an arbitrary limitation.

---

# 15. The JEE/NEET loop

This is where the strategy gets really interesting.

### Phase 1 — Aspirant

```text
JEE/NEET preparation
        ↓
Discovers CampusLoop
        ↓
Gmail signup
        ↓
Chooses dream colleges
        ↓
Campus Preview
        ↓
Reads real student conversations
        ↓
Saves posts
```

### Phase 2 — Decision

```text
Exam
 ↓
Counselling
 ↓
College selection
 ↓
Already knows CampusLoop
```

### Phase 3 — Admission

```text
Gets college email
        ↓
CampusLoop notification/banner
        ↓
"Is this your campus?"
        ↓
Connect institutional email
        ↓
OTP
```

### Phase 4 — 🎓 Campus Unlocked

```text
Viewer
   ↓
Student
   ↓
Post
Comment
Community
Chat
Match
Marketplace
Campus leaderboard
```

### Phase 5 — Network effect

That new student now invites:

> "Bro join CampusLoop, our whole campus is here."

You have effectively turned **pre-college acquisition into post-admission retention**.

---

# 16. The notification I'd use

Once they have a selected college:

> 🎓 **Did you make it?**
>
> If you've joined **BIT Mesra**, connect your college email and unlock your campus.
>
> **[ Unlock Campus ]**

But don't send this aggressively. It should be triggered around the user's own actions or when they return after a long period.

---

# 17. The emotional progression

This is the product story I'd build:

```text
👀 EXPLORE
"I want to know what this college is like."

        ↓

🔖 SAVE
"I want to remember this."

        ↓

❤️ FOLLOW / WATCH
"This might be my campus."

        ↓

🎓 ADMISSION
"I actually got in."

        ↓

🔓 CAMPUS UNLOCKED
"I'm finally part of it."

        ↓

🗣️ PARTICIPATE
"Now I can actually talk."

        ↓

🤝 CONNECT
"My campus is here."
```

That's much more powerful than simply calling it an "unverified account."

---

# 18. One feature I'd add: **"My Future Campus"**

For Viewers, the profile could say:

> **My Future Campus**

```text
🎓 BIT Mesra
❤️ 37 saved posts
👥 8 communities explored
📚 12 discussions saved

Status:
Future Student
```

Don't publicly show "aspirant" to students unless the viewer explicitly chooses that.

This makes the experience feel like they're **building their future campus profile**.

---

# 19. Database changes can remain tiny

You don't need a major rewrite.

Conceptually:

```text
users
 ├── id
 ├── personal_email
 ├── institutional_email
 ├── verification_status
 ├── campus_id
 └── mode
```

Then:

```text
saved_posts
 ├── user_id
 ├── post_id
 └── created_at
```

And your existing posts remain:

```text
posts
 └── ...
```

The permission layer decides whether the user can interact.

So your existing architecture remains fundamentally intact.

---

# My final product structure

### **Campus Preview**

For unverified aspirants.

> **See campus life before you get there.**

**Can:**

* Explore colleges
* Read public campus content
* Search
* Save posts
* Build Future Campus
* Explore communities/events

**Can't:**

* Post
* Comment
* Like
* DM
* Match
* Secret Crush
* Access private content

---

### **Campus Unlocked 🎓**

The moment institutional verification succeeds.

> **You made it. Your campus is unlocked.**

Instantly unlock:

* Posting
* Likes
* Comments
* Communities
* Messaging
* Match Mode where eligible
* Secret Crush
* Anonymous Mode
* Campus participation
* Student-specific features

And **all saved posts, history and account identity remain intact.**

That gives CampusLoop a very compelling loop:

**Aspirants discover CampusLoop → emotionally invest in their future campus → save content → eventually become students → unlock the social layer → bring their batchmates in.**

It also fits your existing **Viewer Mode → verified student** philosophy without creating a second social network inside CampusLoop. 
