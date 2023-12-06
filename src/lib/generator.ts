import path from 'path'
import fs from 'fs'
import chalk from 'chalk'
import dayjs from 'dayjs'

import { Path } from './path'
import { Cache } from './cache'
import { RenderedPageConfig } from '../types'

export class Generator {
  constructor(path: Path, cache: Cache) {
    if (!path || !cache) {
      throw new Error('Path and Cache is required in generator')
    }
    this._path = path
    this._cache = cache
  }

  private _path: Path
  private _cache: Cache

  async copyAssets() {
    const targetPath = path.join(this._path.outputPath, 'assets')
    return new Promise((resolve, reject) => {
      console.log(chalk.yellowBright('Start to generate assets files...'))
      fs.cp(
        this._path.templateAssetsPath,
        targetPath,
        { recursive: true },
        (err) => {
          if (err) {
            reject(err)
          }
          resolve(true)
        },
      )
    })
      .then(() => {
        console.log(chalk.greenBright('Generating assets files completed!'))
      })
      .catch((err) => {
        console.error(
          chalk.redBright(`Generating assets files failed \n${err}`),
        )
        process.exit(1)
      })
  }

  async copyPublic() {
    return new Promise((resolve, reject) => {
      console.log(chalk.yellowBright('Start to generate public files...'))
      fs.cp(
        this._path.publicPath,
        this._path.outputPath,
        { recursive: true },
        (err) => {
          if (err) {
            reject(err)
          }
          resolve(true)
        },
      )
    })
      .then(() => {
        console.log(chalk.greenBright('Generating public files completed!'))
      })
      .catch((err) => {
        console.error(
          chalk.redBright(`Generating public files failed \n${err}`),
        )
        process.exit(1)
      })
  }

  async generatePageThroughRenderedConfig(config: RenderedPageConfig) {
    const targetPath = path.join(this._path.outputPath, config.relativeFilePath)
    const targetExists = fs.existsSync(targetPath)
    if (!targetExists) {
      fs.mkdirSync(targetPath, { recursive: true })
    }
    const targetFilePath = path.join(targetPath, 'index.html')

    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(targetFilePath)

      writeStream.write(config.html, 'utf-8')

      writeStream.on('finish', () => {
        if (config.updateTime) {
          this._cache.updateCache(
            config.absoluteFilePath,
            dayjs(config.updateTime!).valueOf(),
          )
        }

        resolve('ok')
      })

      writeStream.on('error', (error) => {
        reject(error)
      })
    }).catch((error) => {
      console.error(
        chalk.redBright(`Generate ${config.relativeFilePath} error\n${error}`),
      )
      process.exit(1)
    })
  }
}
