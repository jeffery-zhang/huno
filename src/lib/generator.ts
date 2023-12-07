import path from 'path'
import fs from 'fs'
import chalk from 'chalk'

import { Path } from './path'
import { Cache } from './cache'
import {
  RenderedCategoryPageConfig,
  RenderedIndexPageConfig,
  RenderedPageConfig,
} from '../types'

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

  async copyAssets(): Promise<any> {
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

  async copyPublic(): Promise<any> {
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

  private async generateSinglePage(targetPath: string, html: string) {
    const targetExists = fs.existsSync(targetPath)
    if (!targetExists) {
      fs.mkdirSync(targetPath, { recursive: true })
    }
    const targetFilePath = path.join(targetPath, 'index.html')

    return new Promise<'ok'>((resolve, reject) => {
      const writeStream = fs.createWriteStream(targetFilePath)

      writeStream.write(html, 'utf-8')

      writeStream.on('finish', () => {
        resolve('ok')
      })

      writeStream.on('error', (error) => {
        reject(error)
      })

      writeStream.end()
    }).catch((error) => {
      console.error(chalk.redBright(`Generate ${targetPath} error\n${error}`))
      process.exit(1)
    })
  }

  async generateIndexPage(config: RenderedIndexPageConfig) {
    const targetPath = this._path.outputPath
    const result = await this.generateSinglePage(targetPath, config.html)
    if (result) {
      return result
    }
  }

  async generatePageThroughRenderedConfig(config: RenderedPageConfig) {
    const result = await this.generateSinglePage(
      config.outputFilePath,
      config.html,
    )
    const { html, ...rest } = config
    this._cache.updateCache(config.url, rest)

    return result
  }

  async generateCategoryPage(config: RenderedCategoryPageConfig) {
    const result = await this.generateSinglePage(
      config.outputFilePath,
      config.html,
    )
    const { html, ...rest } = config
    this._cache.updateCache(config.url, rest)

    return result
  }
}
