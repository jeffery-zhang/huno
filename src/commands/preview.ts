import { Reader } from '../lib/reader'
import { Server } from '../lib/server'
import { SingleCommand } from '../types'

const action = async () => {
  const reader = new Reader('prod')
  const server = new Server(reader)
  server.startServer()
}

export const preview: SingleCommand = {
  command: 'preview',
  description: 'start preview server',
  action,
}
