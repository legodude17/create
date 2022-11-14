import fs from "node:fs/promises";
import path from "node:path";
import { execa } from "execa";

let _cwd = process.cwd();

export function cwd(dir) {
  if (dir) {
    _cwd = dir;
  }
  return _cwd;
}

export function resolve(...args) {
  return path.resolve(cwd(), ...args);
}

export function command(command, args, opts = {}) {
  if (!Array.isArray(args)) args = args.split(" ");
  opts.cwd = cwd();
  return execa(command, args, opts);
}

export async function mkdirp(path, opts = {}) {
  fs.mkdir(resolve(path), { recursive: true, ...opts });
  return `Created ${path}`;
}

export function format(obj) {
  return JSON.stringify(obj, undefined, 2);
}

export async function writeFile(place, contents) {
  await fs.writeFile(resolve(place), contents, "utf8");
  return `Wrote ${place}`;
}

export function write(place, obj) {
  return writeFile(place, format(obj));
}
