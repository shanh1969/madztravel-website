/* ============================================================
   GENERATED AT DEPLOY TIME BY stamp-version.js — DO NOT EDIT.
   The number counts commits; it is not typed by hand. Edit version.txt
   only to start a new major. The date, commit and environment are
   stamped as attributes, never shown on the line. The committed copy
   of this file is only a fallback for the case where the build step
   does not run.
   ============================================================ */
(function () {
  var LABEL = "1.000";
  var BUILD = "2026-08-08 9d2106e";
  var DATE  = "2026-08-08";
  document.querySelectorAll(".version-bar").forEach(function (el) {
    el.textContent = LABEL;
    el.setAttribute("data-build", BUILD);
    el.setAttribute("title", "Deployed " + DATE);
  });
})();
