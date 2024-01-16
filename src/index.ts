import chalk from 'chalk'
import { program } from 'commander'

import { build } from './commands/build'
import { SingleCommand } from './types'

const setCommand = async () => {
  const commands: SingleCommand[] = [build]
  const promises: Promise<any>[] = []
  commands.map((obj) => {
    promises.push(
      new Promise(async (resolve, reject) => {
        try {
          const cmd = program
            .command(obj.command)
            .description(obj.description)
            .action(obj.action)

          if (obj.options) {
            obj.options.map((opt) => {
              // @ts-ignore
              cmd.option(...opt)
            })
          }
          if (obj.arguments) {
            obj.arguments.map((arg) => {
              // @ts-ignore
              cmd.argument(...arg)
            })
          }

          resolve(true)
        } catch (err) {
          reject()
        }
      }).catch((err) => {
        console.error(chalk.redBright(err))
        process.exit(1)
      }),
    )
  })

  await Promise.all(promises)
}

export const start = async (): Promise<void> => {
  await setCommand()

  program.parse()
}

export const loadPlugins = (plugins: any[]) => {
  global.plugins = plugins
}

start()
