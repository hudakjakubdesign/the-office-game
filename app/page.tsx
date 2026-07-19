"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Facing = "up" | "down" | "left" | "right";
type SpriteId = "heather" | "nathan" | "alice" | "player";
type Interaction =
  | { kind: "person"; id: string; name: string; subtitle: string; message: string; x: number; y: number; sprite: Exclude<SpriteId, "player