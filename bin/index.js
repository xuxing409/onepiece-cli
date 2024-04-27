#! /usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import config from "../package.json" assert { type: "json" };

const program = new Command();

program
  .command("create <app-name>") // 创建命令
  .description("create a new project") // 命令描述
  .action((name, options, cmd) => {
    console.log("执行 create 命令");

    import("../lib/create.js").then(({ default: create }) => {
      create(name, options, cmd);
    });
  });

program.on("--help", () => {
  console.log();
  console.log(
    `Run ${chalk.cyan("rippi <command> --help")} to show detail of this command`
  );
  console.log();
});

program
  // 说明版本
  .version(`rippi-cli@${config.version}`)
  // 说明使用方式
  .usage("<command [option]");

// 解析用户执行命令传入的参数
program.parse(process.argv);
