export function activationChance(integrity) {
  const i=Math.max(0,Math.min(100,integrity));return i>=80?1:i>=30?.1+.9*(i-30)/50:i/300;
}
export function cargoDamage(sample, acceleration, impactSpeed, dt, suspension=100) {
  if(dt<=0)return 0;
  const alpha=1-Math.exp(-dt*4),f=sample.filtered;
  for(let i=0;i<3;i++)f[i]+=(acceleration[i]-f[i])*alpha;
  const vibration=Math.max(0,Math.hypot(f[1],f[0]*.8)-5)*(1+(100-suspension)/100);
  const braking=Math.max(0,-f[2]-6);
  const collision=Math.max(0,impactSpeed-3.5)*.65;
  return Math.min(9*dt,(vibration*vibration*.025+braking*braking*.035)*dt+collision);
}
