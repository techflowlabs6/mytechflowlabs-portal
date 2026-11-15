#!/usr/bin/env node
/**
 * Generate the ADMIN_PASSWORD_HASH value for the portal's admin login.
 *
 * Usage: node scripts/make-admin-hash.mjs
 *
 * The password is read twice from the terminal (typed characters show
 * as asterisks, never echoed) and is never written anywhere — not to a
 * file, not to the shell history, not to stdout. Only the one-way
 * scrypt hash is printed, on stdout alone, so it can be copied into
 * Vercel as the ADMIN_PASSWORD_HASH env var. Guidance goes to stderr.
 *
 * If stdin is piped rather than a terminal, the password is read from
 * the pipe instead (no echo exists to hide in that case).
 */

import { hashAdminPassword } from "../api/login.js";

const MIN_LENGTH = 8;

// --- Line reader for piped (non-terminal) stdin ---------------------------
// One shared buffer: a single piped chunk can hold both password lines,
// so leftovers must survive between reads instead of being dropped.
const lineQueue = [];
const lineWaiters = [];
let stdinReaderStarted = false;
let stdinEnded = false;

function ensureStdinLineReader() {
  if (stdinReaderStarted) return;
  stdinReaderStarted = true;
  let buffer = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    buffer += chunk;
    let newline = buffer.indexOf("\n");
    while (newline !== -1) {
      const line = buffer.slice(0, newline).replace(/\r$/, "");
      buffer = buffer.slice(newline + 1);
      const waiter = lineWaiters.shift();
      if (waiter) waiter(line);
      else lineQueue.push(line);
      newline = buffer.indexOf("\n");
    }
  });
  process.stdin.on("end", () => {
    stdinEnded = true;
    if (buffer.length > 0) {
      const line = buffer.replace(/\r$/, "");
      buffer = "";
      const waiter = lineWaiters.shift();
      if (waiter) waiter(line);
      else lineQueue.push(line);
    }
    while (lineWaiters.length > 0) lineWaiters.shift()("");
  });
}

function readPipedLine() {
  ensureStdinLineReader();
  if (lineQueue.length > 0) return Promise.resolve(lineQueue.shift());
  if (stdinEnded) return Promise.resolve("");
  return new Promise((resolve) => lineWaiters.push(resolve));
}

/** Read one line from the terminal, showing "*" per typed character. */
function askHidden(prompt) {
  process.stderr.write(prompt);
  if (!process.stdin.isTTY) return readPipedLine();
  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let input = "";
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === "\n" || ch === "\r") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener("data", onData);
          process.stderr.write("\n");
          resolve(input);
          return;
        }
        if (ch === "\u0003") {
          // Ctrl-C.
          process.stderr.write("\n");
          process.exit(1);
        }
        if (ch === "\u007f" || ch === "\b") {
          // Backspace: erase one asterisk.
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stderr.write("\b \b");
          }
          continue;
        }
        input += ch;
        process.stderr.write("*");
      }
    };
    stdin.on("data", onData);
  });
}

const first = await askHidden("Admin password: ");
if (first.length < MIN_LENGTH) {
  console.error(`Password must be at least ${MIN_LENGTH} characters.`);
  process.exit(1);
}
const second = await askHidden("Repeat password: ");
if (first !== second) {
  console.error("Passwords do not match. Run the script again.");
  process.exit(1);
}

const hash = await hashAdminPassword(first);
// The hash alone goes to stdout; everything else goes to stderr.
process.stdout.write(`${hash}\n`);
console.error(
  "Paste this value into Vercel as ADMIN_PASSWORD_HASH, then redeploy. " +
    "The password itself was not stored anywhere.",
);
