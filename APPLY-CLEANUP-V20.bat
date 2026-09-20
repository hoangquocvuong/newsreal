@echo off
setlocal
cd /d "%~dp0"
for %%F in (
  COMMERCE-ADMIN-UX-V13.md
  COMMERCE-CORE-MOBILE-V14.md
  COMMERCE-REBUILD-V15.md
  COMMERCE-NEW-TEMPLATE-V16.md
  COMMERCE-FRESH-STOREFRONT-V17.md
  COMMERCE-CLEAN-SLATE-V18.md
  COMMERCE-ROUTE-FIX-V19.md
  scripts\apply-commerce-route-v19.mjs
  scripts\check-commerce-admin-ux-v51.mjs
  scripts\check-commerce-core-mobile-v52.mjs
  scripts\check-commerce-rebuild-v53.mjs
  scripts\check-commerce-new-template-v54.mjs
  scripts\check-commerce-fresh-storefront-v55.mjs
  scripts\check-commerce-clean-slate-v56.mjs
  scripts\check-commerce-route-v19.mjs
) do if exist "%%F" del /q "%%F"
echo Commerce legacy V13-V19 cleanup complete.
