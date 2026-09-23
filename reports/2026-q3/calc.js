/* ==========================================================================
   calc.js  —  turns the raw numbers in data.js into everything the page displays.
   --------------------------------------------------------------------------
   You normally never edit this file. It exists so that every percentage, rate and
   verdict on the page is a written-down formula you can read, check by hand, and
   reproduce in a spreadsheet.

   The pattern is always:   raw numbers  ->  one small formula  ->  display text.
   Every formula has a comment saying (a) what it means and (b) how to do it by hand.

   The function computeModel(D) returns "M": a big tidy object of ready-to-show text,
   e.g.  M.kpi.total = "931".   render.js pours M into the page.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- tiny helpers (each one is a single line of arithmetic) ---------- */
  const DAY = 86400000;                                   // milliseconds in one day
  const toDate = iso => new Date(iso + "T00:00:00Z");     // "2026-09-23" -> a Date (in UTC, so time zones can't shift it)
  const daysBetween = (a, b) => Math.round((toDate(b) - toDate(a)) / DAY);   // b minus a, in days
  const addDays = (iso, n) => new Date(toDate(iso).getTime() + n * DAY);
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

  /* Conversion colour: >= 10% green ("hi"), >= 1% plain, below that grey ("lo"). */
  const convClass = c => (c >= 10 ? "rate hi" : c >= 1 ? "rate" : "rate lo");

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
    const pre = D.launch.preLaunch;                         // 23 new subs in 43 days before launch
    const avgPerDay = D.recent90.newSubs / D.recent90.days; // KPI 2: new subs in last 90 days / 90   (388 / 90 = 4.31)
    const preRate = pre.newSubs / pre.days;                 // 23 / 43 = 0.535 per day before launch
    const expansionPct = pctOf(N, D.capacity.expansionPoint);

    /* ---- KPI 5: MONTHLY GROWTH (net) = gross growth minus the "unexplained gap" ----
       Step 1  Opening balance = subscribers on the last day of the previous quarter (627 on Jun 30).
       Step 2  "Gross" ending balance = opening + every new subscriber Substack recorded this quarter,
               counted the way Sources counts them: each channel's subscribers added up (network + direct-to-app
               + direct + external). A few people are credited to two channels, so this runs a little high.
       Step 3  "Net" ending balance   = what Substack's Overview shows today (931).
       Step 4  Turn each into a compound MONTHLY rate:   (ending / opening) ^ (1 / months) - 1
               "months" = length of the window in months (days / 30.4375, the average month).
       Step 5  Unexplained gap = gross rate minus net rate. Not called churn (Clerk's Rule): it can't yet be
               separated into real unsubscribes vs double-counting.                                          */
    const cur = D.current;      // the quarter this report is about
    const startSubs = countOn(cur.startSubsDate);
    const net3 = cur.network;
    const networkSubs = net3.notes + net3.profilePage + net3.recommendations + net3.substackApp + net3.liveStream + net3.trackbacksOnboarding;
    const channelSum = networkSubs + cur.directToApp.subs + cur.direct.subs + cur.external.subs;   // Sources rows added up (372)
    const quarterDays = daysBetween(cur.start, cur.end) + 1;                                          // 92 days in Jul-Sep
    const elapsedDays = daysBetween(cur.start, asOf) + 1;                                            // days from Jul 1 through today
    const MONTH = 30.4375;                                                                           // 365.25 / 12
    const months = (D.monthlyGrowthBasis === "elapsed" ? elapsedDays : quarterDays) / MONTH;
    const netMonthly   = (Math.pow(N / startSubs, 1 / months) - 1) * 100;
    const grossMonthly = (Math.pow((startSubs + channelSum) / startSubs, 1 / months) - 1) * 100;
    const netShown = dp(netMonthly, 1), grossShown = dp(grossMonthly, 1);
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
      upSinceLaunchPct: Math.round(((N - baseline) / baseline) * 100),   // (931 - 122) / 122 = 663%
      avgPerDay: dp(avgPerDay, 2),
      preLaunchPerDay: dp(D.launch.preLaunch.perDayLocked || preRate, 2),
      growthVsPre: dp(avgPerDay / preRate, 1),                            // 4.31 / 0.535 = 8.1x
      expansionPct: Math.round(expansionPct),                             // 931 / 2500 = 37%
      expansionOf: comma(D.capacity.expansionPoint),
      monthlyNet: netShown, monthlyGross: grossShown, monthlyGap: gapShown
    };

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
    const total = sum(rows.map(r => r.subs));               // 951 gross new subscribers since launch
    const restackSubs = sum(rows.filter(r => r.restack).map(r => r.subs));   // Notes + profile page
    M.sinceLaunch = {
      total: comma(total),
      restackSubs: comma(restackSubs),
      restackSharePct: Math.round(pctOf(restackSubs, total)),               // 710 / 951 = 75%
      rows: rows.map((r, i) => ({
        name: r.name, views: nice(r.views), users: nice(r.users), subs: comma(r.subs),
        share: dp(pctOf(r.subs, total), 1) + "%", best: i === 0
      }))
    };

    /* ================= 4. QUARTER CARDS ================= */
    const inactiveDays = sum((cur.inactive || []).map(([a, b]) => {
      const from = a < cur.start ? cur.start : a, to = b > asOf ? asOf : b;
      return to >= from ? daysBetween(from, to) + 1 : 0;
    }));
    const curActiveDays = elapsedDays - inactiveDays;
    const closed = D.closedQuarters.map(q => ({ key: q.key, season: q.season, open: false, newSubs: comma(q.newSubs), pace: dp(q.newSubs / q.activeDays, 2) }));
    M.quarters = closed.concat([{ key: cur.key, season: cur.season, open: true, newSubs: comma(cur.newSubs), pace: dp(cur.newSubs / curActiveDays, 2) }]);
    const quarterSum = sum(D.closedQuarters.map(q => q.newSubs)) + cur.newSubs;
    if (Math.abs(quarterSum - total) / total <= 0.01) ok("quarter sums (" + quarterSum + ") ≈ channel-table total (" + total + ")");
    else warn("quarter sums (" + quarterSum + ") differ from channel-table total (" + total + ") by more than 1%");

    /* ================= 5. CURRENT-QUARTER CONVERSION TABLE ================= */
    const curN = cur.newSubs;
    const netConv = pctOf(networkSubs, net3.visitors);                       // 304 / 1681 = 18.1%
    const share = s => shareLabel(pctOf(s, curN));                              // share of the quarter's new subscribers
    const sub = (name, subs, note) => ({ name, subs: comma(subs), share: share(subs), note: note || "" });
    const recsLow = cur.network.recommendations / D.recommenders;              // 28 / 50 = 0.56
    const offVisitors = cur.direct.visitors + cur.external.visitors;            // direct + external = 704
    const offSubs = cur.direct.subs + cur.external.subs;
    const offConv = pctOf(offSubs, offVisitors);                              // 1 / 704 = 0.14%
    M.current = {
      key: cur.key,
      newSubs: comma(curN),
      network: { visitors: comma(net3.visitors), subs: comma(networkSubs), conv: dp(netConv, 1), convRound: Math.round(netConv), share: share(networkSubs), convClass: convClass(netConv) },
      subRows: [
        sub("Notes", net3.notes),
        sub("Profile page", net3.profilePage),
        sub("Recommendations", net3.recommendations, D.recommenders + " publications · " + dp(recsLow, 2) + "–" + dp(D.recsPerPublicationHigh, 2) + " subscribers each"),
        sub("Substack app", net3.substackApp),
        sub("Substack live stream", net3.liveStream),
        sub("Trackbacks & onboarding", net3.trackbacksOnboarding)
      ],
      directToApp: { visitors: comma(cur.directToApp.visitors), subs: comma(cur.directToApp.subs), conv: dp(pctOf(cur.directToApp.subs, cur.directToApp.visitors), 1), share: share(cur.directToApp.subs), cls: convClass(pctOf(cur.directToApp.subs, cur.directToApp.visitors)) },
      direct:      { visitors: comma(cur.direct.visitors),      subs: comma(cur.direct.subs),      conv: dp(pctOf(cur.direct.subs, cur.direct.visitors), 1),           share: share(cur.direct.subs),      cls: convClass(pctOf(cur.direct.subs, cur.direct.visitors)) },
      external:    { visitors: comma(cur.external.visitors),    subs: comma(cur.external.subs),    conv: dp(pctOf(cur.external.subs, cur.external.visitors), 1),        share: share(cur.external.subs),    cls: convClass(pctOf(cur.external.subs, cur.external.visitors)) },
      readingRestack: { subs: comma(net3.notes + net3.profilePage), sharePct: Math.round(pctOf(net3.notes + net3.profilePage, curN)) },   // (175 + 72) / 365 = 68%
      offPlatform: { subsPhrase: offSubs + (offSubs === 1 ? " subscriber" : " subscribers"), visitors: offVisitors, visitorsRounded: comma(Math.round(offVisitors / 100) * 100), subs: offSubs, conv: dp(offConv, 2), convRound: dp(offConv, 1) }
    };
    if (net3.subsFromSources !== undefined) {
      if (net3.subsFromSources === networkSubs) ok(cur.key + " network split adds up to Substack's network total (" + networkSubs + ")");
      else warn(cur.key + " network split adds to " + networkSubs + " but Substack's network total is " + net3.subsFromSources);
    }
    if (curN > channelSum) warn("cur.newSubs (" + curN + ") is larger than the sum of channel rows (" + channelSum + ")");

    /* ================= 6. NOTES TABLE ================= */
    M.notes = [...D.notes].sort((a, b) => b.restacks - a.restacks).map((n, i) => {
      const eng = pctOf(n.likes + n.replies + n.restacks, n.impressions);    // engagement = (likes + replies + restacks) / impressions
      const conv = pctOf(n.subs, n.impressions);                             // conversion = new subs / impressions
      return {
        name: n.name, restacks: n.restacks, likes: n.likes, impressions: comma(n.impressions),
        eng: dp(eng, 1) + "%", subs: n.subs,
        conv: conv === 0 ? "0%" : dp(conv, 2) + "%",
        cls: conv === 0 ? "rate red" : conv >= 0.65 ? "rate hi" : "rate mid",   // green >= 0.65%, amber above 0, red = none
        best: i === 0
      };
    });

    /* ================= 7. IMPACT ON MISSION ================= */
    const lifts = D.featureLift.writers.filter(w => w.counted && w.baseline > 0).map(w => (w.gain / w.baseline) * 100);   // gain / baseline
    M.impact = {
      liftMax: "+" + dp(Math.max(...lifts), 1) + "%",      // best single lift
      liftMedian: "+" + dp(median(lifts), 1) + "%",        // middle lift across counted writers
      writersCounted: lifts.length,
      control: D.featureLift.controlMultiple, reach: D.featureLift.reach, stackhunters: D.featureLift.stackhunters
    };

    /* ================= 8. SYSTEM HEALTH & CAPACITY ================= */
    const cap = D.capacity, K = cap.K;
    const r0 = Math.log(cap.benchmarkLeg.toSubs / cap.benchmarkLeg.fromSubs) / cap.benchmarkLeg.days;   // locked benchmark r: ln(610/377)/74 = 0.65%/day
    const benchmark = r0 * (1 - N / K);                                                                   // self-adjusting benchmark: r0 x (1 - N/K)
    const branchDays = daysBetween(cap.branchStart.date, asOf);                                           // days since the Branch stage began
    const rActual = Math.log(N / cap.branchStart.subs) / branchDays;                                     // measured daily compound rate since then
    const ratio = rActual / benchmark;                                                                    // fertility ratio: 1.00 = exactly on benchmark
    const verdict = ratio < 1 - cap.band ? "below" : ratio > 1 + cap.band ? "above" : "healthy";
    M.health = {
      rActualPct: dp(rActual * 100, 2), benchmarkPct: dp(benchmark * 100, 2), ratio: dp(ratio, 2), verdict,
      label: { healthy: "Healthy", below: "Below range", above: "Above range" }[verdict],
      cls: verdict === "healthy" ? "good" : "amber",
      copyKey: { healthy: "healthBodyHealthy", below: "healthBodyBelow", above: "healthBodyAbove" }[verdict]
    };

    /* Next Fibonacci milestone: how many days at today's 90-day pace, vs the target date */
    const ms = cap.nextMilestone;
    const daysToGo = Math.round((ms.subs - N) / avgPerDay);                     // (987 - 931) / 4.31 = 13 days
    const projected = addDays(asOf, daysToGo);
    const early = daysBetween(projected.toISOString().slice(0, 10), ms.targetDate);   // days ahead of target (positive = early)
    const weeks = Math.round(Math.abs(early) / 7);
    const earlyLabel = N >= ms.subs ? "Reached"
      : early === 0 ? "On target"
      : early > 0 ? (Math.abs(early) >= 10 ? "~" + weeks + " weeks early" : early + " days early")
      : (Math.abs(early) >= 10 ? "~" + weeks + " weeks late" : Math.abs(early) + " days late");
    const targetLabel = shortDate(toDate(ms.targetDate));
    M.milestone = {
      subs: comma(ms.subs), earlyLabel, projectedLabel: shortDate(projected), targetLabel,
      targetWithArticle: (/^[AEIOU]/i.test(targetLabel) ? "an " : "a ") + targetLabel,
      list: cap.milestones.join(", "), cls: early >= 0 ? "good" : "amber"
    };
    if (N >= ms.subs) warn("You have passed the milestone (" + ms.subs + "). Set capacity.nextMilestone to the next Fibonacci number.");

    /* Time to the expansion point (2,500): fast case = benchmark pace, slow case = actual pace.
       days = ln(2500 / N) / daily rate;  months = days / 30.4375;  both ends rounded down.   */
    const toGo = Math.log(cap.expansionPoint / N);
    const fastMonths = toGo / benchmark / MONTH, slowMonths = toGo / rActual / MONTH;
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
  window.BoardFormat = { convClass, comma };
})();
