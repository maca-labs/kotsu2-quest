// Original encounter illustrations. The scenery and the monster occupy separate
// canvases so a hit or a victory only affects the monster.
const sprites = {
  moss: [
    '..........tt', '.....t...tlt...t', '....tlt.ttt...tlt', '.....tt.tt..tttt',
    '.......ttlttt', '......llllll', '....lllmmlllll', '...llmmmllmmmll',
    '..llmmmmmmlmmmml', '..lmhimmmiwhmmml', '.smmwiimmwiimmmls',
    '.smmmimmmmiimmmms', '.ssmmmmbbmmmmmmss', 'smmsssmmmmmmsssmmss',
    'smmmsbbsssssbbsmmms', '.sss.bggbbbggbsss',
    '.....bbg..ggbb', '....bbb....bbb'
  ],
  bat: [
    '.z.....................z', '.sz.....z......z......sz', 'slsz....sz....sz.....slz',
    'sllsz...slz..slz....sllz', 'smlmsz..sllssllz...smlmz', 'sammmszsmmmmmmms.szmmamz',
    '.sammmsmlhhhhhlmssmmamz', '..sammmsmwlmlwmmsmmamz', '...saaamsimmimsmaaaaz',
    '...samsasmrrrmsasmaz', '....sz.sswwwwss..sz', '........smwwms',
    '........smmmmms', '.......ssmmsmms', '.......gmms.smg', '........g.....g'
  ],
  boar: [
    '...........sa...s', '.......s..sma..sms', '....s.smasmmmmsmls',
    '...smssmamlmmmlmms', '..smlmmammlmmmllmss', '..slmlmhmmmlmllmlmls',
    '.smlmlmmmlmmlmmlwlms', '.smmammmmlmmmmwimmss',
    'zsmmmammmsmmmmmiimllss', 's.smmmmmsmmmsmmmaaaabs',
    '..smmmsmmmsmsmmaaabbw', '..ssmmsmmmsmsmsbbbbw', '...sssmsmmmsmsw..wh',
    '....smmssssmms.wwwh', '....smmz..smms..wh', '....smm...smm',
    '...gggz..sgggz'
  ],
  golem: [
    '...........lllggl', '.........llmmmmmlg', '........lmmmggmmmgs',
    '.......lmmmgllgmmgs', '.......smmggrrgmmgs', '.......ssmmgllgmgs',
    '........ssmmmmmmss', '...lll..llgssssgll..lll',
    '..lmmmlgmmmmggmmmmglmmml', '.lmmmmlssmmgwwgmmsslmmmml',
    '.smmmgssmmggwwggmmsgmmmms', 'lmmmgs.smmmgwwgmmms.sgmml',
    'smmms..ssmmmggmmmss..smmms', 'smmgs...ssmmmmmmss...sgmms',
    'ssggs....llgssgll....sggss', '..ss....lmmg..gmml....ss',
    '.......smmgs..sgmms', '......smmmgs..sgmmms', '......ssggss..ssggss'
  ],
  wisp: [
    '............t', '...........th', '..........tht', '......t..tldt', '......tttlllt..t',
    '.....tltllmlttth', '....tlllmmmltltt', '...tllmhmmmlllt',
    '...tlmhwwhmmllt', '..tlmhwwwwhmmltt', '.ttlmlwhwwllmmllt',
    'tlttmwimmmwihmltt', 'tt.tmiimmmiimhlt', '...tmmmmrmmmmltt',
    '....tmmlwwwllltt', '..t..tllllllltt', '.th...tttllttt..t',
    '..t......tt.....ht'
  ],
  drake: [
    '...............g....g', '.............ggg...gg', '.......g.....bggg.ggl',
    '......gl.....bbglllmml', '.....gml....llmmmlllmml', '....gmms...llmllmwiimml',
    '...gmlmms..lmlmmmmiimmlll', '..gmmlmms..smmmmmllllmmmm',
    '..smmlmams.smmmmbbgggssw', '..smlmamms.smmmmbwwsw',
    '...smasmlmlmmmlmbbss', '.....stmmllmmlmmbggs',
    'g....stmmmmmmlmmmbgs', 'gl...smmmmmlmsmmmggs',
    'sgl.smmmmlmsmmmgggs', '.sggmmmlmssmsggggs',
    '..ssmmmmsmmmmsssms', '....sssssmms...smms', '.......smmgs...smmls',
    '.......gggss..sggggs'
  ],
  book: [
    '....gg...........gg', '....gwl.........lwg', '....gmwl.......lwmg',
    '....gmwwlllllllwwmg', '.....glmmlllllmlg',
    '....smlhllmmllhlmls', '...smmhwhlmmmhwhmmls', '..smmhwiwlmmhwiwhmms',
    '..smhhwiwlmmhwiwhhms', '.smmhhhhlmggmlhhhhmms', '.smmmlmmmgwwgmmmlmms',
    'smmmmlmmmgggmmmlmmmms', 'smmmslwwwwgwwwwlsmmms', 'smms.mwwwwgwwwwm.smms',
    '.ss..mbbgwgwgbbm..ss', '.....mwwwwgwwwwm',
    '.....sggggaggggs', '......ssggaggss', '......gg..a..gg', '.....ggg..aa.ggg'
  ],
  crab: [
    '..l..l..............l..l', '.lhl.ll............ll.lhl', 'lmml.ml............lm.lmml',
    'lmmmllml..........lmllmmml', 'smmllmms....gg....smmllmms',
    '.smmlms..g.gwwg.g..smlmms', '..ssmms..mgwwwwgm..smmss', '...sms.llmlgggglmll.sms',
    '....ssllmmllllllmmlss', '...slmlhwwlmmmlwwhlmls', '..smlmmwiwlmmmlwiwmmlms',
    '.sgsmmmmimmrrmmimmmmsgs', 'sg.smmmmmmbbbbmmmmmms.gs',
    'g.slssmmmsggggsmmmssls.g', '.sg..ssmmggwwggmmss..gs', 'sg....sggsswwssggs....gs',
    'g....sgg...ss...ggs....g'
  ],
  deer: [
    '..g...g.........g...g', '.gg..gg.........gg..gg', '.ggggg....g.g....ggggg',
    '..ggggg..gg.gg..ggggg', '.....ggggg...ggggg', '...l...gg.....gg...l',
    '..lhll..llmmmll..llhl', '...lmmlllmlllmlllmml',
    '.....smmmlggglmmmms', '......smlmgwgmlms',
    '......lmwhmgmhwml', '......lmwimmmmiwml',
    '.......smmlmmlmms', '........sllhhlls', '.........sgbbgs',
    '........lmmggmml', '....llllmmmggmmml', '..llmmmmmmmmggmms', '.lmllmmmhmmlsggms',
    '.smmmmhmmmlssmms', '.ssmmmmmmss..sms', '..smssmssms..sms',
    '..sm..sm.sm..sm', '..gg..gg.gg..gg'
  ],
  owl: [
    '.....l...........l', '....lhl.........lhl', '....lwhl.......lhwl', '.....lwwlllllllwwl',
    '....llmmllllllmmll', '...lmlhhllmmllhhlml', '..lmhhwwwhllhwwwhhml',
    '..lmmhwiwhmmhwiwhmml', '.lmmhhwiwhmmhwiwhhmml', 'lmmlmhhhhmggmhhhhmlmml',
    'lmlmmmllmgwwgmllmmmlml', 'slmmmmmmsgwgsmmsmmmmls',
    '.slmmmswggggggwsmmmls', '.slmmswwwggggwwwsmmls', '..smsswwhwwwwhwwssms',
    '...ss.swwwhhwwws.ss', '......sswwwwwwss', '.......ssgwwgss',
    '.......ggg..ggg', '......ggg....ggg'
  ]
};

