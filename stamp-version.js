/* ============================================================
   BUILD-TIME VERSION STAMP.

   Vercel runs this before publishing (see vercel.json buildCommand).

   ONE small number is shown, and nothing else: 1.000, 1.001, 1.002 …
   The number is BUMPED AUTOMATICALLY BY A COMMIT HOOK, not typed. See
   hooks/pre-commit. That is the whole point: this stamp used to be a
   hand-edited "1.0.0" and it sat unchanged through a dozen deploys, so
   the site looked current when it was not. A number that can go stale
   is worse than no number, because it is quietly believed.

   If the footer number is the same as it was before a deploy, the
   deploy did not land. If it went up, it did.

   Why the hook and not a commit count at build time: Vercel clones
   SHALLOW, so `git rev-list --count HEAD` on the build machine returns
   a number that never moves. Tried it, watched it stamp 1.000 onto a
   fresh deploy, took it back out. The number therefore has to be fixed
   in the commit itself, where the full history actually exists.

   Hovering the number shows the deploy date. The date, commit and
   environment are also stamped on as data- attributes for view-source.

   version.txt holds the number. Bump the major by hand (2.000) for a
   real relaunch; the hook keeps counting from wherever you leave it.

   Run it the same way Vercel does:      node stamp-version.js
   Bump the number the way the hook does: node stamp-version.js --bump
   ============================================================ */
const fs = require('fs');
const { execSync } = require('child_process');

function git(args) {
  try {
    return execSync('git ' + args, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch (e) {
    return '';                       // never fail the build over a version string
  }
}

const VERSION_FILE = 'version.txt';

function readVersion() {
  const raw = (fs.existsSync(VERSION_FILE) ? fs.readFileSync(VERSION_FILE, 'utf8') : '').trim();
  return /^\d+\.\d+$/.test(raw) ? raw : '1.000';
}

// --bump is the hook's job: advance the number, then regenerate below so the committed copy of
// version.js agrees with the committed version.txt.
if (process.argv.includes('--bump')) {
  const [major, minor] = readVersion().split('.');
  const next = String(parseInt(minor, 10) + 1).padStart(minor.length, '0');
  fs.writeFileSync(VERSION_FILE, major + '.' + next + '\n');
  console.log('[stamp-version] bumped to ' + major + '.' + next);
}

const release = readVersion();

// Vercel's env vars are authoritative — they describe the deploy being built. The git fallbacks are
// for running this locally, where the env vars do not exist.
const sha = (process.env.VERCEL_GIT_COMMIT_SHA || git('rev-parse HEAD')).slice(0, 7);
const date = new Date().toISOString().slice(0, 10);
const env = process.env.VERCEL_ENV || '';

const out = `/* ============================================================
   GENERATED AT DEPLOY TIME BY stamp-version.js — DO NOT EDIT.
   The number comes from version.txt, which a commit hook advances on
   every commit; it is not typed by hand. The date, commit and
   environment are stamped as attributes, never shown on the line.
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
