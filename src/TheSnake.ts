/**
 * @author  raizensoft.com
 */

import { Container, Texture } from "pixi.js";
import SnakePart from "./SnakePart";

const DEFAULT_TOTAL = 3;
const STEP_DURATION = 0.1;

/**
 * TheSnake
 * @class TheSnake
 */
export default class TheSnake extends Container {
  plist: SnakePart[];
  ptex: Texture;
  sPart: Texture;
  etime: number;
  cursorHead: SnakePart;
  stepDuration: number;
  currentDir: number;
  isDontDie: boolean;
  isFast: boolean;
  isGamePaused: boolean;

  dirmap: number[][] = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ];

  constructor() {
    super();
    this.stepDuration = STEP_DURATION;
    this.init();
  }

  /**
   * Init class components
   * @method init
   */
  init() {
    this.ptex = Texture.from("assets/Part.png");
    this.plist = [];
    this.cursorHead = new SnakePart(this);
  }
  setDuration(val: boolean) {
    this.isFast = val;
    this.stepDuration = this.isFast ? STEP_DURATION / 1.5 : STEP_DURATION;
  }

  addHead(i: number, j: number) {
    this.plist[0].reset();
    const newHead = new SnakePart(this);
    newHead.setPosition(
      i + this.dirmap[this.currentDir][0],
      j + this.dirmap[this.currentDir][1]
    );
    this.addChildAt(newHead, this.plist.length);

    // Assign next pointer
    this.plist[0].next = newHead;
    newHead.next = this.cursorHead;
    this.plist.unshift(newHead);
    this.shiftCursorHead();
    this.stepDuration -= 0.001;
  }

  update(delta: number) {
    const dtime = delta / 60;
    this.etime += dtime;

    // Running animation
    this.plist.forEach((it) => {
      it.update(this.etime);
    });

    // Move to next step
    if (this.stepDuration - this.etime < 0.01) {
      this.etime = 0;
      for (let i = this.plist.length - 1; i > 0; i--) {
        const s = this.plist[i];
        s.applyNext();
      }
      this.plist[0].applyNext();
      this.shiftCursorHead();
    }
  }

  shiftCursorHead() {
    if (this.isGamePaused) return;

    if (this.isDontDie) {
      // don`t die
      const ci = this.cursorHead.i;
      const cj = this.cursorHead.j;

      const newI = (ci + this.dirmap[this.currentDir][0] + 20) % 20;
      const newJ = (cj + this.dirmap[this.currentDir][1] + 20) % 20;

      this.cursorHead.setPosition(newI, newJ);
    } else {
      const ci = this.cursorHead.i;
      const cj = this.cursorHead.j;
      this.cursorHead.setPosition(
        ci + this.dirmap[this.currentDir][0],
        cj + this.dirmap[this.currentDir][1]
      );
    }
  }

  selfHitTest(): boolean {
    const ROWS = 20;
    const COLUMNS = 20;
    const hi = this.plist[0].i,
      hj = this.plist[0].j;

    if (hi >= ROWS || hi < 0 || hj >= COLUMNS || hj < 0) return true;

    for (let i = 1; i < this.plist.length; i++) {
      const s = this.plist[i] as SnakePart;
      if (hi == s.i && hj == s.j) return true;
    }
    return false;
  }

  /**
   * Reset snake state
   */
  reset() {
    this.etime = 0;
    this.plist.forEach((it) => {
      this.removeChild(it);
    });
    this.plist.splice(0);

    // Reset blist
    this.currentDir = 1;

    for (let i = 0; i < DEFAULT_TOTAL; i++) {
      const part = new SnakePart(this);
      part.setPosition(0, DEFAULT_TOTAL - i - 1);
      this.plist.push(part);
      this.addChild(part);
    }
    for (let i = DEFAULT_TOTAL - 1; i > 0; i--) {
      const s = this.plist[i];
      s.next = this.plist[i - 1];
    }
    this.plist[0].next = this.cursorHead;
    this.cursorHead.setPosition(0, DEFAULT_TOTAL);
  }
}