const ink = '#172b34';
const common = { i: '#172b34', z: '#32434c', w: '#fff3ce', h: '#eedfa3', g: '#eab86b', b: '#82544a', a: '#f38772', r: '#d8515b', t: '#539c90', d: '#aac7ac' };
const colors = {
  moss: ['#317c60', '#235446', '#80b96e'], bat: ['#89749d', '#564c76', '#c2a4bd'],
  boar: ['#a3634c', '#724a43', '#c88c5c'], golem: ['#839c96', '#506d73', '#b5c7ac'],
  wisp: ['#62b6b0', '#457982', '#9be1ce'], drake: ['#4c9b84', '#345f62', '#82b77e'],
  book: ['#52998b', '#345767', '#85bca1'], crab: ['#cc7960', '#815257', '#eba26d'],
  deer: ['#82a6a7', '#4e7584', '#b6d2bf'], owl: ['#a37a99', '#725670', '#cea7a8']
};

// Gatekeepers have stable chapter names even when a particular quest rolls a
// different underlying combat kind. Their signature materials follow the name.
const gatekeepers = {
  'しおり角のフミボウ': ['book'],
  '札はさみのカラビン': ['crab'],
  '写し紋のシルシカ': ['deer'],
  '風見のウネツノ': ['drake', ['#b37e58', '#78565b', '#e2ad71'], 'pennant'],
  '包み羽のホシフクロ': ['owl'],
  '道結びのミチヨリ': ['deer', ['#509688', '#365e67', '#8fbe98'], 'knot'],
  '帰り風のクモツバサ': ['bat', ['#83a1ba', '#5d668d', '#c8c4d0'], 'stars']
};

