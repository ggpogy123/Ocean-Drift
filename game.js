const canvas = document.getElementById('gameCanvas');
const ctx= canvas.getContext('2d');

const startScreen=document.getElementById('startScreen');
const gameOverScreen=document.getElementById('gameOverScreen')
const finalScoreEl=document.getElementById('finalScore')
const highScoreE1=document.getElementById('highScoreDisplay');
const startBtn=document.getElementById('startBtn');
const restartBtn=document.getElementById('restartBtn');

// Ai CODE 
const audioCtx=new (window.AudioContext||window.webkitAudioContext)();
let musicOsc=null;
let musicGain=null;
document.addEventListener('click',()=>{if(audioCtx.state==='suspended')audioCtx.resume();});
document.addEventListener('keydown',()=>{if(audioCtx.state==='suspended')audioCtx.resume();});

function playCollect(){
const o=audioCtx.createOscillator();
const g=audioCtx.createGain();
o.connect(g);g.connect(audioCtx.destination);
o.frequency.setValueAtTime(520,audioCtx.currentTime);
o.frequency.exponentialRampToValueAtTime(1040,audioCtx.currentTime+0.12);
g.gain.setValueAtTime(0.3,audioCtx.currentTime);
g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.25);
o.start();o.stop(audioCtx.currentTime+0.25);
}

function playHit(){
const o=audioCtx.createOscillator();
const g=audioCtx.createGain();
o.connect(g);g.connect(audioCtx.destination);
o.type='sine';
o.frequency.setValueAtTime(200,audioCtx.currentTime);
o.frequency.exponentialRampToValueAtTime(50,audioCtx.currentTime+0.3);
g.gain.setValueAtTime(0.6,audioCtx.currentTime);
g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.3);
o.start();o.stop(audioCtx.currentTime+0.3);
}

function playSpeedUp(){
const o=audioCtx.createOscillator();
const g=audioCtx.createGain();
o.connect(g);g.connect(audioCtx.destination);
o.type='triangle';
o.frequency.setValueAtTime(300,audioCtx.currentTime);
o.frequency.exponentialRampToValueAtTime(600,audioCtx.currentTime+0.3);
g.gain.setValueAtTime(0.2,audioCtx.currentTime);
g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.3);
o.start();o.stop(audioCtx.currentTime+0.3);
}

function startMusic(){
if(musicOsc)return;
const notes=[55,82,110,165,220];
let noteIdx=0;
function playMelody(){
if(!musicOsc)return;
const o=audioCtx.createOscillator();
const g=audioCtx.createGain();
o.type='sine';
o.frequency.value=notes[noteIdx%notes.length];
noteIdx++;
g.gain.setValueAtTime(0.04,audioCtx.currentTime);
g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.8);
o.connect(g);g.connect(audioCtx.destination);
o.start();o.stop(audioCtx.currentTime+0.8);
setTimeout(playMelody,600);
}
musicOsc=audioCtx.createOscillator();
musicGain=audioCtx.createGain();
musicOsc.type='sine';
musicOsc.frequency.value=55;
musicGain.gain.value=0.03;
musicOsc.connect(musicGain);musicGain.connect(audioCtx.destination);
musicOsc.start();
playMelody();
}

function stopMusic(){
if(musicOsc){musicOsc.stop();musicOsc=null;musicGain=null;}
}
const bestScoreValueE1=document.getElementById('bestScoreValue')

function resize() {
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight
}

resize();
window.addEventListener('resize', resize);

const C= {
    deep:    '#021b3d',
    mid:     '#04306b',
    bright:  '#0a5fba',
    surface: '#1a8fc1',
    foam:    '#7dd8f8',
    foamLt:  '#c8efff',
    sand:    '#f0c060',
    coral:   '#ff6b5e',
    white:   '#ffffff',

};

let state= 'start';
let score =0;
let highScore= parseInt(localStorage.getItem('oceanDriftHS') || '0', 10);
let speedMult=1;
let frameCount=0;
let spawnTimer=0;
let spawnInterval=90;
let lastTime=0;
let animId=null;
let fish = null;
let fishSpawnTimer=0;
let trail=[];

