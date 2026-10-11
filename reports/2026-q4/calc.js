/* ==========================================================================
   calc.js  —  turns the raw numbers in data.js into everything the page displays.
   --------------------------------------------------------------------------
   You normally never edit this file. It exists so that every percentage, rate and
   verdict on the page is a written-down formula you can read, check by hand, and
   reproduce in a spreadsheet.

   The pattern is always:   raw numbers  ->  one small formula  ->  display text.
   Every formula has a comment saying (a) what it means and (b) how to do it by hand.

   The function computeModel(D) returns "M": a big tidy object of ready-to-show text,
   e.g.  M.kpi.total = "936".   render.js pours M into the page.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- tiny helpers (each one is a single line of arithmetic) ---------- */
  const DAY = 86400000;                                   // milliseconds in one day
  const toDate = iso => new Date(iso + "T00:00:00Z");     // "2026-09-23" -> a Date (in UTC, so time zones can't shift it)
  const daysBetween = (a, b) => Math.round((toDate(b) - toDate(a)) / DAY);   // b minus a, in days
  const addDays = (iso, n) => new Date(toDate(iso).getTime() + n * DAY);
  const daysAfter = iso => addDays(iso, 1).toISOString().slice(0, 10);   // "2026-10-05" -> "2026-10-06"
  const comma = n => Number(n).toLocaleString("en-US");   // 1234 -> "1,234"
  const dp = (x, places) => Number(x).toFixed(places);    // 4.3111 -> "4.31"
  const pctOf = (part, whole) => (part / whole) * 100;    // 247 of 365 -> 67.67
  const shortDate = d => d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });        // "Oct 6"
  const longDate  = d => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }); // "Sep 23, 2026"
  const sum = list => list.reduce((a, b) => a + b, 0);
  const median = list => {                                // middle value (average the two middle ones if even count)
    const s = [...list].sort((a, b) => a - b), m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };
  const nice = (n) => (n === null || n === undefined ? "n/a" : comma(n));

  /* Share label: "0%", "0.3%" (under 0.5 gets a decimal so it isn't shown as 0%), "48%" */
  const shareLabel = x => (x === 0 ? "0%" : x < 0.5 ? dp(x, 1) + "%" : Math.round(x) + "%");

  /* ---- PERCENT-VARIANCE COLOURS (one rule for every table) ----
     variance = how far a rate sits from its table's benchmark, as a percent:  (rate / benchmark - 1) x 100
     Example: benchmark 0.57%, a note at 0.34%  ->  (0.34 / 0.57 - 1) x 100 = -40%.
     green  = variance is at or above  -G%   (G comes from data.js -> conversionBands.green, default 30)
     yellow = variance is at or above  -Y%   (data.js -> conversionBands.yellow, default 60)
     red    = worse than that.
     The function returns the CSS class for table cells (rate ...) and for big numbers (num) plus the variance itself. */
  const makeBand = bands => (value, benchmark) => {
    const variance = (value / benchmark - 1) * 100;
    const level = variance >= -bands.green ? "green" : variance >= -bands.yellow ? "yellow" : "red";
    return { variance, level,
             rate: { green: "rate hi", yellow: "rate mid", red: "rate red" }[level],      // table cells
             num:  { green: "good",    yellow: "amber",    red: "bad" }[level] };        // big numbers
  };
  const signedPct = (x, places) => (x >= 0 ? "+" : "−") + dp(Math.abs(x), places) + "%";

  function computeModel(D) {
    const M = {};
    const checks = [];                       // warnings shown in the console (and on screen with ?debug=1)
    const warn = msg => checks.push({ level: "warn", msg });
    const ok = msg => checks.push({ level: "ok", msg });

    /* ================= 0. STAMP & BASICS ================= */
    const series = D.series;
    const latest = series[series.length - 1];              // last [date, count] pair
    const N = latest[1];                                    // N = subscribers today
    const asOf = D.meta.asOf;
    const countOn = date => {                               // look up the count on a given date in "series"
      const row = series.find(r => r[0] === date);
      if (!row) { warn("series has no entry for " + date); return NaN; }
      return row[1];
    };
    if (latest[0] === asOf) ok("series ends on the as-of date (" + asOf + ")");
    else warn("meta.asOf (" + asOf + ") is not the last date in series (" + latest[0] + ")");

    M.meta = {
      eyebrow: "NOT RISING · " + D.current.key + " BOARD REPORT · DATA AS OF " + longDate(toDate(asOf)).toUpperCase(),
      stamp: "Last updated " + longDate(toDate(asOf)) + " · " + D.meta.version,
      monthYear: toDate(asOf).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }),
      motto: D.meta.motto, site: D.meta.site
    };

    /* ================= 1. THE FIVE KPIs ================= */
    const baseline = countOn(D.launch.baselineDate);        // 122 subscribers the day before launch
    const cur = D.current;                                  // the quarter this report is about
    const band = makeBand(D.conversionBands || { green: 30, yellow: 60 });
    const elapsedDays = daysBetween(cur.start, asOf) + 1;   // calendar days from the quarter's first day through the as-of date (Jul 1 -> Sep 25 = 87)

    /* ACTIVE DAYS = calendar days so far minus the days off listed in data.js (current.inactive). Jul 1 -> Sep 25 = 87, minus 5 = 82. */
    const inactiveDays = sum((cur.inactive || []).map(([a, b]) => {
      const from = a < cur.start ? cur.start : a, to = b > asOf ? asOf : b;
      return to >= from ? daysBetween(from, to) + 1 : 0;
    }));
    const curActiveDays = elapsedDays - inactiveDays;

    /* ---- KPI 2: AVERAGE NEW SUBSCRIBERS PER ACTIVE DAY, against last quarter's pace ----
       this quarter = new subs / active days so far          (374 / 82 = 4.56)
       benchmark    = previous closed quarter, same formula  (Q2: 339 / 75 = 4.52)
       variance     = (4.56 / 4.52 - 1) x 100 = +0.9%  -> coloured by the same green/yellow/red rule as the conversion tables */
    const avgPerDay = cur.newSubs / curActiveDays;
    const prevQ = D.closedQuarters[D.closedQuarters.length - 1];
    const prevPace = prevQ.newSubs / prevQ.activeDays;
    const paceBand = band(avgPerDay, prevPace);
    /* First quarter's pace, to show how far the community has come  (Q1: 248 / 66 = 3.76 a day) */
    const firstQ = D.closedQuarters[0];
    const firstPace = firstQ.newSubs / firstQ.activeDays;
    /* For projecting a calendar date (the milestone below) we use the calendar pace, because days off still pass on the calendar. */
    const calendarPace = cur.newSubs / elapsedDays;         // 374 / 87 = 4.30
    const expansionPct = pctOf(N, D.capacity.expansionPoint);

    /* ---- KPI 5: MONTHLY GROWTH (net) = gross growth minus the "unexplained gap" ----
       Step 1  Opening balance = subscribers on the last day of the previous quarter (627 on Jun 30).
       Step 2  "Gross" ending balance = opening + every new subscriber Substack recorded this quarter,
               counted the way Sources counts them: each channel's subscribers added up (network + direct-to-app
               + direct + external). A few people are credited to two channels, so this runs a little high.
       Step 3  "Net" ending balance   = what Substack's Overview shows today (936).
       Step 4  Turn each into a compound MONTHLY rate:   (ending / opening) ^ (1 / months) - 1
               "months" = length of the window in months (days / 30.4375, the average month).
       Step 5  Unexplained gap = gross rate minus net rate. Not called churn (Clerk's Rule): it can't yet be
               separated into real unsubscribes vs double-counting.                                          */
    const startSubs = countOn(cur.startSubsDate);
    const net3 = cur.network;
    const networkSubs = net3.notes + net3.profilePage + net3.recommendations + net3.substackApp + net3.liveStream + net3.trackbacksOnboarding;
    const channelSum = networkSubs + cur.directToApp.subs + cur.direct.subs + cur.external.subs;   // Sources rows added up (381)
    const quarterDays = daysBetween(cur.start, cur.end) + 1;                                          // 92 days in Jul-Sep
    const MONTH = 30.4375;                                                                           // 365.25 / 12
    const months = (D.monthlyGrowthBasis === "elapsed" ? elapsedDays : quarterDays) / MONTH;

    /* ---- NET MONTHLY GROWTH, YEAR TO DATE ----
       Opening = the first subscriber count of 2026 in "series" (Jan 10 = 112; there is no exact Jan 1 count, and we never invent one).
       Compound monthly rate = (today / opening) ^ (1 / months) - 1, months = days between / 30.4375.       (939 / 112)^(1 / 8.48) - 1 = 28.x% */
    const ytdStartDate = D.ytd.startDate;
    const ytdStart = countOn(ytdStartDate);
    const ytdMonths = daysBetween(ytdStartDate, asOf) / MONTH;
    const ytdNet = (Math.pow(N / ytdStart, 1 / ytdMonths) - 1) * 100;
    const netMonthly   = (Math.pow(N / startSubs, 1 / months) - 1) * 100;
    const grossMonthly = (Math.pow((startSubs + channelSum) / startSubs, 1 / months) - 1) * 100;
    const netShown = dp(netMonthly, 1), grossShown = dp(grossMonthly, 1);

    /* ---- KPI 3: GROWTH VS. EXTERNAL BENCHMARK ----
       This quarter's net monthly growth (627 -> today: the stage closest to "about 1K subscribers") divided by the TOP of the
       external range (5% a month).   14.3 / 5 = 2.9x.  Coloured by the variance rule (2.9x is far above 1.0x = green). */
    const XB = D.externalBenchmark;
    const benchRatio = netMonthly / XB.monthlyGrowthHighPct;
    const benchBand = band(benchRatio, 1);
    const gapShown = dp(Number(grossShown) - Number(netShown), 1);    // subtract the ROUNDED numbers so the printed line always adds up
    M.monthly = {
      basis: D.monthlyGrowthBasis, months: dp(months, 3), startSubs, channelSum,
      net: netShown, gross: grossShown, gap: gapShown,
      // the same figures under the other convention, for the reconciliation note
      altBasis: D.monthlyGrowthBasis === "elapsed" ? "quarter" : "elapsed",
      altNet: dp((Math.pow(N / startSubs, MONTH / (D.monthlyGrowthBasis === "elapsed" ? quarterDays : elapsedDays)) - 1) * 100, 1)
    };

    M.kpi = {
      total: comma(N),
      upSinceLaunchPct: Math.round(((N - baseline) / baseline) * 100),   // (939 - 122) / 122 = 670%
      avgPerDay: dp(avgPerDay, 2), activeDays: curActiveDays, paceCls: paceBand.num,
      firstKey: firstQ.key, firstPace: dp(firstPace, 2), paceVsFirst: signedPct((avgPerDay / firstPace - 1) * 100, 0),   // 4.52 / 3.76 = +20%
      gainedSinceLaunch: comma(Math.floor((N - baseline) / 100) * 100),   // (953 - 122) = 831, rounded DOWN to the hundred -> "800"
      monthsSinceLaunch: Math.floor(daysBetween(D.launch.date, asOf) / MONTH), launchBaseline: comma(baseline),
      prevKey: prevQ.key, prevPace: dp(prevPace, 2), paceVar: signedPct(paceBand.variance, 1),
      benchRatio: dp(benchRatio, 1), benchCls: benchBand.num,
      benchLow: XB.monthlyGrowthLowPct, benchHigh: XB.monthlyGrowthHighPct, q3Net: netShown,
      expansionPct: Math.round(expansionPct),                             // 939 / 2500 = 38%
      expansionOf: comma(D.capacity.expansionPoint),
      ytdNet: dp(ytdNet, 1), ytdFrom: longDate(toDate(ytdStartDate)).replace(", 2026", ""), ytdOpening: ytdStart,
      monthlyNet: netShown, monthlyGross: grossShown, monthlyGap: gapShown
    };
    M.chanBench = null;   // filled in section 5
    M.bands = { green: (D.conversionBands || { green: 30 }).green, yellow: (D.conversionBands || { yellow: 60 }).yellow };

    /* ================= 2. TRAJECTORY (chart inputs) ================= */
    /* Chart height: round the biggest count up to a tidy step so the line never runs off the top.
       Step is 250 up to 2,000 subscribers, then 500, then 1,000.  (931 -> 1,000; 1,320 -> 1,500.) */
    const peak = Math.max(...series.map(r => r[1]));
    const yStep = peak <= 2000 ? 250 : peak <= 5000 ? 500 : 1000;
    const yMax = Math.max(1000, Math.ceil(peak / yStep) * yStep);
    const yTicks = []; for (let v = 0; v <= yMax; v += yStep) yTicks.push(v);
    M.trajectory = { series, launchDate: D.launch.date, baselineDate: D.launch.baselineDate, baseline, latestDate: latest[0], latest: N, yMax, yTicks, xLabels: D.chartXLabels };

    /* ================= 3. SINCE-LAUNCH CHANNEL TABLE ================= */
    const rows = D.sinceLaunch.rows;
    const total = sum(rows.map(r => r.subs));               // 961 gross new subscribers since launch
    const restackSubs = sum(rows.filter(r => r.restack).map(r => r.subs));   // Notes + profile page
    M.sinceLaunch = {
      total: comma(total),
      restackSubs: comma(restackSubs),
      restackSharePct: Math.round(pctOf(restackSubs, total)),               // 718 / 961 = 75%
      rows: rows.map((r, i) => ({
        name: r.name, views: nice(r.views), users: nice(r.users), subs: comma(r.subs),
        share: dp(pctOf(r.subs, total), 1) + "%", best: i === 0
      }))
    };

    /* ================= 4. QUARTER CARDS ================= */
    /* Colour of each quarter's numbers: that quarter's pace (subscribers per active day) is compared with the pace
       across ALL quarters together, using the same green/yellow/red rule as everywhere else on the page. */
    const allSubs = sum(D.closedQuarters.map(q => q.newSubs)) + cur.newSubs;
    const allDays = sum(D.closedQuarters.map(q => q.activeDays)) + curActiveDays;
    const overallPace = allSubs / allDays;
    const quarterCls = (subs, days) => band(subs / days, overallPace).num;      // "good" | "amber" | "bad"
    const closed = D.closedQuarters.map(q => ({ key: q.key, season: q.season, open: false, newSubs: comma(q.newSubs), pace: dp(q.newSubs / q.activeDays, 2), cls: quarterCls(q.newSubs, q.activeDays) }));
    M.quarters = closed.concat([{ key: cur.key, season: cur.season, open: true, newSubs: comma(cur.newSubs), pace: dp(cur.newSubs / curActiveDays, 2), cls: quarterCls(cur.newSubs, curActiveDays) }]);
    const quarterSum = sum(D.closedQuarters.map(q => q.newSubs)) + cur.newSubs;
    if (Math.abs(quarterSum - total) / total <= 0.01) ok("quarter sums (" + quarterSum + ") ≈ channel-table total (" + total + ")");
    else warn("quarter sums (" + quarterSum + ") differ from channel-table total (" + total + ") by more than 1%");

    /* ================= 5. CURRENT-QUARTER CONVERSION TABLE ================= */
    const curN = cur.newSubs;
    const netConv = pctOf(networkSubs, net3.visitors);                       // 311 / 1714 = 18.1%
    const share = s => shareLabel(pctOf(s, curN));                              // share of the quarter's new subscribers
    const sub = (name, subs, note) => ({ name, subs: comma(subs), share: share(subs), note: note || "" });
    const recsLow = cur.network.recommendations / D.recommenders;              // 28 / 50 = 0.56
    const offVisitors = cur.direct.visitors + cur.external.visitors;            // direct + external = 709
    const offSubs = cur.direct.subs + cur.external.subs;
    const offConv = pctOf(offSubs, offVisitors);                              // 1 / 709 = 0.14%
    /* Benchmark for the channel table = the table's OVERALL rate: all rows' subscribers / all rows' visitors.  (311+69+0+1) / (1714+1180+571+138) */
    const chanSubs = networkSubs + cur.directToApp.subs + cur.direct.subs + cur.external.subs;
    const chanVisitors = net3.visitors + cur.directToApp.visitors + cur.direct.visitors + cur.external.visitors;
    const chanBench = pctOf(chanSubs, chanVisitors);
    M.chanBench = dp(chanBench, 1) + "%";
    const chanBand = (subs, visitors) => band(pctOf(subs, visitors), chanBench);
    M.current = {
      key: cur.key,
      newSubs: comma(curN),
      network: { visitors: comma(net3.visitors), subs: comma(networkSubs), conv: dp(netConv, 1), convRound: Math.round(netConv), share: share(networkSubs), convClass: chanBand(networkSubs, net3.visitors).rate, numCls: chanBand(networkSubs, net3.visitors).num },
      subRows: [
        sub("Notes", net3.notes),
        sub("Profile page", net3.profilePage),
        sub("Recommendations", net3.recommendations, D.recommenders + " publications · " + dp(recsLow, 2) + "–" + dp(D.recsPerPublicationHigh, 2) + " subscribers each"),
        sub("Substack app", net3.substackApp),
        sub("Substack live stream", net3.liveStream),
        sub("Trackbacks & onboarding", net3.trackbacksOnboarding)
      ],
      directToApp: { visitors: comma(cur.directToApp.visitors), subs: comma(cur.directToApp.subs), conv: dp(pctOf(cur.directToApp.subs, cur.directToApp.visitors), 1), share: share(cur.directToApp.subs), cls: chanBand(cur.directToApp.subs, cur.directToApp.visitors).rate },
      direct:      { visitors: comma(cur.direct.visitors),      subs: comma(cur.direct.subs),      conv: dp(pctOf(cur.direct.subs, cur.direct.visitors), 1),           share: share(cur.direct.subs),      cls: chanBand(cur.direct.subs, cur.direct.visitors).rate },
      external:    { visitors: comma(cur.external.visitors),    subs: comma(cur.external.subs),    conv: dp(pctOf(cur.external.subs, cur.external.visitors), 1),        share: share(cur.external.subs),    cls: chanBand(cur.external.subs, cur.external.visitors).rate },
      readingRestack: { subs: comma(net3.notes + net3.profilePage), sharePct: Math.round(pctOf(net3.notes + net3.profilePage, curN)) },   // (181 + 73) / 374 = 68%
      offPlatform: { numCls: chanBand(offSubs, offVisitors).num, subsPhrase: offSubs + (offSubs === 1 ? " subscriber" : " subscribers"), visitors: offVisitors, visitorsRounded: comma(Math.round(offVisitors / 100) * 100), subs: offSubs, conv: dp(offConv, 2), convRound: dp(offConv, 1) }
    };
    if (net3.subsFromSources !== undefined) {
      if (net3.subsFromSources === networkSubs) ok(cur.key + " network split adds up to Substack's network total (" + networkSubs + ")");
      else warn(cur.key + " network split adds to " + networkSubs + " but Substack's network total is " + net3.subsFromSources);
    }
    if (curN > channelSum) warn("cur.newSubs (" + curN + ") is larger than the sum of channel rows (" + channelSum + ")");

    /* ================= 6. NOTES TABLE ================= */
    /* Benchmark for the notes table = all notes together: total new subs / total impressions. */
    /* If no Notes have been entered yet for this quarter, the table shows a "pending" line instead (no invented numbers). */
    M.notesPending = D.notes.length === 0;
    if (M.notesPending) warn("data.js 'notes' is empty: the Notes table shows a pending line");
    /* A Note written by ANOTHER account has impressions: null (its stats page is private to its author).
       It is shown with n/a for impressions, engagement and conversion, and left out of the table's overall rate. */
    const known = D.notes.filter(n => n.impressions !== null && n.impressions !== undefined);
    const notesBench = known.length === 0 ? 0 : pctOf(sum(known.map(n => n.subs)), sum(known.map(n => n.impressions)));
    M.notesBench = known.length === 0 ? "n/a" : dp(notesBench, 2) + "%";
    M.notes = [...D.notes].sort((a, b) => b.restacks - a.restacks).map((n, i) => {
      const noImp = n.impressions === null || n.impressions === undefined;
      const eng = noImp ? null : pctOf(n.likes + n.replies + n.restacks, n.impressions);    // engagement = (likes + replies + restacks) / impressions
      const conv = noImp ? null : pctOf(n.subs, n.impressions);                             // conversion = new subs / impressions
      return {
        name: n.name, restacks: n.restacks, likes: n.likes, impressions: noImp ? "n/a" : comma(n.impressions),
        eng: noImp ? "n/a" : dp(eng, 1) + "%", subs: n.subs,
        conv: noImp ? "n/a" : conv === 0 ? "0%" : dp(conv, 2) + "%",
        cls: noImp ? "" : band(conv, notesBench).rate,   // percent-variance rule vs. the notes table's overall rate (no colour when unknown)
        best: i === 0
      };
    });

    /* ================= 7. IMPACT ON MISSION ================= */
    const lifts = D.featureLift.writers.filter(w => w.counted && w.baseline > 0).map(w => (w.gain / w.baseline) * 100);   // gain / baseline
    M.impact = {
      liftMax: "+" + dp(Math.max(...lifts), 1) + "%",      // best single lift
      liftMedian: "+" + dp(median(lifts), 1) + "%",        // middle lift across counted writers
      liftAvg: "+" + dp(sum(lifts) / lifts.length, 2) + "%",   // average lift across counted writers: add every lift, divide by how many (47.33 / 8 = 5.92)
      writersCounted: lifts.length,
      /* Stackhunter growth boost (self-reported): week-1 gain / starting count.  (307 - 292) / 292 = 15 / 292 = 5.1% */
      shBaseline: comma(D.stackhunterBoost.baseline), shAfter: comma(D.stackhunterBoost.afterWeek1),
      shGain: D.stackhunterBoost.afterWeek1 - D.stackhunterBoost.baseline,
      shPct: "+" + dp((D.stackhunterBoost.afterWeek1 - D.stackhunterBoost.baseline) / D.stackhunterBoost.baseline * 100, 1) + "%",
      sh3Gain: D.stackhunterBoost.subsNow - D.stackhunterBoost.baseline,                                  // 352 - 292 = 60
      sh3Pct: "+" + dp((D.stackhunterBoost.subsNow - D.stackhunterBoost.baseline) / D.stackhunterBoost.baseline * 100, 1) + "%",   // 60 / 292 = 20.5%
      shCtl: "+" + dp((D.stackhunterBoost.control.end - D.stackhunterBoost.control.start) / D.stackhunterBoost.control.start * 100, 1) + "%",   // comparison writer, same-length week: 7 / 345 = 2.0%
      shCtlCls: "good",   // green: the comparable writer's +2.0% is still real growth
      control: D.featureLift.controlMultiple, reach: D.featureLift.reach, stackhunters: D.featureLift.stackhunters,
       ampEssays: D.amplification.essays, ampWriters: D.amplification.writers   // MANUAL, from data.js section 8b
    };

    /* ================= 8. SYSTEM HEALTH & CAPACITY ================= */
    const cap = D.capacity, K = cap.K;
    const r0 = Math.log(cap.benchmarkLeg.toSubs / cap.benchmarkLeg.fromSubs) / cap.benchmarkLeg.days;   // locked benchmark r: ln(610/377)/74 = 0.65%/day
    const benchmark = r0 * (1 - N / K);                                                                   // self-adjusting benchmark: r0 x (1 - N/K). Now used ONLY for the Phase 2 timeline.

    /* ---- SYSTEM HEALTH = STAGE PACE (option C, Oct 2026) ----
       previous stage pace = its new subs / its active days               (Branch: 462 / 101 = 4.57 a day)   LOCKED
       current stage pace  = new subs so far / active days so far         (Canopy: 30 / 3 = 10.0 a day)
       variance            = (current / previous - 1) x 100               (10.0 / 4.57 - 1 = +119%)
       colour              = the same green / yellow / red rule as every table (data.js -> conversionBands)
       FRAGMENT: if the current stage has fewer active days than capacity.fragmentDays (14), it is shown but never alarmed. */
    const prevSt = cap.previousStage, curSt = cap.currentStage;
    const stageInactive = sum((curSt.inactive || []).map(([a, b]) => {
      const from = a < curSt.start ? curSt.start : a, to = b > asOf ? asOf : b;
      return to >= from ? daysBetween(from, to) + 1 : 0;
    }));
    const stageDays = daysBetween(curSt.start, asOf) + 1 - stageInactive;     // Oct 6 -> Oct 8 = 3 active days
    const prevStagePace = prevSt.newSubs / prevSt.activeDays;
    const stagePace = curSt.newSubs / stageDays;
    const stageBand = band(stagePace, prevStagePace);
    const fragment = stageDays < cap.fragmentDays;
    const verdict = fragment ? "fragment" : stageBand.level;                   // "fragment" | "green" | "yellow" | "red"
    M.health = {
      stage: curSt.name, prevStage: prevSt.name, days: stageDays, minDays: cap.fragmentDays,
      pace: dp(stagePace, 1), prevPace: dp(prevStagePace, 2), variance: signedPct(stageBand.variance, 0), verdict,
      label: { fragment: "Forming", green: "Healthy", yellow: "Below range", red: "Needs attention" }[verdict],
      cls: stageBand.num,                                                        // indicator colour always follows the numbers (brand rule: never grey)
      copyKey: { fragment: "healthBodyFragment", green: "healthBodyHealthy", yellow: "healthBodyBelow", red: "healthBodyFar" }[verdict]
    };
    /* Self-check: the locked stage's own numbers should be consistent with the Overview counts. */
    const prevSpan = daysBetween(prevSt.start, prevSt.end) + 1;
    ok("previous stage (" + prevSt.name + "): " + prevSt.newSubs + " new subs over " + prevSt.activeDays + " active days of " + prevSpan + " = " + dp(prevStagePace, 2) + "/day (locked)");
    if (curSt.start !== daysAfter(prevSt.end)) warn("currentStage.start should be the day after previousStage.end (" + prevSt.end + ")");
    if (N < curSt.from) warn("subscribers (" + N + ") are below the current stage's starting milestone (" + curSt.from + ")");
    if (N >= curSt.to) warn("subscribers (" + N + ") have passed " + curSt.to + ": close this stage (move it to previousStage) and open the next.");

    /* Growth rate measured across the last COMPLETED stage (Branch: ln(989 / 611) / 106 = 0.45%/day). Used for the slow end of the Phase 2 timeline. */
    const rPrevStage = Math.log(prevSt.endSubs / prevSt.startSubs) / prevSpan;

    /* Next Fibonacci milestone: how many days at this quarter's pace so far, vs the target date (if one is set) */
    const ms = cap.nextMilestone;
    let earlyLabel, msCls, targetLabel = "", targetPhrase = "";
    if (ms.targetDate === "nature" && N < ms.subs) {
      /* NATURE'S DATE (the growth dashboard's instrument). On the S-curve N(t) = K / (1 + e^(-r t)), time can be read off a count:
           t(n) = ln( n / (K - n) ) / r
         so the days from today's count N to the milestone n are  t(n) - t(N).
           (ln(1597 / 8403) - ln(1033 / 8967)) / 0.0065 = 77 days  ->  Oct 9 + 77 = Dec 25
         Pace arrival = days to cover the gap at this quarter's pace per ACTIVE day (the dashboard's "recent velocity"):
           (1597 - 1033) / 9.0 = 63 days  ->  Dec 11
         Status = pace arrival minus nature's date, in days (negative = early), banded exactly like the dashboard. */
      const tOf = n => Math.log(n / (K - n)) / r0;
      const natureDays = Math.round(tOf(ms.subs) - tOf(N));
      const target = addDays(asOf, natureDays);
      const activePace = cur.newSubs / curActiveDays;
      const paceDays = Math.round((ms.subs - N) / activePace);
      const arrival = addDays(asOf, paceDays);
      const diff = paceDays - natureDays;                                       // -14 = two weeks early
      const tol = ms.trackDays || 7;
      const status = diff < -2 * tol ? ["Far ahead", "good"] : diff < -tol ? ["Slightly ahead", "good"]
                   : diff <= tol ? ["On track", "good"] : diff <= 3 * tol ? ["Slightly behind", "amber"] : ["Behind", "bad"];
      earlyLabel = status[0]; msCls = status[1];
      targetLabel = shortDate(target);
      targetPhrase = " against " + ((/^[AEIOU]/i.test(targetLabel) ? "an " : "a ") + targetLabel) + " target (on track: " +
        shortDate(addDays(asOf, natureDays - tol)) + " – " + shortDate(addDays(asOf, natureDays + tol)) + ")";
      M.milestone = { subs: comma(ms.subs), earlyLabel, projectedLabel: shortDate(arrival), targetLabel, targetPhrase,
                      list: cap.milestones.map(comma).join(", "), cls: msCls, diff };
      ok("milestone " + ms.subs + ": nature's date " + targetLabel + " (" + natureDays + " days), pace arrival " + shortDate(arrival) + " (" + paceDays + " days), " + diff + " days → " + earlyLabel);
    }
    const daysToGo = Math.round((ms.subs - N) / calendarPace);                     // (1597 - 1033) / 9.0 = 63 days
    const projected = addDays(asOf, daysToGo);
    if (ms.targetDate === "nature" && N < ms.subs) { /* already worked out above */ }
    else if (N >= ms.subs) { earlyLabel = "Reached"; msCls = "good"; }
    else if (!ms.targetDate) {
      earlyLabel = "~" + shortDate(projected); msCls = calendarPace > 0 ? "good" : "bad";   // no target yet: show the projected date
      warn("capacity.nextMilestone.targetDate is not set: the milestone card shows the projected date only");
    } else {
      const early = daysBetween(projected.toISOString().slice(0, 10), ms.targetDate);   // days ahead of target (positive = early)
      const weeks = Math.round(Math.abs(early) / 7);
      earlyLabel = early === 0 ? "On target"
        : early > 0 ? (Math.abs(early) >= 10 ? "~" + weeks + " weeks early" : early + " days early")
        : (Math.abs(early) >= 10 ? "~" + weeks + " weeks late" : Math.abs(early) + " days late");
      msCls = early >= 0 ? "good" : "amber";
      targetLabel = shortDate(toDate(ms.targetDate));
      targetPhrase = " against " + ((/^[AEIOU]/i.test(targetLabel) ? "an " : "a ") + targetLabel) + " target";
    }
    if (!(ms.targetDate === "nature" && N < ms.subs)) M.milestone = {
      subs: comma(ms.subs), earlyLabel, projectedLabel: shortDate(projected), targetLabel, targetPhrase,
      list: cap.milestones.map(comma).join(", "), cls: msCls
    };
    if (N >= ms.subs) warn("You have passed the milestone (" + ms.subs + "). Set capacity.nextMilestone to the next Fibonacci number.");

    /* Time to the expansion point (2,500): fast case = benchmark rate, slow case = rate measured across the last completed stage.
       days = ln(2500 / N) / daily rate;  months = days / 30.4375;  both ends rounded down.
       ln(2500 / 1024) / 0.584% = 153 days = 5.0 months;  / 0.454% = 197 days = 6.5 months  ->  "5–6 months" */
    const toGo = Math.log(cap.expansionPoint / N);
    const fastMonths = toGo / benchmark / MONTH, slowMonths = toGo / rPrevStage / MONTH;
    const lo = Math.floor(Math.min(fastMonths, slowMonths)), hi = Math.floor(Math.max(fastMonths, slowMonths));
    M.capacity = {
      expansionPct: Math.round(expansionPct), subs: comma(N), expansionOf: comma(cap.expansionPoint),
      monthsRange: lo === hi ? lo + " months" : lo + "–" + hi + " months",
      K, r0, N, tNow: Math.log(N / (K - N)) / r0
    };

    /* ================= 9. misc ================= */
    M.recommenders = String(D.recommenders);
    M.checks = checks;
    return M;
  }

  window.computeModel = computeModel;
  window.BoardFormat = { comma };
})();
