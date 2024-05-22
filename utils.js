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
const net = require('net')

/**
 * Checks if a given port is open.
 * @param {number} port - The port to check.
 * @returns {Promise<boolean>} - A promise that resolves with a boolean indicating whether the port is open.
 */
export function checkPort(port) {
  return new Promise((resolve, reject) => {
    const server = net
      .createServer()
      .once('error', (err) => (err.code === 'EADDRINUSE' ? resolve(false) : reject(err)))
      .once('listening', () => server.once('close', () => resolve(true)).close())
      .listen(port)
  })
}

/**
 * Checks a range of ports for availability.
 * @param {number} start - The starting port number.
 * @param {number} count - The number of ports to check.
 * @returns {Promise<Array<{port: number, isOpen: boolean}>>} - A promise that resolves with an array of port status objects.
 */
export async function checkPorts(start, count) {
  const openPorts = []
  for (let i = start; i < start + count; i++) {
    const isOpen = await checkPort(i)
    openPorts.push({ port: i, isOpen })
  }

  if (openPorts.some((port) => port.isOpen === false)) {
    console.error(chalk.bold.red('Ports are not available. Exiting...'))
    console.error(
      chalk.bold.cyan(
        openPorts
          .filter((port) => port.isOpen === false)
          .map((port) => port.port)
          .join('\n')
      )
    )
    process.exit(1)
  }

  return openPorts
}

/**
 * Displays the help message.
 */
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

/**
 * Replaces certain strings in specific files.
 * @param {string} name - The project name and version.
 * @returns {Promise<boolean>} - A promise that resolves when the operation is complete.
 */
