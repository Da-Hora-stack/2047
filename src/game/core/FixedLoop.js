export class FixedLoop {
  constructor(step = 1 / 60, maxSteps = 6) { this.step = step; this.maxSteps = maxSteps; this.accumulator = 0;this.totalSteps=0;this.droppedSeconds=0;this.stepsLastFrame=0; }
  advance(delta, update) {
    const elapsed=Number.isFinite(delta)?Math.max(delta,0):0,accepted=Math.min(elapsed,this.step*this.maxSteps);
    this.droppedSeconds+=elapsed-accepted;this.accumulator+=accepted;
    let steps = 0;
    while (this.accumulator + 1e-10 >= this.step && steps < this.maxSteps) {
      update(this.step); this.accumulator -= this.step; steps++;
    }
    this.stepsLastFrame=steps;this.totalSteps+=steps;return Math.max(0, this.accumulator / this.step);
  }
  reset() { this.accumulator = 0;this.stepsLastFrame=0; }
}
