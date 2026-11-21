// Original pixel artwork. The map sprite and the portrait dress the same person.
const skin = {
  peach: ['#cc8066', '#efad85', '#ffdab0'],
  umber: ['#995d51', '#c48767', '#eeb48a'],
  ochre: ['#b77051', '#dd996c', '#ffcf97'],
};

// Shadow and light on the hair, main cloth and its highlight, signature accessory.
const cast = {
  hero:   ['sweep',  'peach', '#3b3142', '#996151', '#267977', '#64b2a0', '#ed7959'],
  hero1:  ['wave',   'umber', '#272b42', '#665071', '#5f5985', '#a996b9', '#f1ae63'],
  hero2:  ['tuft',   'ochre', '#6e4340', '#c48254', '#416c8c', '#88acc1', '#e49167'],
  mina:   ['post',   'peach', '#4d3440', '#996045', '#315e70', '#83a8af', '#d35e52'],
  haru:   ['band',   'umber', '#413139', '#8d5b4c', '#a76043', '#d99758', '#91b799'],
  sui:    ['bun',    'peach', '#233841', '#548079', '#386c75', '#86bdb3', '#eda985'],
  nagi:   ['cap',    'umber', '#384352', '#889296', '#354e70', '#769bb1', '#e2c595'],
  kohaku: ['goggle', 'ochre', '#6a453d', '#c17f4d', '#87633e', '#c59958', '#68bec0'],
  luka:   ['hood',   'umber', '#4c4039', '#9c7660', '#466c55', '#92b67e', '#efae58'],
  sora:   ['curls',  'peach', '#463856', '#9681a6', '#625481', '#a494b7', '#b6ddc7'],
  senna:  ['wrap',   'ochre', '#342f40', '#85615d', '#396f80', '#83afb8', '#e29a65'],
  elder:  ['beard',  'ochre', '#948b7e', '#e1d9bc', '#54516e', '#a498ad', '#e0be73'],
  toto:   ['tuft',   'ochre', '#3e3e42', '#9a8871', '#477465', '#8cb6a3', '#b9c885'],
  mil:    ['veil',   'peach', '#424256', '#77788b', '#638c8d', '#b7d7c5', '#efe4c0'],
  rio:    ['beard',  'umber', '#695451', '#b19980', '#425975', '#7e9baf', '#c4ae74'],
  villager: ['wave', 'ochre', '#4d4146', '#978173', '#596f78', '#96abaf', '#c9a77a'],
};

const aliases = [
  [/ミナ|郵便屋/, 'mina'], [/ハル|店主/, 'haru'], [/スイ|帳場/, 'sui'],
  [/ナギ|船長/, 'nagi'], [/コハク|道具屋|武器屋/, 'kohaku'], [/ルカ|灯台守/, 'luka'],
  [/ソラ|学者|星読み/, 'sora'], [/セナ|船便係/, 'senna'], [/長老|オリベ/, 'elder'],
  [/先生|トト|案内役/, 'toto'], [/ミル|神官/, 'mil'], [/村長|リオ/, 'rio'],
  [/仕立屋|交換所/, 'sui'], [/門番|橋守|見張り/, 'luka'], [/航海士|船の案内人|港番/, 'senna'],
  [/地図師|記録係/, 'toto'], [/受取人|検品係/, 'sora'], [/配達人|梱包屋/, 'mina'],
  [/船大工|荷物係/, 'haru'],
];

function characterId(identity, avatar) {
  if (identity === 'hero') return ['hero', 'hero1', 'hero2'][avatar] ?? 'hero';
  if (Object.hasOwn(cast, identity)) return identity;
  const name = String(identity ?? '').replace(/\s+/g, '');
  return aliases.find(([match]) => match.test(name))?.[1] ?? 'villager';
}

const fallbackNames = [
  ['郵便屋 ミナ', '先生 トト', '道具屋 コハク', '旅の記録係'],
  ['店主 ハル', '郵便屋 ミナ', '先生 トト', '交換所のユイ'],
  ['帳場の スイ', '案内人 ヒナ', '先生 トト', '受取人 アオイ'],
  ['船長 ナギ', '記録係 セン', '先生 トト', '港の見張り'],
  ['道具屋 コハク', '検品係 リン', '先生 トト', '配達人 ヨウ'],
  ['灯台守 ルカ', '鍵守り アサ', '学者 ソラ', '港の村長'],
  ['学者 ソラ', '船の案内人', '灯台守 ルカ', '港の村長'],
];

