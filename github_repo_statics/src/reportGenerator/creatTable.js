const readJSON = async (filePath) => {
  const data = await fetch(filePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      return data;
    })
    .catch((error) => {
      console.error("Error during fetch operation:", error);
    });
  return data;
};

const formatFileData = (fileData, category) => {
  const tableData = Object.keys(fileData).map((key) => {
    return {
      [category]: key,
      ...fileData[key],
    };
  });
  return tableData;
};

export const getTableData = async (filePath) => {
  const fileData = await readJSON(filePath);
  console.log(fileData);
  const repoData = fileData.allRepoData;
  const statisticsData = {
    total: fileData.totalData,
    median: fileData.medianData,
  };
  const repoTableData = formatFileData(repoData, "repository");
  const statisticsTableData = formatFileData(statisticsData, "");
  return { repoTableData, statisticsTableData };
};

export const creatTable = (tableData, tableHeaders, container) => {
  const tableContainer = document.getElementById(
    container ?? "table-container"
  );

  const table = document.createElement("table");

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  tableHeaders.forEach((key) => {
    const th = document.createElement("th");
    th.textContent = key;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  tableData.forEach((item) => {
    const row = document.createElement("tr");
    Object.values(item).forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  tableContainer.appendChild(table);
};

getTableData("../../subtask1.json").then((tableData_task1) => {
  creatTable(
    tableData_task1.repoTableData,
    Object.keys(tableData_task1.statisticsTableData[0]),
    "table1"
  );
  creatTable(
    tableData_task1.statisticsTableData,
    Object.keys(tableData_task1.statisticsTableData[0]),
    "table2"
  );
});

getTableData("../../subtask2.json").then((tableData_task2) => {
  creatTable(
    tableData_task2.repoTableData,
    Object.keys(tableData_task2.statisticsTableData[0]),
    "table3"
  );
  creatTable(
    tableData_task2.statisticsTableData,
    Object.keys(tableData_task2.statisticsTableData[0]),
    "table4"
  );
});
