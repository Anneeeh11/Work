# PAR/A — The Golf Lab

A static golf learning site (Traditional Chinese + English), styled after the Masters:
deep green, cream and gold, serif headlines and scorecard-style tables.
No build step. Open `index.html` in a browser.

| Page | File | What it does |
|---|---|---|
| Start Here | `start.html` | Pick your level (never held a club / been to a range / 100+ on the course) and get a 4-week path with progress ticks |
| First Time | `guide.html` | First visit to a driving range, first round on a course, what to wear (do/don’t drawings, weather, checklist) and how to fill in a scorecard (double-par max per hole) |
| Glossary | `glossary.html` | Beginner terms; the same words are tappable inside lessons and other pages |
| Home | `index.html` | Intro, search across all content, toolkit, Chipping Academy, short-game club chart |
| Learn Golf | `learn.html` | Four units in learning order: Setup (grip, stance, posture, alignment), Full Swing, Short Game (chipping, pitching, bunker) and Putting; each lesson in the same six steps: 適用情境 → 選桿 → Setup → 動作步驟 → 常見錯誤 → 練習方法 |
| Club Guide | `clubs.html` | Driver, Wood, Hybrid, Iron, Wedge, Putter: loft, distance (men/women, yards/meters), when to use it, how to choose one |
| Fix My Shot | `fix.html` | Answer 3–4 questions, get the most likely cause, a fix and a drill (fixed rules, no AI) |
| Shot Selector | `shot.html` | Four questions about the lie and the green, then a recommended short-game shot and club |
| Practice | `practice.html` | 15 / 30 minute plans with a timer, and a 9-station Up & Down scorecard |
| My Game | `my-game.html` | Upload a scorecard (CSV/TXT, pasted text or a photo to type from) or enter it hole by hole; Masters-style Statistics (Scoring Summary, Greens Hit, Fairways Hit, Driving Distance, Sand Saves, Putting, Longest Drive) compared with a chosen field, plus practice suggestions. Rounds are saved in the browser |
| Golf Rules | `rules.html` | Rules by area of the course (clickable hole map), penalty quick reference, penalty-area relief diagram, scoring terms and etiquette; based on the 2023 Rules of Golf |
| Contact Us | `index.html#contact` | Contact form (sent through FormSubmit, same as the personal site; falls back to Gmail) plus email |

Site is written for beginners (new to golf up to about 95 strokes). All content is in `assets/data.js`; beginner content (lesson key points, glossary, 4-week paths, starter set, extra diagnoses, range plans) is in `assets/beginner.js`. Edit lessons, clubs, diagnosis rules and plans there.
My Game logic is in `assets/mygame.js`. Layout and logic are in `assets/app.js`, styles are in `assets/style.css`.
