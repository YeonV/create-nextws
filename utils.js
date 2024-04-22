#!/usr/bin/env node

import { createRequire } from "module";
const require = createRequire(import.meta.url);
import fs from 'fs';
import cp from 'child_process';
import replace from 'replace-in-file';
import path from 'path';
import chalk, { Chalk } from 'chalk'; // Import Chalk with named export
import { cwd } from 'process';

export function showHelp() {
  console.clear();
  console.log(
    `
      ${chalk.bold.yellow('Create NextJS + NextWS + Strapi')} ${chalk.grey('by Blade')}
      
      ${chalk.bold('USAGE')}
        ${chalk.bold('$')} ${chalk.cyan('create-nextws')} --help
        ${chalk.bold('$')} ${chalk.cyan('create-nextws')} --version
        ${chalk.bold('$')} ${chalk.cyan('create-nextws')}
  
      ${chalk.bold('OPTIONS')}
        --help,     -h                      ${chalk.grey('shows this help message')}
        --version,  -v                      ${chalk.grey('displays the current version of create-nextws')}
    `
  );
}

export function showDocs(projectName, ptitlebar, ptray, ptours, pprimary, picon, installNodeModules) {
  const name = projectName || 'NextWS';
  const titlebar = ptitlebar === true ? 'custom' : 'default';
  const icon = picon === true ? 'custom' : 'default';
  const tray = ptray === true ? 'yes' : 'no';
  const tours = ptours ? 'yes' : 'no';
  const primary = pprimary === '' ? 'default' : pprimary;
  console.clear();
  console.log(`
${chalk.dim.grey('┌───────────────────────────────────────┐')}
${chalk.dim.grey('│')  }           ${chalk.bold.red('Welcome to NextWS')}           ${chalk.dim.grey('│')  }
${chalk.dim.grey('│')  }  ${chalk.dim('Electron + Vite + React + Typescript')} ${chalk.dim.grey('│')  }
${chalk.dim.grey('├───────────────────────────────────────┤')}
${chalk.dim.grey('│')  }  Name:      ${chalk.bold.yellow(`${name}`)}${spaces(26, name)}${chalk.dim.grey('│')  }
${chalk.dim.grey('│')  }  Tray:      ${chalk.bold.yellow(`${tray}`)}${spaces(26, tray)}${chalk.dim.grey('│')  }
${chalk.dim.grey('│')  }  Icon:      ${chalk.bold.yellow(`${icon}`)}${spaces(26, icon)}${chalk.dim.grey('│')  }
${chalk.dim.grey('│')  }  Titlebar:  ${chalk.bold.yellow(`${titlebar}`)}${spaces(26, titlebar)}${chalk.dim.grey('│')  }
${chalk.dim.grey('│')  }  Tours:     ${chalk.bold.yellow(`${tours}`)}${spaces(26, tours)}${chalk.dim.grey('│')  }
${chalk.dim.grey('│')  }  Color:     ${chalk.bold.yellow(`${primary}`)}${spaces(26, primary)}${chalk.dim.grey('│')  }
${chalk.dim.grey('├─────────┬──────────────┬──────────────┤')}
${chalk.dim.grey('│')  }         ${chalk.dim.grey('│')  }     APP      ${chalk.dim.grey('│')  }     WEB      ${chalk.dim.grey('│')  }
${chalk.dim.grey('├─────────┼──────────────┼──────────────┤')}
${chalk.dim.grey('│')  }  dev    ${chalk.dim.grey('│')  }  ${chalk.bold.yellow('yarn start')}  ${chalk.dim.grey('│')  }  ${chalk.bold.yellow('yarn build')}  ${chalk.dim.grey('│')  }
${chalk.dim.grey('│')  }  build  ${chalk.dim.grey('│')  }  ${chalk.bold.yellow('yarn dev')}    ${chalk.dim.grey('│')  }  ${chalk.bold.yellow('yarn dist')}   ${chalk.dim.grey('│')  }
${chalk.dim.grey('└─────────┴──────────────┴──────────────┘')}
                    ${chalk.dim.grey('by Blade')}
  
To get started run:
  
${chalk.bold.yellow(`cd ${name}`)}
${!installNodeModules ? chalk.bold.yellow('yarn\nyarn dev') : chalk.bold.yellow('yarn dev')}`)
}

  export function replaceStrings(name, titlebar, tray, tours, primary) {
    return new Promise((resolve, reject) => {
      const options = [
        {
          files: [
            `${name}/frontend/package.json`,
            `${name}/frontend/package-lock.json`,
          ],
          from: /meeting/g,
          to: name.toLowerCase(),
        },
        {
          files: `${name}/package.json`,
          from: /"version": "\d.\d.\d"/g,
          to: `"version": "0.0.1"`,
        },
        // {
        //   files: `${name}/package.json`,
        //   from: /"description": "(.*?)"/g,
        //   to: `"description": "${name} 0.0.1 - supercharged with nextws (by Blade)"`,
        // },
      ];
      // if (!titlebar) {
      //   options.push({
      //     files: `${name}/package.json`,
      //     from: /"NEXTWS_CUSTOM_TITLEBAR": true/g,
      //     to: `"NEXTWS_CUSTOM_TITLEBAR": false`,
      //   })
      // }

      if (primary !== '') {
        options.push({
          files: `${name}/package.json`,
          from: /"NEXTWS_PRIMARY_COLOR": "default"/g,
          to: `"NEXTWS_PRIMARY_COLOR": "${primary}"`,
        })
      }
      // const customChalk = new Chalk({ level: 4 }); 
      for (let index = 0; index < options.length; index++) {
        try {
        // options[index].from = customChalk.styles.reset(options[index].from); // Reset styles before replacement
        const results = replace.sync(options[index]);
        if (!results) return;
        resolve(true);
      } catch (error) {
        console.error('Error occurred:', error);
        reject(error);
      }
      }
    });
}

