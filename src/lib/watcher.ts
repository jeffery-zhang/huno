import lodash from 'lodash'
import chokidar from 'chokidar'
import chalk from 'chalk'

import { Reader } from './reader'

export class Watcher {
  constructor(reader: Reader) {
    if (!reader) {
      throw new Error('Reader is required in Watcher')
    }
    this._reader = reader
  }

  private _reader: Reader
  private _watcher: chokidar.FSWatcher | null = null

  startWatch(callback: (filePath: string) => Promise<void>) {
    try {
      const debounceCallback = lodash.debounce(async (e, filePath) => {
        if (e === 'change' || e === 'add') {
          console.log(chalk.yellowBright(`${filePath} has changed...`))
          await callback(filePath)
        }
      }, 1000)
      this._watcher = chokidar.watch(this._reader.contentPath)
      this._watcher.on('all', debounceCallback)
    } catch (error) {
      console.log(chalk.redBright(`Watch files change error\n${error}`))
      process.exit(1)
    }
  }
}
