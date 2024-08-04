import { Howl } from "howler";
import { Application, TilingSprite, Texture } from "pixi.js";
import SnakePart from "./SnakePart";
import TheSnake from "./TheSnake";

const BLOCKSIZE = 32;
const APP_WIDTH = BLOCKSIZE * 20;
const APP_HEIGHT = BLOCKSIZE * 20;

/**
 * SnakeGame
 * @class Snakegame
 */
export default class Snakegame {
  pixiApp: Application;
  view: HTMLCanvasElement;
  root: HTMLDivElement;
  ts: TheSnake;
  rlist: SnakePart[];
  isGameOver: boolean;
  gameText: HTMLDivElement;
  scoreCount: number;
  bestScoreCount: number;
  soundHit: Howl;
  soundGameOver: Howl;

  constructor(root: HTMLDivElement) {
    this.root = root;
    this.init();
  }

  /**
   * Init class components
   * @method init
   */
  private init() {
    const papp = (this.pixiApp = new Application({
      width: APP_WIDTH,
      height: APP_HEIGHT,
      backgroundColor: 0x1111111,
      antialias: true,
    }));
    this.view = papp.view;
    this.root.appendChild(this.view);

    this.initComponents();
    this.initKeyboard();

    // Start rendering
    papp.ticker.add(this.update.bind(this));

    // Start new game
    this.newGame();
  }

  private initKeyboard() {
    document.body.addEventListener("keydown", (e) => {
      const ts = this.ts;

      switch (e.key) {
        case "ArrowUp":
          if (ts.currentDir !== 2) ts.currentDir = 0;
          break;
        case "ArrowRight":
          if (ts.currentDir !== 3) ts.currentDir = 1;
          break;
        case "ArrowDown":
          if (ts.currentDir !== 0) ts.currentDir = 2;
          break;
        case "ArrowLeft":
          if (ts.currentDir !== 1) ts.currentDir = 3;
          break;
      }
    });
    document.addEventListener("DOMContentLoaded", (event) => {
      const playButton = document.getElementById(
        "play-button"
      ) as HTMLDivElement;

      playButton.addEventListener("click", () => {
        if (this.ts.isGamePaused) {
          this.ts.isGamePaused = false;
          if (this.root.contains(this.gameText))
            this.root.removeChild(this.gameText);
          this.setGameMode();
          return this.setMenu();
        }

        this.newGame();
      });
    });
    document.addEventListener("DOMContentLoaded", (event) => {
      const menuButton = document.getElementById(
        "menu-button"
      ) as HTMLDivElement;

      menuButton.addEventListener("click", () => {
        this.setGamePause();
        this.setMenu();
      });
    });
    document.addEventListener("DOMContentLoaded", (event) => {
      const exitButton = document.getElementById(
        "exit-button"
      ) as HTMLDivElement;

      exitButton.addEventListener("click", () => {
        this.ts.isGamePaused = false;
        this.setGameOver();
      });
    });
  }

