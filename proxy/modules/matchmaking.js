/* jshint ignore:start */
import data from "../../src/data/data.json" with { type: "json" };
import { Messages } from "../../lib/messages.mjs";
import { config } from "../../src/config/config.js";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

const { l: currentLang = "en", d: currentDiff = "1" } = config;

const pickText = () => {
  try {
    const textsPool = data.text[currentLang]?.[currentDiff];

    if (Array.isArray(textsPool) && textsPool.length > 0) {
      return textsPool[Math.floor(Math.random() * textsPool.length)];
    }

    return data.text["en"]["1"][0];
  } catch (error) {
    Messages.error(`[MATCHMAKING ERROR] Failed to pick text from data.json: ${error.message}`);
    return "Fallback test text: Something went wrong with configuration.";
  }
};

const displayName = (username) => (username || "anon").toString().trim().slice(0, 32) || "anon";
const isSameIdentity = (a, b) => a.toLowerCase() !== "anon" && a.toLowerCase() === b.toLowerCase();

const rooms = new Map();
let queue = [];

const ROOM_TTL_MS = 15 * 60 * 1000;

const cleanupStaleRooms = () => {
  const now = Date.now();
  for (const [code, room] of rooms) {
    if (now - room.createdAt > ROOM_TTL_MS) rooms.delete(code);
  }
};

const generateRoomCode = () => {
  let code;

  do {
    code = nanoid();
  } while (rooms.has(code));

  return code;
};

const createRoom = (socket, username) => {
  const code = generateRoomCode();

  rooms.set(code, {
    text: pickText(),
    players: new Map([[socket.id, { username, result: null }]]),
    createdAt: Date.now(),
  });

  socket.join(code);
  socket.data.roomCode = code;

  return code;
};

const startRace = (io, code) => {
  const room = rooms.get(code);
  if (!room) return;

  io.to(code).emit("match:found", {
    roomCode: code,
    text: room.text,
    players: [...room.players.values()].map((p) => p.username),
    startsInMs: 3000,
  });
};

const finishRace = (io, socket, payload) => {
  const code = socket.data.roomCode;
  const room = code && rooms.get(code);

  if (!room || !room.players.has(socket.id)) return;

  const player = room.players.get(socket.id);
  player.result = {
    pastTime: Number(payload.pastTime) || 0,
    incorrectWords: Number(payload.incorrectWords) || 0,
    sourceWords: Number(payload.sourceWords) || 0,
  };

  const finished = [...room.players.values()].filter((p) => p.result);

  if (finished.length < room.players.size) {
    socket.to(code).emit("race:opponentFinished");
    return;
  }

  const ranked = [...room.players.entries()].sort((a, b) => {
    const ra = a[1].result,
      rb = b[1].result;
    if (ra.incorrectWords !== rb.incorrectWords) return ra.incorrectWords - rb.incorrectWords;
    return ra.pastTime - rb.pastTime;
  });

  const summary = ranked.map(([id, p], i) => ({
    username: p.username,
    result: p.result,
    place: i + 1,
  }));

  io.to(code).emit("race:result", { winner: summary[0].username, players: summary });
  rooms.delete(code);
};

const leaveEverything = (io, socket) => {
  queue = queue.filter((id) => id !== socket.id);

  const code = socket.data.roomCode;
  if (!code) return;

  const room = rooms.get(code);
  if (!room) return;

  room.players.delete(socket.id);
  socket.to(code).emit("opponent:left");

  if (room.players.size === 0) rooms.delete(code);
};

const initMatchmaking = (io) => {
  setInterval(cleanupStaleRooms, 60 * 1000).unref();

  io.on("connection", (socket) => {
    io.emit("status:online", io.engine.clientsCount);

    socket.on("queue:find", ({ username } = {}) => {
      leaveEverything(io, socket);
      const name = displayName(username);
      socket.data.pendingName = name;

      const opponentIndex = queue.findIndex((id) => {
        const opponentSocket = io.sockets.sockets.get(id);
        return opponentSocket && !isSameIdentity(opponentSocket.data.pendingName, name);
      });

      if (opponentIndex !== -1) {
        const [opponentId] = queue.splice(opponentIndex, 1);
        const opponentSocket = io.sockets.sockets.get(opponentId);

        const code = createRoom(opponentSocket, opponentSocket.data.pendingName || "anon");
        socket.join(code);

        socket.data.roomCode = code;
        rooms.get(code).players.set(socket.id, { username: name, result: null });

        startRace(io, code);
      } else {
        queue.push(socket.id);
        socket.emit("queue:waiting");
      }
    });

    socket.on("room:create", ({ username } = {}, ack) => {
      const name = displayName(username);
      const code = createRoom(socket, name);

      if (typeof ack === "function") ack({ code });
    });

    socket.on("room:join", ({ code, username } = {}, ack) => {
      const room = code && rooms.get(code.toString().toUpperCase());

      if (!room) {
        if (typeof ack === "function") ack({ error: "Room not found" });
        return;
      }

      if (room.players.size >= 2) {
        if (typeof ack === "function") ack({ error: "Room is full" });
        return;
      }

      const normalizedCode = code.toString().toUpperCase();
      const name = displayName(username);

      const alreadyTaken = [...room.players.values()].some((p) => isSameIdentity(p.username, name));

      if (alreadyTaken) {
        if (typeof ack === "function") ack({ error: "You can't race against yourself with the same username" });
        return;
      }

      room.players.set(socket.id, { username: name, result: null });
      socket.join(normalizedCode);
      socket.data.roomCode = normalizedCode;

      if (typeof ack === "function") ack({ code: normalizedCode });
      startRace(io, normalizedCode);
    });

    socket.on("race:finish", (payload = {}) => finishRace(io, socket, payload));

    socket.on("disconnect", () => {
      leaveEverything(io, socket);
      io.emit("status:online", io.engine.clientsCount);
    });
  });
};

const onlineCount = (io) => io.engine.clientsCount;

export { initMatchmaking, onlineCount };
/* jshint ignore:end */