export function setPackageJson(name) {
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

/**
 * Clones a git repository.
 * @param {string} repo - The repository to clone.
 * @param {string} projectName - The name of the project.
 * @param {string} [branch] - The branch to clone.
 * @returns {Promise<any>} - A promise that resolves when the operation is complete.
 */
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

/**
 * Determines the available package manager.
 * @returns {Promise<string>} - A promise that resolves with the name of the available package manager.
 */
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

/**
 * Pauses execution for a specified amount of time.
 * @param {number} ms - The amount of time to sleep in milliseconds.
 * @returns {Promise<void>} - A promise that resolves after the specified amount of time.
 */
export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Checks if Docker is running.
 * @returns {Promise<boolean>} - A promise that resolves with a boolean indicating whether Docker is running.
 */
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

/**
 * Checks if Docker is running
 * @returns {Promise<boolean>} - A promise that resolves with a boolean indicating whether Docker is running.
 */
export async function checkDocker() {
  const docker = await isDockerRunning()
  if (!docker) {
    console.log(chalk.bold.red('Docker is not running. Running in lite mode. No Strapi, no Containers. Just barebones NextJS + NextWS.'))
    console.log(chalk.bold.red('CTRL+C to exit. Autostart in 2 seconds..'))
    await sleep(2000)
  }
  return docker
}

/**
 * Checks if a Docker network exists, and creates it if it doesn't.
 * @param {string} name - The name of the Docker network.
 */
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

/**
 * Generates an environment file (.env) based on a template (.env.example).
 * @param {string} [input='.env.example'] - The input file path.
 * @param {string} [output='.env'] - The output file path.
 * @param {string} [mode='manual'] - The mode of operation ('manual' or 'smart').
 * @param {number} [portsStartingRange=3000] - The starting range for the ports.
 * @param {Array<string>} [providers=[]] - The list of providers.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
export async function generateEnv(input = '.env.example', output = '.env', mode = 'manual', portsStartingRange = 3000, providers = []) {
  let providerConfigs = {}
  for (const provider of providers) {
    const idKey = provider.toUpperCase() + '_ID'
    const secretKey = provider.toUpperCase() + '_SECRET'
    let authAppUrl = ''
    switch (provider) {
      case 'github':
        authAppUrl = 'https://github.com/settings/applications/new'
        break
      case 'google':
        authAppUrl = 'https://console.developers.google.com/apis/credentials'
        break
      case 'twitter':
        authAppUrl = 'https://developer.twitter.com/en/apps'
        break
      case 'discord':
        authAppUrl = 'https://discord.com/developers/applications'
        break
      case 'spotify':
        authAppUrl = 'https://developer.spotify.com/dashboard/applications'
        break
      case 'battlenet':
        authAppUrl = 'https://develop.battle.net/access/clients'
        break
    }
    console.log(chalk.bold.cyan('→ ') + chalk.bold.yellow('Create new app: ') + chalk.bold.cyan(authAppUrl))
    console.log(
      chalk.bold.cyan('↳ ') + chalk.bold.yellow('Homepage URL:   ') + chalk.bold.cyan(`http://localhost:${portsStartingRange}/api/auth/callback/google`)
    )
    console.log(chalk.bold.cyan('↳ ') + chalk.bold.yellow('Auth CB URL:    ') + chalk.bold.cyan(`http://localhost:${portsStartingRange}`))

    const p = await prompts([
      {
        type: 'text',
        name: 'clientId',
        message: chalk.bold.yellow(`${provider} Client ID:`),
        instructions: 'https://github.com/settings/applications/new'
      },
      {
        type: 'text',
        name: 'clientSecret',
        message: chalk.bold.yellow(`${provider} Client Secret:`)
      }
    ])
    providerConfigs = {
      ...providerConfigs,
      ...{
        [idKey]: p.clientId,
        [secretKey]: p.clientSecret
      }
    }
  }
  const fileStream = await fsp.readFile(input, 'utf-8')
  const lines = fileStream.split('\n')

  const categories = [
    { name: 'URL & Ports', filter: (key) => key.endsWith('_PORT') || ['NEXT_PUBLIC_NEXTJS_URL', 'NEXTAUTH_URL', 'NEXT_PUBLIC_STRAPI_BACKEND_URL'].includes(key) },
    { name: 'Database', filter: (key) => key.includes('DATABASE') && !key.endsWith('_PORT') },
    { name: 'Advanced', filter: (key) => ['NODE_ENV', 'HOST'].includes(key) },
    { name: 'Docker', filter: (key) => key.includes('DOCKER') },
    { name: 'Letsencrypt', filter: (key) => ['LETSENCRYPT_EMAIL', 'BASE_DOMAIN', 'STRAPI_SUB_DOMAIN', 'SUB_DOMAIN'].includes(key) }
  ]
  let selectedCategories = { value: [] }
  if (mode === 'manual') {
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
    if (line.startsWith('#') && !line.startsWith('#WIN') && !line.startsWith('#MAC')) {
      continue
    }
    if (line.trim() === '') {
      newEnv += `\n`
      continue
    }
    if (process.platform === 'win32') {
      if (line.startsWith('#WIN')) {
        newEnv += `${line.replace('#WIN ', '')}\n`
        continue
      }
    }
    if (process.platform === 'darwin') {
      if (line.startsWith('#MAC')) {
        newEnv += `${line.replace('#MAC ', '')}\n`
        continue
      }
    }
    let [key, defaultValue] = line.trim().split('=')
    defaultValue = defaultValue.replace(/"/g, '') // remove quotes

    let value = ''
    if (defaultValue.startsWith('XXXXXXX')) {
      value = crypto.randomBytes(Math.ceil(defaultValue.length / 2)).toString('hex')
    } else if (mode === 'manual' && selectedCategories.value.some((category) => category.filter(key))) {
      const userInput = await prompts([
        {
          type: 'text',
          name: key,
          message: chalk.bold.yellow(`Set ${chalk.bold.cyan(key)}:`),
          initial: defaultValue
        }
      ])
      value = userInput[key] || defaultValue
    } else if (mode === 'smart' && key.endsWith('NEXT_PUBLIC_NEXTJS_URL')) {
      value = `http://localhost:${portsStartingRange}`
    } else if (mode === 'smart' && key.endsWith('NEXTAUTH_URL')) {
      value = `http://localhost:${portsStartingRange}`
    } else if (mode === 'smart' && key.endsWith('NEXT_PUBLIC_STRAPI_BACKEND_URL')) {
      value = `http://localhost:${portsStartingRange + 4}`
    } else if (mode === 'smart' && key.endsWith('_PORT')) {
      value = portsStartingRange
      portsStartingRange++
    } else {
      providerConfigs[key] ? (value = providerConfigs[key]) : (value = defaultValue)
    }

    newEnv += `${key}="${value}"\n`
  }

  spinner.create(chalk.bold.yellow('Successfully generated .env'))
  spinner.clear()
  return await fsp.writeFile(output, newEnv)
}

/**
 * Configures a Docker Compose file.
 * @param {string} [filePath='docker-compose.yml'] - The path to the Docker Compose file.
 * @param {string} [name='yz'] - The name to use for the services.
 * @param {string} [mode='manual'] - The mode of operation ('manual' or 'smart').
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
export async function configureDockerCompose(filePath = 'docker-compose.yml', name = 'yz', mode = 'manual') {
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
  let responses = {}
  if (mode === 'smart') {
    responses = {
      yznextdev: `${name}-next-dev`,
      yznextprod: `${name}-next-prod`,
      yzstrapiDB: `${name}-strapi-db`,
      yzstrapiAdminer: `${name}-strapi-adminer`,
      yzstrapiweb: `${name}-strapi-web`
    }
  } else {
    console.log(chalk.bold.yellow('✔ Set new service names:'))
    // Ask the user for the new service names
    responses = await prompts(
      services.map((service) => ({
        type: 'text',
        name: service,
        message: chalk.bold.yellow(`Set ${chalk.bold.cyan(serviceNames[service])}:`),
        initial: service
      }))
    )
  }
  // Replace the service names in the docker-compose.yml file
  let newDockerCompose = dockerCompose
  for (const service of services) {
    const regex = new RegExp(service, 'g')
    newDockerCompose = newDockerCompose.replace(regex, responses[service])
  }

  let newerDockerCompose = ''

  for (const line of newDockerCompose.split('\n')) {
    if (line.startsWith('#MAC') && process.platform === 'darwin') {
      newerDockerCompose += line.replace('#MAC - ', '') + '\n'
    } else if (line.startsWith('#WIN') && process.platform === 'win32') {
      newerDockerCompose += line.replace('#WIN - ', '') + '\n'
    } else {
      newerDockerCompose += line + '\n'
    }
  }
  // Write the new docker-compose.yml file
  spinner.create(chalk.bold.yellow('Successfully created docker-compose.yml'))
  spinner.clear()
  return await fsp.writeFile(filePath, newerDockerCompose)
}

/**
 * The directory separator for the current platform.
 * @type {string}
 */
export const dirSep = process.platform === 'win32' ? '\\' : '/'
