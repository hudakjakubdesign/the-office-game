"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Facing = "up" | "down" | "left" | "right";
type SpriteId = "heather" | "nathan" | "alice" | "player";
type LogoId = "onTheBeach" | "stPancras";

type Person = {
  id: string;
  name: string;
  team: string;
  x: number;
  y: number;
  sprite: Exclude<SpriteId, "player">;
  message: string;
};

type Player = {
  x: number;
  y: number;
  facing: Facing;
  moving: boolean;
};

type Collision = {
  x: number;
  y: number;
  w: number;
  h: number;
  buffer?: number;
};

const WIDTH = 480;
const HEIGHT = 320;

const people: Person[] = [
  {
    id: "heather",
    name: "Heather Blundell",
    team: "UK CEO",
    x: 307,
    y: 239,
    sprite: "heather",
    message:
      "Welcome to Grayling. I’m Heather Blundell, UK CEO. Please explore what Grayling can offer you and discover how we can help grow your business.",
  },
  {
    id: "creative",
    name: "Nathan Kemp",
    team: "Chief Innovation Officer",
    x: 105,
    y: 133,
    sprite: "nathan",
    message:
      "I lead Grayling’s agency-wide AI adoption programme, helping you unlock its potential for growth, innovation and efficiency.",
  },
  {
    id: "portfolio",
    name: "Alice Newsham",
    team: "Head of UK Client Service & North",
    x: 423,
    y: 132,
    sprite: "alice",
    message:
      "I lead the client experience and innovation agenda across the UK, helping you build trust and deliver long-term value for your brand.",
  },
];

const structuralCollisions: Collision[] = [
  { x: 0, y: 0, w: 480, h: 15, buffer: 5 },
  { x: 0, y: 0, w: 18, h: 320, buffer: 5 },
  { x: 462, y: 0, w: 18, h: 320, buffer: 5 },
  { x: 0, y: 296, w: 220, h: 24, buffer: 5 },
  { x: 260, y: 296, w: 220, h: 24, buffer: 5 },

  { x: 36, y: 66, w: 51, h: 47, buffer: 3 },
  { x: 121, y: 66, w: 52, h: 47, buffer: 3 },
  { x: 36, y: 134, w: 51, h: 44, buffer: 3 },
  { x: 121, y: 134, w: 52, h: 44, buffer: 3 },

  { x: 184, y: 14, w: 14, h: 138, buffer: 5 },
  { x: 290, y: 14, w: 14, h: 138, buffer: 5 },
  { x: 184, y: 145, w: 47, h: 13, buffer: 5 },
  { x: 260, y: 145, w: 44, h: 13, buffer: 5 },

  { x: 202, y: 82, w: 82, h: 38, buffer: 3 },
  { x: 190, y: 126, w: 41, h: 23, buffer: 3 },
  { x: 250, y: 126, w: 45, h: 23, buffer: 3 },
  { x: 188, y: 203, w: 104, h: 38, buffer: 3 },
  { x: 25, y: 219, w: 54, h: 31, buffer: 3 },
  { x: 100, y: 238, w: 47, h: 40, buffer: 3 },

  { x: 350, y: 82, w: 72, h: 42, buffer: 3 },
  { x: 337, y: 72, w: 18, h: 26, buffer: 2 },
  { x: 337, y: 112, w: 18, h: 26, buffer: 2 },
  { x: 417, y: 72, w: 18, h: 26, buffer: 2 },
  { x: 417, y: 112, w: 18, h: 26, buffer: 2 },

  { x: 341, y: 179, w: 112, h: 30, buffer: 3 },
  { x: 350, y: 238, w: 99, h: 43, buffer: 3 },
];

function intersects(a: Collision, b: Collision) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function isBlocked(x: number, y: number) {
  const feet: Collision = { x: x - 5, y: y - 1, w: 10, h: 8 };
  const blockedByStructure = structuralCollisions.some((block) => {
    const buffer = block.buffer ?? 0;
    return intersects(feet, {
      x: block.x - buffer,
      y: block.y - buffer,
      w: block.w + buffer * 2,
      h: block.h + buffer * 2,
    });
  });

  if (blockedByStructure) return true;

  return people.some((person) =>
    intersects(feet, {
      x: person.x - 10,
      y: person.y - 16,
      w: 20,
      h: 25,
    }),
  );
}

