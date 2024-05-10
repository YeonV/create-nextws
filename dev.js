import * as terminalTools from '@blade86/terminal-tools'
const { logTable } = terminalTools
import chalk from 'chalk'

// logTable()


// logTable({
//   title: 'Welcome to NextWS',
//   subtitle: 'NextJS + Websocket + Strapi -- Dockerizedadasdasdasdasdadas',
//   content: {
//     Name: 'NextWS',
//     Icon: 'default',
//     Color: 'default'
//   },
//   footerHeaders: { Service: 'URL' },
//   footer: {
//     'NextJS - prodaaaa': 'http://localhost:3100',
//     'NextJS - dev': 'http://localhost:3101aaaaaaaaaa',
//     'Strapi': 'http://localhost:1337'
//   },
//   afterText: 'by Blade',
//   borderTop: '┌*┐',
//   borderMid: '├*┤',
//   borderBot: '└*┘',
//   borderColor: 'bold.grey',
//   titleColor: 'bold.magenta',
//   subtitleColor: 'bold.cyan',
//   contentKeyColor: 'green',
//   contentValueColor: 'bold.yellow',
//   footerHeaderKeyColor: 'grey',
//   footerHeaderValueColor: 'grey',
//   footerKeyColor: 'white',
//   footerValueColor: 'yellow',
//   afterTextColor: 'dim.grey'
// })
logTable({
  title: 'Welcome to NextWS',
  subtitle: 'NextJS + Websocket + Strapi -- Dockerized',
  content: {
    Name: 'NextWS',
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