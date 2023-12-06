import http from 'http'
import express from 'express'
import chalk from 'chalk'

import { Path } from '../lib/path'
import { SingleCommand } from '../types'

const startPreviewServer = () => {
  const env = 'prod'
  const path = new Path(env)

  const app = express()
  const port = path.port
  app.use('/', express.static(path.outputPath))

  http.createServer(app).listen(port, () => {
    console.log(
      `preview sever is running on ${chalk.greenBright(
        'http://localhost:' + port,
      )}`,
    )
  })
}

const action = async () => {
  startPreviewServer()
}

export const preview: SingleCommand = {
  command: 'preview',
  description: 'start preview server',
  action,
}
