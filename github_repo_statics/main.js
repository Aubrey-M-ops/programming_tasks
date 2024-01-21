// entrance file
import fs from "fs";
import { getAllRepoData } from "./src/attributes/index.js";
import { getAllRepos, getMedianNumber, getTotalNumber } from "./src/common.js";
import { cloneRepos, scanCode } from "./src/codeLines/index.js";
import { exec } from "promisify-child-process";

const main = async () => {
  const allRepos = await getAllRepos();
  // ----------------- SubTask1: Statistics of various attributes ----------//
  const allRepoData = await getAllRepoData(allRepos);
  const totalData = getTotalNumber(allRepoData);
  const medianData = getMedianNumber(allRepoData);
  fs.writeFileSync("subtask1.json", JSON.stringify({allRepoData, totalData, medianData }));

  // ----------------- SubTask2: Statistics of source code lines per programming languages ----------//
  await cloneRepos(allRepos);
  const allCodeLineData = await scanCode(allRepos);
  const totalTask2Data = getTotalNumber(allCodeLineData);
  const medianTask2Data = getMedianNumber(allCodeLineData);
  fs.writeFileSync(
    "subtask2.json",
    JSON.stringify({ allRepoeData: allCodeLineData, totalData: totalTask2Data, medianData: medianTask2Data })
  );

  exec('open src/reportGenerator/report.html')
};

main();
