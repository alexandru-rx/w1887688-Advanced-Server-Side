// Registers plugin to display values directly on charts
Chart.register(ChartDataLabels);

// Builds query string based on selected filters in the UI
function getFilterQueryString() {
  const programme = document.getElementById("filterProgramme")?.value.trim();
  const industrySector = document.getElementById("filterIndustry")?.value.trim();
  const graduationYear = document.getElementById("filterYear")?.value.trim();

  const params = new URLSearchParams();

  if (programme) {
    params.append("programme", programme);
  }

  if (industrySector) {
    params.append("industrySector", industrySector);
  }

  if (graduationYear) {
    params.append("graduationYear", graduationYear);
  }

  // Returns formatted query string
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

// Fetches and updates dashboard summary
async function loadSummary() {
  try {
    const query = getFilterQueryString();

    const res = await fetch(API + "/analytics/summary" + query, {
      credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to load summary");
    }

    document.getElementById("totalAlumni").innerText = data.totalAlumni ?? 0;
    document.getElementById("totalProgrammes").innerText = data.totalProgrammes ?? 0;
    document.getElementById("topIndustry").innerText = data.topIndustry ?? "N/A";

  } catch (error) {
    console.error("SUMMARY LOAD ERROR:", error);
  }
}

// Loads bar chart showing number of alumni per industry
async function loadIndustryChart() {
  try {
    const query = getFilterQueryString();

    const res = await fetch(API + "/analytics/by-industry" + query, {
      credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to load industry chart");
    }

    const ctx = document.getElementById("industryChart").getContext("2d");

    // Creates the bar chart
    industryChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map(item => item.label),
        datasets: [
          {
            label: "Alumni by Industry",
            data: data.map(item => item.value)
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          datalabels: {
            anchor: "end",
            align: "top",
            font: { weight: "bold" },
            formatter: value => value
          }
        }
      }
    });

  } catch (error) {
    console.error("INDUSTRY CHART ERROR:", error);
  }
}

// Pie chart for programme distribution
async function loadProgrammeChart() {
  try {
    const query = getFilterQueryString();

    const res = await fetch(API + "/analytics/by-programme" + query, {
      credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to load programme chart");
    }

    const ctx = document.getElementById("programmeChart").getContext("2d");

    programmeChartInstance = new Chart(ctx, {
      type: "pie",
      data: {
        labels: data.map(item => item.label),
        datasets: [
          {
            label: "Alumni by Programme",
            data: data.map(item => item.value)
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          datalabels: {
            font: { weight: "bold" },
            formatter: value => value
          }
        }
      }
    });

  } catch (error) {
    console.error("PROGRAMME CHART ERROR:", error);
  }
}

// Line chart showing alumni trends by graduation year
async function loadGraduationYearChart() {
  try {
    const query = getFilterQueryString();

    const res = await fetch(API + "/analytics/by-graduation-year" + query, {
      credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to load graduation year chart");
    }

    const ctx = document.getElementById("graduationYearChart").getContext("2d");

    graduationYearChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.map(item => item.label),
        datasets: [
          {
            label: "Alumni by Graduation Year",
            data: data.map(item => item.value)
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          datalabels: {
            anchor: "end",
            align: "top",
            font: { weight: "bold" },
            formatter: value => value
          }
        }
      }
    });

  } catch (error) {
    console.error("GRADUATION YEAR CHART ERROR:", error);
  }
}

// Doughnut chart for most common skills
async function loadSkillsChart() {
  try {
    const query = getFilterQueryString();

    const res = await fetch(API + "/analytics/skills" + query, {
      credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to load skills chart");
    }

    const ctx = document.getElementById("skillsChart").getContext("2d");

    skillsChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: data.map(item => item.label),
        datasets: [
          {
            label: "Top Skills",
            data: data.map(item => item.value)
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          datalabels: {
            font: { weight: "bold" },
            formatter: value => value
          }
        }
      }
    });

  } catch (error) {
    console.error("SKILLS CHART ERROR:", error);
  }
}

// Loads API usage logs into table
async function loadUsageLogs() {
  try {
    const res = await fetch(API + "/apiKeys/usage", {
      credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to load API usage logs");
    }

    const tableBody = document.getElementById("usageTableBody");
    tableBody.innerHTML = "";

    // Handles empty state
    if (!data.usageLogs || data.usageLogs.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4">No usage logs found</td>
        </tr>
      `;
      return;
    }

    // Dynamically builds table rows
    data.usageLogs.forEach(log => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${log.tokenId?.name || "Unknown Key"}</td>
        <td>${log.endpoint || "N/A"}</td>
        <td>${log.method || "N/A"}</td>
        <td>${log.accessedAt ? new Date(log.accessedAt).toLocaleString() : "N/A"}</td>
      `;

      tableBody.appendChild(row);
    });

  } catch (error) {
    console.error("USAGE LOG ERROR:", error);

    const tableBody = document.getElementById("usageTableBody");
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4">Failed to load usage logs</td>
        </tr>
      `;
    }
  }
}

let industryChartInstance;
let programmeChartInstance;
let graduationYearChartInstance;
let skillsChartInstance;

// Loads entire dashboard 
async function initialiseAnalyticsDashboard() {
  await loadSummary();
  await loadIndustryChart();
  await loadProgrammeChart();
  await loadGraduationYearChart();
  await loadSkillsChart();
  await loadUsageLogs();
}

// Re-applies filters and reloads charts
document.getElementById("applyFiltersBtn")?.addEventListener("click", async () => {
  if (industryChartInstance) industryChartInstance.destroy();
  if (programmeChartInstance) programmeChartInstance.destroy();
  if (graduationYearChartInstance) graduationYearChartInstance.destroy();
  if (skillsChartInstance) skillsChartInstance.destroy();

  await initialiseAnalyticsDashboard();
});

initialiseAnalyticsDashboard();
