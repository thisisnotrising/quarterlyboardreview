# NOT RISING — Quarterly Board Review

A public quarterly report of NOT RISING Magazine's impact on its mission to amplify independent voices drowned out by the algorithm. Board Reports are open-source because this publication answers to humans, not capital.

The site is plain HTML, CSS and JavaScript. No build step, no installs. Double-click `index.html` and it works.

## How the site is laid out

```
index.html        archive homepage (the front door; you never edit it)
reports.js        THE LIST of reports (+ the About sentence). Add one entry here per new quarter.
archive.css       styling for the archive homepage
images/           homepage images: the Human Curators banner and the About photo
reports/
  2026-q3/        one complete, frozen report
    q32026boardreport.html    the report page (named q + quarter + year + boardreport)
    data.js       every number and sentence for this report  <- the only file you edit
    calc.js       formulas
    render.js     draws the page and charts
    style.css     look and feel (white page, black/gray text; colours are listed once at the top)
    fonts/        the three typefaces (Barlow Condensed, Barlow, Space Mono), so the page never depends on Google
    images/       this report's banner
  2026-q4/        (added later: a copy of the folder above)
```

**Every report is self-contained.** Each folder has its own copy of the code, data and images, so an old report never changes when you build a new one, and each one opens on its own.

Inside a report the flow is always: `data.js` (numbers) → `calc.js` (formulas) → `render.js` (draws) → the report page, e.g. `q32026boardreport.html`.

## Look and feel

- **Landing page** (`index.html` + `archive.css`): black background, white text.
- **Quarterly reports** (`reports/*/style.css`): white background, near-black text, gray for small labels. Change any colour in the `:root { ... }` list at the top of `style.css`; the charts read their colours from that same list.
- **Green / amber / red are indicators only** (conversion rates, System Health, milestone status). Never links, headings or commentary. Links are black, bold, underlined.
- Headings use Barlow Condensed at weight 700 (not heavier) and only font weights that exist in `fonts/`, which keeps big numbers sharp instead of blurry.

## Starting a new quarter (e.g. 2026 Q4)

1. **Copy the folder.** Copy `reports/2026-q3` and name the copy `reports/2026-q4` (folder names: year, dash, lowercase quarter). Inside the copy, rename the report page from `q32026boardreport.html` to `q42026boardreport.html` (q + quarter number + year + `boardreport.html`), so every report link reads the same way.
2. **Edit `reports/2026-q4/data.js`:**
   - `meta`: change `quarterLabel` to `"Q4 2026"`, set `asOf` to today, bump `version`.
   - `closedQuarters`: add the quarter that just ended (key, season, new subscribers, active days) using its final numbers from the Q3 report.
   - `current`: describe the new quarter (`key: "Q4"`, `season`, `start`, `end`, `startSubsDate`, `inactive` days off, and this quarter's Sources numbers).
   - `series`: add new dated subscriber totals; the last date must equal `meta.asOf`. Make sure `startSubsDate` (the day before the quarter starts) has an entry.
   - `sinceLaunch`, `notes`, `recommenders`, `capacity.nextMilestone`, and the sentences in `copy` and `quotes`: refresh as needed.
3. **Add one entry to `reports.js`** (copy the existing block; change `id`, `file`, `label`, `season`, `asOf`, `subscribers`, `status`). The archive sorts newest-first by itself.
4. **Check it.** Open `reports/2026-q4/q42026boardreport.html?debug=1`. Every line should start with ✓. A ⚠ means something doesn't add up; fix it before sharing.
5. **Close out the old one.** In `reports.js`, change the finished quarter's `status` from `"In progress"` to `"Final"`. Leave its folder alone.
6. **Section numbers and "In this report".** The five numbered sections and the contents list are written directly in the report page (`q42026boardreport.html`), so a copied report keeps them automatically.
7. Commit to GitHub. The site updates in a minute or two.

The trajectory chart's height grows automatically once you pass 1,000 subscribers.

## Where each number comes from (Substack screens)

| `data.js` field | Substack screen |
|---|---|
| `series` (add lines) | Home → "Total subscribers" chart. Total counts on given dates only. |
| `sinceLaunch.rows[].subs` | Analytics → Sources → custom range (launch date → today) → New subscribers. |
| `sinceLaunch.rows[].views / users` | Stats → Traffic, same date range. |
| `current.newSubs` | Analytics → Sources → custom range (quarter start → today) → New subscribers: the total. |
| `current.network.*` | Same screen. "Other" = profile page + Substack app; split it using the Traffic tab's "substack app" row. |
| `current.network.visitors`, `directToApp.visitors`, `direct.visitors`, `external.visitors` | Analytics → Sources → same range → Unique visitors tab. |
| `recommenders` | Audience → Recommendations → "Substacks recommending you". |
| `notes[]` | Each Note's own stats page (restacks, likes, replies, impressions); new subs from Sources → Notes (expand the row). |
| `featureLift.writers[]` | Your Feature Lift Tracker (not Substack). |

## How the derived numbers are defined

- **Average new subscribers / day** = this quarter's new subscribers (`current.newSubs`, Jul 1 to the as-of date) ÷ calendar days in that window (Jul 1 → Sep 25 = 87). It is *not* Substack's rolling 90-day view.
- **Growth vs pre-launch** = that daily average ÷ the pre-launch daily average (23 new in 43 days).
- **Progress to expansion point** = total subscribers ÷ 2,500.
- **Monthly growth** = *gross* monthly growth minus the *unexplained gap*.
  - Gross = the quarter's opening balance plus every new subscriber Sources recorded (channel rows added up), grown at a compound monthly rate.
  - Net = the opening balance grown to today's Overview total, at the same compound monthly rate.
  - Gap = gross minus net. It is **not** called churn: it can't yet be separated into unsubscribes vs double-counting.
  - `monthlyGrowthBasis` in `data.js` chooses whether "months" means the whole quarter or only the days elapsed so far.
- **Fertility (System Health)** = measured daily compound rate since the Branch stage began (Jun 20) ÷ the self-adjusting benchmark `0.65% × (1 − subscribers/10,000)`. Healthy while inside ±0.30 of 1.00.
- **Next milestone** = days to reach it at the quarter-to-date pace, compared with the target date.
- **Time before Phase 2** = months to reach 2,500 at the benchmark pace (fast end) and at the measured pace (slow end), each rounded down.
- **Note engagement** = (likes + replies + restacks) ÷ impressions. **Note conversion** = new subscribers ÷ impressions.

## Putting it online (GitHub Pages)

1. Open the unzipped folder, select everything **inside** it (`index.html`, `reports.js`, `archive.css`, `README.md`, `images`, `reports`), and drag those items onto GitHub's upload page. Do not drag the outer folder itself.
2. Repository → **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main`, folder `/ (root)` → Save.**
3. After a minute or two the site is live at `https://thisisnotrising.github.io/quarterlyboardreview/`. A report lives at `.../reports/2026-q3/`.
4. To refresh later: open a report's `data.js` on GitHub, click the pencil (Edit), change the numbers, click **Commit changes**.

## Rules this page follows

- Growth Sources is the official record for attribution; the Overview chart supplies total counts only.
- Percentages are always calculated here, never copied from Substack.
- Nothing unverifiable goes on the page. If a number can't be verified, leave it out and say so.
- The unexplained gap is too consistent to behave like churn. Monitoring until we know more.
