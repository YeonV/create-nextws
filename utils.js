#!/usr/bin/env node

import { createRequire } from 'module'
const require = createRequire(import.meta.url)
import fs from 'fs'
import * as fsp from 'fs/promises'
import cp from 'child_process'
import replace from 'replace-in-file'
import path from 'path'
import chalk, { Chalk } from 'chalk' // Import Chalk with named export
import { cwd } from 'process'
import crypto from 'crypto'
import prompts from 'prompts'
import * as spinner from './spinner.js'
const { exec } = require('child_process')
const { promisify } = require('util')
const execPromise = promisify(exec)

export function showHelp() {
  console.clear()
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
  )
}

export function replaceStrings(name) {
  return new Promise((resolve, reject) => {
    const options = [
      {
        files: [`${name}/frontend/package.json`, `${name}/frontend/package-lock.json`],
        from: /meeting/g,
        to: name.toLowerCase()
      },
      {
        files: `${name}/frontend/package.json`,
        from: /"version"\s*:\s*"\d+\\.\d+\\.\d+"/g,
        to: `"version": "0.0.1"`
      }
    ]

    for (let index = 0; index < options.length; index++) {
      try {
        const results = replace.sync(options[index])
        if (!results) return
        resolve(true)
      } catch (error) {
        console.error('Error occurred:', error)
        reject(error)
      }
    }
  })
}

export function gitClone(repo, projectName, branch) {
  return new Promise((resolve, reject) => {
    const _branch = branch ? ['-b', branch] : []
    cp.spawn('git', ['clone', ..._branch, repo, projectName, '--depth', '1'], {
      stdio: 'ignore'
    }).on('close', (code, signal) => {
      if (code) {
        reject(code)
        return
      }
      fs.rmSync(path.join(cwd(), projectName, '.git'), { recursive: true, force: true })
      resolve(signal)
    })
  })
}

export async function pm() {
  const { promisify } = require('util')
  const { exec: defaultExec } = require('child_process')
  let pm = 'yarn'
  const exec = promisify(defaultExec)
  try {
    await exec(`${pm} -v`, { cwd })
  } catch (_) {
    pm = 'npm'
    try {
      await exec(`${pm} -v`, { cwd })
    } catch (_) {
      pm = undefined
    }
  }
  if (pm === undefined) {
    console.log(chalk.yellow('No available package manager! (`npm` or `yarn` is required)'))
    pm = 'npm'
    process.exit(1)
  }
  return pm
}

export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export async function isDockerRunning() {
  try {
    await execPromise('docker ps')
    // Additional check for at least one running container (optional)
    // const psOutput = await execPromise('docker ps -q')
    // return psOutput.trim() !== ''
    return true
  } catch (error) {
    return false
  }
}
export async function dockerNetwork(name) {
  try {
    // Check if the network exists
    const { stdout: networks } = await execPromise('docker network ls --format "{{.Name}}"')
    if (!networks.includes(name)) {
      // If the network doesn't exist, create it
      await execPromise(`docker network create ${name}`)
      // console.log(`Docker network "${name}" has been created.`)
    } else {
      // console.log(`Docker network "${name}" already exists.`)
    }
  } catch (error) {
    console.error(`Error checking/creating Docker network "${name}":`, error)
  }
}

export async function generateEnv(input = '.env.example', output = '.env', autogen = false) {
  const fileStream = await fsp.readFile(input, 'utf-8')
  const lines = fileStream.split('\n')

  const categories = [
    { name: 'URL & Ports', filter: (key) => key.endsWith('_PORT') || key.startsWith('NEXT_PUBLIC_') },
    { name: 'Database', filter: (key) => key.includes('DATABASE') && !key.endsWith('_PORT') },
    { name: 'Advanced', filter: (key) => ['NODE_ENV', 'HOST'].includes(key) },
    { name: 'Docker', filter: (key) => key.includes('DOCKER') },
    { name: 'Letsencrypt', filter: (key) => ['LETSENCRYPT_EMAIL', 'BASE_DOMAIN', 'STRAPI_SUB_DOMAIN', 'SUB_DOMAIN'].includes(key) }
  ]
  let selectedCategories = { value: [] }
  if (autogen === false) {
    selectedCategories = await prompts([
      {
        type: 'multiselect',
        name: 'value',
        message: chalk.bold.yellow('Select categories to configure:'),
        choices: categories.map((category) => ({ title: category.name, value: category }))
      }
    ])
  }

  let newEnv = ''

  for (const line of lines) {
    if (line.startsWith('#')) {
      continue
    }
    if (line.trim() === '') {
      newEnv += `\n`
      continue
    }

    let [key, defaultValue] = line.trim().split('=')
    defaultValue = defaultValue.replace(/"/g, '') // remove quotes

    let value = ''
    if (defaultValue.startsWith('XXXXXXX')) {
      value = crypto.randomBytes(Math.ceil(defaultValue.length / 2)).toString('hex')
    } else if (!autogen && selectedCategories.value.some((category) => category.filter(key))) {
      const userInput = await prompts([
        {
          type: 'text',
          name: key,
          message: chalk.bold.yellow(`Set ${chalk.bold.cyan(key)}:`),
          initial: defaultValue
        }
      ])
      value = userInput[key] || defaultValue
    } else {
      value = defaultValue
    }

    newEnv += `${key}="${value}"\n`
  }

  spinner.create(chalk.bold.yellow('Successfully generated .env'))
  spinner.clear()
  return await fsp.writeFile(output, newEnv)
}

export async function configureDockerCompose(filePath = 'docker-compose.yml') {
  // Read the docker-compose.yml file
  const dockerCompose = fs.readFileSync(filePath, 'utf-8')

  // Define the services that can be renamed
  const services = ['yznextdev', 'yznextprod', 'yzstrapiDB', 'yzstrapiAdminer', 'yzstrapiweb']
  const serviceNames = {
    yznextdev: 'NextJS - Development',
    yznextprod: 'NextJS - Production',
    yzstrapiDB: 'Strapi - Database',
    yzstrapiAdminer: 'Strapi - Adminer',
    yzstrapiweb: 'Strapi - Web'
  }
  console.log(chalk.bold.yellow('✔ Set new service names:'))
  // Ask the user for the new service names
  const responses = await prompts(
    services.map((service) => ({
      type: 'text',
      name: service,
      message: chalk.bold.yellow(`Set ${chalk.bold.cyan(serviceNames[service])}:`),
      initial: service
    }))
  )

  // Replace the service names in the docker-compose.yml file
  let newDockerCompose = dockerCompose
  for (const service of services) {
    const regex = new RegExp(service, 'g')
    newDockerCompose = newDockerCompose.replace(regex, responses[service])
  }

  // Write the new docker-compose.yml file
  spinner.create(chalk.bold.yellow('Successfully created docker-compose.yml'))
  spinner.clear()
  return await fsp.writeFile(filePath, newDockerCompose)
}

export const dirSep = process.platform === 'win32' ? '\\' : '/'
