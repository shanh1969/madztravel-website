/* ============================================================
   SINGLE SOURCE OF TRUTH FOR THE SITE VERSION.
   To bump the version shown at the bottom of every page,
   change the ONE line below and redeploy. Nothing else.
   ============================================================ */
(function () {
  var VERSION = "1.0.0";
  document.querySelectorAll(".version-bar").forEach(function (el) {
    el.textContent = "Version " + VERSION;
  });
})();
