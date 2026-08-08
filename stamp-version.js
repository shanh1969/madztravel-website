/* ============================================================
   BUILD-TIME VERSION STAMP.

   Vercel runs this before publishing (see vercel.json buildCommand).
   It rewrites version.js with the release number plus the commit and
   date of THIS deploy, so the bar at the bottom of every page always
   describes what is actually live.

   Only the release number is SHOWN — one small line, nothing else.
   The deploy date, commit and environment still get stamped onto the
   element as data- attributes, so a deploy can still be identified
   from view-source without putting any of it in front of visitors.

   To change the RELEASE number, edit version.txt. It is the only part
   that is edited by hand; the rest comes from the deploy itself.

   Run it locally the same way Vercel does:   node stamp-version.js
   ============================================================ */
const fs = require('fs');
const { execSync } = require('child_process');

function git(args) {
  try {
    return execSync('git ' + args, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch (e) {
    return '';                       // Vercel clones shallowly; never fail the build over a version string
  }
}

const release = (fs.existsSync('version.txt') ? fs.readFileSync('version.txt', 'utf8') : '').trim() || '1.0.0';

// Vercel's env vars are authoritative — they describe the deploy being built. The git fallbacks are
// for running this locally, where the env vars do not exist.
const sha = (process.env.VERCEL_GIT_COMMIT_SHA || git('rev-parse HEAD')).slice(0, 7);
const date = new Date().toISOString().slice(0, 10);

const env = process.env.VERCEL_ENV || '';

const out = `/* ============================================================
   GENERATED AT DEPLOY TIME BY stamp-version.js — DO NOT EDIT.
   Edit version.txt to change the release number. The date, commit and
   environment are stamped as data- attributes, never displayed. The
   committed copy of this file is only a fallback for the case where
   the build step does not run.
   ============================================================ */
(function () {
  var LABEL = ${JSON.stringify(release)};
  var BUILD = ${JSON.stringify(date + (sha ? ' ' + sha : '') + (env ? ' ' + env : ''))};
  document.querySelectorAll(".version-bar").forEach(function (el) {
    el.textContent = LABEL;
    el.setAttribute("data-build", BUILD);
  });
})();
`;

fs.writeFileSync('version.js', out);
console.log('[stamp-version] ' + release + ' (build ' + date + ' ' + sha + ' ' + (env || 'local') + ')');
