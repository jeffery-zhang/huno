import path from 'path'
import http from 'http'
import express, { Express } from 'express'

import { Path } from './path'
import chalk from 'chalk'

export class Server {
  constructor(path: Path) {
    if (!path) {
      throw new Error('Path is required in server')
    }
    this._path = path
  }

  private _path: Path
  private _server: http.Server | null = null

  startServer() {
    const isDev = this._path.env == 'dev'

    const app: Express = express()
    const port = this._path.port

    app.use('/', express.static(this._path.outputPath))

    const server: http.Server = app.listen(port, () => {
      console.log(
        chalk.greenBright('Server is running on http://localhost:' + port),
      )
    })

    this._server = server
  }

  restartServer() {
    if (this._server) {
      this._server.close((err) => {
        if (err) {
          console.log(chalk.redBright(`Restart server error\n${err}`))
          process.exit(1)
        }
        this._server = null
        this.startServer()
        console.log(chalk.greenBright('Server restarted'))
      })
    }
  }
}
