#!/usr/bin/env node

import ora from 'ora';
import chalk from 'chalk';

const cache = {};
const isTTY = process.env.CI ? false : process.stdout.isTTY;

export function create(text) {
  if (!isTTY) {
    console.log(chalk`{cyan [create-nextws]} ${text}`);
    return;
  }

  const { spinner } = cache;
  if (spinner) {
    spinner.succeed();
    delete cache.spinner;
  }

  cache.spinner = ora({
    text,
    color: 'red',
  }).start();
}

export function clear(message, isError) {
  if (!isTTY) {
    console.log(chalk`{cyan [create-nextws]} ${message}`);
    return;
  }

  const { spinner } = cache;
  if (spinner) {
    if (isError) {
      spinner.fail()
     } else {
      // spinner.stopAndPersist({symbol: '\xE2\x9C\x94'}); 
      spinner.succeed(); 
    };
    delete cache.spinner;
    // console.log('');
  }

  // const prefix = isError ? chalk.red('Error!') : chalk.green('Done!');
  // console.log(`${prefix} ${message}`);
}

export function fail(message) {
  clear(message, true);
  process.exit(1);
}