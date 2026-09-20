# Newsreal clean source

Cleaned from the stable rollback source supplied on 2026-09-20.

Removed only development/history junk that is not required by the application runtime:
- `.git/` repository history and pack files
- old `RELEASE-*.md` history notes
- empty accidental root file named `git`
- common cache/log/temp/backup files when present

Application source, migrations, scripts, assets, Cloudflare functions/workers, package files and Wrangler configuration are retained.

Validation: `npm run check` passed after cleanup.