export function townNpcName(chapter, index) {
  const fallback = fallbackNames[Number(chapter?.id?.slice(3))] ?? fallbackNames[0];
  return chapter?.npcs?.[index]?.name ?? (index === 0 && chapter?.npcName || fallback[index]);
}

const palettes = Object.fromEntries(Object.entries(cast).map(([id, [style, tone, hair, sheen, coat, light, signature]]) => {
  const [shade, face, skinLight] = skin[tone];
  return [id, {style, i:'#202d37', d:hair, h:sheen, s:shade, f:face, b:skinLight, c:coat, a:light,
    g:signature, e:'#ffe8ac', t:'#966f53', n:'#f7e5cf', m:'#ac625b'}];
}));

// Convert the hand-drawn rows into horizontal runs once, independent of color.
function stamp(rows) {
  const runs = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      const color = row[x];
      let end = x + 1;
      while (row[end] === color) end++;
      if (color !== '.') runs.push([x, y, end - x, color]);
      x = end;
    }
  });
  return (paint, x, y) => {
    for (const [dx, dy, w, color] of runs) paint(x + dx, y + dy, w, 1, color);
  };
}

function painter(context, x, y, colors) {
  return (dx, dy, w, h, color) => {
    context.fillStyle = colors[color] ?? color;
    context.fillRect(x + dx, y + dy, w, h);
  };
}

const portraitFace = stamp([
  '........iiiiiiii', '.....iiiddddhhhhiii', '....iddhhhhhdddddhhi',
  '...idhhhhdddhhhhhdddi', '..idhhhdddhhhddddddddi', '.idhhdddhhddssssssdddi',
  '.idddddddsssffffffsddi', '.iddddddssffbbbbfffsdi', 'iddddddsssffbbbbfffbsi',
  'iddddddsffffbbbbfffbfi', 'idddddssffdddfffbbddfi', '.iddddssffnniiffbnniii',
  '.idssdsfffniibffbniibi', '.isssdsffffbbfffbffbfi', '..isfdsmsfffffffbbfffi',
  '...isdsfffffffssfbbfsi', '....iddsffffffffffbsi', '.....iddssfffddmffsii',
  '......iddssfffffbsii', '........issssfffsii', '.........isssssii',
]);
const portraitCoat = stamp([
  '............iiiiiiii', '.........iiiccgggccccii', '.......iiaaccggggccaaacii',
  '.....iiaaccccagggaaccccaci', '...iiaaaaccccaagaacccccacci',
  '..iaaacaaacccccgaccccaaaccci', '.iaaccccaaccccagccccacccccci',
  'iaaccccccaaccaggcccacccccccci', 'iaccccccccaaccgcccaccccccccci',
  'iccccccccccaacgcccacccccccccci', 'icccccccccccccgcccccccccccccci',
]);
const forelock = stamp([
  '..........iii', '......iiiihhiiiii', '....iihhhhhhddddii', '..iidhhhhddddhhhdii',
  '.idhhddddhhdddddddi', 'idhdddhhhhddddd..di', '.idddhhdddddd....si',
  '..idhdddddi......s', '..iddddi.........', '...iddi', '...idi',
]);
const postCap = stamp([
  '.......iiiiiiiiii', '....iiiggggggggggii', '..iigggggggggggggggi', '.igggnnnggggggggggggi',
  'igggggggggggggggeeeggi', 'iggggggggggggggggegggi', '.idddddddddddddddddddii',
  '.idddhhddddddddddddddddi', '..iddiiiiiiiiiiiiiiiii',
]);
const tiedBand = stamp([
  '..iiiii', '.igggggi...iiiiiiiiii', '.iagggggiiiggggggggggii', '..igggiigggggggggggeggi',
  '..iggiiggggeeeegggggggii', '.iggiiggggggggggggggggi', 'iggi.iigggggggggiiiiii',
  '.ii....iiiiiiiii',
]);
const seaCap = stamp([
  '.....iiiiiiiiiiiii', '..iiigggggggggggggiii', '.iggggnnnnnggggggggggi',
  'iggggnnnnnnnnnngggggggi', '.iggggggggggggggggggggi', '..icccccccceeecccccccciii',
  '..iccaaaaaaaeaccccccccccci', '...iiiiiiiiiiiiiiiiiiiiii',
]);
const hood = stamp([
  '........iiiiiiii', '.....iiiaaaaaaaaiii', '...iiaaaaaccccccccci', '..iaaaacccccccccccccii',
  '.iaaaccccaaaaacccccccci', '.iaacccaaaccccaaaaaccci', 'iaacccaaiiiiiiiccccaaci',
  'iacccaai.......iicccaaci', 'iacccai..........icccaci', 'icccai............iccaci',
  'icccai............iccaci', 'icccai.............iccci', 'icccci.............iccci',
  'icccci.............iccci', '.iccci.............iccci', '.iccci.............iccci',
  '..iccci.............icci', '..icccci...........icci', '...icccci.........icci',
]);
const beard = stamp([
  'iihhhi.........ihhii', 'ihhnhhi.......ihnhhi', '.ihhhhhhiiiiiihhhhhi',
  '..ihhhhnnhhhhhnnhhi', '...ihnnhhdddhhhnhhi', '...ihhhhhhhhhhnnhi', '....ihhnnhhhhhnhi',
  '.....ihhhnnhhnhi', '......ihhhhnhhi', '.......ihhhhhi', '.........iii',
]);
const star = stamp(['..e', '.eee', 'eegee', '.eee', '..e']);
const lenses = stamp(['.ddddd.ddddd', 'dgggggdgggggd', 'dgngggdgngggd', '.ddddd.ddddd']);
const letter = stamp(['iiiiiii','innnnni','itnnnti','intttni','innngni','iiiiiii']);

