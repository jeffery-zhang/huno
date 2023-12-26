import path, { resolve } from 'path'
import fs from 'fs'
import chalk from 'chalk'
import xml2js from 'xml2js'

import { Path } from './path'
import { PageConfig } from '../types'

export class Generator {
  constructor(path: Path) {
    if (!path) {
      throw new Error('Path is required in generator')
    }
    this._path = path
  }

  private _path: Path

  private async generateSinglePage(
    targetPath: string,
    text: string,
    filename?: string,
  ) {
    const targetExists = fs.existsSync(targetPath)
    if (!targetExists) {
      fs.mkdirSync(targetPath, { recursive: true })
    }
    const targetFilePath = path.join(targetPath, filename ?? 'index.html')

    return new Promise<'ok' | 'error'>((resolve) => {
      const writeStream = fs.createWriteStream(targetFilePath)

      writeStream.write(text, 'utf-8')

      writeStream.on('finish', () => {
        resolve('ok')
      })

      writeStream.on('error', (error) => {
        console.error(chalk.redBright(`Generate ${targetPath} error\n${error}`))
        resolve('error')
      })

      writeStream.end()
    })
  }

  public async copyAssets(): Promise<any> {
    const inputPath = this._path.templateAssetsPath
    if (!fs.existsSync(inputPath)) {
      return
    }
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

  public async copyPublic(): Promise<any> {
    const inputPath = this._path.publicPath
    if (!fs.existsSync(inputPath)) {
      return
    }
    const targetPath = this._path.outputPath
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

  public async generatePageByPageConfig(config: PageConfig, html: string) {
    const result = await this.generateSinglePage(config.outputFilePath, html)
    return result
  }

  public async generateContentMapXml(configs: PageConfig[]) {
    const builder = new xml2js.Builder()

    const xmlData = builder.buildObject({
      contentMap: { content: configs.map((config) => config.params) },
    })

    const result = await this.generateSinglePage(
      this._path.outputPath,
      xmlData,
      'contentMap.xml',
    )

    return result
  }
}
