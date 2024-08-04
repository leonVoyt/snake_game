import { Sprite, Texture } from "pixi.js";
import TheSnake from "./TheSnake";

const BLOCKSIZE = 32;

/**
 * Body
 * @class Body
 */
export default class SnakePart extends Sprite {
  ox: number;
  oy: number;
  i: number;
  j: number;
  ts: TheSnake;
  next: SnakePart;

  constructor(ts: TheSnake, texture: Texture = ts.ptex) {
    super(texture);
    this.ts = ts;
    this.init();
  }

  /**
   * Init class components
   * @method init
   */
  init() {
    this.scale.set(0.25);
    this.anchor.set(0.5);
  }

  /**
   * Set snake position from input matrix position
   */
  setPosition(i: number, j: number) {
    this.i = i;
    this.j = j;
    this.oy = this.y = i * BLOCKSIZE + BLOCKSIZE * 0.5;
    this.ox = this.x = j * BLOCKSIZE + BLOCKSIZE * 0.5;
  }

  update(etime: number) {
    let dx = this.next.ox - this.ox;
    let dy = this.next.oy - this.oy;

    if (Math.abs(dx) > BLOCKSIZE * 10) {
      if (dx > 0) {
        dx -= BLOCKSIZE * 20;
      } else {
        dx += BLOCKSIZE * 20;
      }
    }

    if (Math.abs(dy) > BLOCKSIZE * 10) {
      if (dy > 0) {
        dy -= BLOCKSIZE * 20;
      } else {
        dy += BLOCKSIZE * 20;
      }
    }

    this.x = this.ox + (etime / this.ts.stepDuration) * dx;
    this.y = this.oy + (etime / this.ts.stepDuration) * dy;

    this.rotation += 0.1;
  }

  applyNext() {
    if (this.next) {
      const newI = this.next.i;
      const newJ = this.next.j;
      this.setPosition(newI, newJ);
    }
  }

  reset() {
    this.rotation = Math.random() * 2 * Math.PI;
  }
}
