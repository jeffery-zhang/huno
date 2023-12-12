import chokidar from 'chokidar'

import { Reader } from './reader'
import chalk from 'chalk'

export class Watcher {
  constructor(reader: Reader) {
    if (!reader) {
      throw new Error('Reader is required in Watcher')
    }
    this._reader = reader
  }

  private _reader: Reader
  private _watcher: chokidar.FSWatcher | null = null
  private _callbackList: (() => Promise<void>)[] = []

  startWatch(callback: (filePath: string) => Promise<void>) {
    try {
      this._watcher = chokidar.watch(this._reader.contentPath)
      this.loopCallback()
      this._watcher.on('all', async (e, filePath) => {
        if (e === 'change' || e === 'add') {
          console.log(chalk.yellowBright(`${filePath} has changed...`))
          this._callbackList.push(async () => await callback(filePath))
        }
      })
    } catch (error) {
      console.log(chalk.redBright(`Watch files change error\n${error}`))
      process.exit(1)
    }
  }

  loopCallback() {
    setInterval(async () => {
      if (this._callbackList.length > 0) {
        const callback = this._callbackList.pop()
        if (callback) {
          await callback()
          this._callbackList = []
        }
      }
    }, 1000)
  }
}
