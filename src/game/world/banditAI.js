import { AMBUSH_RULES as R } from '../../data/road.js';

// IA pura dos saqueadores (sem Three.js). Coordenadas no plano XZ; a frente do Titã é -Z local e a direita é +X local.
export const SLOT_LATERAL=5.2;      // distância lateral em que cada saqueador acompanha o Titã
export const SLOT_CLOSE=3.7;        // distância lateral quando já está quase agarrado
export const SLOT_BACK=[1.5,1.5,6,6,10,10];
export const B_RADIUS=1.15;
export const TRUCK_HALF_W=1.5;
export const TRUCK_HALF_L=4.6;
export const GRAB_TIME=3;           // segundos colado ao Titã até conseguir saquear
export const ACCEL=7.5;
export const LEAVE_SECONDS=7;
export const WRECK_SECONDS=5;

const norm=(x,z)=>{const l=Math.hypot(x,z)||1;return [x/l,z/l];};
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));

// Eixos do Titã projetados no plano XZ a partir do quaternion e da velocidade.
export function truckFrame(pos,q,vel,driving=true){
  const [fx,fz]=norm(-2*(q.x*q.z+q.w*q.y),-(1-2*(q.x*q.x+q.y*q.y)));
  const [rx,rz]=norm(1-2*(q.y*q.y+q.z*q.z),2*(q.x*q.z-q.w*q.y));
  return {x:pos.x,z:pos.z,vx:vel.x,vz:vel.z,speed:Math.hypot(vel.x,vel.z),fx,fz,rx,rz,driving};
}

export function makeGroup(ambush,roadXFn){
  const bandits=[];
  for(let i=0;i<ambush.bandits;i++){
    const side=i%2?1:-1,z=ambush.z-(i>>1)*12-(i%2)*5,x=roadXFn(z)+side*(12+(i>>1)*3);
    bandits.push({x,z,vx:0,vz:0,heading:side>0?-Math.PI/2:Math.PI/2,state:'wait',slot:{side,back:SLOT_BACK[i]},grab:0,timer:0,roll:0,spin:0,leaveX:0,leaveZ:0});
  }
  return {id:ambush.id,ambush,phase:'wait',bandits,max:ambush.speed,giveUp:ambush.giveUp,traveled:0,far:0,clock:0,leaveTimer:0,outcome:null};
}

const minDist=(g,t)=>Math.min(...g.bandits.map(b=>Math.hypot(b.x-t.x,b.z-t.z)));

function face(b,dt){
  if(Math.hypot(b.vx,b.vz)<.8)return;
  b.heading+=wrap(Math.atan2(b.vx,b.vz)-b.heading)*Math.min(1,dt*6);
}
function accelerate(b,vx,vz,dt){
  const ax=vx-b.vx,az=vz-b.vz,m=Math.hypot(ax,az),max=ACCEL*dt;
  if(m>max){b.vx+=ax/m*max;b.vz+=az/m*max;}else{b.vx=vx;b.vz=vz;}
  b.x+=b.vx*dt;b.z+=b.vz*dt;face(b,dt);
}
// Persegue a "vaga" ao lado do Titã: velocidade do Titã + correção proporcional à distância, limitada à velocidade do bando.
function steer(b,g,t,dt){
  const closeness=Math.min(1,b.grab/GRAB_TIME),lat=b.slot.side*(SLOT_LATERAL-(SLOT_LATERAL-SLOT_CLOSE)*closeness),lon=-b.slot.back;
  const tx=t.x+t.rx*lat+t.fx*lon,tz=t.z+t.rz*lat+t.fz*lon,dx=tx-b.x,dz=tz-b.z;
  let vx=t.vx+dx*1.6,vz=t.vz+dz*1.6;const m=Math.hypot(vx,vz);if(m>g.max){vx*=g.max/m;vz*=g.max/m;}
  accelerate(b,vx,vz,dt);
  return Math.hypot(tx-b.x,tz-b.z);
}
function pushOut(b,t,lat){
  const target=Math.sign(lat||b.slot.side)*(TRUCK_HALF_W+B_RADIUS+.1),delta=target-lat;b.x+=t.rx*delta;b.z+=t.rz*delta;
}
function wreck(b,t,lat){
  const s=Math.sign(lat||1);b.state='wrecked';b.timer=0;b.grab=0;b.vx=t.vx*.5+t.rx*s*6;b.vz=t.vz*.5+t.rz*s*6;b.spin=s*3.2;
}
function stepWreck(b,dt){
  b.timer+=dt;const k=Math.exp(-dt*1.2);b.vx*=k;b.vz*=k;b.x+=b.vx*dt;b.z+=b.vz*dt;
  b.heading+=b.spin*dt*Math.max(0,1-b.timer/2);b.roll=Math.min(1.4,b.roll+dt*3);
}
function leave(b,dt){
  accelerate(b,b.leaveX*14,b.leaveZ*14,dt);
}
function finish(g,type,t,ev){
  g.phase='leaving';g.leaveTimer=0;g.outcome=type;
  for(const b of g.bandits){
    if(b.state!=='chase')continue;
    const lat=(b.x-t.x)*t.rx+(b.z-t.z)*t.rz,s=Math.sign(lat||b.slot.side),[dx,dz]=norm(t.rx*s+t.fx*.25,t.rz*s+t.fz*.25);
    b.state='leave';b.leaveX=dx;b.leaveZ=dz;b.grab=0;
  }
  ev.push({type,id:g.id,steal:g.ambush.steal});
}

