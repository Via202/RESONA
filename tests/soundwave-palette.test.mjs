import test from 'node:test';
import assert from 'node:assert/strict';
import { environments } from '../js/environments.js';
import { languages } from '../js/languages.js';

test('Soundwave recolors all layers on the first frame after every environment switch', () => {
  const strokes = [];
  const ctx = {
    save() {}, restore() {}, rect() {}, clip() {}, fillRect() {},
    strokeRect(...box) { strokes.push({ box, color: this.strokeStyle, width: this.lineWidth }); },
    beginPath() { this.points = []; },
    moveTo(x, y) { this.points.push([x, y]); },
    lineTo(x, y) { this.points.push([x, y]); },
    stroke() { strokes.push({ color: this.strokeStyle, width: this.lineWidth, points: this.points }); }
  };
  const frame = {
    ctx, w: 1000, h: 400, t: 1, controls: { hueShift: 0, chaos: .4, distortion: .4 },
    signal: { bass: .7, mid: .5, high: .3, level: .6 },
    point: (x, y) => ({ x, y }), reduced: false
  };
  const hue = color => Number(/^hsla\(([^,]+)/.exec(color)[1]);
  let original;
  for (const preset of [...Object.values(environments), environments.underwater]) {
    strokes.length = 0;
    languages.glitch({ ...frame, preset });
    const [border, ...waves] = strokes.slice(0, 6);
    assert.equal(hue(border.color), preset.hue + 42);
    assert.deepEqual(waves.map(wave => hue(wave.color)), [0, 42, 0, 42, 0].map(n => preset.hue + n));
    assert.equal(hue(ctx.shadowColor), preset.hue);
    assert.ok(border.width < waves.at(-1).width);
    assert.deepEqual(border.box.map(Math.round), [90, 56, 820, 276]);
    const geometry = waves.map(({ points, width }) => ({ points, width }));
    original ??= geometry;
    assert.deepEqual(geometry, original);
  }
});
