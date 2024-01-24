import { Huno } from '../lib/huno'
import { SingleCommand } from '../types'

const action = async () => {
  new Huno('prod', 'preview')
}

export const preview: SingleCommand = {
  command: 'preview',
  description: 'preview sites',
  action,
}
