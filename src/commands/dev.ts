import { Builder } from '../lib/builder'
import { Reader } from '../lib/reader'
import { Server } from '../lib/server'
import { Watcher } from '../lib/watcher'
import { SingleCommand } from '../types'

const action = async () => {
  const builder = new Builder('dev')
  await builder.run()
  const reader = new Reader('dev')
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
