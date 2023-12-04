import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'
import { marked } from 'marked'
import chalk from 'chalk'

import { Template } from './template'
import {
  SinglePageParams,
  SinglePageConfig,
  CompiledPageConfig,
} from '../types'

export class Compiler {
  constructor(template: Template) {
    if (!template) {
      throw new Error('Template is required in Compiler')
    }
    this._template = template
    const that = this
    marked.use({
      renderer: {
        // image() {
        //   return that.parseHtmlTemplateString(that.markups[0], arguments as any)
        // },
      },
    })
  }

  private _template: Template
  private _markupArgumentsReg = /\${arguments\[(\d+)\]}/g
  private _contentConfigRegexp = /\+\+\+(.*?)\+\+\+/s

  private replaceSingleMarkupTemplateArguments(
    tpl: string,
    variables: any[],
  ): string {
    const result = tpl.replace(this._markupArgumentsReg, (match, num) => {
      const index = parseInt(num)
      return variables[index]
    })
    return result
  }

  private filePathToUrl(filePath: string) {
    /**
     * transfer file path to link url
     */
    return filePath
      .replace(this._template.contentPath, '')
      .replace('\\', '/')
      .replace('.md', '')
      .slice(1)
  }

  private extractContentConfig(content: string): SinglePageParams {
    /**
     * extract the config between the symbols from md files
     */
    const contentConfig: { [key: string]: string } = {}
    const reg = this._contentConfigRegexp
    const match = content.match(reg)
    if (match) {
      try {
        const lines = match[1].trim().split('\n')
        lines.forEach((line) => {
          const [key, value]: string[] = line.split('=')
          contentConfig[key] = value?.trim() ?? ''
        })
        return contentConfig as SinglePageParams
      } catch (error) {
        throw new Error(`Extract page config error!\n${error}`)
      }
    } else return {}
  }

  private compileContentWithoutConfig(content: string): string {
    /**
     * compile the md content to html string without config
     */
    const reg = this._contentConfigRegexp
    const restContent = content.replace(reg, '').trim()
    try {
      const html = marked(restContent)
      return html as string
    } catch (error) {
      throw new Error(`Compile content error!\n${error}`)
    }
  }

  private compileSingleMarkdown(
    filePath: string,
  ): Promise<CompiledPageConfig | void> {
    return new Promise<CompiledPageConfig>((resolve, reject) => {
      try {
        const fullFilePath = path.join(this._template.rootPath, filePath)
        const content = fs.readFileSync(fullFilePath, 'utf-8')
        const contentConfig = this.extractContentConfig(content)
        const html = this.compileContentWithoutConfig(content)
        const fullPageConfig: SinglePageConfig = {
          ...this._template.pageParams,
          page: contentConfig as SinglePageParams,
        }
        resolve({
          config: fullPageConfig,
          url: this.filePathToUrl(fullFilePath),
          filePath: fullFilePath,
          content: html,
          updateTime: '',
        })
      } catch (error) {
        reject(error)
      }
    }).catch((error) => {
      console.log(chalk.redBright(error))
    })
  }

  findAllContentMds() {
    return globSync(`${this._template.contentPath}/**/*.md`)
  }

  async compileMarkdowns() {
    const contentMds = this.findAllContentMds()
    const promises = contentMds.map((md) => {
      return this.compileSingleMarkdown(md)
    })
    const compiledMdContentList = await Promise.all(promises)
    return compiledMdContentList
  }
}
