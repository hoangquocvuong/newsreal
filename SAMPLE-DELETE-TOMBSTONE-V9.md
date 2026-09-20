# V9 — Sample delete tombstone fix

Fixes sample deletion in Admin. The posts DELETE branch now executes before POST/PUT payload validation, writes a tombstone for sample posts, deletes the row, and prevents sample-pack repair from resurrecting it.

Regression contract: delete -> Admin refresh -> public refresh -> sample repair; deleted sample remains absent.