  private initComponents() {
    const stage = this.pixiApp.stage;
    const grid = new TilingSprite(
      Texture.from("assets/Grid.png"),
      APP_WIDTH,
      APP_HEIGHT
    );
    grid.tileScale.set(BLOCKSIZE / 128);
    stage.addChild(grid);

    // Load sound
    this.soundHit = new Howl({
      src: ["assets/ButtonSound.mp3"],
    });
    this.soundGameOver = new Howl({
      src: ["assets/GameOver.mp3"],
    });

    // Construct the snake
    const ts = (this.ts = new TheSnake());
    stage.addChild(ts);

    // Initial part list
    this.rlist = [];

    // Init game text
    this.gameText = document.createElement("div");
    this.gameText.className = "game-text";
    this.root.appendChild(this.gameText);
  }
  setGamePause() {
    this.ts.isGamePaused = true;
    this.gameText.innerHTML = `
  <h1>Game Paused</h1>
`;

    this.root.appendChild(this.gameText);
  }
  setMenu() {
    const optionsDiv = document.querySelector(".options") as HTMLDivElement;
    if (optionsDiv) {
      optionsDiv.style.display =
        this.isGameOver || this.ts.isGamePaused ? "flex" : "none";
    }
    const buttonsDivs = document.querySelectorAll(
      ".buttons__menu"
    ) as NodeListOf<HTMLDivElement>;

    buttonsDivs.forEach((buttonsDiv) => {
      buttonsDiv.style.display =
        this.isGameOver || this.ts.isGamePaused ? "inline" : "none";
    });
    const buttonsGame = document.querySelector(
      ".buttons__game"
    ) as HTMLDivElement;
    buttonsGame.style.display =
      !this.ts.isGamePaused && !this.isGameOver ? "flex" : "none";
  }
  getCurrentScore() {
    const scoreCurrent: HTMLDivElement = document.getElementById(
      "score-current"
    ) as HTMLDivElement;

    if (this.scoreCount > this.bestScoreCount) {
      const bestScore: HTMLDivElement = document.getElementById(
        "best-current"
      ) as HTMLDivElement;
      localStorage.setItem("bestScore", this.scoreCount.toString());
      this.bestScoreCount = this.scoreCount;
      bestScore.innerHTML = this.bestScoreCount.toString();
    }
    scoreCurrent.innerHTML = this.scoreCount.toString();
  }
  getMaxScore() {
    const bestScoreFromStorage = localStorage.getItem("bestScore") || 0;
    const bestScore: HTMLDivElement = document.getElementById(
      "best-current"
    ) as HTMLDivElement;

    this.bestScoreCount = +bestScoreFromStorage;
    bestScore.innerHTML = this.bestScoreCount.toString();
  }
  setGameMode() {
    const checkboxes =
      document.querySelectorAll<HTMLInputElement>(".game-option");
    let selectOption: string = "";

    const selectedCheckbox = Array.from(checkboxes).find(
      (checkbox) => checkbox.checked
    );

    if (selectedCheckbox) {
      const selectedOptionText =
        selectedCheckbox.parentElement?.textContent?.trim() ?? "Unknown option";

      switch (selectedOptionText) {
        case "Classic":
          this.ts.isFast = false;
          this.ts.isWalls = false;
          this.ts.isDontDie = false;
          break;
        case "Speed":
          this.ts.isFast = true;
          this.ts.isWalls = false;
          this.ts.isDontDie = false;
          break;
        case "No Die":
          this.ts.isFast = false;
          this.ts.isWalls = false;
          this.ts.isDontDie = true;
          break;
        case "Walls":
          this.ts.isFast = false;
          this.ts.isDontDie = false;
          this.ts.isWalls = true;
          break;
        default:
          return null;
      }
    }
    return;
  }
  /**
   * Start a new game
   */
  newGame() {
    this.isGameOver = false;
    this.ts.isGamePaused = false;
    this.scoreCount = 0;
    this.getCurrentScore();
    this.setMenu();
    this.setGameMode();
    this.getMaxScore();
    if (this.root.contains(this.gameText)) this.root.removeChild(this.gameText);

    document.addEventListener("DOMContentLoaded", () => {
      const checkboxes =
        document.querySelectorAll<HTMLInputElement>(".game-option");

      checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
          const isChecked = Array.from(checkboxes).some((cb) => cb.checked);

          if (!isChecked) {
            checkbox.checked = true;
          }

          if (checkbox.checked) {
            checkboxes.forEach((otherCheckbox) => {
              if (otherCheckbox !== checkbox) {
                otherCheckbox.checked = false;
              }
            });
          }
        });
      });

      const isAnyChecked = Array.from(checkboxes).some((cb) => cb.checked);
      if (!isAnyChecked) {
        checkboxes[0].checked = true;
      }
    });

    this.rlist.forEach((it) => {
      this.pixiApp.stage.removeChild(it);
    });
    this.rlist.splice(0);
    for (let i = 0; i < 5; i++) {
      this.placeRandomPart();
    }
    this.ts.reset();
  }

  /**
   * Update game loop
   */
  update(delta: number) {
    if (this.isGameOver) return;
    this.ts.update(delta);

    const head = this.ts.plist[0] as SnakePart;

    // Update random part and hit test detection
    let hitPart: any = null;

    this.rlist.forEach((it) => {
      if (head.i == it.i && head.j == it.j) {
        hitPart = it;
      }
    });
    if (hitPart) {
      if (this.soundHit.playing()) this.soundHit.stop();
      this.soundHit.play();

      this.scoreCount++;
      this.getCurrentScore();

      // Add more snake head
      this.ts.addHead(hitPart.i, hitPart.j);

      // Remove random part
      this.pixiApp.stage.removeChild(hitPart);

      let i;

      for (i = this.rlist.length - 1; i >= 0; i--) {
        if (this.rlist[i] == hitPart) break;
      }
      this.rlist.splice(i, 1);

      // Add new random segment
      this.placeRandomPart();

      // Добавить стену после поедания еды
      if (this.ts.isWalls) {
        this.ts.onEatFood();
      }
    }

    if (this.ts.selfHitTest()) {
      this.setGameOver();
    }
  }

  /**
   * Place random segment in the current matrix
   */
  placeRandomPart() {
    const rj = Math.floor(Math.random() * 20);
    const ri = Math.floor(Math.random() * 20);

    const part = new SnakePart(this.ts, Texture.from("assets/mouse.png"));
    part.width = 32;
    part.height = 32;
    part.tint = 0xffffff;
    part.setPosition(ri, rj);
    this.pixiApp.stage.addChild(part);
    this.rlist.push(part);
  }

  /**
   * Set game over state
   */
  setGameOver() {
    this.isGameOver = true;
    this.setMenu();
    this.gameText.innerHTML = `
    <h1>Game Over</h1>
    <h2>Your Score: ${this.scoreCount}</h2>
  `;

    this.root.appendChild(this.gameText);
    this.soundGameOver.play();
  }
}
