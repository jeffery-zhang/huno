import fs from 'fs'
import path from 'path'
import { globSync } from 'glob'
import chalk from 'chalk'
import dayjs from 'dayjs'

import { Template } from './template'
import {
  PageConfig,
  SinglePageParams,
  ExtractedContentParams,
  ParsedContentPageConfigWithContent,
  TaxonomyTypeListItem,
} from '../types'

export class Reader extends Template {
  constructor(env: string) {
    super(env)
  }

  private _contentConfigRegexp = /\+\+\+(.*?)\+\+\+/s
  private _parsedContentConfigList: ParsedContentPageConfigWithContent[] = []
  private _parsedListPageConfigList: PageConfig[] = []
  private _categories: TaxonomyTypeListItem[] = []
  private _series: TaxonomyTypeListItem[] = []
  private _tags: TaxonomyTypeListItem[] = []

  private extractContentConfig(content: string): ExtractedContentParams | null {
    const contentConfig: { [key: string]: string } = {}
    const reg = this._contentConfigRegexp
    const match = content.match(reg)
    if (match) {
      const lines = match[1].trim().split('\n')
      lines.forEach((line) => {
        const [key, value]: string[] = line.split('=')
        contentConfig[key.trim()] = value?.trim() ?? ''
      })
      if (!contentConfig.title) return null
      return contentConfig as ExtractedContentParams
    } else return null
  }

  private extractContentWithoutConfig(content: string): string {
    const reg = this._contentConfigRegexp
    return content.replace(reg, '').trim()
  }

  private findAllContentMds(): string[] {
    return globSync(`${this.contentPath}/**/*.md`)
  }

  private parseCategory(contentConfig: ExtractedContentParams) {
    if (!this.category) return
    const { category } = contentConfig
    if (category) {
      if (typeof category === 'string') {
        if (!this._categories.some((c) => c.name === category)) {
          this._categories.push({
            name: category,
            url: this.getEncodedUrl(`${this.category}/${category}`),
          })
        }
      } else if (Array.isArray(category)) {
        category.forEach((c) => {
          if (!this._categories.some((cat) => cat.name === c)) {
            this._categories.push({
              name: c,
              url: this.getEncodedUrl(`${this.category}/${c}`),
            })
          }
        })
      }
    }
  }

  private parseSeries(contentConfig: ExtractedContentParams) {
    if (!this.series) return
    const { series } = contentConfig
    if (series && typeof series === 'string') {
      if (!this._series.some((s) => s.name === series)) {
        this._series.push({
          name: series,
          url: this.getEncodedUrl(`${this.series}/${series}`),
        })
      }
    }
  }

  private parseTag(contentConfig: ExtractedContentParams) {
    if (!this.tag) return
    const { tag } = contentConfig
    if (tag && Array.isArray(tag)) {
      tag.forEach((t) => {
        if (!this._tags.some((tag) => tag.name === t)) {
          this._tags.push({
            name: t,
            url: this.getEncodedUrl(`${this.tag}/${t}`),
          })
        }
      })
    }
  }

  private parseSingleContentPageConfigAndContent(inputFilePath: string) {
    try {
      const fileStats = fs.statSync(inputFilePath)
      const lastModified = Math.floor(fileStats.mtimeMs)
      const createTime = fileStats.birthtime
      const text = fs.readFileSync(inputFilePath, 'utf-8')
      const contentConfig = this.extractContentConfig(text)
      if (!contentConfig) return
      this.parseCategory(contentConfig)
      this.parseSeries(contentConfig)
      this.parseTag(contentConfig)
      const outputFilePath =
        this.getOutputFilePathByInputFilePath(inputFilePath)
      const url = this.getPageUrlByInputFilePath(inputFilePath)
      const content = this.extractContentWithoutConfig(text)

      this._parsedContentConfigList.push({
        config: {
          params: {
            ...this.siteParams,
            ...contentConfig,
            author: contentConfig.author || 'Anonymous',
            url,
            createTime: contentConfig.createTime || dayjs(createTime).format(),
            updateTime:
              contentConfig.updateTime || dayjs(lastModified).format(),
            type: 'content',
          },
          inputFilePath,
          outputFilePath,
          lastModified,
        },
        content,
      })
    } catch (error) {
      console.error(chalk.redBright(`Read ${inputFilePath} error\n${error}`))
    }
  }

