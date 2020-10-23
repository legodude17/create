#! /usr/bin/env node

const run = require('./run');
const basic = require('./types/basic');
const rollup = require('./types/rollup');
const parcel = require('./types/parcel');

run([basic, rollup, parcel])
  .catch(console.error)
  .then(() => process.exit());
