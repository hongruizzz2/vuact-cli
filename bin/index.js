#!/usr/bin/env node
const { program} = require('commander')
const figlet = require('figlet')
const inquirer = require('inquirer')
const fs = require('fs-extra')
const path = require('path')
const gitClone = require('git-clone')
const ora = require('ora')
const chalk = require('chalk')

const projectList = {
    'vue': 'git@github.com:hongruizzz2/vue-js.git',
    'react': 'git@github.com:hongruizzz2/react-js.git',
    'vue&ts': 'git@github.com:hongruizzz2/vue-typescript.git',
    'react&ts': 'git@github.com:hongruizzz2/react-x.git'
}


/* 首行提示 */
program.name('vuact-cli').usage('<command> [options]')

/* 版本号 */
program.version(`v${require('../package.json').version}`)

/* 命令 */
program
    .command('create <app-name>')
    .description('创建一个新项目')
    .action(async function(name) {
        const targetPath = path.join(process.cwd(), name)
        if(fs.existsSync(targetPath)) {
            const answer = await inquirer.prompt([
                {
                type: 'confirm',
                message: '是否要覆盖之前的文件夹?',
                default: false,
                name: 'overwrite'
                }
          ])
          if (answer.overwrite) {
            fs.remove(targetPath)
          } else {
            return;
          }
        } 
        // create template
        const res = await inquirer.prompt([
            {
                type: 'list',
                message: '选择什么框架去新建项目?',
                name: 'type',
                choices: [
                    {
                        name: 'vue',
                        value: 'vue'    
                    },
                    {
                        name: 'react',
                        value: 'react'    
                    }
                ]
            },
            {
                type: 'list',
                message: '是否要使用TypeScript?',
                name: 'ts',
                choices:
                [
                    {
                        name: '是',
                        value: true    
                    },
                    {
                        name: '否',
                        value: false    
                    }
                ]
            }
        ])
        const key = res.type + (res.ts ? '&ts' : '')
        const spinner = ora('下载中...').start()
        gitClone(projectList[key], name, {checkout: 'main'}, function(err) {
            if(err) {
                spinner.fail('下载失败')
            } else {
                spinner.succeed('下载成功')
                fs.remove(path.join(targetPath, '.git'))
                console.log('Done, now run:')
                console.log(chalk.magenta(`\n cd ${name}`))
                console.log(chalk.magenta(` npm install`))
                console.log(chalk.magenta(` npm run dev\n`))
            }
        })
    })

/* 提示 */
program.on('--help', function(){
    console.log(figlet.textSync('vuact-cli', {
      font: 'Ghost',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 100,
      whitespaceBreak: true  
    }));
})

program.parse(process.argv)