function portraitDetails(p, style) {
  if (style === 'post') {
    postCap(p, 4, 2);
    // Quill badge and a smile for the post carrier.
    p(20,5,3,1,'e'); p(19,6,3,1,'e'); p(18,7,3,1,'e'); p(18,8,1,1,'e');
    p(18,20,3,1,'m'); p(21,19,1,1,'m'); p(17,21,4,1,'f');
    p(4,16,3,6,'d'); p(5,17,2,4,'h'); p(5,22,4,2,'g'); p(6,24,2,2,'d');
    p(21,27,3,5,'t'); p(24,25,2,3,'e'); letter(p, 22, 28);
  } else if (style === 'cap') {
    seaCap(p, 4, 3);
    p(16,6,3,1,'c'); p(17,5,1,4,'c'); p(15,8,5,1,'c');
    p(12,20,4,2,'d'); p(15,19,4,2,'d'); p(19,20,3,1,'d'); p(22,19,2,2,'d');
    p(12,21,3,1,'h'); p(16,19,2,1,'h');
    p(5,28,6,3,'e'); p(6,30,1,2,'t'); p(9,30,1,2,'t');
  } else if (style === 'hood' || style === 'veil') {
    hood(p, 3, 3);
    if (style === 'veil') {p(5,7,3,12,'g'); p(6,6,3,3,'g'); p(8,5,8,3,'g'); p(16,6,5,2,'g'); star(p, 17, 6);}
    else {p(6,26,3,3,'g'); star(p, 11, 26);}
  } else if (style === 'beard') {
    p(11,6,12,5,'f'); p(13,5,8,2,'b'); p(10,8,14,3,'b'); p(9,12,6,2,'h'); p(20,12,5,2,'h');
    beard(p, 7, 18); p(3,23,2,9,'t'); p(2,20,4,4,'g'); p(3,20,2,2,'e');
  } else {
    forelock(p, 5, 2);
    if (style === 'goggle') {
      p(5,9,22,3,'t'); lenses(p, 11, 8); p(3,18,3,3,'h');
      p(5,27,3,5,'t'); p(6,28,2,2,'e');
      p(16,14,3,1,'d'); p(16,18,1,1,'s'); p(13,18,1,1,'s'); p(24,18,1,1,'s');
    } else if (style === 'bun') {
      p(2,5,6,6,'i'); p(1,7,8,3,'d'); p(3,5,4,3,'h'); p(1,8,6,2,'g');
      p(2,4,2,3,'e'); p(6,23,2,3,'g'); p(20,27,2,5,'e');
    } else if (style === 'band' || style === 'wrap') {
      tiedBand(p, 2, 5); p(5,25,3,7,style === 'band'?'e':'g');
      if (style === 'band') {
        p(23,25,3,7,'e'); p(8,29,16,3,'g'); p(6,28,2,2,'t');
        p(14,14,4,1,'d'); p(13,15,2,1,'d'); p(16,16,4,1,'s'); p(22,16,2,1,'s');
        p(15,20,2,1,'m'); p(17,21,4,1,'m'); p(21,20,2,1,'m');
      } else {p(3,8,4,3,'g'); p(2,10,2,4,'g'); p(5,9,2,1,'e');}
    } else if (style === 'curls') {
      p(4,8,5,7,'d'); p(3,10,4,3,'h'); p(6,14,3,6,'d'); p(5,19,3,2,'h');
      // Open lenses leave eyes and face visible.
      p(12,15,7,1,'g'); p(12,16,1,3,'g'); p(18,16,1,3,'g'); p(13,19,5,1,'g');
      p(19,16,2,1,'g'); p(21,15,5,1,'g'); p(21,16,1,3,'g'); p(25,16,1,3,'g'); p(22,19,3,1,'g');
      star(p, 6, 26);
    } else if (style === 'tuft') {
      p(10,1,5,3,'d'); p(12,0,3,2,'h'); p(8,3,5,3,'h');
      p(6,25,8,3,'g'); p(10,28,5,4,'g');
    } else if (style === 'wave') {
      p(3,14,4,8,'d'); p(4,17,2,3,'h'); p(5,21,4,5,'d'); p(7,23,2,2,'g');
      p(10,25,12,2,'g'); p(17,27,4,4,'g');
    } else {
      // The traveler's coral scarf turns outward at the left shoulder.
      p(10,9,4,2,'d'); p(10,11,2,2,'d'); p(9,12,2,1,'d');
      p(18,20,3,1,'m'); p(21,19,1,1,'m'); p(17,21,4,1,'f');
      p(4,24,8,2,'g'); p(7,25,12,3,'g'); p(11,25,5,1,'e');
      p(8,28,4,3,'g'); p(6,30,4,2,'g'); p(21,28,2,4,'t');
      p(23,26,2,2,'e'); p(22,29,1,1,'e');
    }
  }
}

