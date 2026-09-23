/* ==========================================================================
   reports.js  —  the LIST of reports shown on the archive homepage (index.html).

   Adding a new quarter = add ONE block to this list (copy an existing one, change the
   words). The archive page sorts by `asOf`, newest first, so order here doesn't matter.

   Each report:
     id         the folder name inside /reports/ (must match exactly)
     label      the big name on the card, e.g. "2026 · Q4"
     season     the small line under it
     asOf       the date the report's numbers are current to (YYYY-MM-DD)
     subscribers total subscribers on that date (a plain number, no comma)
     status     "In progress" while the quarter is running, "Final" once it's closed
   ========================================================================== */

window.BOARD_REPORTS = [
  {
    id: "2026-q3",
    label: "2026 · Q3",
    season: "SPROUT · JUL – SEP",
    asOf: "2026-09-23",
    subscribers: 931,
    status: "In progress"
  }
];

/* Words shown at the top of the archive page. */
window.BOARD_ARCHIVE = {
  title: "Quarterly Board Review",
  publication: "NOT RISING Magazine",
  intro: "A public quarterly report of NOT RISING Magazine's impact on its mission to amplify independent voices drowned out by the algorithm. Board Reports are open-source because this publication answers to humans, not capital."
};
