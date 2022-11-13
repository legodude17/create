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

export function mkdirp(path, opts = {}) {
  return fs.mkdir(path, { recursive: true, ...opts });
}

export function format(obj) {
  return JSON.stringify(obj, undefined, 2);
}

export function writeFile(place, contents) {
  return fs.writeFile(resolve(place), contents, "utf8");
}

export function write(place, obj) {
  return writeFile(place, format(obj));
}
