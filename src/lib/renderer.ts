import nunjucks from 'nunjucks'
import * as cheerio from 'cheerio'

import {
  CompiledPageConfig,
  ParsedPageConfig,
  RenderedPageConfig,
  SinglePageConfig,
} from '../types'
import { Template } from './template'
import chalk from 'chalk'

export class Renderer {
  constructor(template: Template) {
    if (!template) {
      throw new Error('Template is required in renderer')
    }
    this._template = template
  }

  private _template: Template

  private renderIndexBasicLayout(): string {
    const basicLayoutTemplate = this._template.basicLayoutTemplate
    return nunjucks.renderString(basicLayoutTemplate, this._template.pageParams)
  }

  private renderIndexList(configs: ParsedPageConfig[]): string {
    const listTemplate = this._template.listTemplate
    const listConfig = configs.map((cfg) => cfg.config.page)
    return nunjucks.renderString(listTemplate, {
      ...this._template.pageParams,
      list: listConfig,
    })
  }

  renderIndexPageConfig(configs: ParsedPageConfig[]): RenderedPageConfig {
    try {
      const $ = cheerio.load(this.renderIndexBasicLayout())
      const listDom = $(this.renderIndexList(configs))
      $('main#main').append(listDom)
      return {
        html: $.html(),
        url: '',
        relativeFilePath: '',
        absoluteFilePath: this._template.rootPath,
      }
    } catch (error) {
      console.error(chalk.redBright(`Render index page error\n${error}`))
      process.exit(1)
    }
  }

  private renderSingleContentBasicLayout(config: SinglePageConfig): string {
    const basicLayoutTemplate = this._template.basicLayoutTemplate
    return nunjucks.renderString(basicLayoutTemplate, config)
  }

  private renderSingleContentContainer(config: SinglePageConfig): string {
    const containerTemplate = this._template.contentTemplate
    return nunjucks.renderString(containerTemplate, config)
  }

  private renderSingleContentArticle(
    config: SinglePageConfig,
    tpl: string,
  ): string {
    return nunjucks.renderString(tpl, config)
  }

  renderContentPageConfig(config: CompiledPageConfig): RenderedPageConfig {
    const $ = cheerio.load(this.renderSingleContentBasicLayout(config.config))
    const container = $(this.renderSingleContentContainer(config.config))
    const article = $(
      this.renderSingleContentArticle(config.config, config.article),
    )
    $('main#main').append(container)
    $('div#postContent').append(article)
    return {
      ...config,
      html: $.html(),
    }
  }
}
