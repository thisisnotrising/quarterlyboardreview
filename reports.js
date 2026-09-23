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
  title: "Board Reports",
  publication: "NOT RISING Magazine",
  intro: "Hi, Human. In a world where money talks loudest, we're on a mission to make humanity louder. Board Reports track our performance against that mission. All reports are open-source because this publication reports to the people, not capital."
};
