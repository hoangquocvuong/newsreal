# COC Smart Progressive Filter Contract V4

## Goal
Make base discovery fast on mobile and desktop without forcing users to complete every filter.

## Five stages
1. Group: Town Hall / Builder Hall / Clan Capital
2. Level: generated from the selected group
3. Type or District: generated from the selected group
4. Year
5. Sort: Latest / Vote / Download / View

## Progressive behavior
- Group selection resets incompatible Level and Type, updates results immediately, then opens Level.
- Level selection updates results immediately and closes the option panel. Type/ District is only suggested, never forced.
- Type, Year and Sort are optional refinements.
- Every state is represented in the URL and is shareable.
- The browser remembers the last filter and up to three recent level-based filters locally.
- Empty results provide one-click recovery actions.

## Responsive behavior
- Desktop and mobile use the same five-column mental model.
- Mobile keeps the five controls in one compact row and opens one option panel at a time below the row.
- No horizontal chip runways, no long vertical filter drawer, and no forced auto-scroll between optional stages.
