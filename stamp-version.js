/* ============================================================
   BUILD-TIME VERSION STAMP.

   Vercel runs this before publishing (see vercel.json buildCommand).

   ONE small number is shown, and nothing else: 1.000, 1.001, 1.002 …
   The number is COUNTED, not typed. It is the number of commits since
   the baseline below, so every deploy carries a number nobody had to
   remember to change. That is the whole point: this stamp used to be a
   hand-edited "1.0.0" and it sat unchanged through a dozen deploys, so
   the site looked current when it was not. A number that can go stale
   is worse than no number, because it is quietly believed.

   If the footer number is the same as it was before a deploy, the
   deploy did not land. If it went up, it did.

   Hovering the number shows the deploy date. The date, commit and
   environment are also stamped on as data- attributes for view-source.

   version.txt is the STARTING number, i.e. what the site read at the
   baseline commit. Bump its major (2.000) for a real relaunch; the
   counting picks up from there. BASE_COMMITS must then be reset to the
   commit count at that moment — the assert below will tell you if it
   ever drifts negative.

   Run it locally the same way Vercel does:   node stamp-version.js
   ============================================================ */
const fs = require('fs');
const { execSync } = require('child_process');

// Commit count at the moment version.txt was set to its current value.
const BASE_COMMITS = 35;

function git(args) {
  try {
    return execSync('git ' + args, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch (e) {
    return '';                       // never fail the build over a version string
  }
}

const start = (fs.existsSync('version.txt') ? fs.readFileSync('version.txt', 'utf8') : '').trim() || '1.000';
const [startMajor, startMinor] = start.split('.');

// A shallow clone counts wrong, and a wrong count that never moves is exactly the failure this file
// exists to prevent — so only trust the count when the full history is present.
const shallow = git('rev-parse --is-shallow-repository') !== 'false';
const count = shallow ? 0 : parseInt(git('rev-list --count HEAD'), 10) || 0;

let release = start;
if (count) {
  const n = parseInt(startMinor, 10) + (count - BASE_COMMITS);
  // Going backwards means BASE_COMMITS is stale relative to version.txt. Say so rather than
  // printing a number that moves the wrong way.
  if (n < 0) throw new Error('[stamp-version] BASE_COMMITS (' + BASE_COMMITS + ') is ahead of the ' +
                             'commit count (' + count + '); reset it to the current count.');
  release = startMajor + '.' + String(n).padStart(startMinor.length, '0');
} else {
  console.warn('[stamp-version] no usable git history — falling back to version.txt (' + start + '). ' +
               'The number will not advance on this build.');
}

// Vercel's env vars are authoritative — they describe the deploy being built. The git fallbacks are
// for running this locally, where the env vars do not exist.
const sha = (process.env.VERCEL_GIT_COMMIT_SHA || git('rev-parse HEAD')).slice(0, 7);
const date = new Date().toISOString().slice(0, 10);
const env = process.env.VERCEL_ENV || '';

const out = `/* ============================================================
   GENERATED AT DEPLOY TIME BY stamp-version.js — DO NOT EDIT.
   The number counts commits; it is not typed by hand. Edit version.txt
   only to start a new major. The date, commit and environment are
   stamped as attributes, never shown on the line. The committed copy
   of this file is only a fallback for the case where the build step
   does not run.
   ============================================================ */
(function () {
  var LABEL = ${JSON.stringify(release)};
  var BUILD = ${JSON.stringify(date + (sha ? ' ' + sha : '') + (env ? ' ' + env : ''))};
  var DATE  = ${JSON.stringify(date)};
  document.querySelectorAll(".version-bar").forEach(function (el) {
    el.textContent = LABEL;
    el.setAttribute("data-build", BUILD);
    el.setAttribute("title", "Deployed " + DATE);
  });
})();
`;

fs.writeFileSync('version.js', out);
console.log('[stamp-version] ' + release + ' (build ' + date + ' ' + sha + ' ' + (env || 'local') + ')');
