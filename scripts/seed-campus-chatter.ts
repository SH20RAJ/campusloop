/**
 * CampusLoop Campus Chatter Seeder
 * Seeds human-voice multilingual feed posts (English / Hinglish / Hindi / Bangla)
 * with threaded spicy comments, votes, and a poll — spread across real campuses
 * and staggered timestamps so the feed reads alive.
 *
 * Run: bun run scripts/seed-campus-chatter.ts
 */

import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { comments, institutions, pollOptions, pollVotes, posts, userProfiles, votes } from "../src/db/schema";
import { loadLocalEnv } from "../src/lib/load-env";

loadLocalEnv();

function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.DB_URL;
  if (!databaseUrl) throw new Error("Missing DATABASE_URL.");
  return databaseUrl;
}

type SeedComment = {
  body: string;
  anon?: boolean;
  minAfter?: number;
  replies?: { body: string; anon?: boolean; minAfter?: number }[];
};

type SeedPost = {
  campus: RegExp;
  type: "NORMAL" | "CONFESSION" | "QUESTION" | "MEME" | "POLL";
  scope: "CAMPUS" | "GLOBAL";
  anon?: boolean;
  pseudonym?: string;
  title?: string;
  body: string;
  minAgo: number;
  upvotes: number;
  poll?: { options: string[]; votesPerOption: number[] };
  comments: SeedComment[];
};

