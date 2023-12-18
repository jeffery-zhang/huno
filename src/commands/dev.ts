import chalk from 'chalk'
import { Builder } from '../lib/builder'
import { Server } from '../lib/server'
import { Watcher } from '../lib/watcher'
import { SingleCommand } from '../types'

const action = async () => {
  const builder = new Builder('dev')
  const reader = builder.reader
  if (!reader) {
    console.log(chalk.redBright('Start dev server failed...'))
    process.exit(1)
  }
  const server = new Server(reader)
  const watcher = new Watcher(reader)
  server.startServer()
  watcher.startWatch(async () => {
    await builder.run()
    server.restartServer()
  })
}

export const dev: SingleCommand = {
  command: 'dev',
  description: 'start dev server',
  action,
}
