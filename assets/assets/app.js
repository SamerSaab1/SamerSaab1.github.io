const count = document.getElementById("count");
const rows = document.getElementById("rows");
const search = document.getElementById("search");

count.textContent = "Loading data…";

function getSociety(m){
  if (m && typeof m.Organizer === "object" && m.Organizer) return m.Organizer.Society || "";
  return m["Organizer/Society"] || "";
}

function render(list){
  rows.innerHTML = "";
  for (const m of list){
    rows.innerHTML += `
      <tr>
        <td>${m.Category || ""}</td>
        <td>${m.Subdiscipline || ""}</td>
        <td><strong>${m.Meeting || ""}</strong></td>
        <td>${m.Acronym || ""}</td>
        <td>${getSociety(m)}</td>
        <td>${m.Region || ""}</td>
        <td>${m.Confidence || ""}</td>
      </tr>`;
  }
  count.textContent = `${list.length} meetings shown`;
}

fetch("./data/meetings.json")
  .then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status} loading data/meetings.json`);
    return r.json();
  })
  .then(data => {
    if (!Array.isArray(data)) throw new Error("meetings.json is not a JSON array");
    render(data);

    search.addEventListener("input", () => {
      const q = search.value.toLowerCase();
      const filtered = data.filter(m => JSON.stringify(m).toLowerCase().includes(q));
      render(filtered);
    });
  })
  .catch(err => {
    console.error(err);
    count.textContent = "Error loading data. Open DevTools → Console for details.";
  });
