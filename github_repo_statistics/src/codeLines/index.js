import { exec } from "child_process";
import { promisify } from "util";
import _ from "lodash";

const execPromise = promisify(exec);

// clone repositories
export const cloneRepos = async (repos) => {
  const gitArr = repos.map((repo) => repo.git_url);
  try {
    for (const git of gitArr) {
      try {
        await execPromise(`cd repositories && git clone ${git}`);
        console.log(`Clone Success✅ => ${git}`);
      } catch (error) {
        console.error(`Clone fail❌ => ${git}`);
      }
    }
    console.log("🎉 All repositories cloned successfully.");
  } catch (error) {
    console.error(`Error cloning repositories: ${error.message}`);
  }
};

// cloc
export const scanCode = async (repos) => {
  let result = {};
  const repoNames = repos.map((repo) => repo.name);
  // Iterate all repos
  for (const repoName of repoNames) {
    console.log(`💻⏳ scanning code ===>  ${repoName}`);
    try {
      const { stdout } = await execPromise(
        `cloc --json repositories/${repoName}`
      );
      const repoData = JSON.parse(stdout);
      // ignore the irrelevant keys
      delete repoData["SUM"];
      delete repoData["header"];
      // Only keep key "code" (which represents for code lines)
      Object.keys(repoData).forEach((repoKey) => {
        repoData[repoKey] = repoData[repoKey]["code"];
      });
      result = { ...result, [repoName]: _.cloneDeep(repoData) };
    } catch (err) {
      console.error(`Error executing cloc: ${err}`);
    }
  }
  return result;
};