const CHATTER: SeedPost[] = [
  {
    campus: /indian institute of technology, delhi/i,
    type: "NORMAL",
    scope: "GLOBAL",
    body: `unpopular opinion: mess ka rajma chawal genuinely slaps. jo log mess ko gaali dete hain vo kabhi 2 baje night mess ka anda bhurji kha ke nahi aaye. fight me in the comments #MessDiaries`,
    minAgo: 26,
    upvotes: 18,
    comments: [
      {
        body: "night mess ka maggi supremacy koi challenge nahi kar sakta. 2 AM maggi hits different when you have an 8 AM class",
        minAfter: 4,
        replies: [{ body: "fr. night mess wale bhaiya deserve a raise honestly", minAfter: 9 }],
      },
      {
        body: "delhi se bahar walo ko rajma samajh nahi aayega, ye debate yahin khatam",
        minAfter: 7,
        replies: [
          { body: "as a south indian i confirm, yall need to calm down about rajma", minAfter: 12 },
          { body: "bold of you to enter the rajma war unarmed", minAfter: 15 },
        ],
      },
      { body: "mess workers ko tag kardo koi, aaj unka appreciation post ban gaya", minAfter: 11 },
      { body: "rajma acha hai par vo suji ka halwa jo chipak jata hai uska kya", minAfter: 18 },
    ],
  },
  {
    campus: /jadavpur/i,
    type: "NORMAL",
    scope: "CAMPUS",
    body: `8:40 er class e 8:39 e pouchano is my toxic trait. JU gate er cha kheye attendance dite jaoa — ei balance tai life. keu relate korle comment e dekha koro #Jadavpur`,
    minAgo: 48,
    upvotes: 14,
    comments: [
      { body: "gate er cha + first bench er ghum, JU starter pack", minAfter: 6 },
      { body: "8:39 e pouche geleo attendance miss hoy, prof 8:35 ei register niye nen", minAfter: 13 },
      {
        body: "which gate er cha though, this is the real debate",
        minAfter: 20,
        replies: [{ body: "obviously gate no 4. baki gulo just hot water", minAfter: 26 }],
      },
    ],
  },
  {
    campus: /christ university, bangalore/i,
    type: "QUESTION",
    scope: "CAMPUS",
    title: "85% attendance + internships = how?",
    body: `genuine question seniors — 85% attendance rule ke saath internships kaise manage karte ho? companies expect 3 months full-time and college expects you in class. koi loophole hai ya bas suffer karna hai? #ChristUniversity`,
    minAgo: 72,
    upvotes: 22,
    comments: [
      {
        body: "loophole nahi hai, bas 4th year me attendance thodi relax hoti hai. 2nd year wale rona band karo",
        minAfter: 8,
      },
      {
        body: "hot take: the rule exists so they can charge you fines. attendance shortage = revenue stream",
        minAfter: 15,
        replies: [
          { body: "this is dangerously accurate and i refuse to elaborate", minAfter: 22 },
          { body: "bhai ye comment delete kar de, dean padh raha hoga", minAfter: 29 },
        ],
      },
      { body: "evening internship + morning classes. sleep is optional, degree is not", minAfter: 33 },
      { body: "my senior did internship by taking OD for 'conference' every friday for 2 months", minAfter: 41 },
    ],
  },
  {
    campus: /indian institute of technology, delhi/i,
    type: "CONFESSION",
    scope: "GLOBAL",
    anon: true,
    pseudonym: "ProxyKing",
    body: `confession: maine 3rd sem me ek hi subject me 11 proxy lagwayi thi aur prof ne end sem me mujhe 'most regular student' bola tha. aaj tak guilt me hoon. ya nahi bhi. #Confession`,
    minAgo: 125,
    upvotes: 26,
    comments: [
      { body: "11 proxy is not a confession, its a personality trait at this point", minAfter: 9 },
      {
        body: "proxy lagana is a skill issue for the system, not for us. biometric lagao phir baat karo",
        minAfter: 17,
        replies: [{ body: "biometric aaya to hum fingerprint wale gloves pehen lenge. adapt evolve overcome", minAfter: 24 }],
      },
      { body: "'most regular student' is sending me. prof ne kabhi register khola bhi tha?", minAfter: 31 },
      { body: "mera roommate meri proxy lagate lagate khud uss subject me fail ho gaya tha. true sacrifice", minAfter: 44 },
    ],
  },
  {
    campus: /vit bhopal/i,
    type: "NORMAL",
    scope: "GLOBAL",
    body: `FFCS course selection is basically IRCTC tatkal. 10 baje slot khula, 10:00:04 pe faculty full. ab 4th choice ka elective leke baithe hain hum. VIT walo, tumhara war kaisa gaya? #FFCS`,
    minAgo: 185,
    upvotes: 16,
    comments: [
      { body: "4 second me full?? mera to page hi load nahi hua tha", minAfter: 11 },
      { body: "seniors ne bola tha 3 laptop + phone + dosto ka hotspot. war strategy chahiye iske liye", minAfter: 19 },
      { body: "4th choice elective leke bhi log 9 pointer le aate hain, chill kar", minAfter: 27 },
      { body: "timetable banane me jo thrill hai vo exam clear karne me nahi", minAfter: 38 },
    ],
  },
  {
    campus: /ashoka/i,
    type: "NORMAL",
    scope: "GLOBAL",
    body: `unpopular opinion: college fests are just sponsored LinkedIn photoshoots now. 40L budget, same 3 artists every year, aur volunteers ko free tshirt tak naseeb nahi hoti. change my mind.`,
    minAgo: 245,
    upvotes: 24,
    comments: [
      {
        body: "as an ex-core member i can confirm 70% budget goes to artist + sound. volunteers get 'exposure'",
        minAfter: 10,
        replies: [
          { body: "exposure se mess ka bill nahi bharta bhai", minAfter: 18 },
          { body: "core members get portfolios, volunteers get trauma. fair trade", minAfter: 25 },
        ],
      },
      { body: "counterpoint: fest ke 3 din hi to hain jab campus alive lagta hai. paisa vasool for attendees", minAfter: 21 },
      { body: "same 3 artists because sponsors only approve 'safe' names. indie bands ka budget kabhi pass nahi hota", minAfter: 36 },
      { body: "volunteer wali baat pe personally attacked feel ho raha hai", minAfter: 47 },
    ],
  },
  {
    campus: /st\. xavier/i,
    type: "NORMAL",
    scope: "CAMPUS",
    body: `हॉस्टल का वाईफाई exam week में ही क्यों मरता है? पूरा sem 100mbps, और जिस रात OS का पेपर है उस रात loading... loading... loading. coincidence? i think not. #HostelLife`,
    minAgo: 305,
    upvotes: 12,
    comments: [
      { body: "wifi wale bhaiya exam week me chhutti pe chale jate hain, tested theory", minAfter: 14 },
      { body: "bas OS ke time pe hi hota hai ye. OS wale prof se setting hai unki", minAfter: 22 },
      { body: "mobile data ka recharge exam week me double kharch hota hai, ye hidden fee hai college ki", minAfter: 35 },
    ],
  },
  {
    campus: /presidency/i,
    type: "QUESTION",
    scope: "CAMPUS",
    title: "Best budget roll near College Street?",
    body: `college street er kache 50 takar moddhe best roll kothay pabo? coffee house er adda er age ekta roll must. senior ra guide koro, freshman ekhane 🙏 #Kolkata`,
    minAgo: 395,
    upvotes: 9,
    comments: [
      { body: "college street er more er dokan ta, egg chicken 55 nebe but worth it", minAfter: 12 },
      { body: "50 takay best roll + coffee house er adda = peak presidency life. welcome junior", minAfter: 21 },
      {
        body: "ekta kotha, roll kheye coffee house e bosle infilterate hoye jabe adda te. plan kore jeo",
        minAfter: 30,
        replies: [{ body: "infiltration is the whole point of freshman year", minAfter: 40 }],
      },
    ],
  },
  {
    campus: /srm university-ap/i,
    type: "CONFESSION",
    scope: "GLOBAL",
    anon: true,
    pseudonym: "WindowSeatWali",
    body: `library ke 2nd floor pe jo roz window seat pe company law padhti hai — tumhari highlighter collection dekh ke lagta hai tum kaafi organised ho. bas yehi kehna tha. ok bye.`,
    minAgo: 480,
    upvotes: 19,
    comments: [
      { body: "window seat wali didi aap famous ho gayi ho", minAfter: 8 },
      { body: "bro wrote a love letter and called it a confession. respect.", minAfter: 16 },
      {
        body: "plot twist: vo bhi tumhe notice karti hai, tum roz same time pe aate ho",
        minAfter: 25,
        replies: [{ body: "ABEY. ab to jana padega library roz", minAfter: 33 }],
      },
      { body: "highlighter collection se organised judge karna is elite observation skill", minAfter: 42 },
    ],
  },
  {
    campus: /srm university-ap/i,
    type: "NORMAL",
    scope: "GLOBAL",
    body: `hot take: 3rd year me DSA ke 500 questions karne se acha hai ek solid project banao. interviewer ne mera leetcode count nahi, mera project pucha tha. 400 me se 390 ne same sheet kari hui hai — differentiate kaise karoge?`,
    minAgo: 600,
    upvotes: 28,
    comments: [
      {
        body: "counter hot take: project tabhi puchte hain jab resume shortlist ho, aur shortlist CGPA + DSA se hoti hai. dono karo, rona band karo",
        minAfter: 12,
        replies: [
          { body: "ye comment padh ke mera 2 din ka motivation khatam. thanks.", minAfter: 20 },
          { body: "harsh but true. system ko gaali do, system ke hisab se khelo", minAfter: 28 },
        ],
      },
      { body: "500 questions karne wale bhi rote hain, project wale bhi. bas rone ki jagah alag hai", minAfter: 24 },
      { body: "interviewer ne mera project pucha, phir usi project pe itna grill kiya ki DSA easy lagne laga", minAfter: 39 },
      { body: "sach ye hai ki referrals matter more than both. network banao dosto", minAfter: 52 },
    ],
  },
  {
    campus: /indian institute of technology, delhi/i,
    type: "MEME",
    scope: "GLOBAL",
    body: `Delhi ki sardi me 8 AM ki class attend karna is the real JEE Advanced. paper to sab de dete hain, razai se nikal ke dikhao.`,
    minAgo: 780,
    upvotes: 21,
    comments: [
      { body: "JEE me rank laana easy tha, ye roz ka battle hai", minAfter: 15 },
      { body: "razai: 1, mera CGPA: 0", minAfter: 26 },
      { body: "hostel se lecture hall tak ka walk hi cardio hai bhai", minAfter: 40 },
    ],
  },
  {
    campus: /christ university, bangalore/i,
    type: "CONFESSION",
    scope: "GLOBAL",
    anon: true,
    pseudonym: "CanteenRegular",
    body: `dating apps delete kar diye. campus me 4000 log hain aur meri sabse lambi conversation canteen wale bhaiya ke saath hoti hai — 'bhaiya ek extra chutney'. skill issue? haan, skill issue.`,
    minAgo: 960,
    upvotes: 25,
    comments: [
      { body: "canteen bhaiya se jo bond hai vo situationship se zyada loyal hai", minAfter: 13 },
      {
        body: "extra chutney wala bond is the most stable relationship on any campus, statistically proven (by me)",
        minAfter: 23,
        replies: [{ body: "citing 'trust me bro' as source, accepted in peer review", minAfter: 34 }],
      },
      { body: "4000 log aur baat chutney pe atki hai. same bhai same.", minAfter: 45 },
    ],
  },
  {
    campus: /christ university, bangalore/i,
    type: "NORMAL",
    scope: "CAMPUS",
    body: `ethnic day pe jo confidence aata hai na, vo placement cell kabhi nahi de sakta. ajj campus runway lag raha tha 💅`,
    minAgo: 1140,
    upvotes: 11,
    comments: [
      { body: "saree + jhumka + 8 AM attendance = main character energy", minAfter: 18 },
      { body: "photos dekh ke FOMO ho raha hai, next year pakka", minAfter: 30 },
    ],
  },
  {
    campus: /jadavpur/i,
    type: "NORMAL",
    scope: "CAMPUS",
    body: `canteen e last piece fish fry niye senior-junior er juddho ta keu dekhe na, othocho campus politics niye sobar lecture ache. JU er asol rajneeti ekhanei.`,
    minAgo: 1380,
    upvotes: 13,
    comments: [
      { body: "last piece fish fry er jonno friendship o sesh hote dekhechi", minAfter: 22 },
      { body: "canteen kakur decision final. supreme court o er upore na", minAfter: 35 },
    ],
  },
  {
    campus: /vit bhopal/i,
    type: "QUESTION",
    scope: "CAMPUS",
    title: "9PM in-time — kabhi change hoga?",
    body: `seniors genuine puch raha hoon — 9pm in-time kabhi change hone ka chance hai ya manifestation hi sahara hai? library 8 baje band, outing limited. kaise survive karte ho?`,
    minAgo: 1620,
    upvotes: 15,
    comments: [
      {
        body: "3 saal se yehi sun raha hoon 'next sem se change hoga'. copium pe chal raha hai campus",
        minAfter: 16,
        replies: [{ body: "copium is the official fuel of VIT hostels", minAfter: 28 }],
      },
      { body: "survive kaise? 8:55 pe sprint lagate hain, olympics trial samajh ke", minAfter: 33 },
      { body: "day scholar bano, yehi ek solution hai. baaki sab motivational quotes hain", minAfter: 50 },
    ],
  },
  {
    campus: /st\. xavier/i,
    type: "POLL",
    scope: "GLOBAL",
    title: "Night canteen hours?",
    body: `serious campus policy question: night canteen kitne baje tak khula rehna chahiye? vote karo, result warden ko forward karenge (pitch me dalenge, promise nahi)`,
    minAgo: 1920,
    upvotes: 17,
    poll: {
      options: ["2 AM tak, non-negotiable", "12 baje enough hai", "Mess dinner hi sudhar do", "Maggi kettle zindabad"],
      votesPerOption: [14, 5, 6, 8],
    },
    comments: [
      { body: "2 AM walo ne vote kiya ya bas sapne dekhe? voting me bhi procrastination", minAfter: 20 },
      { body: "'mess dinner sudhar do' wale option ko vote karke aya. revolutionary mindset", minAfter: 35 },
      { body: "warden ko forward karne wali baat pe hasi aa gayi. cc me mujhe bhi rakhna", minAfter: 55 },
    ],
  },
  {
    campus: /presidency/i,
    type: "CONFESSION",
    scope: "GLOBAL",
    anon: true,
    pseudonym: "FirstBenchBackbencher",
    body: `seniors ke 'interaction session' me jo confidence toda tha, vo 4 internships ne wapas nahi diya. naam badal dene se culture nahi badalta — juniors se normal baat karna itna mushkil kyun hai kuch logo ke liye?`,
    minAgo: 2280,
    upvotes: 23,
    comments: [
      { body: "this needed to be said. interaction ke naam pe jo hota hai vo sab jante hain", minAfter: 18 },
      {
        body: "not all seniors though. mere seniors ne mujhe first week me mess ka menu samjhaya tha, life saver the",
        minAfter: 30,
        replies: [{ body: "good seniors exist and they deserve more credit. tumhare wale keepers hain", minAfter: 44 }],
      },
      { body: "confidence todna easy hai, banana me 4 saal lagte hain. choose wisely seniors", minAfter: 58 },
    ],
  },
  {
    campus: /ashoka/i,
    type: "NORMAL",
    scope: "GLOBAL",
    body: `being awake at 4am writing an essay on something you don't fully believe in, to impress a prof you'll never meet again. liberal arts core memory unlocked.`,
    minAgo: 2640,
    upvotes: 10,
    comments: [
      { body: "the 4am 'what am i doing with my life' hits different during essay week", minAfter: 25 },
      { body: "plot twist: prof gives you an A and now you believe in it", minAfter: 48 },
    ],
  },
  {
    campus: /st\. xavier/i,
    type: "NORMAL",
    scope: "CAMPUS",
    body: `Kolkata rain + cancelled last period = maidan me football. yehi to college hai bhai. jo classroom me baithe rahe vo kya janein ⛈️`,
    minAgo: 3120,
    upvotes: 8,
    comments: [
      { body: "maidan ka keechad wala football > any turf. fight me", minAfter: 30 },
      { body: "aur phir bimar pad ke attendance miss. circle of life.", minAfter: 52 },
    ],
  },
  {
    campus: /indian institute of technology, delhi/i,
    type: "NORMAL",
    scope: "GLOBAL",
    body: `freshers ke liye ek advice: pehle sem me CGPA sambhal lo. 'CGPA doesn't matter' ye dialogue 9 pointer dete hain, 6 wale nahi. baad me rona mat. #UnpopularOpinion`,
    minAgo: 3600,
    upvotes: 27,
    comments: [
      {
        body: "9 pointer hoon, confirm karta hoon CGPA matters. branch change, MS admits, day-1 shortlists — sab me CGPA dekha jata hai",
        minAfter: 14,
        replies: [
          { body: "ek 9 pointer ne accept kar liya to discussion khatam. freshers note karo", minAfter: 26 },
          { body: "par 9 pointer ke paas ye post padhne ka time kahan se aya", minAfter: 38 },
        ],
      },
      { body: "6 pointer hoon, confirm karta hoon rona aata hai. dono side se verified info", minAfter: 22 },
      { body: "pehle sem ka CGPA recover karna almost impossible hai, ye koi nahi batata", minAfter: 47 },
      { body: "balance bolo bhai. 8+ with actual skills > 9.5 with zero personality in interviews", minAfter: 63 },
    ],
  },
  {
    campus: /jadavpur/i,
    type: "MEME",
    scope: "GLOBAL",
    body: `my sleep schedule is sponsored by 'ek aur episode' and 'kal se pakka 6 baje uthunga'. 3 saal se ye sponsorship chal rahi hai, brand deal kabhi khatam nahi hoti.`,
    minAgo: 4200,
    upvotes: 13,
    comments: [
      { body: "'kal se pakka' is the biggest lie ever told. above politics, above religion", minAfter: 28 },
      { body: "6 baje uthne ka plan bana ke 5:55 pe alarm band karne wale assemble ho jao", minAfter: 45 },
    ],
  },
  {
    campus: /vit bhopal/i,
    type: "CONFESSION",
    scope: "GLOBAL",
    anon: true,
    pseudonym: "MessTablePhilosopher",
    body: `mess me jo bhaiya extra sabzi dete hain bina mange — unki salary se zyada bada dil hai. kabhi thank you bola hai unhe? aaj bola. unki smile dekh ke laga canteen debates sab bekar hain.`,
    minAgo: 4680,
    upvotes: 20,
    comments: [
      { body: "wholesome post in the middle of all the chaos. needed this", minAfter: 20 },
      { body: "extra sabzi wale bhaiya are the backbone of this nation's engineers", minAfter: 36 },
      { body: "aaj mess me thank you bol ke aya. bhaiya ne extra papad de diya. kindness compounds.", minAfter: 60 },
    ],
  },
];