export function handleIcon(name) {
    const pngToIco = require('png-to-ico');
    const png2icons = require("png2icons");
    const input = fs.readFileSync(`${name}/icon.png`);
    return new Promise((resolve, reject) => {
      pngToIco(`${name}/icon.png`)
        .then((buf) => {
          fs.writeFileSync(`${name}/resources/icon.ico`,buf);
          fs.writeFileSync(`${name}/resources/installerIcon.ico`,buf);
          fs.writeFileSync(`${name}/resources/uninstallerIcon.ico`,buf);
          fs.rmSync(`${name}/resources/icon.icns`, {recursive: true,force: true,});       
          const output = png2icons.createICNS(input, png2icons.BILINEAR, 0);
          if (output) {
              fs.writeFileSync(`${name}/resources/icon.icns`, output);
          }
          resize(path.join(name, 'icon.png'),`${name}/resources/icon.png`);
          resize(path.join(name, 'icon.png'),`${name}/packages/renderer/src/assets/icon.png`);
          fs.rmSync(path.join(cwd, name, 'icon.png'), {recursive: true,force: true,});
          resolve()
        })
        .catch(error=>{
          console.log(error)
          reject()
        });
      });    
}
  
export async function resize(source, target, size = 256) {
    const jimp = require('jimp');
    const image = await jimp.read(source);
    image.resize(size, jimp.AUTO);
    await image.writeAsync(target || source);
    return true;
}

export function gitClone(repo, projectName, branch) {
    return new Promise((resolve, reject) => {
      const _branch = branch ? ['-b', branch] : [];
      cp.spawn('git', ['clone', ..._branch, repo, projectName, '--depth', '1'], {
        stdio: 'ignore',
      }).on('close', (code, signal) => {
        if (code) {
          reject(code);
          return;
        }
        resolve(signal);
      });
    });
}

export async function pm() {
    const { promisify } = require('util');
    const { exec: defaultExec } = require('child_process');
    let pm = 'yarn';
    const exec = promisify(defaultExec);
    try {
      await exec(`${pm} -v`, { cwd });
    } catch (_) {
      pm = 'npm';
      try {
        await exec(`${pm} -v`, { cwd });
      } catch (_) {
        pm = undefined;
      }
    }
    if (pm === undefined) {
      console.log(
        chalk.yellow(
          'No available package manager! (`npm` or `yarn` is required)'
        )
      );
      pm = 'npm'
      process.exit(1);
    }
    return pm;
}


export function spaces(max, str) {
    return Array(max - str.length).fill('\xa0').join('')
}

export function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}