import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

// 并行克隆仓库
export const cloneRepos = async (repos) => {
  const gitArr = repos.map((repo) => repo.git_url);
  //   const gitArr = [
  //     'git@github.com:Kaggle/learntools.git',
  //     'git@github.com:Kaggle/docker-python.git',
  //   ]
  try {
    // await Promise.all(
    for (const git of gitArr) {
      try {
        await execPromise(`cd repositories && git clone ${git}`);
        console.log(`Clone Success✅ => ${git}`);
      } catch (error) {
        console.error(`Clone fail❌ => ${git}`);
      }
    }
    //   gitArr.map(async (git) => {
    //     try {
    //       await execPromise(`cd repositories && git clone ${git}`);
    //       console.log(`Clone Success✅ => ${git}`);
    //     } catch (error) {
    //       console.error(`Clone fail❌ => ${git}`);
    //     }
    //   })
    // );
    console.log("🎉 All repositories cloned successfully.");
  } catch (error) {
    console.error(`Error cloning repositories: ${error.message}`);
  }
};

// cloc
export const scanCode = async () => {
  exec(`cloc repositories`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing cloc: ${error.message}`);
      return;
    }
    console.log(stdout);
  });
};
