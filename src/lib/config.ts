const defaultPageParams = {
  baseUrl: '/',
  defaultLang: 'en',
  title: 'Awesome Title',
  description: 'This is an Awesome Description!',
  favicon: 'favicon.ico',
}

export class Config {
  constructor(env: string) {
    this._env = env
  }

  private _env: string = 'prod'
}
