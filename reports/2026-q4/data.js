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
    quarterLabel: "Q4 2026",                     // also used by the archive page
    asOf: "2026-10-09",   // must equal the LAST date in "series" below (the page checks this). Oct 9 = last COMPLETE day when pulled on Oct 10.
    version: "v2.2",      // v2.0 = first Q4 build (new System Health rule, see section 9) · v2.1 = Q4 community quotes · v2.2 = quote swap
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
    ["2026-09-23", 931], ["2026-09-25", 939], ["2026-09-28", 948], ["2026-09-30", 949], ["2026-10-01", 953],
    ["2026-10-03", 973], ["2026-10-04", 978], ["2026-10-05", 989], ["2026-10-07", 1013], ["2026-10-08", 1024], ["2026-10-09", 1033]
  ],

  /* ---------------------------------------------------------------------
     3. LAUNCH BASELINES — locked on the day recorded, never edited (Clerk's Rules)
     --------------------------------------------------------------------- */
  launch: {
    date: "2026-01-25",            // "engine launch" (Nebula) — the dashed line on the chart
    baselineDate: "2026-01-24",    // last day BEFORE launch; its count in "series" is the baseline (122)
    /* (the old pre-launch pace was removed: the page now compares growth with an external benchmark instead, see externalBenchmark below) */
  },

  /* Year-to-date growth starts at the first EXACT 2026 count in "series" (Jan 10 = 112). We never invent a Jan 1 count. */
  ytd: { startDate: "2026-01-10" },

  /* PERCENT-VARIANCE COLOURS: a rate is green if it is within 30% below its table's overall rate,
     yellow if 30-60% below, red if worse. Change the two numbers here to change every table at once. */
  conversionBands: { green: 30, yellow: 60 },

  /* EXTERNAL BENCHMARK for newsletters around 1,000 subscribers. Read this honestly: it is a practitioner rule of thumb
     (1-5% net growth per month), NOT a peer-reviewed study or a Substack-published statistic. We compare against the TOP (5%). */
  externalBenchmark: {
    monthlyGrowthLowPct: 1, monthlyGrowthHighPct: 5,
    source: "ClickMinded, Newsletter Statistics (2026)", url: "https://www.clickminded.com/newsletter-statistics/",
    note: "Practitioner heuristic for small newsletters, not a primary study. Treat as a rough yardstick."
  },

  /* ---------------------------------------------------------------------
     4. (removed) "Average new subscribers / day" is now worked out in calc.js from
        current.newSubs (section 6 below) divided by the calendar days from the quarter's
        start to the as-of date. There is nothing to type in for it.
     --------------------------------------------------------------------- */

  /* ---------------------------------------------------------------------
     5. SINCE-LAUNCH CHANNEL TABLE
     WHERE: Substack > Analytics > Sources, custom range = launch date -> today.
       "subs"  = New subscribers tab (the official attribution record)
       "views" and "users" = Stats > Traffic tab, same date range (n/a where Substack doesn't report)
     Put the biggest row first: it gets the highlight.
     "restack: true" marks the rows that count as "Notes + profile page" in the callout.
     --------------------------------------------------------------------- */
  /* Pulled Oct 10, range Jan 25 -> Oct 9. Rows add up to Substack's own total (1,054).
     SUBSTACK RENAMED A CHANNEL SINCE Q3: "Other" is now split into "Profile discovery" + "Other".
     Q3's "substack.com" row was Other (incl. profile) minus Substack app. Here that same bucket is two rows:
     Profile discovery (93) and substack.com other = Other (163) minus Substack app (47) = 116.
     All three restack rows (Notes, Profile discovery, substack.com other) = the same definition as Q3's "Notes + profile page". */
  sinceLaunch: {
    rows: [
      { name: "Notes",                 views: null,   users: null,  subs: 542, restack: true },
      { name: "Direct to app",         views: 7965,   users: 3645,  subs: 162 },
      { name: "substack.com (other)",  views: null,   users: null,  subs: 116, restack: true },   // = Sources "Other" (163) minus "Substack app" (47)
      { name: "Profile discovery",     views: null,   users: null,  subs: 93,  restack: true },
      { name: "Recommendations",       views: null,   users: null,  subs: 63 },
      { name: "Substack app",          views: 13429,  users: 4349,  subs: 47 },
      { name: "Direct",                views: 7881,   users: 2973,  subs: 8 },
      { name: "Substack trackbacks",   views: null,   users: null,  subs: 7 },
      { name: "Substack onboarding",   views: null,   users: null,  subs: 5 },
      { name: "Substack live video",   views: null,   users: null,  subs: 5 },
      { name: "Substack chat",         views: null,   users: null,  subs: 2 },
      { name: "google.com",            views: 41,     users: 33,    subs: 2 },
      { name: "instagram.com",         views: 41,     users: 38,    subs: 1 },
      { name: "Email",                 views: 107,    users: 84,    subs: 1 }
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
    { key: "Q1", season: "SEED · JAN – MAR",    newSubs: 248, activeDays: 66 },
    { key: "Q2", season: "ROOTS · APR – JUN",   newSubs: 339, activeDays: 75 },
    /* Q3 LOCKED as published in the Q3 report (Oct 1, v1.6): 398 new subs over 88 active days (Jul 1 -> Oct 1, minus Sep 7-11).
       Clerk's Rule: baselines are never edited, even though Substack has since re-attributed Jul 1 -> Oct 1 to 393. */
    { key: "Q3", season: "SPROUT · JUL – SEP",  newSubs: 398, activeDays: 88 }
  ],

  current: {
    key: "Q4",                            // shown wherever the page says "Q4"
    season: "BRANCH · OCT – DEC",         // stage order is locked: Seed > Roots > Sprout > Branch > Canopy
    start: "2026-10-01",
    end: "2026-12-31",                    // quarter length (92 days) feeds the monthly-growth formula
    startSubsDate: "2026-09-30",          // count on this date (from "series") = opening balance for the quarter (949)
    inactive: [],                          // no days off so far this quarter. Add ["YYYY-MM-DD", "YYYY-MM-DD"] pairs when you take any.
    /* NOTE: Oct 1 is counted in BOTH the locked Q3 figure (which ran to Oct 1) and here (Q4 = the calendar quarter).
       That is 3 subscribers. Kept on purpose: Q3 is locked, and Q4 should start on the quarter's first day. */
    newSubs: 81,                           // WHERE: Sources > custom Oct 1 -> Oct 9 > New subscribers: TOTAL (channel rows add to 84; Substack credits 3 people twice)

    /* Substack-network subscribers, split (Sources > New subscribers, Oct 1 -> Oct 9).
       Substack now shows "Profile discovery" as its own row. Profile page = Profile discovery (7) + "Other" (13) minus Substack app (7) = 13,
       the same definition Q3 used (Q3's "Other" contained profile discovery). */
    network: {
      visitors: 277,                       // Sources > Unique visitors tab > "Substack" total
      subsFromSources: 72,                 // Sources > New subscribers tab > "Substack" row. The page checks that the split below adds up to this.
      notes: 42,
      profilePage: 13,                     // = Profile discovery (7) + Sources "Other" (13) - Traffic "substack app" free signups (7)
      recommendations: 7,
      substackApp: 7,
      liveStream: 0,
      trackbacksOnboarding: 3              // trackbacks (1) + onboarding (2)
    },
    directToApp: { visitors: 233, subs: 11 },
    direct:      { visitors: 70,  subs: 1 },
    external:    { visitors: 6,   subs: 0 }    // email clicks (2) + instagram (2) + google (1) + linktree (1); own website: 0
  },

  /* WHERE: Substack > Audience > Recommendations: "Substacks recommending you" */
  recommenders: 56,
  recsPerPublicationHigh: 1.13,   // MANUAL: upper end of the "subscribers each" range = since-launch subscribers from recommendations (63) / recommenders (56)

  /* ---------------------------------------------------------------------
     7. NOTES — per-Note stats (open each Note's stats page; new subs from Sources > Notes expanded)
     Sorted automatically by restacks. Engagement and conversion are calculated.
     --------------------------------------------------------------------- */
  /* Q4 Notes (Oct 1 -> Oct 9). Restacks, likes, replies, impressions = each Note's own stats page, read Oct 10
     (impressions keep growing for a few days, so these are a snapshot). New subs = Sources > Notes (expanded), Oct 1 -> Oct 9.
     Included: every Note YOU published in Q4 that Sources credits with a subscriber (except one reply with 7 impressions),
     plus a Note by ANOTHER account about you that Sources credits with 5 subscribers. Its stats page is private to its author,
     so impressions are unknown: write impressions: null and the page shows n/a (and leaves it out of the table's overall rate).
     Left out: restacks of two posts ("There Are A Thousand Of Us." 4, NOT RISING Issue 3), which are posts, not Notes. */
  notes: [
    { name: "\"There's another way\" · Oct 2",        restacks: 21, likes: 63, replies: 5,  impressions: 663, subs: 7 },
    { name: "Fast Four Friday · Oct 2",              restacks: 19, likes: 40, replies: 11, impressions: 478, subs: 1 },
    { name: "\"There were a hundred of us\" · Oct 7",  restacks: 4,  likes: 43, replies: 7,  impressions: 414, subs: 3 },
    { name: "Group-chat note · Oct 2",               restacks: 1,  likes: 10, replies: 1,  impressions: 101, subs: 1 },
    { name: "Culture Thursdays · Oct 8",             restacks: 0,  likes: 5,  replies: 1,  impressions: 67,  subs: 1 },
    { name: "Neela 🌶️ (WorkmanShit®) on the Chief of Staff story · Oct 7", restacks: 2, likes: 35, replies: 3, impressions: null, subs: 5 }
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
      { name: "Joel L",             baseline: 420, gain: 19, counted: true },   // teaser baseline (Aug 26) -> 439 at the 1-week mark
      { name: "Constantinos",       baseline: 99,  gain: 8,  counted: true },   // pre-feature baseline (99, flat through Sep 6) -> 107 on Sep 16
      { name: "Andrew Barban",      baseline: 177, gain: 9,  counted: true },   // teaser baseline (Aug 9) -> 186 on Aug 26
      { name: "Jennifer Houle",     baseline: 630, gain: 15, counted: true },   // gross lift in the feature window (net is now -5)
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
    subsNow: 352,           // their subscribers now (about 3 months in); gain = 352 - 292 = 60
    /* Comparison: +2.0% in a week, the known benchmark for a comparable writer (a publication this size) who is NOT Stackhunting (Feature Lift Tracker: 345 -> 352) */
    control: { start: 345, end: 352 }
  },

   // ---------------------------------------------------------------------
   // 8b. AMPLIFICATION VOLUME - the reach of the restack engine itself.
   // MANUAL, and an ESTIMATE, not a count. Fast Four Friday compiles every writer
   // restacked that week into one Note. Jan 25 -> Oct 9 = 37 Fridays; allowing for
   // skipped weeks, ~35 notes at 30-40 names each = ~1,200 slots. Unique writers =
   // that figure minus repeat appearances. The repeat rate has NOT been measured
   // against the full roster, so we publish the floor (700+), not the midpoint (~800).
   // Replace both with counted figures once the Friday notes are tallied.
   // ---------------------------------------------------------------------
   amplification: {
      essays:  "1,200+",   // restacked posts across all Fast Four Friday Notes, since launch
      writers: "700+"      // unique writers behind them, repeat appearances removed
   },

  /* ---------------------------------------------------------------------
     9. SYSTEM HEALTH & CAPACITY — the S-curve model
     --------------------------------------------------------------------- */
  /* OCT 2026 DECISION (option C): K is now used ONLY for the expansion timeline (Progress to Expansion, the S-curve chart,
     Time before Phase 2). System Health is judged on PACE: new subscribers per active day in the current Fibonacci stage,
     compared with the previous (completed) stage, coloured by the same percent-variance rule as the tables (conversionBands). */
  capacity: {
    K: 10000,                                   // carrying capacity: chosen, not measured. Could not be fitted at the Oct 2026 checkpoint (no slowdown in the data yet)
    expansionPoint: 2500,                       // where a Stackhunter Desk gets added
    benchmarkLeg: { fromSubs: 377, toSubs: 610, days: 74 },   // Root -> Sprout leg: r = ln(610/377)/74 = 0.65%/day (locked). Used only for the Phase 2 timeline now.
    milestones: [233, 377, 610, 987, 1597],     // Fibonacci checkpoints
    /* Fibonacci milestone TARGET = "Nature's Date", the growth dashboard's own instrument: the date the S-curve says we'd reach
       the milestone from today's count at the healthy pace (r = 0.65%/day, K above). On-track range = target ± 7 days.
       Status compares it with the date we'd arrive at this quarter's pace (new subs per active day). Same bands as the dashboard:
       >14 days early = Far ahead · >7 early = Slightly ahead · within 7 = On track · up to 21 late = Slightly behind · later = Behind. */
    nextMilestone: { subs: 1597, targetDate: "nature", trackDays: 7 },

    /* STAGE PACE — the System Health instrument.
       previousStage is LOCKED (completed). Crossing dates come from the Overview chart; new subs from Sources (custom range = stage window).
       Branch: crossed 610 on Jun 21 (Jun 20 = 607, Jun 21 = 611) and 987 on Oct 5 (Oct 4 = 978, Oct 5 = 989).
       Window Jun 22 -> Oct 5 = 106 days, minus Sep 7-11 off = 101 active days. Sources total = 462. */
    previousStage: { name: "Branch", from: 610, to: 987, start: "2026-06-22", end: "2026-10-05", startSubs: 611, endSubs: 989, newSubs: 462, activeDays: 101 },
    /* currentStage: newSubs = Sources total from start -> as-of date. Update every refresh. */
    currentStage:  { name: "Canopy", from: 987, to: 1597, start: "2026-10-06", newSubs: 39, inactive: [] },   // Sources total Oct 6 -> Oct 9
    fragmentDays: 14                            // a stage with fewer active days than this is a "fragment": shown, never alarmed (Clerk's Rule)
  },

  /* ---------------------------------------------------------------------
     10. MONTHLY GROWTH — which "month" the growth is divided across
     "quarter"  = divide by the length of the WHOLE quarter (92 days). The 13.8% you published on
                  Sep 22 was this same formula at 926 subscribers; it rises as the count grows.
     "elapsed"  = divide by days elapsed so far (87 days). Higher number, arguably truer mid-quarter.
     --------------------------------------------------------------------- */
  /* Q4 NOTE: 8 days into the quarter, "quarter" gives 2.5%/mo (the 8 days spread over 3 months, looks like a collapse)
     and "elapsed" gives 33.6%/mo (8 sprint days stretched to a month). Neither is a fair read this early.
     Kathi, Oct 10: show monthly ("elapsed"). */
  monthlyGrowthBasis: "elapsed",

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
    heroHeadline: "There's another way for voices to be heard without depending on the algorithm—and it's unapologetically human.",
    methodology: "Based on Hi, Human's 1-year growth data, analyzing growth levers to compile a repeatable and open-source community-building playbook for future <a href=\"https://claude.ai/artifact/8WVxXTnM9Q69n8gaMogvfb\" target=\"_blank\" rel=\"noopener\">Desk Chiefs</a>.",

    ytdHeadliner: "I used Notes to amplify others, and Notes became the main thing that amplified me.",
    trajectoryLede: "Hi, Human's subscriber count, with the restack engine launch marked.",
    sinceLaunchLede: "Where our {{sinceLaunch.total}} gross new subscribers have come from, cumulative since January.",
    sinceLaunchCallout: "<strong>Notes and the profile page together account for {{sinceLaunch.restackSharePct}}% of Hi, Human's subscribers since launch</strong> — {{sinceLaunch.restackSubs}} of {{sinceLaunch.total}}. Everything else combined, including the app, recommendations and outside links, makes up the remainder.",

    quarterlyHeadliner: "Community growth can happen without paid reach or capital. It just takes time and genuine connection.",
    conversionLede: "This quarter's {{current.newSubs}} new subscribers, by channel. Conversion = subscribers ÷ visitors. Share = portion of the quarter's new subscribers.",
    /* Oct 10 (Kathi): no trend commentary in Q4 while trends are still forming. An EMPTY callout ("") hides its panel. */
    conversionCallout: "", conversionCalloutWas: "<strong>Reading and restacking — Notes plus the profile page — drove {{current.readingRestack.subs}} of the quarter's subscribers, {{current.readingRestack.sharePct}}% of the total.</strong> It's also the most efficient channel: the Substack network converts visitors at {{current.network.conv}}%, off-platform traffic at {{current.offPlatform.convRound}}%.",
    conversionMethodology: "\"Substack network\" is the only bucket Substack lets us see traffic for in aggregate — it can't be split further into Notes vs. recommendations at the visitor level, only at the point someone subscribes. The individual Note examples below get closer to isolating restacks specifically. Shares total slightly over 100% — Substack credits a few subscribers to two sources.",
    spendBlockNetworkBody: "Of every 100 people who reached Hi, Human through Substack — restacks, the profile page, the app — about {{current.network.convRound}} subscribed. This is where all the effort goes, and it costs nothing but time and attention to run.",
    spendBlockOffBody: "Direct links, email, social media (LinkedIn, Facebook, Instagram) and search together sent {{current.offPlatform.visitors}} visitors and produced {{current.offPlatform.subsPhrase}}, organically. We haven't needed to spend on these channels to grow.",

    notesLede: "Performance analytics of six Notes published in {{current.key}}, including one written about us by another writer.",
    notesPending: "{{current.key}} Note stats are added at the next refresh.",     // shown in the table while data.js "notes" is empty
    notesCalloutTitle: "", notesCallout: [], notesCalloutWas: [
      "Every Friday I compile all the people we've restacked in the past week in a Note, and I DM every single one on the list to make sure they see it. It converts the most because it builds the most relationships.",
      "9+ restacks can make voices travel. 20+ can make them soar."
    ],
    notesMethodology: "Engagement rate = likes + replies + restacks, divided by impressions. Table sorted by restack count, most first.<p class='color-key'>HOW COLOURS WORK · each rate is compared with this table’s overall rate ({{notesBench}}): <b class='k-good'>green</b> = no more than {{bands.green}}% below it, <b class='k-warn'>yellow</b> = {{bands.green}}–{{bands.yellow}}% below, <b class='k-bad'>red</b> = worse.</p>",

    missionLede: "What happens when a writer is featured on the cover of NOT RISING Magazine.",
    missionControlBody: "A featured writer grew roughly ten times faster than a same-size writer we didn't feature, over the identical window.",
    stackhunterBoostBody: "The Stackhunter self-reported gaining {{impact.shGain}} new subscribers and their first paid one within week 1.",
    stackhunterControlBody: "Growth for a comparable writer who isn't stackhunting, over one week.",
    shipsLede: "When a Stackhunter lifts others up, they get lifted back.",
    stackhunterBoostBody2: "Three months in, they've gained {{impact.sh3Pct}}.",
    missionReachBody: "Combined subscribers our curators can amplify a writer into — the discovery range we offer the people we feature. Five curators and three editorial directors.",
     amplificationLede: "The reach of the restack engine itself, since launch.",
     amplificationEssaysBody: "Essays restacked across nine months of daily Notes, compiled every Friday into one Fast Four list and sent by DM to each writer.",
     amplificationWritersBody: "The writers behind those essays, counted once each with repeat appearances removed.",

    healthHeadliner: "NOT RISING is made up of humans, not machines. The long-term plan protects the system's health and capacity as we grow it.",
    /* ---- SYSTEM HEALTH WORDING (option C, Oct 2026) — approved by Kathi Oct 10 ---- */
    healthLede: "The Logistic S-Curve Model is an evidence-based framework for predicting growth inside a bounded population. We use it to decide when to expand. Whether the system needs tending is read from pace, below.",
    healthBodyHealthy: "The {{health.stage}} stage is bringing in {{health.pace}} new subscribers per active day, {{health.variance}} against the {{health.prevStage}} stage ({{health.prevPace}}/day). Within normal range: keep tending.",
    healthBodyBelow: "The {{health.stage}} stage is bringing in {{health.pace}} new subscribers per active day, {{health.variance}} against the {{health.prevStage}} stage ({{health.prevPace}}/day). Below normal range: tend the soil before expanding.",
    healthBodyFar: "The {{health.stage}} stage is bringing in {{health.pace}} new subscribers per active day, {{health.variance}} against the {{health.prevStage}} stage ({{health.prevPace}}/day). Well below normal range: the system needs attention.",
    healthBodyFragment: "The {{health.stage}} stage is {{health.days}} days old and bringing in {{health.pace}} new subscribers per active day, {{health.variance}} against the {{health.prevStage}} stage ({{health.prevPace}}/day). Too early to call: a stage needs {{health.minDays}} active days before its pace counts.",
    healthMethodology: "<p><b>Pace, not compounding (changed in Q4 2026).</b> Until Q3, System Health compared our daily compound growth rate with an S-curve benchmark. Measured stage by stage, our growth rate fell from 1.15% to 0.45% a day while the S-curve's crowding term barely moved, so the curve could not explain the slowdown.</p><p>So from Q4, System Health compares new subscribers per active day in the current Fibonacci stage with the stage before it. Same colours as the tables: green = no more than {{bands.green}}% below, yellow = {{bands.green}}–{{bands.yellow}}% below, red = worse. A stage under {{health.minDays}} active days old is shown but never alarmed. The S-curve is kept for one job: timing the expansion.</p>",
    milestoneBody: "On pace to arrive {{milestone.projectedLabel}}{{milestone.targetPhrase}}. We set checkpoints on the Fibonacci sequence — {{milestone.list}} — because each is about 1.6× the last, so every milestone takes a comparable effort rather than getting easier as we grow.",
    phase2Body: "Projected on the S-curve's benchmark rate (fast end) and the growth rate measured across the last completed stage (slow end), not a flat daily count. Phase 2 is when Desk Chiefs join — see <a href=\"https://claude.ai/artifact/8WVxXTnM9Q69n8gaMogvfb\" target=\"_blank\" rel=\"noopener\">Hi, Desk Chief</a>.",

    recommendersHeadline: "{{recommenders}} publications recommend Hi, Human on Substack.",
    quotesSummary: "What the Community Is Saying"
  },

  /* Community quotes. size: "sm" | "md" | "lg".  center: true = centered row.
     Q4 (pulled Oct 10): word-for-word excerpts from restacks-with-comment of NOT RISING Notes and posts, Oct 1 -> Oct 10.
     WHERE: each Note's or post's "Restacks" list (substack.com/note/c-ID/restacks). "…" marks where a longer restack was trimmed.
     (Q3's six quotes live on in the Q3 report.) */
  quotes: [
    { text: "…some days it's hard not to lose hope. Your essay and the movement you've started inspired me today.", who: "Lauren Maguire", size: "lg" },
    { text: "Friday dosage of hope", who: "Nirav Bhatt", size: "sm", center: true },
    { text: "Writers reading writers. People noticing people. Communities choosing which voices deserve to travel farther because something in the work mattered to them.", who: "Monica A Leyva", size: "md" },
    { text: "Stepping out of a vicious cycle to create a virtuous cycle instead, guided by human noticing rather than artificial algorithm.", who: "Hans Jorgensen", size: "md", center: true },
    { text: "I think we’ve handed so much over to algorithms without realizing it, and there’s something really powerful about people amplifying each other instead.", who: "Natalie Nicholson", size: "sm" },
    { text: "Some people are in it for the money, the material, the win. Some people like Kathi want to hear your story, have others hear your story—that’s rare.", who: "Gabe, Organizational Gravity", size: "lg", center: true },
    { text: "It’s time to bring soul to systems.", who: "Ms. Jana, Journey the Weave", size: "md" }
  ]
};
