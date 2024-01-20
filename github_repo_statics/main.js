// entrance
import fs from "fs";
import { getAllRepoData } from "./src/index.js";
getAllRepoData().then((res) => {
  fs.writeFileSync("results.json", JSON.stringify(res));
});