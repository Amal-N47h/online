document.addEventListener("DOMContentLoaded", () => {
  const certName    = document.getElementById("certName");
  const statusMsg   = document.getElementById("statusMsg");
  const downloadBtn = document.getElementById("downloadBtn");
  const certificate = document.getElementById("certificate");

  // ====== EDIT THESE VALUES ======
  const GH_OWNER   = "Amal-N47h";
  const GH_REPO    = "hidden"; 
  const GH_BRANCH  = "main";
  const FILE_PATH  = "names.json";

  // Your GitHub token (visible in browser - you're okay with that)
  const GH_TOKEN   = "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";
  // ===============================

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    statusMsg.textContent = "No ID found in link.";
    return;
  }

  const url = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${FILE_PATH}?ref=${GH_BRANCH}`;

  fetch(url, {
    headers: {
      Authorization: `Bearer ${GH_TOKEN}`,
      Accept: "application/vnd.github.v3+json"
    }
  })
    .then(res => res.json())
    .then(data => {
      const decoded = atob(data.content.replace(/\n/g, ""));
      const nameMap = JSON.parse(decoded);

      const name = nameMap[id];
      if (!name) {
        statusMsg.textContent = "Invalid ID.";
        return;
      }

      certName.textContent = name;
      statusMsg.textContent = `Certificate for: ${name}`;
      downloadBtn.disabled = false;

      enablePdf(downloadBtn, certificate, name);
    })
    .catch(err => {
      console.error(err);
      statusMsg.textContent = "Error loading certificate data.";
    });
});

function enablePdf(downloadBtn, certificate, name) {
  downloadBtn.addEventListener("click", async () => {
    downloadBtn.disabled = true;
    downloadBtn.textContent = "Generating...";

    const canvas = await html2canvas(certificate, { scale: 2 });
    const img = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("landscape", "pt", "a4");

    const pageWidth  = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth  = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(img, "PNG", 20, (pageHeight - imgHeight)/2, imgWidth, imgHeight);

    const safe = name.replace(/[^a-z0-9]/gi, "_");
    pdf.save(`certificate_${safe}.pdf`);

    downloadBtn.disabled = false;
    downloadBtn.textContent = "Download as PDF";
  });
}