function drawPosterFrame(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | undefined,
  x: number,
  y: number,
  width: number,
  height: number,
  background: string,
) {
  ctx.fillStyle = "rgba(26, 20, 20, .3)";
  ctx.fillRect(x + 2, y + 2, width, height);
  ctx.fillStyle = "#704936";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = background;
  ctx.fillRect(x + 2, y + 2, width - 4, height - 4);

  if (image?.complete && image.naturalWidth) {
    const padding = 4;
    const maxWidth = width - padding * 2;
    const maxHeight = height - padding * 2;
    const scale = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    ctx.drawImage(
      image,
      x + (width - drawWidth) / 2,
      y + (height - drawHeight) / 2,
      drawWidth,
      drawHeight,
    );
  }
}

function drawOpenAliceArea(ctx: CanvasRenderingContext2D) {
  const x = 299;
  const y = 54;
  const width = 167;
  const height = 112;

  ctx.fillStyle = "#c7a776";
  ctx.fillRect(x, y, width, height);

  for (let row = 0; row < height; row += 10) {
    for (let column = 0; column < width; column += 20) {
      const offset = row % 20 === 0 ? 0 : 10;
      ctx.fillStyle = (row / 10 + column / 20) % 2 === 0 ? "#b4b9aa" : "#a7b2a6";
      ctx.fillRect(x + column - offset, y + row, 19, 9);
      ctx.fillStyle = "rgba(255,255,255,.22)";
      ctx.fillRect(x + column - offset + 2, y + row + 1, 15, 1);
    }
  }

  ctx.fillStyle = "rgba(25, 63, 75, .12)";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = "#5c7f82";
  ctx.fillRect(x, y, width, 3);
  ctx.fillRect(x, y + height - 3, width, 3);

  ctx.fillStyle = "rgba(38, 30, 28, .22)";
  ctx.fillRect(349, 83, 76, 44);
  ctx.fillStyle = "#8c634b";
  ctx.fillRect(348, 80, 76, 42);
  ctx.fillStyle = "#d5a276";
  ctx.fillRect(352, 84, 68, 34);
  ctx.fillStyle = "rgba(255,246,224,.6)";
  ctx.fillRect(355, 87, 62, 2);

  const chairs = [
    [337, 73],
    [337, 112],
    [418, 73],
    [418, 112],
  ];
  chairs.forEach(([chairX, chairY], index) => {
    ctx.fillStyle = "#25394c";
    ctx.fillRect(chairX, chairY, 16, 22);
    ctx.fillStyle = index % 2 === 0 ? "#507c7a" : "#496d78";
    ctx.fillRect(chairX + 3, chairY + 3, 10, 13);
    ctx.fillStyle = "#19283a";
    ctx.fillRect(chairX + 6, chairY + 20, 4, 6);
  });
}

function drawAtlasPerson(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | undefined,
  x: number,
  y: number,
  facing: Facing,
  moving: boolean,
  frame: number,
) {
  if (!image?.complete || !image.naturalWidth) {
    ctx.fillStyle = "#0e294b";
    ctx.fillRect(x - 8, y - 22, 16, 30);
    ctx.fillStyle = "#f0b18d";
    ctx.fillRect(x - 6, y - 18, 12, 10);
    return;
  }

  const walking = moving && Math.floor(frame / 7) % 2 === 1;
  const index =
    facing === "down"
      ? walking
        ? 1
        : 0
      : facing === "up"
        ? walking
          ? 3
          : 2
        : facing === "left"
          ? walking
            ? 5
            : 4
          : walking
            ? 7
            : 6;
  const cellWidth = image.naturalWidth / 4;
  const cellHeight = image.naturalHeight / 2;
  const sourceX = (index % 4) * cellWidth;
  const sourceY = Math.floor(index / 4) * cellHeight;

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    cellWidth,
    cellHeight,
    Math.round(x - 24),
    Math.round(y - 43),
    48,
    48,
  );
}

