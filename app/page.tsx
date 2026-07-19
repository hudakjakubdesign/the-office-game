"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Facing = "up" | "down" | "left" | "right";
type SpriteId = "heather" | "nathan" | "alice" | "player";

type Person = {
  id: string;
  name: string;
  team: string;
  x: number;
  y: number;
  shirt: string;
  hair: string;
  look: "crop" | "long" | "wave";
  sprite: Exclude<SpriteId, "player">;
  message: string;
};

type Player = {
  x: number;
  y: number;
  facing: Facing;
  moving: boolean;
};

const WIDTH = 480;
const HEIGHT = 300;

const people: Person[] = [
  {
    id: "heather",
    name: "Heather Blundell",
    team: "UK CEO",
    x: 240,
    y: 214,
    shirt: "#1d2029",
    hair: "#f2bd55",
    look: "long",
    sprite: "heather",
    message:
      "Welcome to Grayling. I’m Heather, UK CEO. Come in, explore the office and meet the teams creating advantage for our clients every day.",
  },
  {
    id: "creative",
    name: "Nathan Kemp",
    team: "Design & Marketing",
    x: 287,
    y: 176,
    shirt: "#66704a",
    hair: "#c79648",
    look: "crop",
    sprite: "nathan",
    message:
      "We turn strategy into stories people notice, shaping ideas, visuals and campaigns across every channel.",
  },
  {
    id: "portfolio",
    name: "Alice Newsham",
    team: "Brand Portfolio",
    x: 387,
    y: 158,
    shirt: "#74706c",
    hair: "#2c2424",
    look: "long",
    sprite: "alice",
    message:
      "I connect the dots across our brand portfolio, helping each specialist team bring the right expertise to the table.",
  },
];

const collisions = [
  { x: 12, y: 28, w: 456, h: 26 },
  { x: 12, y: 28, w: 16, h: 248 },
  { x: 452, y: 28, w: 16, h: 248 },
  { x: 12, y: 264, w: 208, h: 12 },
  { x: 260, y: 264, w: 208, h: 12 },
  { x: 30, y: 53, w: 112, h: 25 },
  { x: 31, y: 79, w: 25, h: 40 },
  { x: 73, y: 105, w: 64, h: 27 },
  { x: 159, y: 68, w: 76, h: 32 },
  { x: 256, y: 68, w: 76, h: 32 },
  { x: 159, y: 137, w: 76, h: 29 },
  { x: 255, y: 137, w: 76, h: 29 },
  { x: 350, y: 76, w: 79, h: 64 },
  { x: 322, y: 211, w: 61, h: 28 },
  { x: 401, y: 196, w: 36, h: 48 },
];