function stamp(ctx, rows, x, y, palette) {
  // The one-pixel ink contour also separates pale details from the sky.
  ctx.fillStyle = ink;
  rows.forEach((row, dy) => {
    for (let dx = 0; dx < row.length; dx++) {
      if (row[dx] === '.') continue;
      ctx.fillRect(x + dx - 1, y + dy, 3, 1);
      ctx.fillRect(x + dx, y + dy - 1, 1, 3);
    }
  });
  rows.forEach((row, dy) => {
    for (let dx = 0; dx < row.length; dx++) {
      const color = palette[row[dx]];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x + dx, y + dy, 1, 1);
      }
    }
  });
}

function monster(ctx, enemy, desert) {
  ctx.fillStyle = '#223b3e88';
  ctx.fillRect(10, 30, 20, 2);
  ctx.fillRect(14, 32, 12, 1);
  const [kind, variant, insignia] = gatekeepers[enemy.name] ?? [enemy.kind];
  const rows = sprites[kind] ?? sprites.moss;
  const [m, s, l] = variant ?? colors[kind] ?? colors.moss;
  const palette = { ...common, m, s, l };
  if (desert) {
    // Three sandstone masks rise from a single plated body. One central ruby
    // and the broken crown make its silhouette visible even in the dunes.
    const body = { ...common, m:'#9d645d', s:'#644656', l:'#d6936a', a:'#d4ab71' };
    stamp(ctx, [
      '....g....g....g', '...ggl..ggl..ggl.....g', '...sllggmllggmllg...gl',
      '..smmmlmmmlmmmlms..gms', '.slmmmmmmmmmmmmmlggms',
      'smmmlgggggggggmmmmmms', 'smmggmlmlmlmlmggmms', 'smmmggggggggggmms',
      '.smmms.sss.smmms', '.smms......smms', 'sgggs.....sgggs'
    ], 8, 20, body);
    stamp(ctx, ['sggms','slmls','sggms','smlms','sggms','sllms','sggms'], 15, 15, body);
    stamp(ctx, ['slls','sggms','.smlms','..sggms'], 7, 20, body);
    stamp(ctx, ['..slls','.sggms','smmms','sggms'], 24, 20, body);
    const head = ['.g....g', '.gg..gg', '.glgglg', 'lmmllmml', 'lmwrrwml', 'smwiimms', '.smbbms', '.swwwws', '..swws'];
    stamp(ctx, head, 4, 14, body);
    stamp(ctx, head, 26, 13, body);
    stamp(ctx, ['.g......g','.gl....lg','.gllggllg','..ggrrgg','lmmmllmmml','lrrlgglrrl','swiiwwiiws','smmbbbbmms','.swwbbwws','..swwwws','...swws'], 13, 6, body);
    return;
  }
  const width = Math.max(...rows.map(row => row.length));
  const x = Math.floor((40 - width) / 2);
  const y = 31 - rows.length;
  stamp(ctx, rows, x, y, palette);
  if (insignia === 'pennant') stamp(ctx, ['..gg','..gaaa','..gwwwaa','..g..aa','..g','..g'], x + 4, y + 1, palette);
  if (insignia === 'knot') stamp(ctx, ['aa..aa','.abba','.baab','.a..aa','a....a'], x + 12, y + 14, palette);
  if (insignia === 'stars') {
    for (const [dx,dy] of [[3,6],[20,6],[10,11]]) stamp(ctx, ['.g.','ghg','.g.'], x + dx, y + dy, palette);
  }
}

