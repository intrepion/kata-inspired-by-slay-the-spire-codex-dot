export type CardKind = 'cut'|'ward'|'flare'|'read'|'bash'|'surge'|'bastion'|'focus'|'siphon'|'sweep';
export interface Card { id:number; kind:CardKind; upgraded:boolean }
export interface CardRule { name:string; cost:number; type:'Attack'|'Skill'|'Power'; target:boolean; damage?:number; block?:number; draw?:number; weak?:number; strength?:number; heal?:number; energy?:number; exhaust?:boolean; all?:boolean; glyph:string }
export const RULES:Record<CardKind,CardRule> = {
 cut:{name:'Copper Edge',cost:1,type:'Attack',target:true,damage:6,glyph:'⟋'},
 ward:{name:'Folded Shield',cost:1,type:'Skill',target:false,block:5,glyph:'◇'},
 flare:{name:'Last Light',cost:2,type:'Attack',target:true,damage:14,exhaust:true,glyph:'✦'},
 read:{name:'Read the Wind',cost:0,type:'Skill',target:false,draw:2,exhaust:true,glyph:'≋'},
 bash:{name:'Dimming Blow',cost:1,type:'Attack',target:true,damage:4,weak:2,glyph:'☾'},
 surge:{name:'Borrowed Dawn',cost:0,type:'Skill',target:false,energy:2,exhaust:true,glyph:'☀'},
 bastion:{name:'Stone Promise',cost:2,type:'Skill',target:false,block:14,glyph:'▱'},
 focus:{name:'Inner Furnace',cost:1,type:'Power',target:false,strength:2,glyph:'△'},
 siphon:{name:'Warmth Thief',cost:1,type:'Attack',target:true,damage:7,heal:3,exhaust:true,glyph:'❖'},
 sweep:{name:'Horizon Arc',cost:1,type:'Attack',target:false,damage:5,all:true,glyph:'⌒'}
};
export function rule(card:Card):CardRule {
 const r={...RULES[card.kind]};
 if(card.upgraded){if(r.damage)r.damage+=3;if(r.block)r.block+=3;if(r.draw)r.draw++;if(r.weak)r.weak++;if(r.strength)r.strength++;if(r.heal)r.heal+=2;if(r.energy)r.energy++;}
 return r;
}
export function description(c:Card):string {
 const r=rule(c); return [r.damage?`Deal ${r.damage} damage${r.all?' to ALL foes':''}.`:'',r.block?`Gain ${r.block} Block.`:'',r.draw?`Draw ${r.draw}.`:'',r.weak?`Apply ${r.weak} Weak.`:'',r.strength?`Gain ${r.strength} Strength this combat.`:'',r.heal?`Heal ${r.heal} HP.`:'',r.energy?`Gain ${r.energy} energy.`:'',r.exhaust?'Exhaust.':'',r.type==='Power'?'Removed for this combat.':''].filter(Boolean).join(' ');
}
export interface Intent {type:'attack'|'guard'|'grow';amount:number;hits?:number}
export interface Enemy {id:number;name:string;hp:number;maxHp:number;block:number;weak:number;strength:number;pattern:Intent[];step:number;shape:'moth'|'sentinel'|'keeper'}
export interface Combat {turn:number;energy:number;block:number;strength:number;draw:Card[];hand:Card[];discard:Card[];exhaust:Card[];powers:Card[];enemies:Enemy[];elite:boolean;boss:boolean}
export type NodeType='fight'|'elite'|'event'|'rest'|'boss';
export interface MapNode {id:string;tier:number;lane:number;type:NodeType;name:string}
export type Phase='map'|'combat'|'reward'|'rest'|'event'|'won'|'lost';
export interface Run {version:1;seed:number;rng:number;phase:Phase;hp:number;maxHp:number;deck:Card[];nextId:number;embers:string[];tier:number;lane:number;path:string[];combat:Combat|null;rewards:CardKind[];log:string[]}
export const SAVE_KEY='lantern-ascent:v1:run';
export const MAP:MapNode[]=[
 ...['Moss Gate','Broken Steps','Low Lanterns'].map((name,lane)=>({id:`0-${lane}`,tier:0,lane,type:'fight' as const,name})),
 {id:'1-0',tier:1,lane:0,type:'event',name:'The Brass Archivist'},{id:'1-1',tier:1,lane:1,type:'fight',name:'Gale Crossing'},{id:'1-2',tier:1,lane:2,type:'event',name:'The Brass Archivist'},
 {id:'2-0',tier:2,lane:0,type:'fight',name:'Twin Shadows'},{id:'2-1',tier:2,lane:1,type:'elite',name:'Iron Orchard'},{id:'2-2',tier:2,lane:2,type:'fight',name:'Twin Shadows'},
 {id:'3-0',tier:3,lane:0,type:'fight',name:'High Pass'},{id:'3-1',tier:3,lane:1,type:'fight',name:'Hollow Bridge'},{id:'3-2',tier:3,lane:2,type:'fight',name:'Cloud Stair'},
 {id:'4-0',tier:4,lane:0,type:'rest',name:'Quiet Hearth'},{id:'4-1',tier:4,lane:1,type:'rest',name:'Quiet Hearth'},{id:'4-2',tier:4,lane:2,type:'rest',name:'Quiet Hearth'},
 {id:'5-1',tier:5,lane:1,type:'boss',name:'The Beacon Keeper'}
];
function note(s:Run,line:string){s.log=[line,...s.log].slice(0,8);}
function random(s:Run){s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;}
function shuffle<T>(s:Run,items:T[]):T[]{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function card(s:Run,kind:CardKind):Card{return {id:s.nextId++,kind,upgraded:false};}
export function newRun(seed=2718):Run {
 const s:Run={version:1,seed:seed>>>0,rng:seed>>>0,phase:'map',hp:64,maxHp:64,deck:[],nextId:1,embers:['Hearth Coal'],tier:-1,lane:1,path:[],combat:null,rewards:[],log:['A small light. A long way up.']};
 for(const kind of ['cut','cut','cut','cut','ward','ward','ward','ward','flare','read'] as CardKind[])s.deck.push(card(s,kind));return s;
}
export function legalNodes(s:Run):MapNode[]{return s.phase==='map'?MAP.filter(n=>n.tier===s.tier+1&&(s.tier===-1||Math.abs(n.lane-s.lane)<=1)):[];}
function enemy(id:number,name:string,hp:number,shape:Enemy['shape'],pattern:Intent[]):Enemy{return {id,name,hp,maxHp:hp,shape,pattern,step:0,block:0,weak:0,strength:0};}
export function intent(e:Enemy):Intent {const i=e.pattern[e.step%e.pattern.length];return {...i,amount:i.type==='attack'?Math.floor((i.amount+e.strength)*(e.weak>0?0.75:1)):i.amount};}
export function draw(s:Run,count:number){const c=s.combat;if(!c)return;for(let i=0;i<count&&c.hand.length<10;i++){if(!c.draw.length){c.draw=shuffle(s,c.discard);c.discard=[];}const next=c.draw.pop();if(!next)break;c.hand.push(next);}}
function begin(s:Run,n:MapNode){
 const boss=n.type==='boss',elite=n.type==='elite';
 const foes=boss?[enemy(1,'Beacon Keeper',84,'keeper',[{type:'attack',amount:12},{type:'guard',amount:15},{type:'attack',amount:8,hits:2},{type:'grow',amount:3}])]:elite?[enemy(1,'Orchard Warden',54,'sentinel',[{type:'attack',amount:11},{type:'grow',amount:2},{type:'attack',amount:7,hits:2}])]:n.tier===0?[enemy(1,'Ashwing',24,'moth',[{type:'attack',amount:7},{type:'guard',amount:6},{type:'attack',amount:10}])]:[enemy(1,'Gale Husk',23+n.tier*2,'sentinel',[{type:'attack',amount:7},{type:'guard',amount:7},{type:'attack',amount:9}]),enemy(2,'Cinder Moth',16+n.tier,'moth',[{type:'guard',amount:4},{type:'attack',amount:5},{type:'attack',amount:7}])];
 s.combat={turn:1,energy:3+(s.embers.includes('Storm Lens')?1:0),block:s.embers.includes('Brass Feather')?3:0,strength:0,draw:shuffle(s,s.deck.map(c=>({...c}))),hand:[],discard:[],exhaust:[],powers:[],enemies:foes,elite,boss};s.phase='combat';draw(s,5);note(s,`${n.name}: read the enemy intents before committing.`);
}
export function chooseNode(s:Run,id:string):boolean{const n=legalNodes(s).find(x=>x.id===id);if(!n)return false;s.tier=n.tier;s.lane=n.lane;s.path.push(n.id);if(n.type==='rest'||n.type==='event'){s.phase=n.type;note(s,n.name);}else begin(s,n);return true;}
function damage(target:{hp:number;block:number},amount:number){const absorbed=Math.min(target.block,amount);target.block-=absorbed;target.hp=Math.max(0,target.hp-(amount-absorbed));}
function finish(s:Run){const c=s.combat;if(!c||c.enemies.some(e=>e.hp>0))return;if(c.boss){s.phase='won';note(s,'The beacon is lit. Your expedition is complete.');return;}
 s.hp=Math.min(s.maxHp,s.hp+4);if(c.elite&&!s.embers.includes('Storm Lens')){s.embers.push('Storm Lens');note(s,'Storm Lens: +1 energy on the first turn of each combat.');}
 s.rewards=shuffle(s,['bash','surge','bastion','focus','siphon','sweep','read','flare'] as CardKind[]).slice(0,3);s.phase='reward';note(s,'Victory. Hearth Coal restores 4 HP. Choose a card or keep the deck lean.');
}
export function play(s:Run,id:number,targetId?:number):boolean {
 const c=s.combat;if(s.phase!=='combat'||!c)return false;const index=c.hand.findIndex(x=>x.id===id);if(index<0)return false;const picked=c.hand[index],r=rule(picked);const target=c.enemies.find(e=>e.id===targetId&&e.hp>0);if(c.energy<r.cost||(r.target&&!target))return false;
 c.energy-=r.cost;c.hand.splice(index,1);if(r.type==='Power')c.powers.push(picked);else if(r.exhaust)c.exhaust.push(picked);else c.discard.push(picked);
 if(r.damage){for(const e of r.all?c.enemies.filter(e=>e.hp>0):target?[target]:[])damage(e,r.damage+c.strength);}
 if(r.weak&&target&&target.hp>0)target.weak+=r.weak;if(r.block)c.block+=r.block;if(r.strength)c.strength+=r.strength;if(r.energy)c.energy+=r.energy;if(r.heal)s.hp=Math.min(s.maxHp,s.hp+r.heal);if(r.draw)draw(s,r.draw);
 note(s,`${r.name}${target?` → ${target.name}`:''}.`);finish(s);return true;
}
export function endTurn(s:Run):boolean {
 const c=s.combat;if(s.phase!=='combat'||!c)return false;c.discard.push(...c.hand);c.hand=[];
 for(const e of c.enemies){if(e.hp<=0)continue;e.block=0;const i=intent(e);if(i.type==='attack'){for(let h=0;h<(i.hits??1);h++){const t={hp:s.hp,block:c.block};damage(t,i.amount);s.hp=t.hp;c.block=t.block;}note(s,`${e.name} attacks for ${i.amount}${i.hits?` × ${i.hits}`:''}.`);}else if(i.type==='guard'){e.block=i.amount;note(s,`${e.name} gains ${i.amount} Block.`);}else{e.strength+=i.amount;note(s,`${e.name} gains ${i.amount} Strength.`);}e.weak=Math.max(0,e.weak-1);e.step++;if(s.hp<=0){s.phase='lost';note(s,'Your lantern goes dark. Begin a new expedition.');return true;}}
 c.turn++;c.block=0;c.energy=3;draw(s,5);return true;
}
export function takeReward(s:Run,kind:CardKind|null):boolean {if(s.phase!=='reward'||(kind!==null&&!s.rewards.includes(kind)))return false;if(kind)s.deck.push(card(s,kind));s.rewards=[];s.combat=null;s.phase='map';return true;}
export function rest(s:Run,id:number|null):boolean {if(s.phase!=='rest')return false;if(id===null){s.hp=Math.min(s.maxHp,s.hp+Math.floor(s.maxHp*0.3));note(s,'Rested: recovered up to 19 HP.');}else{const c=s.deck.find(c=>c.id===id&&!c.upgraded);if(!c)return false;c.upgraded=true;note(s,`Upgraded ${rule(c).name}.`);}s.phase='map';return true;}
export function event(s:Run,id:number|null):boolean{if(s.phase!=='event')return false;if(id===null){if(!s.embers.includes('Brass Feather'))s.embers.push('Brass Feather');note(s,'Brass Feather: begin each combat with 3 Block.');}else{const i=s.deck.findIndex(c=>c.id===id);if(i<0||s.deck.length<=5)return false;note(s,`The Archivist removes ${rule(s.deck[i]).name}.`);s.deck.splice(i,1);}s.phase='map';return true;}
export function serialize(s:Run){return JSON.stringify(s);}
export function restore(raw:string|null):Run|null {
 if(!raw)return null;try{const s:unknown=JSON.parse(raw);if(!s||typeof s!=='object')return null;const r=s as Run;
 const validCard=(c:Card)=>c&&Number.isInteger(c.id)&&c.id>0&&c.kind in RULES&&typeof c.upgraded==='boolean';
 if(r.version!==1||!['map','combat','reward','rest','event','won','lost'].includes(r.phase)||!Number.isInteger(r.seed)||!Number.isInteger(r.rng)||!Number.isFinite(r.hp)||r.hp<0||r.hp>64||r.maxHp!==64||!Array.isArray(r.deck)||r.deck.length<5||!r.deck.every(validCard)||new Set(r.deck.map(c=>c.id)).size!==r.deck.length||!Number.isInteger(r.nextId)||r.nextId<=Math.max(...r.deck.map(c=>c.id))||!Number.isInteger(r.tier)||r.tier< -1||r.tier>5||!Number.isInteger(r.lane)||r.lane<0||r.lane>2||!Array.isArray(r.path)||!r.path.every(id=>MAP.some(n=>n.id===id))||!Array.isArray(r.embers)||!r.embers.every(e=>['Hearth Coal','Storm Lens','Brass Feather'].includes(e))||!Array.isArray(r.log)||!r.log.every(x=>typeof x==='string')||!Array.isArray(r.rewards)||!r.rewards.every(k=>k in RULES))return null;
 if(r.phase==='combat'||r.phase==='won'||r.phase==='lost'){
 const c=r.combat;if(!c||![c.hand,c.draw,c.discard,c.exhaust,c.powers].every(a=>Array.isArray(a)&&a.every(validCard))||!Number.isInteger(c.turn)||c.turn<1||!Number.isFinite(c.energy)||c.energy<0||!Number.isFinite(c.block)||c.block<0||!Number.isFinite(c.strength)||!Array.isArray(c.enemies)||!c.enemies.length||!c.enemies.every(e=>Number.isFinite(e.hp)&&e.hp>=0&&e.hp<=e.maxHp&&Number.isFinite(e.block)&&Number.isFinite(e.weak)&&Number.isFinite(e.strength)&&Number.isInteger(e.step)&&e.step>=0&&typeof e.name==='string'&&['moth','sentinel','keeper'].includes(e.shape)&&Array.isArray(e.pattern)&&e.pattern.length>0&&e.pattern.every(i=>['attack','guard','grow'].includes(i.type)&&Number.isFinite(i.amount)&&i.amount>=0&&(i.hits===undefined||Number.isInteger(i.hits)&&i.hits>0&&i.hits<10))))return null;
 }
 return r;}catch{return null;}
}
