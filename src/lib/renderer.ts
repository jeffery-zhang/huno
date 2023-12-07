import nunjucks from 'nunjucks'
import * as cheerio from 'cheerio'
import chalk from 'chalk'

import { Template } from './template'
import {
  CompiledPageConfig,
  ParsedCategoryConfig,
  ParsedPageConfig,
  RenderedCategoryPageConfig,
  RenderedIndexPageConfig,
  RenderedPageConfig,
  SinglePageFullParams,
} from '../types'

export class Renderer {
  constructor(template: Template) {
    if (!template) {
      throw new Error('Template is required in renderer')
    }
    this._template = template
  }

  private _template: Template

  private renderBasicLayout(params?: SinglePageFullParams): string {
    const basicLayoutTemplate = this._template.basicLayoutTemplate
    const pageParams = params ?? this._template.pageParams
    return nunjucks.renderString(basicLayoutTemplate, pageParams)
  }

  private renderContentList(configs: ParsedPageConfig[]): string {
    const listTemplate = this._template.listTemplate
    const listParams = configs.map((cfg) => cfg.params.page)
    return nunjucks.renderString(listTemplate, {
      ...this._template.pageParams,
      list: listParams,
    })
  }

  private renderSingleContentContainer(params: SinglePageFullParams): string {
    const containerTemplate = this._template.contentTemplate
    return nunjucks.renderString(containerTemplate, params)
  }

  private renderSingleContent(
    params: SinglePageFullParams,
    tpl: string,
  ): string {
    return nunjucks.renderString(tpl, params)
  }

  renderIndexPageConfig(configs: ParsedPageConfig[]): RenderedIndexPageConfig {
    try {
      const $ = cheerio.load(this.renderBasicLayout())
      const listDom = $(this.renderContentList(configs))
      $('main#main').append(listDom)
      return {
        html: $.html(),
      }
    } catch (error) {
      console.error(chalk.redBright(`Render index page error\n${error}`))
      process.exit(1)
    }
  }

  renderContentPageConfig(config: CompiledPageConfig): RenderedPageConfig {
    const $ = cheerio.load(this.renderBasicLayout(config.params))
    const container = $(this.renderSingleContentContainer(config.params))
    const article = $(this.renderSingleContent(config.params, config.article))
    $('main#main').append(container)
    $('div#postContent').append(article)
    const { article: _, ...rest } = config
    return {
      ...rest,
      html: $.html(),
    }
  }

  renderCategoryListPageConfig(
    parsedCategoryConfig: ParsedCategoryConfig,
    configs: ParsedPageConfig[],
  ): RenderedCategoryPageConfig {
    const $ = cheerio.load(this.renderBasicLayout())
    const listDom = $(this.renderContentList(configs))
    $('main#main').append(listDom)
    return {
      ...parsedCategoryConfig,
      html: $.html(),
    }
  }
}
