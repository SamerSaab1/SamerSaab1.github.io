// ORBIT Search page script (robust)

document.addEventListener("DOMContentLoaded", () => {
  const count = document.getElementById("count");
  const rows = document.getElementById("rows");
  const search = document.getElementById("search");

  // Guard: if we’re not on the Search page, exit quietly
  if (!count || !rows || !search) return;

  count.textContent = "Loading data…";

  function getSociety(m){
    if (m && typeof m.Organizer === "object" && m.Organizer) {
      return m.Organizer.Society || "";
    }
    return m["Organizer/Society"] || "";
  }

  function render(list){
    rows.innerHTML = "";
    list.forEach(m => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${m.Category || ""}</td>
        <td>${m.Subdiscipline || ""}</td>
        <td><strong>${m.Meeting || ""}</strong></td>
        <td>${m.Acronym || ""}</td>
        <td>${getSociety(m)}</td>
        <td>${m.Region || ""}</td>
        <td>${m.Confidence || ""}</td>
      `;
      rows.appendChild(tr);
    });
    count.textContent = `${list.length} meetings shown`;
  }

  // Fetch with explicit error handling
  fetch("/data/meetings.json", { cache: "no-store" })
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status} while loading /data/meetings.json`);
      return r.json();
    })
    .then(data => {
      if (!Array.isArray(data)) throw new Error("meetings.json is not an array");

      // Initial render
      render(data);

      // Search behavior
      search.addEventListener("input", () => {
        const q = (search.value || "").toLowerCase().trim();
        if (!q) return render(data);

        const filtered = data.filter(m => {
          const hay = [
            m.Category, m.Subdiscipline, m.Meeting, m.Acronym,
            getSociety(m), m.Region, m.NonProceedingsRecordType, m.EvidenceSummary
          ].join(" ").toLowerCase();
          return hay.includes(q);
        });

        render(filtered);
      });
    })
    .catch(err => {
      console.error(err);
      count.textContent = "Error loading data. (Open DevTools → Console)";
    });
});
