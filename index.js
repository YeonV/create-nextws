#!/usr/bin/env node

import { createRequire } from "module";
const require = createRequire(import.meta.url);
import * as fs from 'fs'
// import { exec } from 'child_process'
import prompts from 'prompts'
import arg from 'arg'
import path from 'path'
import chalk from 'chalk'
import { URL } from 'url';
import { cwd } from 'process'
import * as utils from './utils.js'
import * as spinner from './spinner.js';
const __dirname = new URL('.', import.meta.url).pathname;

const args = arg({
  '--help': Boolean,
  '--docs': Boolean,
  '--version': Boolean,
  '-h': '--help',
  '-d': '--docs',
  '-v': '--version',
});

if (args['--version']) {
  (async () => {
    const pkg = require(path.join(__dirname, 'package.json'))
    console.log(`NextWS v${pkg.version}`);
    process.exit(0);
  })();
}


if (args['--help']) {
  utils.showHelp()
  process.exit(0);
}

if (args['--docs']) {
  utils.showDocs()
  process.exit(0);
}

async function init() {
  console.clear();
  console.log(`${chalk.bold.red('Create Stack NextJS + Strapi + Websocket')}${chalk.dim.grey(' by Blade')}`);

  const project = await prompts([
    {
      type: 'text',
      name: 'projectname',
      message: chalk.bold.yellow('Name:'),
    },
    // {
    //   type: 'select',
    //   name: 'titlebar',
    //   message: chalk.bold.yellow('Titlebar:'),
    //   choices: [
    //     { title: 'Yes', description: 'Use Custom Titlebar', value: true },
    //     { title: 'No', description: 'Use Default Titlebar', value: false },
    //   ],
    //   initial: 0,
    // },
    {
      type: 'text',
      name: 'primary',
      message: chalk.bold.yellow('Primary color (empty for default):'),
    },
  ]);

  if (!project.projectname) return;
  const projectName = project.projectname;
  const titlebar = project.titlebar;
  const tray = project.tray;
  const tours = project.tours;
  const primary = project.primary;

  const template = await prompts([
    {
      type: 'select',
      name: 'value',
      message: chalk.bold.yellow('Template:'),
      choices: [
        {
          title: 'React-Typescript',
          description: 'more might come',
          value: { repoName: 'meeting' },
        },
      ],
    },
  ]);

  if (!template.value) return;

  const img2ico = await prompts([
    {
      type: 'select',
      name: 'value',
      message: chalk.bold.yellow('Use custom icon.png:'),
      choices: [
        { title: 'No', description: 'No', value: false },
        { title: 'Yes', description: 'Yes', value: true },
      ],
    },
  ]);

  const installNodeModules = await prompts([
    {
      type: 'select',
      name: 'value',
      message: chalk.bold.yellow('Install Node Modules:'),
      choices: [
        { title: 'No', description: 'No just scaffold the app', value: false },
        { title: 'Yes', description: 'Yes (this will take time)', value: true },
      ],
    },
  ]);

  const { repoName, branch } = template.value;
  const repo = `https://github.com/yeonv/${repoName}`;
  
  // const spinner = require('./spinner');
  try {
    if (fs.existsSync(projectName) && fs.statSync(projectName).isDirectory()) {
      console.error(`🚧 Directory "${projectName}" already exists.`);
      process.exit(1);
    }
    spinner.create(chalk.bold.yellow('Downloading and extracting...'));
    await utils.gitClone(repo, projectName, branch);
    fs.rmSync(path.join(cwd(), projectName, '.git'), {
      recursive: true,
      force: true,
    });
    spinner.clear();
    spinner.create(chalk.bold.yellow('Configuring App...'));
    const configured = await utils.replaceStrings(projectName, titlebar, tray, tours, primary);
    if (configured) {
      spinner.clear();
    }
    if (img2ico.value === true) {
      const img2icoConfirm = await prompts([
        {
          type: 'select',
          name: 'value',
          message: chalk`{bold.yellow Place squared ${chalk`{cyan icon.png}`} in ${chalk`{cyan ./${projectName}}`}:}`,
          choices: [
            {
              title: 'Confirm',
              description: `Placed icon.png inside of ${projectName}`,
              value: true,
            },
            {
              title: 'Cancel',
              description: 'Continue without custom icon',
              value: false,
            },
          ],
        },
      ]);
      if (img2icoConfirm.value === true) {
        await utils.handleIcon(projectName)
      }
    }
    if (installNodeModules.value) {
      spinner.create(chalk.bold.yellow('Installing Node Modules (grab a coffee)...'));
      const { exec } = require('child_process');
      const thePath = path.join(path.join(cwd(), projectName), 'frontend')
      const { promisify } = require('util');
      const execPromise = promisify(exec);      
      await execPromise(`cp ${path.join(cwd(), projectName)}/.env.example ${path.join(cwd(), projectName)}/.env`)
      await execPromise(`cd ${thePath} && npm install`)
      await execPromise(`cd ${path.join(cwd(), projectName)} && docker-compose up -d`)
      spinner.clear();
    }

    await utils.sleep(2000);
    utils.showDocs(projectName, titlebar, tray, tours, primary, img2ico.value, installNodeModules.value)
  } catch (error) {
    console.log(error)
    spinner.fail(error);
    process.exit(error);
  }
}

init();