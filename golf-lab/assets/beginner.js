/* PAR/A — content for beginners (new to golf, up to about 95 strokes):
   key points per lesson, glossary, 4-week paths, starter set, extra diagnoses and range practice plans. */
(function (GL) {
  'use strict';

  /* One-line takeaway shown at the top of each lesson. */
  var KEYS = {
    'grip': '用手指握、不是手掌；往下看到 2–3 個指節，握力只要 4/10。',
    'stance': '7 號鐵與肩同寬；桿越長、站越寬、球越靠左。',
    'posture': '從髖部前傾、背打直、膝微彎，手臂自然垂下。',
    'alignment': '先擺桿面、再擺身體；身體和目標線平行，不是對準目標。',
    'backswing': '手、手臂、肩膀一起轉；頂點時背對目標，重心在右腳內側。',
    'downswing': '下半身先動，手在球前面擊球，重心移到左腳。',
    'finish-tempo': '用 80% 的力量，收桿站穩 3 秒；上桿慢、下桿快（3 : 1）。',
    'iron-basics': '鐵桿是往下打：先打到球、再打到地。',
    'driver-basics': 'Tee 高一點、球放左腳跟，往上掃過球，力量 75% 就好。',
    'bump-and-run': '能滾就不要飛：選直一點的桿，像推桿一樣打。',
    'standard-chip': '重心在左腳、手在球前，用肩膀擺動，手腕不動。',
    'putter-from-fringe': '草短又平順時就用推桿，力道比平常多一點。',
    'pitch-shot': '用擺幅控制距離（7:30 / 9:00 / 10:30），不是用力量。',
    'flop-shot': '風險高的打法：球位好、真的需要時才用。',
    'bunker-splash': '不打球、打球後方的沙，持續加速到收桿。',
    'short-putts': '頭不動、用肩膀推，推過洞 30–40 公分。',
    'lag-putting': '長推先求停在洞旁 1 公尺內，速度比方向重要。',
    'green-reading': '先決定速度，再決定線；寧可多看一點彎度。'
  };
  GL.lessons.forEach(function (l) { if (KEYS[l.id]) l.key = KEYS[l.id]; });

  /* Glossary. auto: also turn this word into a tappable term inside lessons and other text. */
  GL.glossary = [
    { g: '計分', t: 'Par', zh: '標準桿', d: '一個洞預期要打的桿數，通常是 3、4 或 5 桿。18 洞加起來多半是 72 桿。', auto: ['標準桿'] },
    { g: '計分', t: 'Birdie', zh: '博蒂（小鳥）', d: '比標準桿少 1 桿。' },
    { g: '計分', t: 'Bogey', zh: '柏忌', d: '比標準桿多 1 桿。新手的第一個目標可以是「每洞柏忌」——全場大約 90 桿。' },
    { g: '計分', t: 'Double Bogey', zh: '雙柏忌', d: '比標準桿多 2 桿。' },
    { g: '計分', t: 'Handicap', zh: '差點', d: '代表你平均比標準桿多打幾桿的數字，讓不同程度的人可以公平比賽。差點 28 大約是平均打 100 桿。', auto: ['差點'] },
    { g: '計分', t: 'Break 100', zh: '破百', d: '18 洞打進 99 桿以內，是許多新手的第一個里程碑。' },
    { g: '球場', t: 'Tee Box', zh: '開球區（發球台）', d: '每一洞第一桿的地方，用兩個 Tee 標記劃出範圍。', auto: ['開球區'] },
    { g: '球場', t: 'Fairway', zh: '球道', d: '開球區到果嶺之間、草剪得比較短的區域。球停在這裡最好打。', auto: ['球道'] },
    { g: '球場', t: 'Rough', zh: '長草區', d: '球道兩側草比較長的地方，球容易陷進去，比較難打。', auto: ['長草'] },
    { g: '球場', t: 'Green', zh: '果嶺', d: '洞所在的地方，草剪得最短，只用推桿。', auto: ['果嶺'] },
    { g: '球場', t: 'Fringe', zh: '果嶺邊緣', d: '果嶺外圍一圈稍長的草。', auto: ['果嶺邊緣'] },
    { g: '球場', t: 'Bunker', zh: '沙坑', d: '球場上裝沙的凹地。在沙坑裡瞄球時球桿不能碰到沙。', auto: ['沙坑'] },
    { g: '球場', t: 'Penalty Area', zh: '罰桿區', d: '用黃樁或紅樁標示的區域，通常是水。球進去後可以罰 1 桿救濟。', auto: ['罰桿區'] },
    { g: '球場', t: 'OB (Out of Bounds)', zh: '界外', d: '白樁外面的區域。球打出界要罰 1 桿，回上一桿的位置重打。', auto: ['界外', 'OB'] },
    { g: '球桿', t: 'Loft', zh: '桿面角度', d: '桿面往後傾斜的角度。Loft 越大，球飛得越高、越近。Driver 約 10°，挖起桿約 50–60°。', auto: ['Loft'] },
    { g: '球桿', t: 'Bounce', zh: '反彈角', d: '挖起桿桿底的角度，讓桿頭在沙或軟草上滑過去而不會挖太深。', auto: ['Bounce'] },
    { g: '球桿', t: 'Lie Angle', zh: '桿身角度', d: '桿身和地面的角度。不適合你的身高時，球容易偏左或偏右。', auto: ['Lie'] },
    { g: '球桿', t: 'Shaft Flex', zh: '桿身硬度', d: '桿身的軟硬：L（女士）、A（年長）、R（一般）、S（硬）。揮速慢的人用軟一點的桿身。', auto: ['桿身硬度'] },
    { g: '球桿', t: 'Hybrid', zh: '混合桿', d: '介於木桿和鐵桿之間，比長鐵桿更容易打高，很適合新手。', auto: ['Hybrid'] },
    { g: '球桿', t: 'Wedge', zh: '挖起桿', d: 'Loft 最大的鐵桿：PW、GW、SW、LW，用在短距離與沙坑。', auto: ['挖起桿'] },
    { g: '擊球', t: 'Fat', zh: '打厚', d: '桿頭先打到地面才打到球，球飛不遠。', auto: ['打厚'] },
    { g: '擊球', t: 'Thin / Top', zh: '打薄', d: '桿頭打到球的上半部，球低飛或在地上滾。', auto: ['打薄'] },
    { g: '擊球', t: 'Slice', zh: '右曲球', d: '（右手球員）球往右大幅彎曲，是新手最常見的球路。', auto: ['右曲'] },
    { g: '擊球', t: 'Hook', zh: '左曲球', d: '（右手球員）球往左大幅彎曲。', auto: ['左曲'] },
    { g: '擊球', t: 'Shank', zh: '打到桿頸', d: '球打到桿頭和桿身的連接處，突然往右側飛出去。', auto: ['Shank'] },
    { g: '擊球', t: 'Divot', zh: '草皮痕', d: '鐵桿擊球後被削起的一小片草皮。好的鐵桿擊球，草皮痕在球的前方。', auto: ['草皮痕'] },
    { g: '擊球', t: 'Sweet Spot', zh: '甜蜜點', d: '桿面正中央最有效率的擊球點。打中時手感最輕、距離最遠。' },
    { g: '統計', t: 'GIR', zh: '標準桿上果嶺', d: 'Greens in Regulation：在「標準桿 − 2」桿內上果嶺，例如 Par 4 用 2 桿上果嶺。', auto: ['GIR', '標準桿上果嶺'] },
    { g: '統計', t: 'Fairway Hit', zh: '開球上球道', d: 'Par 4 與 Par 5 的開球停在球道上的比例。' },
    { g: '統計', t: 'Up & Down', zh: '救球（兩桿進洞）', d: '沒上果嶺時，一次切球加一次推桿就進洞。', auto: ['Up & Down'] },
    { g: '統計', t: 'Scrambling', zh: '救球率', d: '沒有標準桿上果嶺時，仍然打出標準桿或更好的比例。', auto: ['Scrambling'] },
    { g: '統計', t: 'Sand Save', zh: '沙坑救球', d: '從果嶺邊沙坑出來後，一推內進洞的比例。' },
    { g: '統計', t: '3-Putt', zh: '三推', d: '在果嶺上推了 3 桿以上。新手最容易省桿的地方。', auto: ['三推'] },
    { g: '規則', t: 'Penalty Stroke', zh: '罰桿', d: '違反規則或救濟時要加上的桿數，例如出界、進水各罰 1 桿。', auto: ['罰桿'] },
    { g: '規則', t: 'Provisional Ball', zh: '暫定球', d: '覺得球可能遺失或出界時，先宣告再多打一顆，省下走回來的時間。', auto: ['暫定球'] },
    { g: '規則', t: 'Drop', zh: '拋球', d: '救濟時從膝蓋高度讓球落下，球要停在救濟範圍內。', auto: ['拋球'] },
    { g: '規則', t: 'Free Relief', zh: '免罰救濟', d: '球停在電車道、整修地等地方時，可以不罰桿移到旁邊打。', auto: ['免罰救濟'] },
    { g: '規則', t: 'Ready Golf', zh: '準備好就打', d: '休閒打球時，誰準備好誰先打，不一定要等最遠的人，讓速度變快。', auto: ['Ready golf'] },
    { g: '規則', t: 'Max Score', zh: '每洞上限', d: '新手休閒打球時，可以打到「雙倍標準桿」就把球撿起來，記下那個桿數，不拖慢後面的人。' }
  ];

  /* 4-week paths by starting point. Each item is a lesson or a page link. */
  GL.levels = [
    { id: 'new', t: '從沒摸過球桿', s: '還沒去過練習場，或只去過一兩次' },
    { id: 'range', t: '去過練習場，還沒下場', s: '可以把球打出去，但不穩定' },
    { id: 'course', t: '下過場，大約 100 桿以上', s: '目標是穩定破百、打進 95' }
  ];
  var L = function (id) { return { lesson: id }; };
  var P = function (href, t, s) { return { href: href, t: t, s: s }; };
  GL.paths = {
    new: [
      { w: '第 1 週', t: '認識球桿與準備動作', items: [P('guide.html#range', '第一次去練習場', '要帶什麼、怎麼買球、練習順序'), P('clubs.html#starter', '新手第一套球桿', '只需要 5–7 支'), L('grip'), L('stance'), L('posture'), L('alignment'), P('practice.html#r30', '練習場 30 分鐘', '照著菜單練一次')] },
      { w: '第 2 週', t: '半揮桿，打到球', items: [L('backswing'), L('downswing'), L('iron-basics'), P('fix.html#air', '球飛不起來？', '新手最常見的問題'), P('practice.html#r30', '練習場 30 分鐘', '這週練兩次')] },
      { w: '第 3 週', t: '完整揮桿與短桿', items: [L('finish-tempo'), L('bump-and-run'), L('short-putts'), P('practice.html#15', '短桿 15 分鐘', '每次練習的最後 15 分鐘')] },
      { w: '第 4 週', t: '準備第一次下場', items: [P('guide.html#course', '第一次下場', '服裝、時間、要帶什麼'), P('guide.html#score', '計分卡怎麼填', '每洞最多記雙倍標準桿'), P('rules.html#basics', '基本規則', '最常遇到的幾條'), L('driver-basics'), L('lag-putting')] }
    ],
    range: [
      { w: '第 1 週', t: '檢查基本功', items: [L('grip'), L('stance'), L('posture'), L('alignment'), P('fix.html', '擊球診斷', '找出你最常見的問題')] },
      { w: '第 2 週', t: '揮桿順序與節奏', items: [L('backswing'), L('downswing'), L('finish-tempo'), L('iron-basics'), P('practice.html#r60', '練習場 60 分鐘', '完整的練習菜單')] },
      { w: '第 3 週', t: '果嶺周圍', items: [L('bump-and-run'), L('standard-chip'), L('short-putts'), L('lag-putting'), P('practice.html#30', '短桿 30 分鐘', '切球加推桿')] },
      { w: '第 4 週', t: '第一次下場', items: [P('guide.html#course', '第一次下場', '服裝、時間、要帶什麼'), P('guide.html#score', '計分卡怎麼填', '每洞最多記雙倍標準桿'), P('rules.html', '高球規則', '依球的位置查規則'), L('driver-basics'), P('shot.html', '短桿選擇', '果嶺邊不知道怎麼打時')] }
    ],
    course: [
      { w: '第 1 週', t: '找出漏掉的桿數', items: [P('my-game.html', '輸入一場成績', '用新手模式看看桿數掉在哪'), P('fix.html', '擊球診斷', '最常出現的失誤'), P('guide.html#score', '每洞上限', '避免一洞打到十幾桿')] },
      { w: '第 2 週', t: '少掉三推', items: [L('lag-putting'), L('short-putts'), L('green-reading'), P('practice.html#15', '短桿 15 分鐘', '以推桿為主')] },
      { w: '第 3 週', t: '果嶺周圍兩桿進洞', items: [L('bump-and-run'), L('standard-chip'), L('putter-from-fringe'), P('shot.html', '短桿選擇', '選最簡單的打法'), P('practice.html#30', 'Up & Down 挑戰', '9 站計分卡')] },
      { w: '第 4 週', t: '避免大數字', items: [L('driver-basics'), L('bunker-splash'), P('rules.html#lost', '遺失球與界外', '正確處理罰桿'), P('practice.html#r60', '練習場 60 分鐘', '開球與鐵桿')] }
    ]
  };

  /* A beginner's first set. */
  GL.starterSet = [
    { c: '7 號鐵', need: '必備', d: '最好練習的一支桿，練習場大部分時間都用它。' },
    { c: 'PW 劈起桿', need: '必備', d: '100 碼內攻果嶺與果嶺邊切球。' },
    { c: '56° 沙坑桿', need: '必備', d: '沙坑和需要讓球飛高的短桿。' },
    { c: '推桿', need: '必備', d: '每一洞都會用到，選瞄準時覺得順眼的。' },
    { c: 'Hybrid 或 5 號木', need: '建議', d: '取代難打的長鐵，第二桿需要距離時用。' },
    { c: '9 號、5 號鐵', need: '建議', d: '補足 7 號鐵前後的距離。' },
    { c: 'Driver', need: '之後再買', d: '最難打的球桿。剛開始可以用 Hybrid 或 5 號木開球。' }
  ];

  /* Diagnoses beginners need most. */
  GL.problems.push(
    {
      id: 'whiff', title: '為什麼我會揮空、打不到球？', en: 'Whiff', desc: '揮桿時桿頭完全沒碰到球。',
      questions: [
        { q: '揮空時，桿頭經過球的哪裡？', a: [{ t: '從球的上方掃過', w: { lift: 3 } }, { t: '先打到球後面的地', w: { sway: 2, force: 1 } }, { t: '不確定', w: { force: 2 } }] },
        { q: '揮桿時你是不是很用力？', a: [{ t: '是，想打很遠', w: { force: 3 } }, { t: '不會', w: { lift: 1, setup: 1 } }] },
        { q: '揮桿時身體會左右晃動嗎？', a: [{ t: '會', w: { sway: 3 } }, { t: '不會', w: { setup: 2 } }, { t: '不確定', w: { sway: 1 } }] }
      ],
      causes: {
        lift: { name: '擊球時起身抬頭', why: '還沒打到球就抬頭看球去哪，身體跟著站起來，桿頭也被拉高。', fix: '眼睛盯著球，打完後再看。保持膝蓋與上半身的角度。', drill: '在球下方放一枚硬幣，擊球後還要看到硬幣才抬頭。', lesson: 'posture' },
        force: { name: '太用力', why: '想打遠時全身繃緊，動作變形，桿頭的路線就不穩定。', fix: '先用 50% 的力量、半揮桿把球打到就好，距離之後會自然出來。', drill: '9 點到 3 點的半揮，連續 10 顆都打到球再加大擺幅。', lesson: 'finish-tempo' },
        sway: { name: '身體左右晃動', why: '上桿時身體往右滑、下桿又往左衝，最低點每次都不一樣。', fix: '在原地轉身，想像腳下有一個圓圈，身體不能離開它。', drill: '雙腳併攏揮半揮桿，強迫自己在原地轉。', lesson: 'backswing' },
        setup: { name: '站的距離不對', why: '離球太遠或太近，手臂在擊球時伸直或縮起，桿頭就碰不到球。', fix: '手臂自然垂下握桿，手和大腿之間約一個拳頭。', drill: '每球站位前先檢查「一個拳頭」的距離。', lesson: 'posture' }
      }
    },
    {
      id: 'air', title: '為什麼球飛不起來，一直滾地？', en: 'Ball won’t get airborne', desc: '球貼著地面滾，或飛得很低。',
      questions: [
        { q: '最常發生在哪種球桿？', a: [{ t: '長鐵桿、木桿', w: { club: 3 } }, { t: '每一支都會', w: { scoop: 1, top: 1 } }] },
        { q: '球被打到哪裡？', a: [{ t: '上半部，球直接滾在地上', w: { top: 3 } }, { t: '飛很低、但有往前', w: { scoop: 2 } }, { t: '不知道', w: { scoop: 1, top: 1 } }] },
        { q: '擊球時，你會想把球「撈」起來嗎？', a: [{ t: '會', w: { scoop: 3 } }, { t: '不會', w: { top: 1, club: 1 } }] }
      ],
      causes: {
        scoop: { name: '想把球撈起來', why: '用手腕往上撈，桿頭在最低點之前就往上走，反而打到球的中間。', fix: '鐵桿要「往下」打，讓桿面的角度（Loft）把球送上去。', drill: '在球後方 10 公分放毛巾，揮桿不能碰到毛巾。', lesson: 'iron-basics' },
        top: { name: '擊球時起身（打頂）', why: '身體在擊球時站起來，桿頭跟著變高，打到球的上半部。', fix: '保持前傾角度到擊球後，眼睛盯著球。', drill: '半揮桿練習，收桿時胸口還朝向地面。', lesson: 'posture' },
        club: { name: '球桿太難打', why: '長鐵桿 Loft 小、桿身長，新手本來就很難把它打高。', fix: '用 Hybrid 或 5 號木取代 3–5 號鐵，Driver 的 Tee 放高一點。', drill: '練習時先用 7 號鐵打到穩定，再換長的球桿。', lesson: 'driver-basics' }
      }
    },
    {
      id: 'distance', title: '為什麼同一支桿距離每次都不一樣？', en: 'Inconsistent distance', desc: '有時很遠、有時很近。',
      questions: [
        { q: '擊球的手感？', a: [{ t: '常常震手、不紮實', w: { contact: 3 } }, { t: '手感還好', w: { tempo: 1, length: 1 } }] },
        { q: '你的揮桿速度？', a: [{ t: '每次都不太一樣', w: { tempo: 3 } }, { t: '差不多', w: { length: 1, contact: 1 } }] },
        { q: '你的上桿長度？', a: [{ t: '有時長、有時短', w: { length: 3 } }, { t: '差不多', w: { contact: 1, tempo: 1 } }] }
      ],
      causes: {
        contact: { name: '沒有打到甜蜜點', why: '打在桿頭的趾端或跟部，距離會差 10–20%。', fix: '先用半揮桿找到穩定的擊球點，再慢慢加大。', drill: '在桿面貼擊球貼紙或噴一點粉，看每一球打在哪裡。', lesson: 'iron-basics' },
        tempo: { name: '節奏不穩定', why: '有時候特別用力，速度與擊球點都會跟著改變。', fix: '固定的「一、二、三——打」節奏，力量 80%。', drill: '手機節拍器練習，三拍上桿、一拍下桿。', lesson: 'finish-tempo' },
        length: { name: '上桿長度不固定', why: '擺幅不同，距離自然不同。', fix: '每一支桿都揮到相同的頂點位置。', drill: '頂點停 2 秒檢查位置，再下桿。', lesson: 'backswing' }
      }
    }
  );

  /* Driving-range plans for full-swing practice. */
  GL.plans.r30 = {
    name: 'Range Basics', zh: '練習場 30 分鐘',
    blocks: [
      { mins: 3, cat: 'Warm-up', name: '暖身與空揮', how: '轉動肩膀與髖部，用 PW 做 10 次 9 點到 3 點的空揮。', fig: 'halfswing', cap: '先做半揮的空揮，感受身體帶動手臂。' },
      { mins: 7, cat: 'Half Swing', name: 'PW 半揮', how: '用 PW 打 15 顆 9 點到 3 點的半揮，目標是每顆都打到球。', lesson: 'iron-basics', fig: 'targets', cap: '選最近的旗子當目標，先求每一顆都紮實打到。' },
      { mins: 10, cat: 'Full Swing', name: '7 號鐵全揮', how: '每顆球都選一個目標旗，打 20 顆，收桿站穩 3 秒。', lesson: 'finish-tempo', fig: 'targets', cap: '每一顆都換一個目標旗，不要連續一直打。' },
      { mins: 5, cat: 'Woods', name: 'Hybrid 或 5 號木', how: '用 75% 的力量打 10 顆，Tee 稍微架高。', lesson: 'driver-basics', fig: 'tee', cap: 'Tee 的高度：球有一半在桿頭上方。' },
      { mins: 5, cat: 'Short Game', name: '切球收尾', how: '到練習果嶺用 Bump & Run 打 10 顆，或在打位用 PW 打 30 碼。', lesson: 'bump-and-run', fig: 'towel', cap: '最後用短桿收尾，讓手感留在最常用到的距離。' }
    ]
  };
  GL.plans.r60 = {
    name: 'Complete Range Session', zh: '練習場 60 分鐘',
    blocks: [
      { mins: 5, cat: 'Warm-up', name: '暖身與空揮', how: '伸展後用 PW 做 15 次半揮空揮。', fig: 'halfswing', cap: '先做半揮的空揮，感受身體帶動手臂。' },
      { mins: 10, cat: 'Half Swing', name: '短鐵半揮', how: 'PW 與 9 號鐵各打 10 顆半揮，檢查擊球點。', lesson: 'iron-basics', fig: 'targets', cap: '選最近的旗子當目標，先求每一顆都紮實打到。' },
      { mins: 15, cat: 'Full Swing', name: '7 號鐵目標練習', how: '每顆都換一個目標，記錄 20 顆中有幾顆落在目標附近。', lesson: 'alignment', fig: 'targets', cap: '每球都用球桿擺出瞄準線，再換目標。' },
      { mins: 10, cat: 'Driver', name: '開球', how: '用 Driver 或 5 號木以 75% 力量打 10 顆，想像兩側是球道邊界。', lesson: 'driver-basics', fig: 'tee', cap: 'Tee 的高度：球有一半在桿頭上方。' },
      { mins: 10, cat: 'Short Game', name: '切球', how: '在練習果嶺用毛巾落點練習 Bump & Run 與 Standard Chip。', lesson: 'standard-chip', fig: 'towel', cap: '把毛巾鋪在果嶺邊緣往內一步，球要先落在毛巾上。' },
      { mins: 10, cat: 'Putting', name: '推桿', how: '1 公尺 Circle Drill 一輪，再推 5 顆 10 步以上的長推。', lesson: 'lag-putting', fig: 'circle', cap: '以洞為中心，在 1 公尺處插 8 支 tee 圍成一圈。' }
    ]
  };
})(window.GL);
