#! /usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import fs from "fs-extra";

const program = new Command();

program
  .command("create <app-name>") // 创建命令
  .description("create a new project") // 命令描述
  .option("-f, --force", "overwrite target directory if it is existed") // 命令选项(选项名，描述) 这里解决下重名的情况
  .action((name, options, cmd) => {
    console.log("执行 create 命令");

    import("../lib/create.js").then(({ default: create }) => {
      create(name, options, cmd);
    });
  });

program.on("--help", () => {
  console.log();
  console.log(
    `Run ${chalk.cyan(
      "simple <command> --help"
    )} to show detail of this command`
  );
  console.log();
});

const config = fs.readJSONSync(
  path.resolve(dirname(fileURLToPath(import.meta.url)), "../package.json")
);

program
  // 说明版本
  .version(`simple-cli@${config.version}`)
  // 说明使用方式
  .usage("<command [option]");

// 解析用户执行命令传入的参数
program.parse(process.argv);