const terrain = {
  cave: { sky:'#294657', haze:'#446672', far:'#385766', wall:'#273e50', edge:'#182f40', ground:'#485b56', light:'#6c7d66' },
  road: { sky:'#87b4aa', haze:'#c2d4aa', far:'#839e92', wall:'#537a73', edge:'#2a5356', ground:'#5d7b5d', light:'#90a66b' },
  desert: { sky:'#a67578', haze:'#e7b689', far:'#bd8b78', wall:'#9a6969', edge:'#694d5d', ground:'#b68166', light:'#e5b47a' }
};

// Fill integer scanlines to preserve the step edges at all device pixel ratios.
function landform(ctx, points, color, bottom = 75) {
  ctx.fillStyle = color;
  for (let i = 1; i < points.length; i++) {
    const [x0,y0] = points[i-1], [x1,y1] = points[i];
    for (let x = x0; x < x1; x++) {
      const y = Math.round(y0 + (y1-y0)*(x-x0)/(x1-x0));
      ctx.fillRect(x,y,1,bottom-y);
    }
  }
}

function landscape(ctx, location) {
  const p = terrain[location];
  const rect = (x,y,w,h,c) => { ctx.fillStyle = c; ctx.fillRect(x,y,w,h); };
  rect(0,0,180,75,p.sky);
  rect(0,25,180,11,p.haze);
  const ridge = (points,c) => landform(ctx,points,c);
  const sun = (x,y,color) => {
    rect(x+4,y,6,1,color); rect(x+2,y+1,10,2,color); rect(x+1,y+3,12,2,color);
    rect(x,y+5,14,4,color); rect(x+1,y+9,12,2,color); rect(x+2,y+11,10,2,color);
    rect(x+4,y+13,6,1,color);
  };
  if (location === 'cave') {
    rect(60,0,60,45,p.haze); rect(66,0,19,44,'#527582'); rect(69,0,4,42,'#5a7980');
    ridge([[0,13],[15,28],[27,21],[42,43],[58,33],[72,47],[88,42],[111,44],[126,27],[143,40],[165,18],[180,29]],p.far);
    for (const [x,h,w] of [[3,27,8],[15,12,6],[27,19,7],[139,12,4],[147,24,7],[164,29,7],[175,37,5]]) {
      rect(x,0,w,h,p.wall); rect(x+1,h,w-2,4,p.wall); rect(x+2,h+4,1,3,p.wall);
    }
    ridge([[0,14],[9,26],[20,31],[22,47],[33,48],[48,52],[62,49],[90,51],[111,46],[143,53],[158,40],[163,28],[180,19]],p.wall);
    for (let x=0; x<180; x++) {
      const side = Math.min(x,179-x);
      const depth = Math.max(0,6-Math.floor(side/12));
      if (depth) rect(x,0,1,depth+Math.floor((1+Math.sin(x*.16))*2),p.edge);
    }
    for (const [x,y,w] of [[2,39,9],[9,41,6],[16,44,8],[151,46,10],[160,43,6],[168,37,8]]) {
      rect(x,y,w,1,p.far);rect(x+2,y-2,Math.max(2,w-4),1,p.far);
    }
  } else if (location === 'road') {
    sun(116,6,'#f1d698');
    for (const [x,y,w] of [[12,15,14],[19,13,16],[63,9,15],[72,7,10],[139,19,18]]) rect(x,y,w,2,'#cfdbc0');
    ridge([[0,36],[15,29],[30,36],[49,21],[57,26],[68,17],[89,36],[101,27],[112,32],[137,16],[153,30],[165,23],[180,34]],p.far);
    ridge([[0,42],[18,34],[31,39],[47,33],[60,40],[80,36],[93,44],[111,35],[128,39],[149,29],[166,36],[180,31]],p.wall);
    for (const [x,y,h] of [[5,23,24],[17,31,15],[30,34,13],[143,31,14],[156,21,24],[172,18,28]]) {
      for (let n=0;n<3;n++) {
        const tip=y+n*4, length=Math.round(h/2)+n;
        for (let j=0;j<length;j++) rect(x-Math.floor(j/3),tip+j,1+2*Math.floor(j/3),1,p.edge);
      }
      rect(x-1,y+10,3,h-7,p.edge);
    }
  } else {
    sun(128,7,'#ecd29c');
    ridge([[0,36],[24,31],[50,40],[74,32],[95,36],[117,25],[145,34],[169,22],[180,24]],p.far);
    ridge([[0,38],[12,35],[16,21],[21,21],[24,32],[29,29],[34,38],[48,41],[78,45],[100,38],[126,42],[152,30],[156,19],[163,21],[166,29],[180,30]],p.wall);
  }
  ridge([[0,51],[19,48],[42,55],[64,58],[92,55],[119,53],[142,56],[163,49],[180,48]],p.ground);
  for (let i=0;i<33;i++) {
    const x=(i*31+7)%180, y=60+(i*7)%14;
    rect(x,y,2+(i*5)%9,1,i%3===0?p.wall:p.light);
  }
  if (location === 'cave') {
    for (const [x,y] of [[9,54],[15,56],[23,53],[153,55],[162,53],[170,56]]) {
      rect(x,y-3,3,5,'#426f79');rect(x+1,y-5,2,6,'#78b9af');rect(x+1,y-5,1,2,'#c0debc');
    }
  }
  if (location === 'road') for (const [x,y] of [[8,54],[16,58],[162,55],[171,53]]) {
    rect(x,y,1,3,p.edge);rect(x+1,y-1,1,3,p.edge);rect(x-1,y,2,1,'#e5c58a');
  }
  if (location === 'desert') {
    for (const [x,y,w] of [[11,53,19],[26,52,9],[119,57,23],[134,56,14],[141,55,11]]) rect(x,y,w,1,p.light);
  }
}

