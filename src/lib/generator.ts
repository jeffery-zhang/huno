import path from 'path'
import fs from 'fs'
import chalk from 'chalk'
import xml2js from 'xml2js'

import { Path } from './path'
import { Cache } from './cache'
import {
  ParsedPageConfig,
  RenderedCategoryPageConfig,
  RenderedIndexPageConfig,
  RenderedPageConfig,
  RenderedSearchPageConfig,
} from '../types'

export class Generator {
  constructor(path: Path) {
    if (!path) {
      throw new Error('Path is required in generator')
    }
    this._path = path
  }

  private _path: Path

  async copyAssets(): Promise<any> {
    const targetPath = path.join(this._path.outputPath, 'assets')
    const targetExists = fs.existsSync(targetPath)
    if (!targetExists) {
      fs.mkdirSync(targetPath, { recursive: true })
    }
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
        console.log(chalk.greenBright('Generate assets files completed!'))
      })
      .catch((err) => {
        console.error(chalk.redBright(`Generate assets files failed \n${err}`))
        process.exit(1)
      })
  }

  async copyPublic(): Promise<any> {
    const targetPath = path.join(this._path.outputPath, 'public')
    const targetExists = fs.existsSync(targetPath)
    if (!targetExists) {
      fs.mkdirSync(targetPath, { recursive: true })
    }
    return new Promise((resolve, reject) => {
      console.log(chalk.yellowBright('Start to generate public files...'))
      fs.cp(this._path.publicPath, targetPath, { recursive: true }, (err) => {
        if (err) {
          reject(err)
        }
        resolve(true)
      })
    })
      .then(() => {
        console.log(chalk.greenBright('Generate public files completed!'))
      })
      .catch((err) => {
        console.error(chalk.redBright(`Generate public files failed \n${err}`))
        process.exit(1)
      })
  }

  async generateSinglePage(
    targetPath: string,
    text: string,
    filename?: string,
  ) {
    const targetExists = fs.existsSync(targetPath)
    if (!targetExists) {
      fs.mkdirSync(targetPath, { recursive: true })
    }
    const targetFilePath = path.join(targetPath, filename ?? 'index.html')

    return new Promise<'ok'>((resolve, reject) => {
      const writeStream = fs.createWriteStream(targetFilePath)

      writeStream.write(text, 'utf-8')

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

  async generateSearchPage(config: RenderedSearchPageConfig) {
    const targetPath = path.join(this._path.outputPath, 'search')
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

    return result
  }

  async generateCategoryPage(config: RenderedCategoryPageConfig) {
    const result = await this.generateSinglePage(
      config.outputFilePath,
      config.html,
    )

    return result
  }

  async generateContentMapXml(configs: ParsedPageConfig[]) {
    const builder = new xml2js.Builder()
    const data = configs.map((config) => {
      const { content, ...rest } = config
      return rest
    })
    const xmlData = builder.buildObject({
      contentMap: { content: data },
    })

    const result = await this.generateSinglePage(
      this._path.outputPath,
      xmlData,
      'contentMap.xml',
    )

    return result
  }
}
