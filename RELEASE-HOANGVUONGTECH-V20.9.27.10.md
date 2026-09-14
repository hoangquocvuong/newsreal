# HoangVuongTech V20.9.27.10

## Hero skeleton overlay hotfix
- Removed the editable-Hero label from `::after` so it can no longer override template Hero overlay pseudo-elements.
- The label is now a real `.nr-hero-edit-hint` element inserted by the shared client-simulation contract.
- Fixes the tall vertical block seen on the Lion Dance empty Hero and protects all professional Hero variants using `::after`/`::before` overlays.
- Keeps empty handover geometry 1:1 while preserving each template's own Hero overlay.
