const assert = require('node:assert/strict');
const {createHCStory} = require('../story-state.js');
let time = 0, id = 0;
const queue = new Map();
const clock = {
  now: () => time,
  schedule: (f, ms) => { queue.set(++id, {f, t: time + ms}); return id; },
  cancel: id => queue.delete(id)
};
function advanceTo(until) {
  assert.ok(until >= time, 'The test clock must move forwards');
  while (true) {
    const next = [...queue].filter(([, x]) => x.t <= until).sort((a, b) => a[1].t - b[1].t)[0];
    if (!next) break;
    time = next[1].t;
    queue.delete(next[0]);
    next[1].f();
  }
  time = until;
}
const story = createHCStory(clock);
story.start();
// Absolute presentation times, including the boundary immediately before each change.
// Business timestamps displayed in the UI are independent of elapsed milliseconds.
const phases = [
  [0, 1, 0, 0], [1999, 1, 0, 0], [2000, 2, 0, 0],
  [3999, 2, 0, 0], [4000, 3, 0, 0], [5999, 3, 0, 0],
  [6000, 3, 1, 0], [6499, 3, 1, 0], [6500, 4, 1, 0],
  [8999, 4, 1, 0], [9000, 5, 1, 0], [11999, 5, 1, 0],
  [12000, 6, 1, 1], [16999, 6, 1, 1], [17000, 6, 1, 2],
  [25999, 6, 1, 2], [26000, 6, 1, 3], [29999, 6, 1, 3],
  [30000, 6, 1, 4], [33999, 6, 1, 4], [34000, 6, 1, 5],
  [38999, 6, 1, 5], [39000, 6, 1, 6]
];
for (const [t, optical, energy, qwen] of phases) {
  advanceTo(t);
  const actual = story.get();
  assert.deepEqual([actual.optical, actual.energy, actual.qwen], [optical, energy, qwen], `at ${t}ms`);
  if (qwen < 6) assert.equal(story.complete('qwen'), false, 'An unfinished upgrade cannot be confirmed');
}
assert.equal(story.complete('qwen'), true);
assert.equal(story.get().qwen, 9);
assert.equal(story.get().qwenClosedAt, 39000);
assert.equal(story.complete('qwen'), false);
assert.equal(story.complete('optical'), true);
assert.equal(story.get().optical, 7);
assert.equal(story.complete('optical'), false);
advanceTo(39519); assert.equal(story.get().optical, 7);
advanceTo(39520); assert.equal(story.get().optical, 8);
advanceTo(40039); assert.equal(story.get().optical, 8);
advanceTo(40040); assert.equal(story.get().optical, 9);
assert.equal(story.get().opticalClosedAt, 40040);
assert.equal('ds' in story.get(), false);
story.start();
advanceTo(time + 1000);
story.start();
const restarted = time;
advanceTo(restarted + 1000); assert.equal(story.get().optical, 1);
advanceTo(restarted + 2000); assert.equal(story.get().optical, 2);
advanceTo(restarted + 12000);
assert.equal(story.get().optical, 6);
assert.equal(story.get().qwen, 1);
assert.equal(story.complete('optical'), true);
story.reset();
advanceTo(time + 2000);
assert.equal(story.get().optical, 0);
assert.equal(story.get().qwen, 0);
assert.equal(queue.size, 0, 'Reset cancels story progression and completion timers');
console.log('PASS: 23 phase boundaries, completion guards, closure timestamps, idempotency and restart/reset cancellation');