const keys= {};
window.addEventListener('keydown', e=>{
    keys[e.code]=true;
    if (e.code==='Space' && state === 'start') startGame();
    if (e.code==='Space' && state === 'dead') startGame();
    if(['ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) e.preventDefault();

});

window.addEventListener('keyup', e=> { keys[e.code]=false;});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

const TURTLE={
    x:0 , y:0,
    w:64, h:44,
    speed:5,
    invincible:0,

};

function resetTurtle(){
    TURTLE.x=70;
    TURTLE.y=canvas.height/2- TURTLE.h/2;
}

let obstacles=[]
 
const OBSTACLE_TYPES = {
  bag: {
    emoji:  '🛍️',
    label:  'plastic bag',
    w: 36, h: 36,
    baseSpeed: 4.5,
    speedVar:  1.0,
    scoreW: 1,
  },
  shark: {
    emoji:  '🦈',
    label:  'shark',
    w: 72, h: 42,
    baseSpeed: 3.2,
    speedVar:  0.6,
    scoreW: 1,
  },
  net: {
    emoji:  '🕸️',
    label:  'fishing net',
    w: 110, h: 90,
    baseSpeed: 1.8,
    speedVar:  0.4,
    scoreW: 1,
  },
};

const OBS_KEYS= Object.keys(OBSTACLE_TYPES);
function spawnObstacle(){
    const type=OBS_KEYS[Math.floor(Math.random()*OBS_KEYS.length)];
    const def= OBSTACLE_TYPES[type];

    const margin =30;
    const y = margin + Math.random()*(canvas.height-def.h-margin*2);
    const speed= (def.baseSpeed+ (Math.random()-0.5) * def.speedVar*2)*speedMult;
    obstacles.push({type,x:canvas.width+20, y, w:def.w, h:def.h, speed, emoji:def.emoji});

}

function spawnFish(){
    fish={
        x:canvas.width+20,
        y:60+Math.random()*(canvas.height-120),
        w:40,h:40,
        speed:2+Math.random()*1.5,
    };
}
function updateFish(){
    fishSpawnTimer++;
    if(!fish && fishSpawnTimer>300+Math.random()*300){
        fishSpawnTimer=0;
        spawnFish();
    }
    if(!fish) return;
    fish.x-=fish.speed;
    if(fish.x+fish.w<0){fish=null; return;}
    const fh={x:fish.x+8,y:fish.y+8,w:24,h:24};
    const th =getHitbox(TURTLE);
    if(rectsOverlap(fh,th)){
        score+=50;
        fish=null;
        playCollect();
    }
}

function drawFish(){
    if(!fish) return;
    ctx.save();
    ctx.font='32px serif';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.scale(-1,1);
    ctx.fillText('🐟', -(fish.x + fish.w / 2), fish.y + fish.h / 2);
    ctx.restore();
}

let bubbles=[];
const MAX_BUBBLES=55;
function initBubbles(){
    bubbles=[]
    for(let i=0; i<MAX_BUBBLES;i++){
        bubbles.push(makeBubble(true));
    }
}

function makeBubble(randomY=false){
    const r=2+Math.random()*7;
    return{
        x: Math.random()*canvas.width,
        y:randomY?Math.random()*canvas.height: canvas.height+r,
        r,
        speed:0.3+Math.random()*0.8,
        drift: (Math.random()-0.5)*0.4,
        opacity: 0.08 +Math.random()*0.22,
        wobble: Math.random()*Math.PI*2,
    };
}

function drawOcean(){
    const W= canvas.width, H=canvas.height;

    const grad=ctx.createLinearGradient(0,0,0,H);
    grad.addColorStop(0, '#010e22');
    grad.addColorStop(0.35, '#021b3d');
    grad.addColorStop(0.7, '#04306b');
    grad.addColorStop(1, '#062a5a');
    ctx.fillStyle=grad;
    ctx.fillRect(0,0,W,H);

    ctx.save();
    ctx.globalAlpha=0.04;
    for(let i=0; i<6;i++){
        const cx =W * (i/5);
        const rayGrad= ctx.createRadialGradient(cx,-40,0,cx,H*0.6,H*0.7);
        rayGrad.addColorStop(0,C.foam);
        rayGrad.addColorStop(1,'transparent');
        ctx.fillStyle=rayGrad;
        ctx.beginPath();
        ctx.moveTo(cx-60,-40);
        ctx.lineTo(cx+60,-40);
        ctx.lineTo(cx+200,H);
        ctx.lineTo(cx-200,H);
        ctx.closePath();
        ctx.fill();
        
    }
    ctx.restore();

    const seabed=ctx.createLinearGradient(0,H-60,0,H);
    seabed.addColorStop(0, 'rgba(2,10,30,0)');
    seabed.addColorStop(1,'rgba(1,6,18,0.7)');
    ctx.fillStyle=seabed;
    ctx.fillRect(0,H-60,W,60);


}

function drawBubbles(){
    bubbles.forEach(b=>{
        ctx.save();
        ctx.globalAlpha=b.opacity;
        ctx.strokeStyle=C.foamLt;
        ctx.lineWidth=1;
        ctx.beginPath();
        ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
        ctx.stroke();

        ctx.globalAlpha=b.opacity*0.6;
        ctx.fillStyle=C.white;
        ctx.beginPath();
        ctx.arc(b.x-b.r*0.3, b.y-b.r*0.3, b.r*0.3,0,Math.PI*2);
        ctx.fill();
        ctx.restore();

    }
    );
}

function updateBubbles(){
    bubbles.forEach(b=>{
        b.wobble+=0.03;
        b.x+=Math.sin(b.wobble)*b.drift;
        b.y-=b.speed;
        if(b.y+b.r<0){
            b.x=Math.random()*canvas.width;
            b.y=canvas.height+b.r;
            b.opacity=0.08+Math.random()*0.22;
        }
        
    });
}

function drawTurtle(){
    const{x,y,w,h}=TURTLE;
    const bobY=Math.sin(frameCount*0.05)*3;

    ctx.save();
    ctx.font=`${Math.max(w,h)}px serif`;
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.shadowColor='rgba(10,95,186,0.5)';
    ctx.shadowBlur=14;
    
    ctx.scale(-1,1);


    ctx.fillText('🐢', -(x + w / 2), y + h / 2 + bobY);
    ctx.restore();

    const DEBUG_HITBOX=false;
    if(DEBUG_HITBOX){
        const hb=getHitbox(TURTLE);
        ctx.strokeStyle='lime';
        ctx.lineWidth=1;
        ctx.strokeRect(hb.x,hb.y,hb.w,hb.h);
    }
}

function drawObstacles(){
    obstacles.forEach(o=>{
        ctx.save();
        ctx.font=`${Math.max(o.w, o.h) * 0.9}px serif`;
        ctx.textAlign='center';
        ctx.textBaseline='middle';
        ctx.shadowColor='rgba(0,0,0,0.4)';
        ctx.shadowBlur=8;
        ctx.fillText(o.emoji,o.x+o.w/2,o.y+o.h/2);
        ctx.restore();
    });
}

function drawHUD(){
    const pad=20;
    ctx.save();
    ctx.font='bold 22px "Courier New", monospace';
    ctx.fillStyle=C.foamLt;
    ctx.shadowColor=C.foam;
    ctx.shadowBlur=12;
    ctx.textAlign='right';
    ctx.textBaseline='top';
    ctx.fillText(`SCORE ${score}`, canvas.width-pad, pad);
    ctx.font='13px "Courier New", monospace'
    ctx.fillStyle=C.foam;
    ctx.shadowBlur=6;
    ctx.fillText(`SPEED x${speedMult.toFixed(1)}`, canvas.width-pad, pad+30);
    ctx.font='11px "Courier New",monospace';
    ctx.fillStyle=C.sand;
    ctx.shadowBlur=6;
    ctx.fillText(`BEST ${highScore}`, canvas.width-pad, pad+52);
    ctx.restore();
}


function getHitbox(obj){
    const shrink=0.35;
    return{
        x:obj.x+obj.w*shrink,
        y:obj.y+obj.h*shrink,
        w:obj.w*(1-shrink*2),
        h:obj.h*(1-shrink*2),
    };
}

function rectsOverlap(a,b){
    return a.x<b.x+b.w &&
    a.x+a.w>b.x &&
    a.y <b.y+b.h&&
    a.y+a.h>b.y;
}

function startGame(){
    score=0;
    frameCount=0;
    speedMult=1;
    spawnInterval=90;
    spawnTimer=0;
    fish=null;
    fishSpawnTimer=0;
    trail=[]
    obstacles=[];
    resetTurtle();
    initBubbles();
    showScreen(null);
    state='playing';
    if(animId) cancelAnimationFrame(animId);
    lastTime=performance.now();
    stopMusic();
    startMusic();
    animId=requestAnimationFrame(loop);
}

function gameOver(){
    state='dead';
    playHit();
    stopMusic();
    finalScoreEl.textContent=score;
    bestScoreValueE1.textContent=highScore;
    if(score>highScore){
        highScore=score;
        localStorage.setItem('oceanDriftHS', highScore);
        highScoreE1.style.display='block';
    } else {
        highScoreE1.style.display='none';
    }
    showScreen('gameOverScreen');
}

function showScreen(id){
    startScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');
    if(id) document.getElementById(id).classList.add('active');
}

showScreen('startScreen');
function updateTrail(){
    trail.push({x:TURTLE.x, y:TURTLE.y+TURTLE.h/2,age:0});
    if(trail.length>12)trail.shift();
    trail.forEach(t =>t.age++);
}


function drawTrail(){
    const visibility=Math.min((speedMult-1)/1.5, 1);
    if(visibility <= 0) return;
    trail.forEach((t,i)=>{
        const alpha=(1-t.age/12)*0.35*visibility;
        const size=20*(1-t.age/12);
        if(alpha<= 0 || size<=0) return;
        ctx.save();
        ctx.globalAlpha=alpha;
        ctx.font=`${size}px serif`;
        ctx.textAlign='center';
        ctx.textBaseline='middle';
        ctx.scale(-1,1);
        ctx.fillText('🐢', -(t.x+32), t.y+22);
        ctx.restore();
    });
}

function loop(now){
    if(state!=='playing') return;

    const dt=Math.min((now-lastTime)/1000,0.05);
    lastTime=now;
    frameCount++;
    const prevSpeed=speedMult;
    speedMult=1+Math.floor(frameCount/480)*0.15;
    if(speedMult>prevSpeed) playSpeedUp();
    if (frameCount%480===0&& spawnInterval>30) spawnInterval-=5;
    score=Math.floor(frameCount/6);
    const turtleSpeed = TURTLE.speed * (1 + speedMult * 0.1);
    if (keys['ArrowUp']   || keys['KeyW']) TURTLE.y -= turtleSpeed;
    if (keys['ArrowDown'] || keys['KeyS']) TURTLE.y += turtleSpeed;
    TURTLE.y=Math.max(0,Math.min(canvas.height-TURTLE.h,TURTLE.y));

    spawnTimer++;
    if(spawnTimer>=spawnInterval){
        spawnTimer=0;
        spawnObstacle();
        if (Math.random()<0.25){
            setTimeout(() => {
                if (state==='playing') spawnObstacle();
            }, 500);
        }
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    o.x -= o.speed * speedMult;
    if (o.x + o.w < -20) { obstacles.splice(i, 1); continue; }


    const th=getHitbox(TURTLE);
    const oh=getHitbox(o);
    if (rectsOverlap(th,oh)){
        gameOver();
        return;
    }


}

updateBubbles();
ctx.clearRect(0,0, canvas.width, canvas.height);
drawOcean();
drawBubbles();
updateFish();
drawObstacles();
drawFish();
updateTrail();
drawTrail();
drawTurtle();
drawHUD();
animId=requestAnimationFrame(loop);
}

function idlePaint(){
    if(state!=='start'&& state!=='dead') return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawOcean();
    if(bubbles.length===0) initBubbles();
    updateBubbles();
    drawBubbles();
    requestAnimationFrame(idlePaint);
}

initBubbles();
idlePaint();