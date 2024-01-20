// entrance file
import fs from "fs";
import { getAllRepoData } from "./src/attributes/index.js";
import { getAllRepos } from "./src/common.js";
import { cloneRepos, scanCode } from "./src/codeLines/index.js";

const main = async () => {
  const allRepos = await getAllRepos();
//   console.log('allRepos',allRepos);
  // ----------------- SubTask1: Statistics of various attributes ----------//
//   getAllRepoData(allRepos).then((res) => {
//     fs.writeFileSync("results.json", JSON.stringify(res));
//   });
  // ----------------- SubTask2: Statistics of source code lines per programming languages ----------//
  await cloneRepos(allRepos);
  await scanCode();
};

main();
