# Notes for Claude

## Learn Golf (技巧教學) lessons taken off the site — restore on request

On 2026-11-03 the owner asked to take the lesson content off the website for now and to put it back
whenever they ask. Only the 準備動作 (Setup) unit keeps its full content. Every other lesson keeps its
title and shows 敬請期待 (Coming soon).

**The full content is saved in git history at commit `e15f54f`** on branch `claude/lucid-keller-tizc9c`
(the last commit before the removal; a local tag `lessons-full-2026-11` points at it too).
Never rewrite or force-push that history.

Taken off (all marked `soon: true` in `golf-lab/assets/data.js`):

| Unit | Lessons (id) |
|---|---|
| 全揮桿 Full Swing | backswing, downswing, finish-tempo, iron-basics, driver-basics |
| 短桿 Short Game | bump-and-run, standard-chip, putter-from-fringe, pitch-shot, flop-shot, bunker-splash |
| 推桿 Putting | short-putts, lag-putting, green-reading |

Also announced but never written: **AimPoint** (`GL.soon.putting` in `golf-lab/assets/beginner.js`).

### How to put a lesson back

The content lived in three places. Copy each lesson's entry from `e15f54f` (`git show e15f54f:<file>`):

1. `golf-lab/assets/data.js`: the full lesson object (situation, club, setup, steps, mistakes, drills)
   replaces its one-line stub. Drop `soon: true`.
2. `golf-lab/assets/beginner.js`: its line in `KEYS` (這篇的重點 key point).
3. `golf-lab/assets/en.js`: its full entry in `EN.lessons` (English key, situation, club, setup, steps,
   mistakes, drills) replaces the `{ zh, title }` stub.

The page code already handles both states (`l.soon` in `assets/app.js` and `assets/en.js`), so no code
change is needed when restoring. After restoring, check the lesson page in both languages and run a
missing-translation check (`window.__glMissing`).
