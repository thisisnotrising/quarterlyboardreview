/* ==========================================================================
   data.js  —  THE ONLY FILE YOU EDIT EACH QUARTER (plus the images, if they change)
   --------------------------------------------------------------------------
   Everything on the Board Snapshot page comes from this file. Nothing here is
   calculated: these are the raw numbers you read off Substack (and your trackers).
   calc.js turns them into percentages, rates and verdicts; render.js draws them.

   HOW TO READ THIS FILE (for a first-time coder)
   - "//" starts a comment: a note to humans. The computer ignores it.
   - Text goes in "quotes". Numbers go bare:  931   4.31   0
   - A list is [ ... , ... ] and an item with named parts is { name: value, ... }
   - Every line ends with a comma except the last one in its group.
   - If you break something, the page goes blank and the browser console (F12)
     says which line. Undo your last change and it comes back.
   ========================================================================== */

window.BOARD_DATA = {

  /* ---------------------------------------------------------------------
     1. STAMP — bump these two every time you refresh the page
     --------------------------------------------------------------------- */
  meta: {
    reportTitle: "Board Report",   // shown in the browser tab
    quarterLabel: "Q3 2026",                     // also used by the archive page
    asOf: "2026-09-23",   // must equal the LAST date in "series" below (the page checks this)
    version: "v1.2",      // v1.1 -> v1.2 ... whatever you like
    publication: "Hi, Human",
    site: "thisisnotrising.org",
    motto: "Human in control. Not human in the loop."
  },

  /* ---------------------------------------------------------------------
     2. SUBSCRIBER HISTORY — the line chart, and the "Total subscribers" KPI
     WHERE: Substack > Home > "Total subscribers" chart (Overview).
     Clerk's Rule: the Overview chart is used ONLY for total counts on given dates.
     Add one [ "YYYY-MM-DD", count ] line at the bottom each refresh.
     --------------------------------------------------------------------- */
  series: [
    ["2025-08-08", 20],  ["2025-09-15", 42],  ["2025-10-16", 55],  ["2025-11-15", 78],
    ["2025-12-12", 99],  ["2026-01-10", 112], ["2026-01-24", 122], ["2026-02-07", 140],
    ["2026-02-14", 155], ["2026-02-28", 215], ["2026-03-12", 301], ["2026-03-25", 400],
    ["2026-04-01", 466], ["2026-04-20", 520], ["2026-05-10", 564], ["2026-05-25", 590],
    ["2026-06-20", 610], ["2026-06-30", 627], ["2026-07-14", 683], ["2026-08-03", 746],
    ["2026-08-19", 803], ["2026-08-30", 841], ["2026-09-10", 890], ["2026-09-22", 926],
    ["2026-09-23", 931]
  ],

  /* ---------------------------------------------------------------------
     3. LAUNCH BASELINES — locked on the day recorded, never edited (Clerk's Rules)
     --------------------------------------------------------------------- */
  launch: {
    date: "2026-01-25",            // "engine launch" (Nebula) — the dashed line on the chart
    baselineDate: "2026-01-24",    // last day BEFORE launch; its count in "series" is the baseline (122)
    // Dec 12 -> Jan 24: 99 -> 122, i.e. 23 new in 43 days. perDayLocked is the figure printed on the page (locked baseline).
    preLaunch: { newSubs: 23, days: 43, perDayLocked: 0.54 }
  },

  /* ---------------------------------------------------------------------
     4. LAST-90-DAYS PACE — drives "Average new subscribers / day"
     WHERE: Substack > Analytics > Sources > "90 days" > New subscribers tab: read the TOTAL.
     (Total = the Substack-network number divided by its percentage, or add the unique sources.)
     --------------------------------------------------------------------- */
  recent90: { newSubs: 388, days: 90 },

  /* ---------------------------------------------------------------------
     5. SINCE-LAUNCH CHANNEL TABLE
     WHERE: Substack > Analytics > Sources, custom range = launch date -> today.
       "subs"  = New subscribers tab (the official attribution record)
       "views" and "users" = Stats > Traffic tab, same date range (n/a where Substack doesn't report)
     Put the biggest row first: it gets the highlight.
     "restack: true" marks the rows that count as "Notes + profile page" in the callout.
     --------------------------------------------------------------------- */
  sinceLaunch: {
    rows: [
      { name: "Notes",               views: null,   users: null,  subs: 494, restack: true },
      { name: "substack.com",        views: null,   users: null,  subs: 216, restack: true },   // = Sources "Other" (253) minus "Substack app" (37)
      { name: "Direct to app",       views: 7076,   users: 3221,  subs: 130 },
      { name: "Recommendations",     views: null,   users: null,  subs: 51 },
      { name: "Substack app",        views: 12189,  users: 3851,  subs: 37 },
      { name: "Direct",              views: 7399,   users: 2770,  subs: 7 },
      { name: "Substack trackbacks", views: null,   users: null,  subs: 5 },
      { name: "Substack onboarding", views: null,   users: null,  subs: 3 },
      { name: "Substack live stream",views: null,   users: null,  subs: 3 },
      { name: "Substack chat",       views: null,   users: null,  subs: 2 },
      { name: "google.com",          views: 39,     users: 31,    subs: 2 },
      { name: "instagram.com",       views: 35,     users: 32,    subs: 1 }
    ]
  },

  /* ---------------------------------------------------------------------
     6. QUARTERS
     "closedQuarters" = quarters that are finished. Their numbers are locked history.
     activeDays = days you were actually publishing.
     "current" = the quarter this report is about (it gets the ● marker and the detailed tables).
     NEXT QUARTER: move the finished quarter into closedQuarters (with its final newSubs and activeDays)
     and describe the new quarter in "current".
     --------------------------------------------------------------------- */
  closedQuarters: [
    { key: "Q1", season: "SEED · JAN – MAR",   newSubs: 248, activeDays: 66 },
    { key: "Q2", season: "ROOTS · APR – JUN",  newSubs: 339, activeDays: 75 }
  ],

  current: {
    key: "Q3",                            // shown wherever the page says "Q3"
    season: "SPROUT · JUL – SEP",         // stage order is locked: Seed > Roots > Sprout > Branch > Canopy
    start: "2026-07-01",
    end: "2026-09-30",                    // quarter length (92 days) feeds the monthly-growth formula
    startSubsDate: "2026-06-30",          // count on this date (from "series") = opening balance for the quarter (627)
    inactive: [["2026-09-07", "2026-09-11"]],   // days off, subtracted from the quarter's "active days" (pace)
    newSubs: 365,                          // WHERE: Sources > custom Jul 1 -> today > New subscribers: TOTAL

    /* Substack-network subscribers, split (Sources > New subscribers, Jul 1 -> today).
       "Other" on Substack = profile page + Substack app. Split it with Stats > Traffic > "substack app" > Free subs. */
    network: {
      visitors: 1681,                      // Sources > Unique visitors tab > "Substack" total
      subsFromSources: 304,                // Sources > New subscribers tab > "Substack" row. The page checks that the split below adds up to this.
      notes: 175,
      profilePage: 72,                     // = Sources "Other" (95) minus Traffic "substack app" (23)
      recommendations: 28,
      substackApp: 23,
      liveStream: 3,
      trackbacksOnboarding: 3              // trackbacks (2) + onboarding (1)
    },
    directToApp: { visitors: 1145, subs: 67 },
    direct:      { visitors: 568,  subs: 0 },
    external:    { visitors: 136,  subs: 1 }   // social + email + own website + search + AI combined
  },

  /* WHERE: Substack > Audience > Recommendations: "Substacks recommending you" */
  recommenders: 50,
  recsPerPublicationHigh: 0.82,   // MANUAL: upper end of the "0.56–0.82 subscribers each" range (source not on file)

  /* ---------------------------------------------------------------------
     7. NOTES — per-Note stats (open each Note's stats page; new subs from Sources > Notes expanded)
     Sorted automatically by restacks. Engagement and conversion are calculated.
     --------------------------------------------------------------------- */
  notes: [
    { name: "Fast Four Friday · Aug 21",         restacks: 27, likes: 56,  replies: 20, impressions: 611,  subs: 7 },
    { name: "Fast Four Friday · Sep 4",          restacks: 24, likes: 68,  replies: 16, impressions: 872,  subs: 6 },
    { name: "Fast Four Friday · Sep 18",         restacks: 19, likes: 45,  replies: 10, impressions: 500,  subs: 3 },
    { name: "Fast Four Friday · Aug 28",         restacks: 17, likes: 49,  replies: 8,  impressions: 703,  subs: 8 },
    { name: "Anniversary note · Aug 20",         restacks: 14, likes: 103, replies: 26, impressions: 1359, subs: 6 },
    { name: "\"Life is hard as fuck\" · Sep 3",  restacks: 9,  likes: 184, replies: 27, impressions: 2646, subs: 9 },
    { name: "Culture Thursdays · Sep 17",        restacks: 3,  likes: 11,  replies: 2,  impressions: 157,  subs: 0 }
  ],

  /* ---------------------------------------------------------------------
     8. IMPACT ON MISSION
     Feature lift comes from your Feature Lift Tracker (not from Substack Analytics).
     lift % = (gain / baseline). "counted: false" = left out of the median (with the reason).
     --------------------------------------------------------------------- */
  featureLift: {
    writers: [
      { name: "Jennifer Hong",      baseline: 640, gain: 16, counted: true },
      { name: "Paolo Nardi",        baseline: 58,  gain: 8,  counted: true },
      { name: "Casey Keen",         baseline: 215, gain: 12, counted: true },
      { name: "Mustard",            baseline: 426, gain: 23, counted: true },
      { name: "Joel L",             baseline: 428, gain: 11, counted: true },
      { name: "Constantinos",       baseline: 99,  gain: 5,  counted: true },
      { name: "Jennifer Houle",     baseline: 630, gain: -5, counted: false, why: "grief-sabbatical confound" },
      { name: "Rebe",               baseline: null, gain: null, counted: false, why: "baseline unrecoverable" }
    ],
    controlMultiple: "~10×",         // MANUAL: featured vs same-size control (Joel L vs Des Kennedy, first 24-72h)
    reach: "~29,000",                // MANUAL: combined subscribers of the 8 Stackhunters
    stackhunters: "8"
  },

  /* WHERE: reported to us directly by one Stackhunter (self-reported, not from Substack Analytics).
     Their own subscriber count on their first day of Stackhunting, and at the end of week 1.
     The page works out the gain and the % boost from these two numbers. */
  stackhunterBoost: {
    baseline: 292,          // their subscribers when Stackhunting began
    afterWeek1: 307,        // their subscribers after week 1
    paidSubsWeek1: 1,       // their first paid subscriber came in week 1
    gain3Months: 60         // total subscribers gained over their first 3 months of Stackhunting
  },

  /* ---------------------------------------------------------------------
     9. SYSTEM HEALTH & CAPACITY — the S-curve model
     --------------------------------------------------------------------- */
  capacity: {
    K: 10000,                                   // carrying capacity for this stage (chosen, not measured — fit at the Oct 6 checkpoint)
    expansionPoint: 2500,                       // where a Stackhunter Desk gets added
    benchmarkLeg: { fromSubs: 377, toSubs: 610, days: 74 },   // Root -> Sprout leg: r = ln(610/377)/74 = 0.65%/day (locked)
    branchStart: { date: "2026-06-20", subs: 610 },           // Branch stage begins at the Sprout milestone
    band: 0.30,                                 // fertility tolerance for a FORMING stage (0.20 once locked)
    milestones: [233, 377, 610, 987],           // Fibonacci checkpoints
    nextMilestone: { subs: 987, targetDate: "2026-10-18" }
  },

  /* ---------------------------------------------------------------------
     10. MONTHLY GROWTH — which "month" the growth is divided across
     "quarter"  = divide by the length of the WHOLE quarter (92 days). This reproduces the
                  13.8% / 16.6% you published on Sep 22.
     "elapsed"  = divide by days elapsed so far (85 days). Higher number, arguably truer mid-quarter.
     --------------------------------------------------------------------- */
  monthlyGrowthBasis: "quarter",

  /* ---------------------------------------------------------------------
     10b. TRAJECTORY CHART — the month labels along the bottom.
     [ date, label, alignment ]. The last label (today) is added automatically.
     The height of the chart grows by itself once you pass 1,000 subscribers.
     --------------------------------------------------------------------- */
  chartXLabels: [
    ["2025-08-08", "Aug 2025", "start"],
    ["2025-12-12", "Dec", "middle"],
    ["2026-04-01", "Apr", "middle"]
  ],

  /* ---------------------------------------------------------------------
     11. WORDS — headlines, ledes, callouts. Numbers inside {{double braces}} are filled in
     by calc.js so the sentence can never disagree with the table above it.
     (Ask before changing wording: these are your published claims.)
     --------------------------------------------------------------------- */
  copy: {
    heroHeadline: "NOT RISING's growth engine runs on <em>trust</em>, and it's working.",
    methodology: "Based on Hi, Human's 1-year growth data, analyzing growth levers to compile a repeatable and open-source community-building playbook for future <a href=\"https://claude.ai/artifact/8WVxXTnM9Q69n8gaMogvfb\" target=\"_blank\" rel=\"noopener\">Desk Chiefs</a>.",

    ytdHeadliner: "Daily restacks are NOT RISING's biggest growth driver, by a large margin.",
    trajectoryLede: "Hi, Human's subscriber count, with the restack engine launch marked.",
    sinceLaunchLede: "Where our {{sinceLaunch.total}} gross new subscribers have come from, cumulative since January.",
    sinceLaunchCallout: "<strong>Notes and the profile page together account for {{sinceLaunch.restackSharePct}}% of Hi, Human's subscribers since launch</strong> — {{sinceLaunch.restackSubs}} of {{sinceLaunch.total}}. Everything else combined, including the app, recommendations and outside links, makes up the remainder.",

    quarterlyHeadliner: "Amplifying others drives growth and costs $0. We don't need capital to earn trust.",
    conversionLede: "This quarter's {{current.newSubs}} new subscribers, by channel. Conversion = subscribers ÷ visitors. Share = portion of the quarter's new subscribers.",
    conversionCallout: "<strong>Reading and restacking — Notes plus the profile page — drove {{current.readingRestack.subs}} of the quarter's subscribers, {{current.readingRestack.sharePct}}% of the total.</strong> It's also the most efficient channel: the Substack network converts visitors at {{current.network.conv}}%, off-platform traffic at {{current.offPlatform.convRound}}%.",
    conversionMethodology: "\"Substack network\" is the only bucket Substack lets us see traffic for in aggregate — it can't be split further into Notes vs. recommendations at the visitor level, only at the point someone subscribes. The individual Note examples below get closer to isolating restacks specifically. Shares total slightly over 100% — Substack credits a few subscribers to two sources.",
    spendBlockNetworkBody: "Of every 100 people who reached Hi, Human through Substack — restacks, the profile page, the app — about {{current.network.convRound}} subscribed. This is where all the effort goes, and it costs nothing but time and attention to run.",
    spendBlockOffBody: "Email, outside links, social media (LinkedIn, Facebook, Instagram) and search together sent {{current.offPlatform.visitorsRounded}} visitors and produced {{current.offPlatform.subsPhrase}}, organically. We haven't needed to spend on these channels to grow.",

    notesLede: "Performance analytics of seven Notes published in {{current.key}}.",
    notesCalloutTitle: "Fast Four Fridays convert the most",
    notesCallout: [
      "The four Fast Four Friday notes take every one of Q3's top four restack counts. Aug 21 and Aug 28 converted best, at 1.15% and 1.14%.",
      "<strong>Likes don't predict conversion; restacks do.</strong> \"Life is hard as fuck\" drew 184 likes, the most of any note, and converted worst at 0.34%.",
      "Every note at 9+ restacks converted someone; the only note that converted no one was also the lowest-restack."
    ],
    notesMethodology: "Engagement rate = likes + replies + restacks, divided by impressions. Table sorted by restack count, most first.",

    missionLede: "What happens to a writer's subscriber count after we put them on the cover of NOT RISING.",
    missionControlBody: "A featured writer grew roughly ten times faster than a same-size writer we didn't feature, over the identical window.",
    stackhunterBoostBody: "A Stackhunter self-reported gaining {{impact.shGain}} new subscribers and their first paid one within week 1 of Stackhunting.",
    stackhunterBoostBody2: "Three months in, they've gained {{impact.sh3Pct}}.",
    missionReachBody: "Combined subscribers our curators can amplify a writer into — the discovery range we offer the people we feature. Five curators and three editorial directors.",

    healthLede: "The Logistic S-Curve Model is an evidence-based framework for predicting growth inside a bounded population. We use it to trigger two decisions: if the system needs tending, and when to expand it.",
    healthBodyHealthy: "Growth is running at {{health.rActualPct}}% a day against a {{health.benchmarkPct}}% benchmark for our size — within normal range, so the signal is to keep tending rather than expand.",
    healthBodyBelow: "Growth is running at {{health.rActualPct}}% a day against a {{health.benchmarkPct}}% benchmark for our size — below the normal range, so the signal is to tend the soil before expanding.",
    healthBodyAbove: "Growth is running at {{health.rActualPct}}% a day against a {{health.benchmarkPct}}% benchmark for our size — above the normal range; check that the pace is sustainable before expanding.",
    milestoneBody: "On pace to arrive {{milestone.projectedLabel}} against an {{milestone.targetLabel}} target. We set checkpoints on the Fibonacci sequence — {{milestone.list}} — because each is about 1.6× the last, so every milestone takes a comparable effort rather than getting easier as we grow.",
    phase2Body: "Projected on the compounding rate the S-curve above uses, not a flat daily count. Phase 2 is when Desk Chiefs join — see <a href=\"https://claude.ai/artifact/8WVxXTnM9Q69n8gaMogvfb\" target=\"_blank\" rel=\"noopener\">Hi, Desk Chief</a>.",

    recommendersHeadline: "{{recommenders}} publications recommend Hi, Human on Substack.",
    quotesSummary: "What the Community Is Saying"
  },

  /* Community quotes. size: "sm" | "md" | "lg".  center: true = centered row. */
  quotes: [
    { text: "Friday's reading is always more meaningful thanks to Fast Four Friday.", who: "Wealth GPS", size: "sm" },
    { text: "Featuring other voices is what makes Substack so unique, this felt like a breath of fresh air!", who: "Kim Doyal", size: "md", center: true },
    { text: "Knowing it was a human selection makes the recognition even more meaningful.", who: "Tahir, restless thinker", size: "lg" },
    { text: "In a world so often shaped by algorithms, you and your group choose instead to see with human eyes, to read with human hearts, and to lift up writers whose words carry real weight and meaning.", who: "Death Whisperer", size: "sm", center: true },
    { text: "More than thirty names on this list, and a person behind every one of them. That is a lot of reading for one week, and reading is the part nobody sees.", who: "KYO, Tokyo", size: "md" },
    { text: "What makes a list like this worth reading is that the selection criteria are legible. You can argue with a framework. You can't argue with an algorithm's latent space.", who: "The Synthesis", size: "lg", center: true }
  ]
};
