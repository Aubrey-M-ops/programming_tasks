// entrance file
import fs from "fs";
import { getAllRepoData } from "./src/attributes/index.js";
import { getAllRepos, getMedianNumber, getTotalNumber } from "./src/common.js";
import { cloneRepos, scanCode } from "./src/codeLines/index.js";
import liveServer from "live-server";

const main = async () => {
  const allRepos = await getAllRepos();
  // ----------------- SubTask1: Statistics of various attributes ----------//
  const allRepoData = await getAllRepoData(allRepos);
  const totalData = getTotalNumber(allRepoData);
  const medianData = getMedianNumber(allRepoData);
  fs.writeFileSync("src/reportGenerator/subtask1.json", JSON.stringify({allRepoData, totalData, medianData }));

  // ----------------- SubTask2: Statistics of source code lines per programming languages ----------//
  await cloneRepos(allRepos);
  const allCodeLineData = await scanCode(allRepos);
  const totalTask2Data = getTotalNumber(allCodeLineData);
  const medianTask2Data = getMedianNumber(allCodeLineData);
  fs.writeFileSync(
    "src/reportGenerator/subtask2.json",
    JSON.stringify({ allRepoData: allCodeLineData, totalData: totalTask2Data, medianData: medianTask2Data })
  );

  // open report automatically
  var params = {
    port: 8181, // Set the server port. Defaults to 8080.
    host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
    root: "src/reportGenerator", // Set root directory that's being served. Defaults to cwd.
    open: true, // When false, it won't load your browser by default.
    file: "report.html", // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
    wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
  };
  liveServer.start(params);
};

main();
