const count = document.getElementById("count");
const rows = document.getElementById("rows");
const search = document.getElementById("search");

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
  });
  count.textContent = `${list.length} meetings shown`;
}

fetch("/data/meetings.json")
  .then(r => r.json())
  .then(data => {
    render(data);

    search.addEventListener("input", () => {
      const q = search.value.toLowerCase();
      render(data.filter(m =>
        JSON.stringify(m).toLowerCase().includes(q)
      ));
    });
  })
  .catch(err => {
    console.error(err);
    count.textContent = "Error loading data.";
  });
