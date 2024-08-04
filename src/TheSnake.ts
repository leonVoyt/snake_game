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
  isWalls: boolean;
  isGamePaused: boolean;
  walls: SnakePart[];

  dirmap: number[][] = [
    [-1, 0], // Up
    [0, 1], // Right
    [1, 0], // Down
    [0, -1], // Left
  ];

  constructor() {
    super();
    this.stepDuration = STEP_DURATION;
    this.walls = [];
    this.init();
  }

  init() {
    this.ptex = Texture.from("assets/Part.png");
    this.plist = [];
    this.cursorHead = new SnakePart(this);
  }

  addHead() {
    const lastPart = this.plist[this.plist.length - 1];
    const newHead = new SnakePart(this);

    // Place new head where the current tail is
    newHead.setPosition(lastPart.i, lastPart.j);
    this.addChildAt(newHead, 0);

    // Update the linked list
    lastPart.next = newHead;
    newHead.next = this.cursorHead;

    // Update the parts list
    this.plist.push(newHead);

    // Shift the cursor head
    this.shiftCursorHead();

    // Adjust step duration if the snake is moving fast
    if (this.isFast) {
      this.stepDuration = this.stepDuration - this.stepDuration / 10;
    }
  }

  addTail() {
    const lastPart = this.plist[this.plist.length - 1];
    const newPart = new SnakePart(this, this.ptex);

    newPart.setPosition(lastPart.i, lastPart.j);
    lastPart.next = newPart;
    this.plist.push(newPart);
    this.addChild(newPart);
  }

  update(delta: number) {
    if (this.isGamePaused) return;

    const dtime = delta / 60;
    this.etime += dtime;

    this.plist.forEach((it) => {
      it.update(this.etime);
    });

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

    for (const wall of this.walls) {
      if (hi == wall.i && hj == wall.j) return true;
    }

    return false;
  }

  reset() {
    this.etime = 0;
    this.plist.forEach((it) => {
      this.removeChild(it);
    });
    this.plist.splice(0);

    this.currentDir = 1;

    for (let i = 0; i < DEFAULT_TOTAL; i++) {
      const part = new SnakePart(
        this,
        i === 0 ? Texture.from("assets/snakeHead.png") : this.ptex
      );
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

    this.walls.forEach((wall) => {
      this.removeChild(wall);
    });
    this.walls = [];
  }

  placeRandomWall() {
    const rj = Math.floor(Math.random() * 20);
    const ri = Math.floor(Math.random() * 20);

    const wallTexture = Texture.from("assets/stop.png");
    const wall = new SnakePart(this, wallTexture);

    wall.width = 32;
    wall.height = 32;

    wall.setPosition(ri, rj);
    this.addChild(wall);
    this.walls.push(wall);
  }

  onEatFood() {
    this.addTail();
    this.placeRandomWall();
  }

  reverseDirection() {
    // Reverse the direction by mapping the current direction to its opposite
    this.currentDir = (this.currentDir + 2) % 4;
  }
}
