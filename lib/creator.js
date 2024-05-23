// lib/creator.js creator类，整个找模板到下载模板的主要逻辑都抽象到了这个类中。
import { fetchRepoList } from "./request.js";
import { loading } from "./utils.js";
import downloadGitRepo from "download-git-repo";
import inquirer from "inquirer";
import chalk from "chalk";
import util from "util";
import { homedir } from "os";
import path from "path";
import fs from "fs-extra";

class Creator {
  constructor(projectName, targetDir, promptFeatures) {
    // 项目名称
    this.name = projectName;
    // 模板目录
    this.templateDir = null;
    // 项目目录
    this.dir = targetDir;
    // 将downloadGitRepo转成promise
    this.downloadGitRepo = util.promisify(downloadGitRepo);
    // 插件特性
    this.promptFeatures = promptFeatures;
    // 特性的选择，之后他的choices会被一个一个插件填充
    this.featurePrompts = defaultFeaturePrompt;
    // 被注入的插件选择框
    this.injectPrompts = [];
    // 被注入的选择完成的回调
    this.promptCompleteCbs = [];
    // 所选择的答案
    this.projectOptions = null;
    // 启动的插件
    this.plugins = [];
    // package.json的内容
    this.pkg = null;
    // 文件处理的中间件数组
    this.fileMiddleWares = [];
    // 需要注入的import语句
    this.imports = {};
    // key:文件路径 value: 文件内容 插件在执行过程中生成的文件都会记录在这,最后统一写入硬盘
  }

  // 加载特性

  async fetchRepo() {
    const branches = await loading(
      fetchRepoList,
      "waiting for fetch resources"
    );
    return branches;
  }

  fetchTag() {}

  async download(branch) {
    // 1 拼接下载路径 这里放自己的模板仓库url
    const requestUrl = `xuxing409/Vbetter-admin/#${branch}`;
    const localCacheFolder = path.resolve(homedir(), ".simpleCli_templates");
    const localTemplateCacheUrl = (this.templateDir = path.join(
      localCacheFolder,
      "vue",
      "vue+ts"
    ));

    const hasDownloaded = fs.existsSync(localTemplateCacheUrl);
    if (!hasDownloaded) {
      // 2 把资源下载到用户目录缓存起来
      await this.downloadGitRepo(requestUrl, localTemplateCacheUrl);
    }
    console.log(chalk.green("模板准备完成!"));
  }

  async create() {
    // 1 先去拉取当前仓库下的所有分支
    const branches = await this.fetchRepo();
    // 这里会在shell命令行弹出选择项，选项为choices中的内容
    const { curBranch } = await inquirer.prompt([
      {
        name: "curBranch",
        type: "list",
        // 提示信息
        message: "please choose current version:",
        // 选项
        choices: branches
          .filter((branch) => branch.name !== "main")
          .map((branch) => ({
            name: branch.name,
            value: branch.name,
          })),
      },
    ]);

    // 2 下载
    await this.download(curBranch);
    // 3.将模板复制到目标目录
    await fs.copy(this.templateDir, this.dir);
  }
}

export default Creator;