function drawOffice(
  ctx: CanvasRenderingContext2D,
  player: Player,
  visited: Set<string>,
  frame: number,
  sprites: Partial<Record<SpriteId, HTMLImageElement>>,
  logos: Partial<Record<LogoId, HTMLImageElement>>,
  officeImage: HTMLImageElement | null,
) {
  const renderScale = ctx.canvas.width / WIDTH;
  ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  if (officeImage?.complete && officeImage.naturalWidth) {
    ctx.drawImage(officeImage, 0, 0, WIDTH, HEIGHT);
  } else {
    ctx.fillStyle = "#c99162";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#fff2d5";
    ctx.fillRect(18, 15, WIDTH - 36, HEIGHT - 39);
  }

  drawOpenAliceArea(ctx);
  drawPosterFrame(ctx, logos.onTheBeach, 42, 29, 68, 24, "#ffdc00");
  drawPosterFrame(ctx, logos.stPancras, 370, 29, 72, 24, "#f4eee6");

  people.forEach((person) => {
    drawAtlasPerson(ctx, sprites[person.sprite], person.x, person.y, "down", false, frame);
    if (!visited.has(person.id)) {
      ctx.fillStyle = "#0e294b";
      ctx.fillRect(person.x - 8, person.y - 62, 16, 13);
      ctx.fillRect(person.x - 2, person.y - 49, 5, 3);
      ctx.fillStyle = "#fff4d1";
      ctx.fillRect(person.x - 6, person.y - 60, 12, 9);
      ctx.fillRect(person.x - 1, person.y - 51, 3, 2);
      ctx.fillStyle = "#d94f5c";
      ctx.fillRect(person.x - 1, person.y - 58, 2, 5);
      ctx.fillRect(person.x - 1, person.y - 52, 2, 2);
    }
  });

  drawAtlasPerson(
    ctx,
    sprites.player,
    Math.round(player.x),
    Math.round(player.y),
    player.facing,
    player.moving,
    frame,
  );
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spritesRef = useRef<Partial<Record<SpriteId, HTMLImageElement>>>({});
  const logosRef = useRef<Partial<Record<LogoId, HTMLImageElement>>>({});
  const officeRef = useRef<HTMLImageElement | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const playerRef = useRef<Player>({
    x: 240,
    y: 286,
    facing: "up",
    moving: false,
  });
  const visitedRef = useRef<Set<string>>(new Set());
  const dialogueRef = useRef<Person | null>(null);
  const [nearby, setNearby] = useState<Person | null>(null);
  const [dialogue, setDialogue] = useState<Person | null>(null);
  const [visited, setVisited] = useState<string[]>([]);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const spriteFiles: Record<SpriteId, string> = {
      heather: "heather-sprites.png",
      nathan: "nathan-sprites.png",
      alice: "alice-sprites.png",
      player: "player-chibi-sprites.png",
    };

    (Object.entries(spriteFiles) as [SpriteId, string][]).forEach(([id, filename]) => {
      const image = new Image();
      image.src = `./${filename}?v=meet-team-1`;
      image.onload = () => {
        spritesRef.current[id] = image;
      };
    });

    const logoFiles: Record<LogoId, string> = {
      onTheBeach: "on-the-beach-logo.svg",
      stPancras: "st-pancras-logo.svg",
    };

    (Object.entries(logoFiles) as [LogoId, string][]).forEach(([id, filename]) => {
      const image = new Image();
      image.src = `./${filename}?v=meet-team-1`;
      image.onload = () => {
        logosRef.current[id] = image;
      };
    });

    const office = new Image();
    office.src = "./office-map-welcome.png?v=meet-team-1";
    office.onload = () => {
      officeRef.current = office;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const displayWidth = canvas.getBoundingClientRect().width || WIDTH;
      const cssScale = displayWidth / WIDTH;
      const deviceScale = Math.min(Math.max(window.devicePixelRatio || 1, 2), 4);
      const renderScale = Math.min(6, Math.max(2, Math.ceil(cssScale * deviceScale)));
      const nextWidth = WIDTH * renderScale;
      const nextHeight = HEIGHT * renderScale;
      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }
    };

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas);
    window.addEventListener("orientationchange", resizeCanvas);
    window.addEventListener("resize", resizeCanvas);
    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", resizeCanvas);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  useEffect(() => {
    visitedRef.current = new Set(visited);
  }, [visited]);

  useEffect(() => {
    dialogueRef.current = dialogue;
  }, [dialogue]);

  const interact = useCallback(() => {
    if (dialogueRef.current) {
      setDialogue(null);
      return;
    }

    const player = playerRef.current;
    const closest = people
      .map((person) => ({
        person,
        distance: Math.hypot(person.x - player.x, person.y - player.y),
      }))
      .sort((a, b) => a.distance - b.distance)[0];

    if (closest && closest.distance < 34) {
      setDialogue(closest.person);
      setVisited((current) =>
        current.includes(closest.person.id)
          ? current
          : [...current, closest.person.id],
      );
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let animationFrame = 0;
    let frame = 0;
    let lastNearbyId = "";

    const update = () => {
      frame += 1;
      const player = playerRef.current;
      let dx = 0;
      let dy = 0;

      if (!dialogueRef.current && started) {
        if (keysRef.current.has("arrowleft") || keysRef.current.has("a")) dx -= 1;
        if (keysRef.current.has("arrowright") || keysRef.current.has("d")) dx += 1;
        if (keysRef.current.has("arrowup") || keysRef.current.has("w")) dy -= 1;
        if (keysRef.current.has("arrowdown") || keysRef.current.has("s")) dy += 1;
      }

      if (dx && dy) {
        dx *= 0.707;
        dy *= 0.707;
      }

      const speed = 1.18;
      if (dx !== 0) {
        const nextX = player.x + dx * speed;
        if (!isBlocked(nextX, player.y)) player.x = nextX;
        player.facing = dx < 0 ? "left" : "right";
      }
      if (dy !== 0) {
        const nextY = player.y + dy * speed;
        if (!isBlocked(player.x, nextY)) player.y = nextY;
        player.facing = dy < 0 ? "up" : "down";
      }
      player.moving = dx !== 0 || dy !== 0;

      const closePerson = people.find(
        (person) => Math.hypot(person.x - player.x, person.y - player.y) < 34,
      );
      const closeId = closePerson?.id ?? "";
      if (closeId !== lastNearbyId) {
        lastNearbyId = closeId;
        setNearby(closePerson ?? null);
      }

      drawOffice(
        ctx,
        player,
        visitedRef.current,
        frame,
        spritesRef.current,
        logosRef.current,
        officeRef.current,
      );
      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [started]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
        event.preventDefault();
      }
      if (["e", "enter", " "].includes(key) && !event.repeat) interact();
      keysRef.current.add(key);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keysRef.current.delete(event.key.toLowerCase());
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [interact]);

  const setTouchKey = (key: string, active: boolean) => {
    if (active) keysRef.current.add(key);
    else keysRef.current.delete(key);
  };

  const beginTour = () => {
    setStarted(true);
    setDialogue(null);
    setVisited([]);
  };

  return (
    <main className="game-page">
      <section className="game-card" aria-label="Meet the Team, a Grayling office experience">
        <header className="game-header">
          <div className="brand-lockup">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="grayling-logo"
              src="https://grayling.com/wp-content/uploads/2023/11/GraylingCreatingAdvantage_Logo_Blue.png"
              alt="Grayling, creating advantage"
            />
            <div>
              <p className="eyebrow">GRAYLING EXPERIENCE 01</p>
              <h1>Meet the Team</h1>
            </div>
          </div>
          <div className="mission" aria-live="polite">
            <span>People met</span>
            <strong>{visited.length} / {people.length}</strong>
          </div>
        </header>

        <div className="game-stage">
          <canvas
            ref={canvasRef}
            width={WIDTH * 3}
            height={HEIGHT * 3}
            aria-label="A top-down pixel art office with desks, an open meeting area and three colleagues"
          />

          <div className="rotate-hint" role="status">
            <strong>Rotate to landscape</strong>
            <span>The full office and controls fit best sideways.</span>
          </div>

          {!started && (
            <div className="start-panel">
              <span className="tiny-label">WELCOME TO GRAYLING</span>
              <h2>Meet the Team</h2>
              <p>Explore the office, visit Heather, Nathan and Alice, then tap TALK when you reach each person.</p>
              <button type="button" onClick={beginTour}>
                Start the experience
              </button>
            </div>
          )}

          {started && nearby && !dialogue && (
            <button className="talk-prompt" type="button" onClick={interact}>
              <kbd>E</kbd> Talk to {nearby.name}
            </button>
          )}

          {dialogue && (
            <div className="dialogue" role="dialog" aria-label={`Conversation with ${dialogue.name}`}>
              <div className={`portrait profile-portrait profile-${dialogue.sprite}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`./${
                    dialogue.sprite === "heather"
                      ? "heather-blundell-sprites.png"
                      : dialogue.sprite === "nathan"
                        ? "nathan-kemp-sprites.png"
                        : "alice-newsham-sprites.png"
                  }?v=meet-team-profile-1`}
                  alt=""
                />
              </div>
              <div className="dialogue-copy">
                <div className="speaker-line">
                  <strong>{dialogue.name}</strong>
                  <span>{dialogue.team}</span>
                </div>
                <p>{dialogue.message}</p>
              </div>
              <button className="dialogue-close" type="button" onClick={interact} aria-label="Close conversation">
                ×
              </button>
            </div>
          )}

          {visited.length === people.length && !dialogue && (
            <div className="complete-badge" role="status">
              <span>✓</span> Team introductions complete
            </div>
          )}

          <div className="touch-controls" aria-label="Touch controls">
            <div className="d-pad">
              <button
                className="up"
                aria-label="Move up"
                onPointerDown={() => setTouchKey("arrowup", true)}
                onPointerUp={() => setTouchKey("arrowup", false)}
                onPointerCancel={() => setTouchKey("arrowup", false)}
                onPointerLeave={() => setTouchKey("arrowup", false)}
              >▲</button>
              <button
                className="left"
                aria-label="Move left"
                onPointerDown={() => setTouchKey("arrowleft", true)}
                onPointerUp={() => setTouchKey("arrowleft", false)}
                onPointerCancel={() => setTouchKey("arrowleft", false)}
                onPointerLeave={() => setTouchKey("arrowleft", false)}
              >◀</button>
              <button
                className="down"
                aria-label="Move down"
                onPointerDown={() => setTouchKey("arrowdown", true)}
                onPointerUp={() => setTouchKey("arrowdown", false)}
                onPointerCancel={() => setTouchKey("arrowdown", false)}
                onPointerLeave={() => setTouchKey("arrowdown", false)}
              >▼</button>
              <button
                className="right"
                aria-label="Move right"
                onPointerDown={() => setTouchKey("arrowright", true)}
                onPointerUp={() => setTouchKey("arrowright", false)}
                onPointerCancel={() => setTouchKey("arrowright", false)}
                onPointerLeave={() => setTouchKey("arrowright", false)}
              >▶</button>
            </div>
            <button className="action-button" type="button" onClick={interact}>TALK</button>
          </div>
        </div>

        <footer className="game-footer">
          <div className="desktop-controls">
            <span><kbd>WASD</kbd> or <kbd>ARROWS</kbd> to move</span>
            <span><kbd>E</kbd> or <kbd>ENTER</kbd> to talk</span>
          </div>
        </footer>
      </section>
      <p className="prototype-note">Walk through the office and meet all three Grayling leaders.</p>
    </main>
  );
}
