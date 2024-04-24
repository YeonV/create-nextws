import * as terminalTools from '@blade86/terminal-tools'
const { logTable } = terminalTools
import chalk from 'chalk'

// logTable()
logTable({
  title: 'Welcome to NextWS',
  subtitle: 'NextJS + Websocket + Strapi -- Dockerized',
  content: {
    Name: 'NextWS',
    Icon: 'default',
    Color: 'default'
  },
  footerHeaders: { Service: 'URL' },
  footer: {
    'NextJS - prod': 'http://localhost:3100',
    'NextJS - dev': 'http://localhost:3101',
    'Strapi': 'http://localhost:1337'
  },
  afterText: 'by Blade',
  borderMid: '|=|',
  borderColor: chalk.red
})