function drawPixelText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color = "#26334f",
  align: CanvasTextAlign = "left",
) {
  ctx.save();
  ctx.font = "bold 6px monospace";
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawPlant(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "#bd714b";
  ctx.fillRect(x - 5, y + 4, 10, 7);
  ctx.fillStyle = "#274e43";
  ctx.fillRect(x - 1, y - 7, 3, 13);
  ctx.fillStyle = "#5dbb63";
  ctx.fillRect(x - 7, y - 7, 7, 6);
  ctx.fillRect(x + 1, y - 11, 7, 7);
  ctx.fillStyle = "#80d173";
  ctx.fillRect(x - 4, y - 12, 6, 6);
}

function drawDesk(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  accent: string,
) {
  ctx.fillStyle = "#7e5c48";
  ctx.fillRect(x + 3, y + 4, 70, 24);
  ctx.fillStyle = "#c98d62";
  ctx.fillRect(x, y, 76, 20);
  ctx.fillStyle = "#e5ae78";
  ctx.fillRect(x + 3, y + 3, 70, 3);
  ctx.fillStyle = "#2b3850";
  ctx.fillRect(x + 27, y + 3, 25, 13);
  ctx.fillStyle = "#d9f2ef";
  ctx.fillRect(x + 30, y + 5, 19, 8);
  ctx.fillStyle = accent;
  ctx.fillRect(x + 31, y + 6, 17, 2);
  ctx.fillStyle = "#46546d";
  ctx.fillRect(x + 37, y + 16, 5, 3);
  ctx.fillStyle = "#f6e4b8";
  ctx.fillRect(x + 6, y + 5, 14, 9);
  ctx.fillStyle = "#d09b5b";
  ctx.fillRect(x + 8, y + 7, 10, 1);
  ctx.fillRect(x + 8, y + 10, 7, 1);
  ctx.fillStyle = "#26334f";
  ctx.fillRect(x + 4, y + 20, 5, 10);
  ctx.fillRect(x + 67, y + 20, 5, 10);
}

function drawPerson(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  shirt: string,
  hair: string,
  look: "crop" | "long" | "wave",
  facing: Facing,
  moving: boolean,
  frame: number,
) {
  const phase = moving ? Math.floor(frame / 5) % 4 : 0;
  const stepLeft = phase === 1 ? 2 : phase === 3 ? -1 : 0;
  const stepRight = phase === 3 ? 2 : phase === 1 ? -1 : 0;
  const bob = moving && (phase === 1 || phase === 3) ? -1 : 0;
  const armSwing = moving && (phase === 1 || phase === 3) ? 2 : 0;
  const py = y + bob;
  const outline = "#0a203b";
  const skin = "#efb18d";
  const skinShadow = "#d98669";
  const trousers = "#29496b";

  ctx.fillStyle = "rgba(14,41,75,.23)";
  ctx.fillRect(x - 9, y + 15, 18, 2);
  ctx.fillRect(x - 6, y + 17, 12, 1);

  ctx.fillStyle = outline;
  ctx.fillRect(x - 7 + stepLeft, py + 7, 6, 11);
  ctx.fillRect(x + 1 + stepRight, py + 7, 6, 11);
  ctx.fillStyle = trousers;
  ctx.fillRect(x - 6 + stepLeft, py + 8, 4, 8);
  ctx.fillRect(x + 2 + stepRight, py + 8, 4, 8);
  ctx.fillStyle = "#f3ead9";
  ctx.fillRect(x - 7 + stepLeft, py + 16, 6, 2);
  ctx.fillRect(x + 1 + stepRight, py + 16, 6, 2);

  ctx.fillStyle = outline;
  ctx.fillRect(x - 8, py - 2, 16, 12);
  ctx.fillRect(x - 10, py, 3, 10);
  ctx.fillRect(x + 7, py, 3, 10);
  ctx.fillStyle = shirt;
  ctx.fillRect(x - 7, py - 1, 14, 10);
  ctx.fillStyle = "rgba(255,255,255,.28)";
  ctx.fillRect(x - 5, py, 3, 7);
  ctx.fillStyle = "#fff6e7";
  ctx.fillRect(x + 2, py, 3, 3);
  ctx.fillStyle = "#0e294b";
  ctx.fillRect(x + 3, py + 1, 1, 1);

  ctx.fillStyle = outline;
  ctx.fillRect(x - 11, py + 1 + armSwing, 4, 8);
  ctx.fillRect(x + 7, py + 1 + (armSwing ? 0 : 2), 4, 8);
  ctx.fillStyle = skin;
  ctx.fillRect(x - 10, py + 3 + armSwing, 2, 5);
  ctx.fillRect(x + 8, py + 3 + (armSwing ? 0 : 2), 2, 5);
  ctx.fillStyle = skinShadow;
  ctx.fillRect(x - 10, py + 7 + armSwing, 2, 1);
  ctx.fillRect(x + 8, py + 7 + (armSwing ? 0 : 2), 2, 1);

  ctx.fillStyle = outline;
  ctx.fillRect(x - 7, py - 14, 14, 13);
  ctx.fillStyle = skin;
  ctx.fillRect(x - 6, py - 12, 12, 10);
  ctx.fillStyle = skinShadow;
  ctx.fillRect(x - 6, py - 4, 12, 2);
  ctx.fillRect(x - 7, py - 9, 2, 4);
  ctx.fillRect(x + 5, py - 9, 2, 4);

  ctx.fillStyle = hair;
  if (look === "long") {
    ctx.fillRect(x - 7, py - 15, 14, 5);
    ctx.fillRect(x - 8, py - 12, 3, 12);
    ctx.fillRect(x + 5, py - 12, 3, 12);
    ctx.fillRect(x - 5, py - 14, 4, 2);
  } else if (look === "wave") {
    ctx.fillRect(x - 7, py - 15, 12, 4);
    ctx.fillRect(x - 8, py - 13, 4, 4);
    ctx.fillRect(x + 3, py - 14, 5, 4);
    ctx.fillRect(x - 3, py - 16, 6, 2);
  } else {
    ctx.fillRect(x - 7, py - 15, 14, 5);
    ctx.fillRect(x - 7, py - 11, 3, 3);
    ctx.fillRect(x + 4, py - 12, 3, 2);
  }

  if (facing !== "up") {
    ctx.fillStyle = outline;
    if (facing === "left") {
      ctx.fillRect(x - 4, py - 8, 2, 2);
      ctx.fillRect(x - 6, py - 5, 2, 1);
    } else if (facing === "right") {
      ctx.fillRect(x + 2, py - 8, 2, 2);
      ctx.fillRect(x + 4, py - 5, 2, 1);
    } else {
      const blink = !moving && frame % 140 > 134;
      ctx.fillRect(x - 4, py - 8, 2, blink ? 1 : 2);
      ctx.fillRect(x + 2, py - 8, 2, blink ? 1 : 2);
      ctx.fillRect(x - 1, py - 4, 3, 1);
    }
  } else {
    ctx.fillStyle = hair;
    ctx.fillRect(x - 6, py - 11, 12, 8);
  }
}

function drawAtlasPerson(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | undefined,
  x: number,
  y: number,
  facing: Facing,
  moving: boolean,
  frame: number,
  fallback: Pick<Person, "shirt" | "hair" | "look">,
) {
  ctx.fillStyle = "rgba(54, 35, 27, .28)";
  ctx.fillRect(x - 10, y + 15, 20, 3);

  if (!image?.complete || !image.naturalWidth) {
    drawPerson(ctx, x, y, fallback.shirt, fallback.hair, fallback.look, facing, moving, frame);
    return;
  }

  const walking = moving && Math.floor(frame / 7) % 2 === 1;
  const index = facing === "down"
    ? (walking ? 1 : 0)
    : facing === "up"
      ? (walking ? 3 : 2)
      : facing === "left"
        ? (walking ? 5 : 4)
        : (walking ? 7 : 6);
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
    Math.round(x - 22),
    Math.round(y - 45),
    44,
    62,
  );
}

