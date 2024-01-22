import path from 'path'
import fs from 'fs'
import chalk from 'chalk'
import xml2js from 'xml2js'

import { Path } from './path'
import { ContentVariables } from '../types'

export class Generator {
  private _config: Path | null = null

  constructor(config: Path) {
    if (!config) return
    this._config = config
  }

  private async generateSinglePage(
    targetPath: string,
    text: string,
    filename?: string,
  ): Promise<'ok' | 'error'> {
    const targetExists = fs.existsSync(targetPath)
    if (!targetExists) {
      fs.mkdirSync(targetPath, { recursive: true })
    }
    const targetFilePath = path.join(targetPath, filename || 'index.html')

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

  private async copyAssets(): Promise<any> {
    const inputPath = path.join(this._config!.templatePath, 'assets')
    if (!fs.existsSync(inputPath)) return
    const targetPath = path.join(this._config!.outputPath, 'assets')
    const targetExists = fs.existsSync(targetPath)
    if (!targetExists) {
      fs.mkdirSync(targetPath, { recursive: true })
    }
    return new Promise((resolve) => {
      fs.cp(inputPath, targetPath, { recursive: true }, (err) => {
        if (err) {
          console.error(
            chalk.redBright(`Generate assets files failed \n${err}`),
          )
          process.exit(1)
        }
        resolve(true)
      })
    })
  }

  private async copyPublic(): Promise<any> {
    const inputPath = this._config!.publicPath
    if (!fs.existsSync(inputPath)) {
      return
    }
    const targetPath = this._config!.outputPath
    const targetExists = fs.existsSync(targetPath)
    if (!targetExists) {
      fs.mkdirSync(targetPath, { recursive: true })
    }
    return new Promise((resolve) => {
      fs.cp(inputPath, targetPath, { recursive: true }, (err) => {
        if (err) {
          console.error(
            chalk.redBright(`Generate public files failed \n${err}`),
          )
          process.exit(1)
        }
        resolve(true)
      })
    })
  }

  private async generatePageByPageVars(
    key: string,
    html: string,
  ): Promise<'ok' | 'error'> {
    const result = await this.generateSinglePage(key, html)
    return result
  }

  public async generateContentMapXml(contentVariablesList: ContentVariables[]) {
    const builder = new xml2js.Builder()

    const xmlData = builder.buildObject({
      contentMap: {
        content: contentVariablesList,
      },
    })

    const result = await this.generateSinglePage(
      this._config!.outputPath,
      xmlData,
      'contentMap.xml',
    )

    return result
  }

  public async generateAllPage(pageHtmlList: { [key: string]: string }) {
    if (!this._config) {
      process.exit(1)
    }
    const total: number = Object.keys(pageHtmlList).length
    let finished: number = 0
    const promises: Promise<any>[] = []
    Object.keys(pageHtmlList).forEach((key) => {
      const html = pageHtmlList[key]
      promises.push(
        new Promise(async (resolve) => {
          const result = await this.generatePageByPageVars(key, html)
          if (result === 'ok') {
            finished++
            process.stdout.write(
              chalk.yellowBright(
                `\rGenerating page files... --> ${finished}/${total}`,
              ),
            )
          }
          resolve(true)
        }),
      )
    })
    process.stdout.write(
      chalk.yellowBright(`\rGenerating page files... --> ${finished}/${total}`),
    )
    await Promise.all(promises)
    await this.copyAssets()
    await this.copyPublic()

    console.log(chalk.greenBright('\nGenerate all pages success!'))
  }
}
