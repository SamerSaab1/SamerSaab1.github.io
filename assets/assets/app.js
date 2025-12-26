document.addEventListener("DOMContentLoaded", () => {
  const count = document.getElementById("count");
  const rows = document.getElementById("rows");
  const search = document.getElementById("search");

  // If these don't exist, you're on a different page or IDs changed
  if (!count || !rows || !search) {
    console.log("Search page elements not found (count/rows/search).");
    return;
  }

  count.textContent = "Loading data…";

  function getSociety(m){
    if (m && typeof m.Organizer === "object" && m.Organizer) {
      return m.Organizer.Society || "";
    }
    return m["Organizer/Society"] || "";
  }

  function escapeHtml(s){
    return (s ?? "").toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function openMeetingModal(m){
  const modal = document.getElementById("meetingModal");
  const closeBtn = document.getElementById("mClose");

  // Fill header
  document.getElementById("mTitle").textContent = `${m.Meeting || ""} (${m.Acronym || ""})`;
  document.getElementById("mSub").textContent = `${m.Subdiscipline || ""} • ${getSociety(m) || ""}`;

  // Pills
  const conf = (m.Confidence || "").toString();
  const confEl = document.getElementById("mConfidence");
  confEl.textContent = `Confidence: ${conf || "—"}`;
  confEl.className = "pill " + (conf.toLowerCase().startsWith("high") ? "high" : "medium");

  document.getElementById("mCategory").textContent = `Category: ${m.Category || "—"}`;
  document.getElementById("mRegion").textContent = `Region: ${m.Region || "—"}`;

  // Criteria mapping
  document.getElementById("mRecord").textContent = m.NonProceedingsRecordType || "—";
  document.getElementById("mEvidenceSummary").textContent = m.EvidenceSummary || "—";

  const ev = (m.EvidenceURL || "").toString().trim();
  const off = (m.OfficialURL || "").toString().trim();
  document.getElementById("mEvidenceLinks").innerHTML =
    `${ev ? `<a href="${ev}" target="_blank" rel="noopener noreferrer">Evidence URL</a>` : "No evidence link provided."}
     ${ev && off ? " · " : ""}
     ${off ? `<a href="${off}" target="_blank" rel="noopener noreferrer">Official URL</a>` : ""}`;

  document.getElementById("mConfExplain").textContent =
    conf.toLowerCase().startsWith("high")
      ? "High confidence: the non-proceedings scholarly record is clearly documented (e.g., abstract archive/supplement) and easy to verify."
      : "Medium confidence: the meeting is clearly prestigious, but the public documentation of the non-proceedings record is less explicit or varies by year.";

  // Show + close
  modal.style.display = "flex";

  function close(){
    modal.style.display = "none";
    modal.removeEventListener("click", backdropClose);
    document.removeEventListener("keydown", escClose);
  }
  function backdropClose(e){
    if (e.target === modal) close();
  }
  function escClose(e){
    if (e.key === "Escape") close();
  }

  closeBtn.onclick = close;
  modal.addEventListener("click", backdropClose);
  document.addEventListener("keydown", escClose);
}


  function render(list){
    rows.innerHTML = "";
    list.forEach(m => {
      const meetingText = escapeHtml(m.Meeting || "");
      const url = (m.OfficialURL || "").toString().trim();

      // Build the clickable meeting name safely
      const meetingCell = url
        ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer"><strong>${meetingText}</strong></a>`
        : `<strong>${meetingText}</strong>`;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(m.Category || "")}</td>
        <td>${escapeHtml(m.Subdiscipline || "")}</td>
        <td>${meetingCell}</td>
        <td>${escapeHtml(m.Acronym || "")}</td>
        <td>${escapeHtml(getSociety(m) || "")}</td>
        <td>${escapeHtml(m.Region || "")}</td>
        <td>${escapeHtml(m.Confidence || "")}</td>
      `;
      rows.appendChild(tr);
    });

    count.textContent = `${list.length} meetings shown`;
  }

  fetch("/data/meetings.json", { cache: "no-store" })
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status} while loading /data/meetings.json`);
      return r.json();
    })
    .then(data => {
      if (!Array.isArray(data)) throw new Error("meetings.json is not an array");
      render(data);

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
      count.textContent = "Error loading data: " + err.message;
    });
});
