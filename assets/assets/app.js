fetch("data/meetings.json")
  .then(r => r.json())
  .then(data => {
    const rows = document.getElementById("rows");
    const count = document.getElementById("count");
    const search = document.getElementById("search");

    function render(list) {
      rows.innerHTML = "";
      list.forEach(m => {
        const society =
          typeof m.Organizer === "object"
            ? m.Organizer.Society
            : m["Organizer/Society"] || "";

        rows.innerHTML += `
          <tr>
            <td>${m.Category}</td>
            <td>${m.Subdiscipline}</td>
            <td><strong>${m.Meeting}</strong></td>
            <td>${m.Acronym}</td>
            <td>${society}</td>
            <td>${m.Region}</td>
            <td>${m.Confidence}</td>
          </tr>`;
      });
      count.textContent = `${list.length} meetings shown`;
    }

    render(data);

    search.addEventListener("input", () => {
      const q = search.value.toLowerCase();
      render(data.filter(m =>
        JSON.stringify(m).toLowerCase().includes(q)
      ));
    });
  })
  .catch(err => {
    document.getElementById("count").textContent =
      "Failed to load data/meetings.json";
    console.error(err);
  });
