import inquirer from 'inquirer'
import path from 'path'
import fs from 'fs'

import { Path } from '../lib/path'
import { SingleCommand } from '../types'
import chalk from 'chalk'

const action = async (projectName: string) => {
  let name: string
  if (!projectName) {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Please name your project first: ',
      },
    ])
    name = answer.name
  } else {
    name = projectName
  }

  const config = new Path('new')
  const inputPath = path.join(config.appPath, 'starter')
  const targetPath = path.join(config.rootPath, name)

  fs.cp(inputPath, targetPath, { recursive: true }, (err) => {
    if (err) {
      console.log(chalk.redBright(`Create new project failed\n${err}`))
      process.exit(1)
    }
    console.log(chalk.greenBright('Create project starter files completed!'))
  })
}

export const create: SingleCommand = {
  command: 'create',
  description: 'create site project',
  action,
  arguments: [['[projectName]', 'project name']],
}