export function drawCharacterPortrait(canvas, identity='hero', avatar=0) {
  canvas.width = canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  const colors = palettes[characterId(identity, avatar)], p = painter(ctx, 0, 0, colors);
  p(0,0,32,32,'#1a3543');
  p(1,1,30,30,'#2c5058'); p(2,8,27,18,'#3b6365'); p(4,4,23,23,'#3b6365');
  p(7,2,17,25,'#3b6365'); p(1,27,30,4,'#28484e');
  p(2,3,2,1,'#83a297'); p(3,2,1,3,'#83a297'); p(28,20,2,1,'#83a297');
  portraitCoat(p, 1, 22); portraitFace(p, 4, 3);
  portraitDetails(p, colors.style);
}

const mapHair = stamp(['.....iiiii','...iihhhhdi','..ihhhddhhdi','.idhhhddddddi',
  '.iddhhdddddhi','.idddssssssdi','..iddffffffdi','..idfbbbbbfsii','..issffffffsi',
  '...isfffbbfsi','....issfffsi','.....iissii']);
const mapCoat = stamp(['....iiiiiii','..iicgggggcii','.iaacccggcccci','.iaccacccgcccai',
  '.isccacccgcccsi','.ifccacccgcccfi','..iiaccccgccii','...iccccttttci','...icccctetcci','....iiiiiiiii']);

function mapHeadwear(p, style, front) {
  if (style === 'post' || style === 'cap') {
    p(4,1,7,1,'i'); p(2,2,11,2,'i'); p(3,2,9,2,'g'); p(2,4,12,2,'g');
    p(3,4,4,1,style === 'cap'?'n':'e'); p(2,6,13,1,'i');
    if (front) {p(7,6,8,1,'d'); p(10,4,2,1,'e');}
  } else if (style === 'band' || style === 'wrap') {
    p(2,4,11,2,'g'); p(2,5,4,1,'e'); p(0,5,3,2,'g'); p(0,7,2,1,'g');
  } else if (style === 'bun' || style === 'wave') {
    p(0,4,4,4,'d'); p(0,4,3,1,'h'); p(1,7,3,1,'g'); if (style === 'wave') p(2,8,2,4,'d');
  } else if (style === 'hood' || style === 'veil') {
    p(4,1,8,2,'i'); p(3,2,10,3,'c'); p(4,2,7,2,style === 'veil'?'g':'a');
    p(1,4,3,7,'c'); p(2,5,1,4,'a'); p(13,4,2,7,'c');
    if (front) p(4,4,8,2,'a');
  } else if (style === 'goggle') {
    p(2,4,12,2,'t'); p(4,3,4,3,'i'); p(9,3,4,3,'i'); p(5,4,2,1,'g'); p(10,4,2,1,'g');
  } else if (style === 'beard') {
    p(5,2,6,2,'f'); p(6,2,3,1,'b');
    if (front) {p(4,10,8,2,'h'); p(6,12,5,3,'h'); p(8,14,2,2,'h'); p(6,11,4,1,'n');}
  } else if (style === 'curls') {
    p(1,5,3,5,'d'); p(2,5,2,2,'h'); if (front) {p(5,8,3,1,'g'); p(10,8,3,1,'g');}
  } else if (style === 'tuft') {p(6,0,3,3,'h'); p(4,2,4,2,'d');}
  else {p(4,1,4,2,'d'); p(6,1,4,1,'h');}
}