  private getContentPageList(condition?: {
    key: string
    value: string
  }): SinglePageParams[] {
    let contentPageList: SinglePageParams[] = []
    if (condition && condition.key && condition.value) {
      contentPageList = this.parsedContentConfigList
        .map((config) => config.config)
        .filter(({ params }) => {
          if (
            condition.key === 'series' ||
            (condition.key === 'category' &&
              typeof params[condition.key] === 'string')
          ) {
            return (
              params[condition.key as keyof SinglePageParams] ===
              condition.value
            )
          }
          if (
            condition.key === 'tag' ||
            (condition.key === 'category' &&
              Array.isArray(params[condition.key]))
          ) {
            return params[condition.key].includes(condition.value)
          }
          return false
        })
        .sort((a, b) => b.lastModified! - a.lastModified!)
        .map((config) => config.params)
    } else {
      contentPageList = this.parsedContentConfigList
        .map((config) => config.config)
        .sort((a, b) => b.lastModified! - a.lastModified!)
        .map((config) => config.params)
    }

    return contentPageList
  }

  private parseCategoryConfigList() {
    if (this._categories.length === 0 || !this.outputCategoryPath) return

    this._categories.forEach((category) => {
      const outputFilePath = path.join(this.outputCategoryPath!, category.name)
      const list = this.getContentPageList({
        key: 'category',
        value: category.name,
      })
      const count = list.length
      category.count = count
      this._parsedListPageConfigList.push({
        params: {
          ...this.siteParams,
          url: category.url,
          category,
          list,
          type: 'list',
        },
        outputFilePath,
      })
    })

    this.categories = this._categories
  }

  private parseSeriesConfigList() {
    if (this._series.length === 0 || !this.outputSeriesPath) return

    this._series.forEach((series) => {
      const outputFilePath = path.join(this.outputSeriesPath!, series.name)
      const list = this.getContentPageList({
        key: 'series',
        value: series.name,
      })
      const count = list.length
      series.count = count
      this._parsedListPageConfigList.push({
        params: {
          ...this.siteParams,
          url: series.url,
          series,
          list,
          type: 'list',
        },
        outputFilePath,
      })
    })

    this.seriesList = this._series
  }

  private parseTagConfigList() {
    if (this._tags.length === 0 || !this.outputTagPath) return

    this._tags.forEach((tag) => {
      const outputFilePath = path.join(this.outputTagPath!, tag.name)
      const list = this.getContentPageList({
        key: 'tag',
        value: tag.name,
      })
      const count = list.length
      tag.count = count
      this._parsedListPageConfigList.push({
        params: {
          ...this.siteParams,
          url: tag.url,
          tag,
          list,
          type: 'list',
        },
        outputFilePath,
      })
    })

    this.tags = this._tags
  }

  private parseIndexPageConfig() {
    const list = this.getContentPageList()
    this._parsedListPageConfigList.push({
      params: {
        ...this.siteParams,
        url: '',
        list,
        type: 'index',
      },
      outputFilePath: this.outputPath,
    })
  }

  private parseSearchPageConfig() {
    this._parsedListPageConfigList.push({
      params: {
        ...this.siteParams,
        url: 'search',
        type: 'search',
      },
      outputFilePath: path.join(this.outputPath, 'search'),
    })
  }

  private async parseAllContentPage() {
    console.log(chalk.yellowBright('Start parsing content files...'))
    const mds = this.findAllContentMds()
    const promises: Promise<boolean>[] = []
    mds.forEach((md) => {
      promises.push(
        new Promise((resolve) => {
          try {
            const inputFilePath = path.join(this.rootPath, md)
            this.parseSingleContentPageConfigAndContent(inputFilePath)
            resolve(true)
          } catch (error) {
            resolve(false)
          }
        }),
      )
    })

    await Promise.all(promises)
    console.log(chalk.greenBright('Parsing content files completed!'))
  }

  get parsedContentConfigList(): ParsedContentPageConfigWithContent[] {
    return this._parsedContentConfigList
  }

  get parsedListPageConfigList(): PageConfig[] {
    return this._parsedListPageConfigList
  }

  public async readFiles() {
    await this.parseAllContentPage()
    this.parseCategoryConfigList()
    this.parseSeriesConfigList()
    this.parseTagConfigList()
    this.parseIndexPageConfig()
    this.parseSearchPageConfig()
  }
}
