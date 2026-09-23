/* ==========================================================================
   render.js  —  pours the calculated numbers (M) and your words (D.copy) into index.html
   and draws the two charts. You normally never edit this file.

   Four jobs, in order:
     1. fill every  data-bind="..."   with a calculated value
     2. fill every  data-copy="..."   with a sentence from data.js (swapping {{tokens}} for numbers)
     3. build the tables from lists of rows
     4. draw the two SVG charts (trajectory, S-curve)
   ========================================================================== */

(function () {
  "use strict";
  const D = window.BOARD_DATA;
  const M = window.computeModel(D);

  /* Look up "kpi.total" inside M  ->  M.kpi.total */
  const get = (obj, path) => path.split(".").reduce((o, k) => (o === undefined || o === null ? undefined : o[k]), obj);

  /* Replace {{some.path}} inside a sentence with its calculated value */
  const fill = text => text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, path) => {
    const v = get(M, path);
    if (v === undefined) { M.checks.push({ level: "warn", msg: "sentence uses {{" + path + "}} but calc.js has no such value" }); return "⚠"; }
    return v;
  });

  document.title = "NOT RISING · " + D.meta.reportTitle + " · " + D.meta.quarterLabel;   // browser tab title

  /* ---------- 1. numbers ---------- */
  document.querySelectorAll("[data-bind]").forEach(el => {
    const v = get(M, el.dataset.bind);
    if (v === undefined) M.checks.push({ level: "warn", msg: "page asks for " + el.dataset.bind + " but calc.js has no such value" });
    el.textContent = v === undefined ? "⚠" : v;
  });

  /* ---------- 2. words ---------- */
  document.querySelectorAll("[data-copy]").forEach(el => {
    let key = el.dataset.copy;
    if (el.id === "health-body") key = M.health.copyKey;
    const text = D.copy[key];
    if (text === undefined) { M.checks.push({ level: "warn", msg: "no D.copy." + key }); el.textContent = "⚠"; return; }
    el.innerHTML = fill(text);
  });
  document.getElementById("health-body").innerHTML = fill(D.copy[M.health.copyKey]);     // health sentence depends on the verdict
  document.getElementById("health-label").className = "stat-block-num " + M.health.cls;
  document.getElementById("milestone-label").className = "stat-block-num " + M.milestone.cls;
  document.querySelectorAll("[data-copy-list]").forEach(el => {                               // a list of sentences -> one <p> each
    el.innerHTML = D.copy[el.dataset.copyList].map(t => "<p>" + fill(t) + "</p>").join("");
  });
  document.querySelector("[data-quotes]").innerHTML = D.quotes.map(q => {
    const cls = { sm: "rave-sm", md: "rave", lg: "rave-lg" }[q.size] || "rave";
    return '<div class="rave-row' + (q.center ? " center" : "") + '"><div class="' + cls + '">"' + q.text + '"</div><div class="rave-attr">— ' + q.who + "</div></div>";
  }).join("");

  /* ---------- 3. tables ---------- */
  const td = (v, extra) => '<td class="num">' + v + "</td>";
  const tables = {
    sinceLaunch: () => M.sinceLaunch.rows.map((r, i) =>
      '<tr' + (r.best ? ' class="best"' : "") + "><td>" + r.name + "</td>" + td(r.views) + td(r.users) + td(r.subs) +
      '<td class="num">' + (r.best ? '<span class="rate hi">' + r.share + "</span>" : r.share) + "</td></tr>").join(""),

    quarters: () => M.quarters.map(q =>
      '<div class="qcell' + (q.open ? " open" : "") + '"><div class="qname">' + q.key + '</div><div class="qseason">' + q.season + (q.open ? " ●" : "") + "</div>" +
      '<div class="qrow">New subscribers<b>' + q.newSubs + '</b></div><div class="qrow">Pace<b>' + q.pace + "/day</b></div></div>").join(""),

    conversion: () => {
      const q = M.current;
      let h = '<tr class="best"><td>Substack network</td>' + td(q.network.visitors) + td(q.network.subs) +
              '<td class="num"><span class="' + q.network.convClass + '">' + q.network.conv + "%</span></td>" + td(q.network.share) + "</tr>";
      q.subRows.forEach(r => {
        h += '<tr class="sub"><td>' + r.name + (r.note ? '<span class="subnote">' + r.note + "</span>" : "") + "</td>" + td("—") + td(r.subs) + td("—") + td(r.share) + "</tr>";
      });
      const line = (label, x) => "<tr><td>" + label + "</td>" + td(x.visitors) + td(x.subs) +
        '<td class="num"><span class="' + x.cls + '">' + (Number(x.conv) === 0 ? "0" : x.conv) + "%</span></td>" + td(x.share) + "</tr>";
      h += line("Direct to app", q.directToApp) + line("Direct", q.direct) + line("External (social, email, own site, search)", q.external);
      return h;
    },

    notes: () => M.notes.map(n =>
      '<tr' + (n.best ? ' class="best"' : "") + "><td>" + n.name + "</td>" + td(n.restacks) + td(n.likes) + td(n.impressions) + td(n.eng) + td(n.subs) +
      '<td class="num"><span class="' + n.cls + '">' + n.conv + "</span></td></tr>").join("")
  };
  document.querySelectorAll("[data-table]").forEach(el => { el.innerHTML = tables[el.dataset.table](); });

  /* ---------- 4a. TRAJECTORY CHART ---------- */
  (function () {
    const T_ = M.trajectory, series = T_.series;
    const W = 880, H = 880, L = 52, Rt = 16, T = 18, B = 34, pw = W - L - Rt, ph = H - T - B;
    const t0 = new Date(series[0][0]).getTime(), t1 = new Date(series[series.length - 1][0]).getTime();
    const yMax = T_.yMax, yMin = 0;              // yMax comes from calc.js and grows with the subscriber count
    const X = ts => L + (ts - t0) / (t1 - t0) * pw;             // date  -> horizontal position
    const Y = v => T + ph - (v - yMin) / (yMax - yMin) * ph;    // count -> vertical position
    let svg = "";
    T_.yTicks.forEach(v => {
      svg += `<line x1="${L}" y1="${Y(v)}" x2="${W - Rt}" y2="${Y(v)}" stroke="#1e1e1e" stroke-width="1"/>`;
      svg += `<text x="${L - 10}" y="${Y(v) + 4}" fill="#666" font-family="Space Mono,monospace" font-size="15" text-anchor="end">${v}</text>`;
    });
    const xLaunch = X(new Date(T_.launchDate).getTime());
    svg += `<rect x="${L}" y="${T}" width="${xLaunch - L}" height="${ph}" fill="rgba(255,255,255,0.03)"/>`;
    svg += `<text x="${L + 8}" y="${T + 14}" fill="#888" font-family="Space Mono,monospace" font-size="14">BEFORE LAUNCH</text>`;
    svg += `<line x1="${xLaunch}" y1="${T}" x2="${xLaunch}" y2="${T + ph}" stroke="#555" stroke-width="1.5" stroke-dasharray="4,3"/>`;
    svg += `<text x="${xLaunch + 6}" y="${T + 14}" fill="#9a9a92" font-family="Space Mono,monospace" font-size="14">ENGINE LAUNCH · JAN 2026</text>`;
    const pts = series.map(([d, v]) => [X(new Date(d).getTime()), Y(v)]);
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
    svg += `<path d="${line} L${pts[pts.length - 1][0]},${T + ph} L${pts[0][0]},${T + ph} Z" fill="rgba(143,168,106,0.13)"/>`;
    svg += `<path d="${line}" fill="none" stroke="#8FA86A" stroke-width="2.5"/>`;
    [[series.findIndex(p => p[0] === T_.baselineDate), String(T_.baseline)], [series.length - 1, String(T_.latest)]].forEach(([i, label]) => {
      const [x, y] = pts[i];
      svg += `<circle cx="${x}" cy="${y}" r="4.5" fill="#8FA86A"/>`;
      svg += `<text x="${x - 8}" y="${y - 10}" fill="#FFF" font-family="Barlow Condensed,sans-serif" font-weight="900" font-size="22" text-anchor="end">${label}</text>`;
    });
    /* month labels along the bottom: the ones listed in data.js, plus the latest date (labelled automatically) */
    T_.xLabels.concat([[T_.latestDate, M.meta.monthYear, "end"]]).forEach(([d, label, anchor]) => {
      const x = X(new Date(d).getTime());
      svg += `<text x="${x}" y="${H - 12}" fill="#666" font-family="Space Mono,monospace" font-size="15" text-anchor="${anchor}">${label}</text>`;
    });
    document.getElementById("traj").innerHTML = svg;
  })();

  /* ---------- 4b. S-CURVE CHART (logistic growth: N(t) = K / (1 + e^(-r t))) ---------- */
  (function () {
    const { K, r0: r, N, tNow, expansionPct } = M.capacity;
    const W = 880, H = 880, L = 64, Rt = 20, T = 22, B = 42, pw = W - L - Rt, ph = H - T - B;
    const Nt = t => K / (1 + Math.exp(-r * t));
    const t0 = -600, t1 = 600;
    const X = t => L + (t - t0) / (t1 - t0) * pw, Y = n => T + ph - n / K * ph;
    const expansion = D.capacity.expansionPoint;
    let g = "";
    [[0, "0"], [expansion, expansion.toLocaleString("en-US")], [K / 2, (K / 2).toLocaleString("en-US")], [K, K.toLocaleString("en-US")]].forEach(([v, lab]) => {
      g += `<line x1="${L}" y1="${Y(v)}" x2="${W - Rt}" y2="${Y(v)}" stroke="#1e1e1e"/>`;
      g += `<text x="${L - 10}" y="${Y(v) + 5}" fill="#666" font-family="Space Mono,monospace" font-size="12" text-anchor="end">${lab}</text>`;
    });
    g += `<line x1="${L}" y1="${Y(expansion)}" x2="${W - Rt}" y2="${Y(expansion)}" stroke="#C79B4A" stroke-width="1.5" stroke-dasharray="5,4"/>`;
    g += `<text x="${W - Rt}" y="${Y(expansion) - 10}" fill="#9a9a92" font-family="Space Mono,monospace" font-size="12" text-anchor="end">EXPAND THE NETWORK HERE</text>`;
    let d = "";
    for (let t = t0; t <= t1; t += 8) d += (d ? "L" : "M") + X(t).toFixed(1) + "," + Y(Nt(t)).toFixed(1);
    g += `<path d="${d}" fill="none" stroke="#8FA86A" stroke-width="3"/>`;
    const xN = X(tNow), yN = Y(N);
    g += `<line x1="${xN}" y1="${T}" x2="${xN}" y2="${T + ph}" stroke="#3a3a3a" stroke-dasharray="3,4"/>`;
    g += `<circle cx="${xN}" cy="${yN}" r="7" fill="#FFF"/>`;
    g += `<text x="${xN + 14}" y="${yN - 6}" fill="#FFF" font-family="Barlow Condensed,sans-serif" font-weight="900" font-size="24">${N} today</text>`;
    g += `<text x="${xN + 14}" y="${yN + 16}" fill="#9a9a92" font-family="Space Mono,monospace" font-size="12">${expansionPct}% of the way to expansion</text>`;
    g += `<text x="${L}" y="${H - 12}" fill="#666" font-family="Space Mono,monospace" font-size="12">TIME →</text>`;
    document.getElementById("scurve").innerHTML = g;
  })();

  /* ---------- 4c. "In this report" links: open the section you click, then scroll to it ---------- */
  function openSection(id) {
    const el = document.getElementById(id);
    if (!el || el.tagName !== "DETAILS") return false;
    el.open = true;
    el.scrollIntoView({ block: "start" });
    return true;
  }
  document.querySelectorAll(".toc a").forEach(a => a.addEventListener("click", e => {
    if (openSection(a.getAttribute("href").slice(1))) { e.preventDefault(); history.replaceState(null, "", a.getAttribute("href")); }
  }));
  if (location.hash) openSection(location.hash.slice(1));      // a link like ...#grp-health opens that section on arrival

  /* ---------- 5. self-checks: shown in the console, and on the page with ?debug=1 ---------- */
  M.checks.forEach(c => (c.level === "warn" ? console.warn : console.log)("[board check] " + c.msg));
  if (/[?&]debug=1/.test(location.search)) {
    const box = document.getElementById("debug");
    box.style.cssText = "display:block;max-width:920px;margin:24px auto;padding:16px 20px;border:1px solid #333;font:13px/1.6 'Space Mono',monospace;color:#9a9a92";
    box.innerHTML = "<b style='color:#fff'>DATA CHECKS</b><br>" + M.checks.map(c => (c.level === "warn" ? "⚠ " : "✓ ") + c.msg).join("<br>") +
      "<br><br><b style='color:#fff'>MONTHLY GROWTH</b><br>basis: " + M.monthly.basis + " (" + M.monthly.months + " months) · opening " + M.monthly.startSubs +
      " · channel rows sum " + M.monthly.channelSum + "<br>net " + M.monthly.net + "% · gross " + M.monthly.gross + "% · gap " + M.monthly.gap +
      " pts · other basis (" + M.monthly.altBasis + ") would show net " + M.monthly.altNet + "%";
  }

  window.BOARD_MODEL = M;   // handy for poking at in the browser console: type BOARD_MODEL
})();
