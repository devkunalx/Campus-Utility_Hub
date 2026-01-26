auth.onAuthStateChanged(user => {
  if (!user) location.href = "/loginpage.html";
  loadUtilities();
});

const grid = document.getElementById("utilitiesGrid");

async function loadUtilities() {
  const snap = await db.collection("utilitiesStatus").get();
  grid.innerHTML = "";

  snap.forEach(doc => {
    const d = doc.data();
    grid.innerHTML += `
      <div class="utility-card">
        <h4>${doc.id.toUpperCase()}</h4>
        <p class="status-${d.status}">
          ${d.status.toUpperCase()}
        </p>
      </div>
    `;
  });
}

document.getElementById("reportBtn").onclick = async () => {


  const user = auth.currentUser;
  if (!user) return;

  await db.collection("utilityReports").add({
    utility: utilitySelect.value,
    reportedStatus: statusSelect.value,
    userId: user.uid,
    status: "pending",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  alert("Report submitted for admin review");
  descInput.value = "";
};
