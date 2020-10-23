#! /usr/bin/env node

const run = require('./run');
const basic = require('./types/basic');
const rollup = require('./types/rollup');
const parcel = require('./types/parcel');
const rimworldmod = require('./types/rimworldmod');

run([basic, rollup, parcel, rimworldmod])
  .catch(console.error)
  .then(() => process.exit());