function drawOffice(
  ctx: CanvasRenderingContext2D,
  player: Player,
  visited: Set<string>,
  frame: number,
  sprites: Partial<Record<SpriteId, HTMLImageElement>>,
) {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "#0e294b";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#1b456f";
  for (let x = 0; x < WIDTH; x += 12) {
    ctx.fillRect(x, 0, 6, 8);
    ctx.fillRect(x + 6, 292, 6, 8);
  }

  ctx.fillStyle = "#f8ead3";
  ctx.fillRect(12, 28, 456, 248);
  ctx.fillStyle = "#f0d5ad";
  ctx.fillRect(12, 28, 456, 21);
  ctx.fillStyle = "#6e3e2d";
  ctx.fillRect(12, 47, 456, 7);
  ctx.fillStyle = "#0e294b";
  ctx.fillRect(12, 28, 16, 248);
  ctx.fillRect(452, 28, 16, 248);
  ctx.fillRect(12, 264, 208, 12);
  ctx.fillRect(260, 264, 208, 12);

  for (let y = 54; y < 264; y += 10) {
    for (let x = 28; x < 452; x += 32) {
      const offset = ((y - 54) / 10) % 2 ? 16 : 0;
      ctx.fillStyle = ((x + y) / 10) % 2 > 1 ? "#c99162" : "#d8a574";
      ctx.fillRect(x - offset, y, 31, 9);
      ctx.fillStyle = "#a96f4f";
      ctx.fillRect(x - offset, y + 8, 31, 1);
      ctx.fillStyle = "rgba(255,239,205,.34)";
      ctx.fillRect(x - offset + 2, y + 1, 17, 1);
    }
  }

  ctx.fillStyle = "#0e294b";
  ctx.fillRect(171, 184, 148, 58);
  ctx.fillStyle = "#173f68";
  ctx.fillRect(176, 189, 138, 48);
  ctx.fillStyle = "#fff6e7";
  for (let x = 180; x < 310; x += 18) {
    ctx.fillRect(x, 193, 9, 4);
    ctx.fillRect(x + 7, 197, 9, 4);
    ctx.fillRect(x, 225, 9, 4);
    ctx.fillRect(x + 7, 221, 9, 4);
  }
  drawPixelText(ctx, "CREATE", 245, 207, "#fff6e7", "center");
  drawPixelText(ctx, "ADVANTAGE", 245, 216, "#fff6e7", "center");

  ctx.fillStyle = "#7591a7";
  ctx.fillRect(145, 54, 4, 210);
  ctx.fillRect(340, 54, 4, 210);
  ctx.fillStyle = "#fff9ef";
  ctx.fillRect(149, 54, 191, 4);

  ctx.fillStyle = "#0e294b";
  ctx.fillRect(184, 31, 112, 15);
  drawPixelText(ctx, "GRAYLING  /  CREATING ADVANTAGE", 240, 39, "#fff6e7", "center");

  ctx.fillStyle = "#527d8d";
  ctx.fillRect(35, 32, 37, 12);
  ctx.fillRect(81, 32, 37, 12);
  ctx.fillRect(362, 32, 37, 12);
  ctx.fillRect(408, 32, 30, 12);
  ctx.fillStyle = "#bfe3e2";
  ctx.fillRect(38, 35, 31, 3);
  ctx.fillRect(84, 35, 31, 3);
  ctx.fillRect(365, 35, 31, 3);
  ctx.fillRect(411, 35, 24, 3);
  ctx.fillStyle = "#f7cc72";
  ctx.fillRect(42, 36, 7, 2);
  ctx.fillRect(88, 36, 8, 2);
  ctx.fillRect(369, 36, 8, 2);

  ctx.fillStyle = "#315c58";
  ctx.fillRect(30, 53, 112, 25);
  ctx.fillStyle = "#6ea09a";
  ctx.fillRect(30, 53, 112, 7);
  ctx.fillStyle = "#b9d4c4";
  for (let x = 34; x < 138; x += 18) ctx.fillRect(x, 62, 14, 12);
  ctx.fillStyle = "#d29b53";
  for (let x = 45; x < 138; x += 18) ctx.fillRect(x, 67, 2, 2);
  ctx.fillStyle = "#6d91a1";
  ctx.fillRect(31, 79, 25, 40);
  ctx.fillStyle = "#cfe8df";
  ctx.fillRect(35, 84, 17, 15);
  ctx.fillStyle = "#4b6278";
  ctx.fillRect(48, 103, 3, 3);
  drawPixelText(ctx, "KITCHEN", 86, 88, "#74513e", "center");

  ctx.fillStyle = "#976948";
  ctx.fillRect(73, 105, 64, 27);
  ctx.fillStyle = "#dca66f";
  ctx.fillRect(70, 102, 64, 24);
  ctx.fillStyle = "#f4eee0";
  ctx.fillRect(84, 107, 15, 11);
  ctx.fillStyle = "#61a8a5";
  ctx.fillRect(112, 107, 8, 10);
  ctx.fillStyle = "#fff6dc";
  ctx.fillRect(114, 108, 4, 4);
  ctx.fillStyle = "#76513c";
  ctx.fillRect(76, 126, 5, 8);
  ctx.fillRect(126, 126, 5, 8);

  drawDesk(ctx, 159, 68, "#0e294b");
  drawDesk(ctx, 256, 68, "#4d7898");
  drawDesk(ctx, 159, 137, "#d7a84b");
  drawDesk(ctx, 255, 137, "#76957d");

  [[196, 103], [293, 103], [196, 172], [292, 172]].forEach(([x, y], index) => {
    ctx.fillStyle = "#29354a";
    ctx.fillRect(x - 7, y, 14, 10);
    ctx.fillStyle = index % 2 ? "#466d73" : "#56425a";
    ctx.fillRect(x - 5, y + 2, 10, 6);
    ctx.fillStyle = "#19263a";
    ctx.fillRect(x - 1, y + 10, 3, 6);
  });
  ctx.fillStyle = "#f4d791";
  ctx.fillRect(218, 73, 5, 4);
  ctx.fillRect(315, 142, 5, 4);
  ctx.fillStyle = "#3c6d6b";
  ctx.fillRect(171, 73, 9, 5);
  ctx.fillRect(267, 142, 9, 5);

  ctx.fillStyle = "#8097a8";
  ctx.fillRect(350, 76, 79, 64);
  ctx.fillStyle = "#c7d9db";
  ctx.fillRect(354, 80, 71, 56);
  ctx.fillStyle = "#8c634b";
  ctx.fillRect(362, 90, 56, 36);
  ctx.fillStyle = "#bd8a61";
  ctx.fillRect(358, 86, 56, 36);
  ctx.fillStyle = "#f2d4a7";
  ctx.fillRect(363, 91, 46, 26);
  ctx.fillStyle = "#586f7f";
  ctx.fillRect(375, 82, 22, 5);
  ctx.fillRect(375, 122, 22, 5);
  ctx.fillRect(348, 97, 6, 18);
  ctx.fillRect(418, 97, 6, 18);
  drawPixelText(ctx, "MEETING ROOM", 389, 68, "#566276", "center");

  ctx.fillStyle = "#456c77";
  ctx.fillRect(322, 211, 61, 28);
  ctx.fillStyle = "#6aa2a0";
  ctx.fillRect(326, 207, 53, 20);
  ctx.fillStyle = "#9bc4bd";
  ctx.fillRect(330, 210, 20, 14);
  ctx.fillRect(354, 210, 20, 14);
  ctx.fillStyle = "#aa764f";
  ctx.fillRect(342, 238, 22, 6);

  ctx.fillStyle = "#385169";
  ctx.fillRect(401, 196, 36, 48);
  ctx.fillStyle = "#c88656";
  for (let shelf = 202; shelf < 240; shelf += 12) {
    ctx.fillRect(404, shelf, 30, 3);
  }
  const bookColors = ["#0e294b", "#76957d", "#d7a84b", "#4d7898"];
  bookColors.forEach((color, index) => {
    ctx.fillStyle = color;
    ctx.fillRect(406 + index * 7, 193 + (index % 2) * 12, 4, 9);
  });
  drawPixelText(ctx, "BRANDS", 419, 251, "#6b4f42", "center");

  drawPlant(ctx, 154, 247);
  drawPlant(ctx, 440, 249);
  drawPlant(ctx, 46, 246);

  ctx.fillStyle = "#704936";
  ctx.fillRect(83, 143, 45, 34);
  ctx.fillStyle = "#fff0cb";
  ctx.fillRect(87, 147, 37, 26);
  ctx.fillStyle = "#d16f56";
  ctx.fillRect(91, 151, 12, 14);
  ctx.fillStyle = "#517e80";
  ctx.fillRect(105, 156, 14, 11);
  ctx.fillStyle = "#f0c760";
  ctx.fillRect(101, 150, 5, 5);
  ctx.fillStyle = "#654536";
  ctx.fillRect(61, 188, 3, 45);
  ctx.fillStyle = "#f4cc70";
  ctx.fillRect(54, 183, 17, 8);
  ctx.fillStyle = "rgba(255,221,145,.25)";
  ctx.fillRect(48, 191, 29, 27);

  ctx.fillStyle = "#48617d";
  ctx.fillRect(220, 264, 40, 8);
  ctx.fillStyle = "#8295a7";
  ctx.fillRect(224, 258, 32, 10);
  ctx.fillStyle = "#d9e8e4";
  ctx.fillRect(238, 260, 4, 5);
  drawPixelText(ctx, "LIFT", 240, 284, "#d9e8e4", "center");

  people.forEach((person) => {
    drawAtlasPerson(
      ctx,
      sprites[person.sprite],
      person.x,
      person.y,
      "down",
      false,
      frame,
      person,
    );
    if (!visited.has(person.id)) {
      ctx.fillStyle = "#fff4d1";
      ctx.fillRect(person.x - 5, person.y - 55, 10, 10);
      ctx.fillStyle = "#0e294b";
      ctx.fillRect(person.x - 1, person.y - 53, 2, 5);
      ctx.fillRect(person.x - 1, person.y - 46, 2, 1);
    } else {
      ctx.fillStyle = "#76957d";
      ctx.fillRect(person.x - 5, person.y - 55, 10, 9);
      drawPixelText(ctx, "✓", person.x, person.y - 50, "#163d38", "center");
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
    { shirt: "#386b91", hair: "#d56a3d", look: "wave" },
  );
}

function isBlocked(x: number, y: number) {
  const feet = { x: x - 5, y: y + 10, w: 10, h: 7 };
  return collisions.some(
    (block) =>
      feet.x < block.x + block.w &&
      feet.x + feet.w > block.x &&
      feet.y < block.y + block.h &&
      feet.y + feet.h > block.y,
  );
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spritesRef = useRef<Partial<Record<SpriteId, HTMLImageElement>>>({});
  const keysRef = useRef<Set<string>>(new Set());
  const playerRef = useRef<Player>({
    x: 240,
    y: 241,
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
    const files: Record<SpriteId, string> = {
      heather: "heather-blundell-sprites.png",
      nathan: "nathan-kemp-sprites.png",
      alice: "alice-newsham-sprites.png",
      player: "visitor-sprites.png",
    };

    (Object.entries(files) as [SpriteId, string][]).forEach(([id, filename]) => {
      const image = new Image();
      image.src = `./${filename}`;
      image.onload = () => {
        spritesRef.current[id] = image;
      };
    });
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

    if (closest && closest.distance < 31) {
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
        (person) => Math.hypot(person.x - player.x, person.y - player.y) < 31,
      );
      const closeId = closePerson?.id ?? "";
      if (closeId !== lastNearbyId) {
        lastNearbyId = closeId;
        setNearby(closePerson ?? null);
      }

      drawOffice(ctx, player, visitedRef.current, frame, spritesRef.current);
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
    const heather = people[0];
    setStarted(true);
    setDialogue(heather);
    setVisited([heather.id]);
  };

  return (
    <main className="game-page">
      <section className="game-card" aria-label="The Office Game, a Grayling office experience">
        <header className="game-header">
          <div className="brand-lockup">
            {/* Grayling's official logo is used here for the client prototype. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="grayling-logo"
              src="https://grayling.com/wp-content/uploads/2023/11/GraylingCreatingAdvantage_Logo_Blue.png"
              alt="Grayling, creating advantage"
            />
            <div>
              <p className="eyebrow">THE OFFICE GAME  /  EXPERIENCE 01</p>
              <h1>The Office Game</h1>
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
            width={WIDTH}
            height={HEIGHT}
            aria-label="A top-down pixel art office with desks, a kitchen, a meeting room and three colleagues"
          />

          {!started && (
            <div className="start-panel">
              <span className="tiny-label">WELCOME TO GRAYLING</span>
              <h2>Ready to create advantage?</h2>
              <p>Explore the office and meet three teams shaping the work.</p>
              <button type="button" onClick={beginTour}>
                Enter the office
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
              <div
                className="portrait atlas-portrait"
                style={{
                  "--shirt": dialogue.shirt,
                  "--hair": dialogue.hair,
                  backgroundImage: `url("./${dialogue.sprite === "heather"
                    ? "heather-blundell-sprites.png"
                    : dialogue.sprite === "nathan"
                      ? "nathan-kemp-sprites.png"
                      : "alice-newsham-sprites.png"}")`,
                } as React.CSSProperties}
              />
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
              <span>✓</span> Office tour complete
            </div>
          )}
        </div>

        <footer className="game-footer">
          <div className="desktop-controls">
            <span><kbd>WASD</kbd> or <kbd>ARROWS</kbd> to move</span>
            <span><kbd>E</kbd> or <kbd>ENTER</kbd> to talk</span>
          </div>

          <div className="touch-controls" aria-label="Touch controls">
            <div className="d-pad">
              <button
                className="up"
                aria-label="Move up"
                onPointerDown={() => setTouchKey("arrowup", true)}
                onPointerUp={() => setTouchKey("arrowup", false)}
                onPointerCancel={() => setTouchKey("arrowup", false)}
              >▲</button>
              <button
                className="left"
                aria-label="Move left"
                onPointerDown={() => setTouchKey("arrowleft", true)}
                onPointerUp={() => setTouchKey("arrowleft", false)}
                onPointerCancel={() => setTouchKey("arrowleft", false)}
              >◀</button>
              <button
                className="down"
                aria-label="Move down"
                onPointerDown={() => setTouchKey("arrowdown", true)}
                onPointerUp={() => setTouchKey("arrowdown", false)}
                onPointerCancel={() => setTouchKey("arrowdown", false)}
              >▼</button>
              <button
                className="right"
                aria-label="Move right"
                onPointerDown={() => setTouchKey("arrowright", true)}
                onPointerUp={() => setTouchKey("arrowright", false)}
                onPointerCancel={() => setTouchKey("arrowright", false)}
              >▶</button>
            </div>
            <button className="action-button" type="button" onClick={interact}>TALK</button>
          </div>
        </footer>
      </section>
      <p className="prototype-note">The Office Game is a playable Grayling office concept. Character art and dialogue can be replaced in the next round.</p>
    </main>
  );
}