const actionIcons = {
  attack: ['...........gg','..........gww','.........gwg','........gwg','.......gwg','...g..gwg','...gwwgg','....ggg','...bb.g','..bb...g','.gg','gg'],
  guard: ['..gggggggg','..gwwhhwwg','..ghhllhhg','..ghllllhg','..ghllllhg','...ghllhg','...ghllhg','....ghhg','.....gg'],
  skill: ['.....g.....g','.....w....g','....gwg..g','.g..gwg.g','..ggwwwg','ggwwwwwwwgg','..ggwwwg','...ggwgg','..g..wg.g','.g...g...g'],
  flee: ['......gggggg','....ggwwwwwg','...gwwwwwgg','..gwwwgggg','.gwwwgwwg','.gwwgggg','gwwggwg','gwgggg','gg.gg','g']
};

export function makeBattleActionIcon(doc, id) {
  const canvas = doc.createElement('canvas');
  canvas.width = canvas.height = 16;
  canvas.className = 'rpg-action-icon';
  canvas.setAttribute('aria-hidden','true');
  const ctx = canvas.getContext('2d');
  if (ctx && actionIcons[id]) stamp(ctx, actionIcons[id], 1, 2, { ...common, l:'#71a9a2' });
  return canvas;
}

export function makeBattleStage(doc, battle) {
  const location = battle.fieldKind === 'desert' ? 'desert' : battle.kind === 'field' ? 'road' : 'cave';
  const stage = doc.createElement('div');
  stage.className = 'rpg-enemy-stage';
  stage.setAttribute('data-battle-enemy-stage','');
  stage.setAttribute('data-battle-biome',location);
  const backdrop = doc.createElement('canvas');
  backdrop.width = 180;
  backdrop.height = 75;
  backdrop.className = 'rpg-battle-landscape';
  backdrop.setAttribute('aria-hidden','true');
  const sceneContext = backdrop.getContext('2d');
  if (sceneContext) landscape(sceneContext, location);
  stage.append(backdrop);
  if (battle.status === 'won') {
    const clear = doc.createElement('p');
    clear.className = 'rpg-enemy-gone';
    clear.textContent = '敵を退けた！';
    stage.append(clear);
  } else {
    const canvas = doc.createElement('canvas');
    canvas.width = 40;
    canvas.height = 34;
    canvas.className = 'rpg-pixel rpg-pixel-enemy';
    canvas.setAttribute('role','img');
    canvas.setAttribute('aria-label',`${battle.enemy.name}のドット絵`);
    canvas.setAttribute('data-battle-enemy','');
    const ctx = canvas.getContext('2d');
    if (ctx) monster(ctx, battle.enemy, location === 'desert');
    stage.append(canvas);
  }
  return stage;
}
