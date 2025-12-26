document.addEventListener("DOMContentLoaded", () => {
  const count = document.getElementById("count");
  const rows  = document.getElementById("rows");
  const search = document.getElementById("search");

  // If these don't exist, you're on another page
  if (!count || !rows || !search) return;

  // Modal elements (must exist in index.html)
  const modal = document.getElementById("meetingModal");
  const closeBtn = document.getElementById("mClose");

  count.textContent = "Loading data…";

  function getSociety(m){
    if (m && typeof m.Organizer === "object" && m.Organizer) return m.Organizer.Society || "";
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
    if (!modal) return; // if modal not present, do nothing

    document.getElementById("mTitle").textContent = `${m.Meeting || ""} (${m.Acronym || ""})`;
    document.getElementById("mSub").textContent = `${m.Subdiscipline || ""} • ${getSociety(m) || ""}`;

    const conf = (m.Confidence || "").toString();
    const confEl = document.getElementById("mConfidence");
    confEl.textContent = `Confidence: ${conf || "—"}`;
    confEl.className = "pill " + (conf.toLowerCase().startsWith("high") ? "high" : "medium");

    document.getElementById("mCategory").textContent = `Category: ${m.Category || "—"}`;
    document.getElementById("mRegion").textContent = `Region: ${m.Region || "—"}`;

    document.getElementById("mRecord").textContent = m.NonProceedingsRecordType || "—";
    document.getElementById("mEvidenceSummary").textContent = m.EvidenceSummary || "—";

    const ev  = (m.EvidenceURL || "").toString().trim();
    const off = (m.OfficialURL || "").toString().trim();
    document.getElementById("mEvidenceLinks").innerHTML =
      `${ev ? `<a href="${escapeHtml(ev)}" target="_blank" rel="noopener noreferrer">Evidence URL</a>` : "No evidence link provided."}
       ${ev && off ? " · " : ""}
       ${off ? `<a href="${escapeHtml(off)}" target="_blank" rel="noopener noreferrer">Official URL</a>` : ""}`;

    document.getElementById("mConfExplain").textContent =
      conf.toLowerCase().startsWith("high")
        ? "High confidence: the non-proceedings scholarly record is clearly documented and easy to verify."
        : "Medium confidence: the meeting is clearly prestigious, but public documentation is less explicit or varies by year.";

    modal.style.display = "flex";
  }

  function closeMeetingModal(){
    if (!modal) return;
    modal.style.display = "none";
  }

  if (closeBtn) closeBtn.onclick = closeMeetingModal;

  // Close modal by clicking the dark backdrop
  if (modal){
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeMeetingModal();
    });
  }

  // Close modal on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMeetingModal();
  });

  function render(list){
    rows.innerHTML = "";
    list.forEach(m => {
      const meetingText = escapeHtml(m.Meeting || "");
      const url = (m.OfficialURL || "").toString().trim();

      // IMPORTANT:
      // - Clicking the ROW opens the modal
      // - Meeting name stays as plain text (so it doesn't navigate away)
      // - We add a small "Official" link icon to open website
      const meetingCell = `
        <strong>${meetingText}</strong>
        ${url ? ` <a class="mini-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" title="Open official website">↗</a>` : "" }
      `;

      const tr = document.createElement("tr");
      tr.style.cursor = "pointer";
      tr.innerHTML = `
        <td>${escapeHtml(m.Category || "")}</td>
        <td>${escapeHtml(m.Subdiscipline || "")}</td>
        <td>${meetingCell}</td>
        <td>${escapeHtml(m.Acronym || "")}</td>
        <td>${escapeHtml(getSociety(m) || "")}</td>
        <td>${escapeHtml(m.Region || "")}</td>
        <td>${escapeHtml(m.Confidence || "")}</td>
      `;

      // If user clicks the small link (↗), do NOT open modal
      tr.addEventListener("click", (evt) => {
        if (evt.target.closest("a")) return;
        openMeetingModal(m);
      });

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
