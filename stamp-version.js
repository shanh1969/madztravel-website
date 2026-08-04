/* ============================================================
   BUILD-TIME VERSION STAMP.

   Vercel runs this before publishing (see vercel.json buildCommand).
   It rewrites version.js with the release number plus the commit and
   date of THIS deploy, so the bar at the bottom of every page always
   describes what is actually live.

   Why it exists: version.js used to hard-code "1.0.0", so the stamp
   only moved if somebody remembered to edit it by hand — and nobody
   did, through a dozen deploys. A number that can go stale is worse
   than no number, because it is quietly believed.

   To change the RELEASE number, edit version.txt. The commit and date
   are never edited by hand; they come from the deploy itself.

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

// A preview build should SAY it is a preview. Seeing "Version 1.1.0" on a preview URL and assuming
// production has it is exactly the confusion this stamp is meant to end.
const env = process.env.VERCEL_ENV || '';
const suffix = env && env !== 'production' ? ' · ' + env : '';

const label = 'Version ' + release + ' · ' + date + (sha ? ' · ' + sha : '') + suffix;

const out = `/* ============================================================
   GENERATED AT DEPLOY TIME BY stamp-version.js — DO NOT EDIT.
   Edit version.txt to change the release number; the date and commit
   come from the deploy. The committed copy of this file is only a
   fallback for the case where the build step does not run.
   ============================================================ */
(function () {
  var LABEL = ${JSON.stringify(label)};
  document.querySelectorAll(".version-bar").forEach(function (el) {
    el.textContent = LABEL;
  });
})();
`;

fs.writeFileSync('version.js', out);
console.log('[stamp-version] ' + label);