// Avança um bando. Devolve eventos: chase, ram, robbed, cleared, gaveup, outran, despawn, done.
export function stepGroup(g,t,dt){
  const ev=[];
  if(g.phase==='wait'){
    const d=minDist(g,t);
    if(t.driving&&d<=R.triggerRadius){g.phase='chase';g.clock=0;g.traveled=0;g.far=0;for(const b of g.bandits)b.state='chase';ev.push({type:'chase',id:g.id});}
    else if(d>=R.despawnRadius)ev.push({type:'despawn',id:g.id});
    return ev;
  }
  if(g.phase==='chase'){
    g.clock+=dt;g.traveled+=t.speed*dt;
    let alive=0,robbed=false,allFar=true;
    g.bandits.forEach((b,i)=>{
      if(b.state==='wrecked'){stepWreck(b,dt);return;}
      if(b.state!=='chase')return;
      alive++;
      const dist=steer(b,g,t,dt),rx=b.x-t.x,rz=b.z-t.z,lat=rx*t.rx+rz*t.rz,along=rx*t.fx+rz*t.fz;
      if(Math.abs(lat)<TRUCK_HALF_W+B_RADIUS&&Math.abs(along)<TRUCK_HALF_L+B_RADIUS){
        if(t.speed>=R.ramMinSpeed){wreck(b,t,lat);alive--;ev.push({type:'ram',id:g.id,index:i,reward:g.ambush.reward});return;}
        pushOut(b,t,lat);
      }
      if(dist<2.3&&g.clock>=R.graceSeconds)b.grab=Math.min(GRAB_TIME,b.grab+dt);else b.grab=Math.max(0,b.grab-dt*1.5);
      if(b.grab>=GRAB_TIME)robbed=true;
      if(Math.hypot(rx,rz)<=R.outrunDistance)allFar=false;
    });
    g.far=allFar&&alive>0?g.far+dt:Math.max(0,g.far-dt*2);
    if(robbed)finish(g,'robbed',t,ev);
    else if(alive===0)finish(g,'cleared',t,ev);
    else if(g.traveled>=g.giveUp)finish(g,'gaveup',t,ev);
    else if(g.far>=R.outrunSeconds)finish(g,'outran',t,ev);
    return ev;
  }
  if(g.phase==='leaving'){
    g.leaveTimer+=dt;
    for(const b of g.bandits){if(b.state==='wrecked')stepWreck(b,dt);else if(b.state==='leave')leave(b,dt);}
    if(g.leaveTimer>=LEAVE_SECONDS){g.phase='done';ev.push({type:'done',id:g.id});}
  }
  return ev;
}

export function groupInfo(g,t){
  const alive=g.bandits.filter(b=>b.state==='chase'||b.state==='leave'||b.state==='wait').length;
  const grab=Math.max(0,...g.bandits.map(b=>b.grab))/GRAB_TIME;
  return {id:g.id,phase:g.phase,alive,total:g.bandits.length,remaining:Math.max(0,Math.round(g.giveUp-g.traveled)),grab,nearest:Math.round(minDist(g,t)),outcome:g.outcome};
}
