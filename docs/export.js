// Export current user's profile as a CSV file
async function exportCSV() {
  try {
    // Get profile data from backend
    const res = await fetch(API + "/profile/me", {
      credentials: "include"
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch data");
    }

    const profile = data.profile;

    // CSV headers and values
    const headers = [
      "Full Name",
      "Programme",
      "Graduation Year",
      "Industry Sector",
      "Current Role",
      "Skills",
      "Certifications"
    ];

    const values = [
      profile.fullName || "",
      profile.programme || "",
      profile.graduationYear || "",
      profile.industrySector || "",
      profile.currentRole || "",
      (profile.skills || []).join(", "),
      (profile.certifications || []).join(", ")
    ];

    // Create CSV content
    let csvContent = headers.join(",") + "\n" + values.join(",");

    // Trigger download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "alumni_data.csv";
    a.click();

    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("CSV EXPORT ERROR:", error);
    alert("Failed to export CSV");
  }
}

// Button click handler
document.getElementById("exportBtn").addEventListener("click", exportCSV);