async function main() {
  const databaseUrl = requireDatabaseUrl();
  const sqlClient = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sqlClient);

  console.log("Seeding campus chatter...");

  // CLEAN=1 removes previously seeded chatter posts (exact body match, cascades
  // to comments/votes) so the script can be safely re-run.
  if (process.env.CLEAN === "1") {
    for (const item of CHATTER) {
      try {
        await db.delete(posts).where(eq(posts.body, item.body));
      } catch {}
    }
    console.log("Cleaned previous chatter run.");
  }

  const allInstitutions = await db.select({ id: institutions.id, name: institutions.name }).from(institutions);
  const allUsers = await db.select({ id: userProfiles.id }).from(userProfiles).limit(60);
  if (allUsers.length < 10) throw new Error("Not enough users to seed from.");

  const resolveCampus = (re: RegExp) => {
    const found = allInstitutions.find((i) => re.test(i.name));
    return (found ?? allInstitutions[0]).id;
  };

  let postCount = 0;
  let commentCount = 0;
  let voteCount = 0;

  for (let i = 0; i < CHATTER.length; i++) {
    const item = CHATTER[i];
    const instId = resolveCampus(item.campus);
    const postTime = new Date(Date.now() - item.minAgo * 60 * 1000);
    const author = allUsers[(i * 7) % allUsers.length];

    const [insertedPost] = await db
      .insert(posts)
      .values({
        authorId: item.anon ? author.id : allUsers[(i * 7 + 3) % allUsers.length].id,
        institutionId: instId,
        type: item.type,
        scope: item.scope,
        title: item.title ?? null,
        body: item.body,
        isAnonymous: Boolean(item.anon),
        pseudonym: item.pseudonym ?? null,
        status: "PUBLISHED",
        isSeeded: false,
        createdAt: postTime,
        updatedAt: postTime,
      })
      .returning({ id: posts.id });

    // Votes from rotating users (unique constraint safe). NOTE: votes.id has
    // no DB default, so an explicit UUID is required. Batched into one insert.
    const voters = Math.min(item.upvotes, allUsers.length - 1);
    const voteRows = Array.from({ length: voters }, (_, u) => ({
      id: randomUUID(),
      postId: insertedPost.id,
      userId: allUsers[(i * 5 + u * 7 + 1) % allUsers.length].id,
      value: 1,
      createdAt: new Date(postTime.getTime() + (u + 1) * 3 * 60 * 1000),
    }));
    if (voteRows.length > 0) {
      try {
        await db.insert(votes).values(voteRows).onConflictDoNothing();
        voteCount += voteRows.length;
      } catch {}
    }

    // Poll options + distributed votes (batched per option)
    if (item.type === "POLL" && item.poll) {
      let voteCursor = 0;
      for (let o = 0; o < item.poll.options.length; o++) {
        const [opt] = await db
          .insert(pollOptions)
          .values({ postId: insertedPost.id, text: item.poll.options[o], createdAt: postTime })
          .returning({ id: pollOptions.id });
        const want = item.poll.votesPerOption[o] ?? 0;
        const pollVoteRows = Array.from({ length: want }, () => {
          const row = {
            id: randomUUID(),
            postId: insertedPost.id,
            optionId: opt.id,
            userId: allUsers[(voteCursor * 7 + o * 2) % allUsers.length].id,
            createdAt: new Date(postTime.getTime() + (voteCursor + 1) * 5 * 60 * 1000),
          };
          voteCursor++;
          return row;
        });
        if (pollVoteRows.length > 0) {
          try {
            await db.insert(pollVotes).values(pollVoteRows).onConflictDoNothing();
          } catch {}
        }
      }
    }

    // Comments + one level of replies (batched, parents first so FK resolves)
    const commentRows: {
      id: string;
      postId: string;
      authorId: string | null;
      pseudonym: string | null;
      parentId: string | null;
      body: string;
      isAnonymous: boolean;
      status: "PUBLISHED";
      createdAt: Date;
      updatedAt: Date;
    }[] = [];
    for (let c = 0; c < item.comments.length; c++) {
      const cm = item.comments[c];
      const cmId = randomUUID();
      const cmTime = new Date(postTime.getTime() + (cm.minAfter ?? 10 + c * 8) * 60 * 1000);
      commentRows.push({
        id: cmId,
        postId: insertedPost.id,
        authorId: cm.anon ? null : allUsers[(i * 11 + c * 4 + 2) % allUsers.length].id,
        pseudonym: cm.anon ? `chatter_${((i * 13 + c * 5) % 89) + 10}` : null,
        parentId: null,
        body: cm.body,
        isAnonymous: Boolean(cm.anon),
        status: "PUBLISHED",
        createdAt: cmTime,
        updatedAt: cmTime,
      });
      for (let r = 0; r < (cm.replies?.length ?? 0); r++) {
        const rp = cm.replies![r];
        const rpTime = new Date(cmTime.getTime() + (rp.minAfter ?? 6) * 60 * 1000);
        commentRows.push({
          id: randomUUID(),
          postId: insertedPost.id,
          authorId: rp.anon ? null : allUsers[(i * 17 + c * 6 + r * 3 + 5) % allUsers.length].id,
          pseudonym: rp.anon ? `chatter_${((i * 19 + r * 7) % 89) + 10}` : null,
          parentId: cmId,
          body: rp.body,
          isAnonymous: Boolean(rp.anon),
          status: "PUBLISHED",
          createdAt: rpTime,
          updatedAt: rpTime,
        });
      }
    }
    if (commentRows.length > 0) {
      try {
        await db.insert(comments).values(commentRows);
        commentCount += commentRows.length;
      } catch {}
    }

    postCount++;
    console.log(`[${postCount}/${CHATTER.length}] Seeded (${item.minAgo}m ago): "${item.body.slice(0, 60)}..."`);
  }

  console.log(`\nDone: ${postCount} posts, ${commentCount} comments, ${voteCount} votes.`);
  await sqlClient.end();
}

main().catch((err) => {
  console.error("Chatter seeding error:", err);
  process.exit(1);
});
