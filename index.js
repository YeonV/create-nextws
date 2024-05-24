#!/usr/bin/env node

import { createRequire } from 'module'
import * as fs from 'fs'
import * as utils from './utils.js'
import * as spinner from './spinner.js'
import * as terminalTools from '@blade86/terminal-tools'
import prompts from 'prompts'
import arg from 'arg'
import path from 'path'
import chalk from 'chalk'
import { URL } from 'url'
import { cwd } from 'process'
import { config as dotEnv } from 'dotenv'
const require = createRequire(import.meta.url)
const { logTable, yesNo } = terminalTools
const { dirSep, showHelp, checkDocker, sleep, gitClone, setPackageJson, generateEnv, configureDockerCompose, dockerNetwork, checkPorts } = utils
const { exec } = require('child_process')
const { promisify } = require('util')
const execPromise = promisify(exec)
const __dirname = new URL('.', import.meta.url).pathname

const args = arg({
  '--help': Boolean,
  '--docs': Boolean,
  '--version': Boolean,
  '-h': '--help',
  '-d': '--docs',
  '-v': '--version'
})

if (args['--version']) {
  ;(async () => {
    const pkg = require(path.join(__dirname, 'package.json'))
    console.log(`NextWS v${pkg.version}`)
    process.exit(0)
  })()
}

if (args['--help']) {
  showHelp()
  process.exit(0)
}

if (args['--docs']) {
  logTable()
  process.exit(0)
}

async function init() {
  console.clear()
  console.log(`${chalk.bold.red('Create Stack NextJS + Strapi + Websocket')}${chalk.dim.grey(' by Blade')}`)

  const docker = await checkDocker()

  const modes = [
    { name: 'Smart', value: 'smart' },
    { name: 'Automatic', value: 'automatic' },
    { name: 'Manual', value: 'manual' }
  ]

  const project = await prompts([
    {
      type: 'text',
      name: 'projectname',
      message: chalk.bold.yellow('Name:'),
      validate: (value) => {
        const pattern = '^(?:(?:@(?:[a-z0-9-*~][a-z0-9-*._~]*)?/[a-z0-9-._~])|[a-z0-9-~])[a-z0-9-._~]*$'
        return value.match(pattern) ? true : 'Invalid project name'
      }
    },
    {
      type: 'select',
      name: 'mode',
      message: chalk.bold.yellow('Select Mode:'),
      choices: modes.map((mode) => ({ title: mode.name, value: mode.value }))
    }
  ])

  if (!project.projectname) return
  const projectName = project.projectname
  const basePath = path.join(cwd(), projectName)
  const copy = process.platform === 'win32' ? 'copy' : 'cp'

  let manual = { autoenv: { value: true }, compose: { value: true } }
  if (project.mode === 'manual') {
    manual = await prompts([yesNo('autoenv', 'Auto-Generate .env:'), yesNo('compose', 'Customize compose service names?')])
  }
  let portsStartingRange = 3000
  let providers = []
  if (project.mode === 'smart') {
    const providerOptions = ['github', 'google', 'twitter', 'discord', 'spotify', 'battlenet']

    const p = await prompts([
      {
        type: 'number',
        name: 'port',
        message: chalk.bold.yellow('Starting Port (will use 5 ports for different services):'),
        initial: 3000
      },
      yesNo('configProdivers', 'Pre-configure providers?'),
      {
        type: (prev) => (prev === true ? 'multiselect' : null),
        name: 'providers',
        message: chalk.bold.yellow('Select Providers to configure:'),
        choices: providerOptions.map((provider) => ({ title: provider.charAt(0).toUpperCase() + provider.slice(1), value: provider }))
      }
    ])

    portsStartingRange = p.port
    providers = p.providers
  }
  await checkPorts(portsStartingRange, 5)

  try {
    if (fs.existsSync(projectName) && fs.statSync(projectName).isDirectory()) {
      console.error(` Directory "${projectName}" already exists.`)
      process.exit(1)
    }
    spinner.create(chalk.bold.yellow('Downloading and extracting...'))
    await gitClone('https://github.com/yeonv/meeting', projectName)
    // fs.rmSync(path.join(cwd(), projectName, '.git'), { recursive: true, force: true })
    spinner.clear()

    spinner.create(chalk.bold.yellow('Configuring App...'))
    await setPackageJson(projectName)
    spinner.clear()

    await generateEnv(`${basePath}${dirSep}.env.example`, `${basePath}${dirSep}.env`, project.mode, portsStartingRange, providers, projectName)
    await execPromise(`${copy} ${basePath}${dirSep}.env ${basePath}${dirSep}frontend${dirSep}.env`)
    await execPromise(`${copy} ${basePath}${dirSep}.env ${basePath}${dirSep}backend${dirSep}.env`)

    dotEnv({ path: `${basePath}${dirSep}.env` })

    spinner.create(chalk.bold.yellow('Installing Node Modules... (get a coffee)'))
    await execPromise(`cd ${basePath}${dirSep}frontend && npm install --force`)
    await execPromise(`cd ${basePath}${dirSep}frontend && npx next-ws-cli@latest patch --yes`)
    spinner.clear()

    if (docker) {
      if ((manual.compose === true || manual.compose.value === true) && project.mode !== 'automatic') {
        await configureDockerCompose(`${basePath}/docker-compose.yml`, projectName, project.mode)
      }

      spinner.create(chalk.bold.yellow('Creating Docker Network...'))
      await dockerNetwork(process.env.DOCKER_NETWORK)
      spinner.clear()

      spinner.create(chalk.bold.yellow('Pulling Docker Images... (First time takes ages)'))
      ;(await execPromise(`cd ${basePath} && docker-compose pull ${projectName}-strapi-web ${projectName}-strapi-db ${projectName}-strapi-adminer`)) ||
        spinner.clear()
      spinner.clear()

      spinner.create(chalk.bold.yellow('Starting Docker Containers... (First time takes ages, get another coffee or two)'))
      ;(await execPromise(`cd ${basePath} && docker-compose up -d`)) || spinner.clear()
      spinner.clear()
    }

    await sleep(2000)
    logTable({
      title: 'Welcome to NextWS',
      subtitle: 'NextJS + Websocket + Strapi -- Dockerized',
      content: {
        Name: projectName,
        Network: process.env.DOCKER_NETWORK || 'webproxy'
      },
      footerHeaders: { Service: 'URL' },
      footer: {
        'NextJS - prod': `http://localhost:${process.env.NEXT_PORT || 3100}`,
        'NextJS - dev': `http://localhost:${process.env.NEXT_DEV_PORT || 3101}`,
        'Strapi': `http://localhost:${process.env.STRAPI_PORT || 1337}`,
        '↳ Login Email': process.env.INIT_ADMIN_EMAIL || 'admin@strapi.com',
        '↳ Password': process.env.INIT_ADMIN_PASSWORD || 'admin'
      },
      afterText: 'by Blade'
    })
  } catch (error) {
    console.log(error)
    spinner.fail(error)
    process.exit(error)
  }
}

init()
