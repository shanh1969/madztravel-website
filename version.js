/* ============================================================
   GENERATED AT DEPLOY TIME BY stamp-version.js — DO NOT EDIT.
   The number comes from version.txt, which a commit hook advances on
   every commit; it is not typed by hand. The date, commit and
   environment are stamped as attributes, never shown on the line.
   ============================================================ */
(function () {
  var LABEL = "1.026";
  var BUILD = "2026-08-11 1b7fc2a";
  var DATE  = "2026-08-11";
  document.querySelectorAll(".version-bar").forEach(function (el) {
    el.textContent = LABEL;
    el.setAttribute("data-build", BUILD);
    el.setAttribute("title", "Deployed " + DATE);
  });
})();
