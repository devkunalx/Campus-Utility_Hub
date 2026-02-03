auth.onAuthStateChanged(async user => {
  if (!user) return location.href = "/index.html";

  const snap = await db.collection("users").doc(user.uid).get();
  if (!snap.exists || snap.data().role === "student") {
    alert("Admins only");
    await auth.signOut();
    location.href = "/index.html";
    return;
  }

  loadOfficialStatus();
  loadReports();
});

async function loadOfficialStatus() {
  const snap = await db.collection("utilitiesStatus").get();

  snap.forEach(doc => {
    const select = document.querySelector(
      `select[onchange*="${doc.id}"]`
    );
    if (select) select.value = doc.data().status;
  });
}

document.getElementById("updateOfficialStatus").addEventListener("click", async () => {
  const updates = {
    water: document.querySelector(`select[onchange*="water"]`).value,
    wifi: document.querySelector(`select[onchange*="wifi"]`).value,
    electricity: document.querySelector(`select[onchange*="electricity"]`).value,
    laundry: document.querySelector(`select[onchange*="laundry"]`).value
  };

  try {
    const batch = db.batch();

    Object.entries(updates).forEach(([utility, status]) => {
      const ref = db.collection("utilitiesStatus").doc(utility);
      batch.set(ref, {
        status,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    alert("Utilities status updated successfully");

  } catch (err) {
    console.error("Update failed:", err);
    alert("Failed to update utilities");
  }
});

async function loadReports() {
  const table = document.getElementById("reportsTable");
  const snap = await db.collection("utilityReports")
    .orderBy("createdAt", "desc")
    .get();

  table.innerHTML = "";

  snap.forEach(doc => {
    const d = doc.data();

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.utility.toUpperCase()}</td>
      <td>${d.status}</td>
      <td>${d.createdAt?.toDate().toLocaleString()}</td>
      <td>
        ${!d.verified ? `<button onclick="verifyReport('${doc.id}')">Verify</button>` : "✅"}
      </td>
    `;
    table.appendChild(tr);
  });
}

window.verifyReport = async function (id) {
  await db.collection("utilityReports").doc(id).update({
    status: "verified",
    verified: true
  });
  loadReports();
};