function drawGear(p, gear) {
  if (gear.head) {p(3,0,11,2,'g'); p(3,-1,2,2,'e'); p(7,-2,2,3,'e'); p(12,-1,2,2,'e');}
  const armor = gear.armor ?? gear.shield;
  if (armor?.endsWith('-armor')) {
    const mail = armor === 'rpg-mail-armor';
    p(3,14,10,3,mail?'#839bab':'#6c8d72'); p(5,16,7,3,mail?'#a9c5c8':'#abc18a');
    p(4,14,4,1,mail?'#d4e2d7':'#d3d59d'); p(8,18,4,1,mail?'#677f96':'#587561');
  } else if (gear.shield) {
    p(-1,14,6,6,'i'); p(0,15,4,5,'e'); p(1,16,3,3,'a'); p(1,20,2,1,'e');
  }
  if (!gear.weapon) return;
  if (gear.weapon === 'rainbow-oath' || gear.weapon.endsWith('-sword')) {
    const copper = gear.weapon === 'rpg-copper-sword';
    p(15,7,2,12,copper?'#c49467':'#9abdc9'); p(16,6,1,11,copper?'#f1ce85':'#ebf0dc');
    if (gear.weapon === 'rainbow-oath') {p(14,11,1,6,'#b7a3d1'); p(15,6,1,4,'#9ed2c0');}
    p(13,18,6,2,'t'); p(14,18,4,1,'e'); p(15,20,2,3,'d');
  } else {p(15,9,2,13,'t'); p(15,8,2,2,'e'); p(16,10,1,3,'h');}
}

export function drawWalkingCharacter(ctx, x, y, identity='hero', direction=0, frame=0, equipment={}, avatar=0) {
  const colors = palettes[characterId(identity, avatar)], style = colors.style;
  const p = painter(ctx, x, y, colors);
  p(2,22,12,2,'#233f4655');
  const left = frame === 1 ? -1 : 0, right = frame === 2 ? -1 : 0;
  p(4,19+left,3,4,'i'); p(4,22+left,4,2,'d'); p(3,23+left,4,1,'t');
  p(9,19+right,3,4,'i'); p(9,22+right,4,2,'d'); p(10,23+right,4,1,'t');
  // Walk animation shifts the boots, leaving the face at a readable, steady height.
  mapCoat(p,0,11); mapHair(p,0,1);
  if (direction === 2) {
    p(3,6,10,5,'d'); p(4,6,7,2,'h'); p(4,10,8,2,'d'); p(4,14,7,5,'t'); p(5,15,5,1,'e');
  } else {
    if (direction === 0) {p(5,8,1,2,'i'); p(10,8,1,2,'i');}
    else {const leftward = direction === 1; p(leftward?3:12,8,2,2,'b'); p(leftward?4:11,8,1,2,'i'); p(leftward?9:3,7,4,4,'d');}
    if (style === 'post') {p(10,13,2,2,'t'); p(8,15,3,2,'t'); p(4,17,5,4,'t'); p(5,18,3,2,'n');}
    else if (style === 'band') {p(4,14,2,4,'g'); p(10,14,2,4,'g'); p(4,17,8,4,'g');}
    else if (style === 'beard') {p(14,12,2,10,'t'); p(14,11,2,2,'e');}
  }
  mapHeadwear(p, style, direction !== 2);
  drawGear(p, equipment);
}
