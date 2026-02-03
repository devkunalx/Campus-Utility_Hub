/* AUTH */
auth.onAuthStateChanged(async user => {
  if (!user) return location.href = "/index.html";

  const snap = await db.collection("users").doc(user.uid).get();
  if (!snap.exists || snap.data().role === "student") {
    alert("Admins only");
    await auth.signOut();
    location.href = "/index.html";
  }

  loadMarketplace();
});

const list = document.getElementById("productList");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");

const totalCount = document.getElementById("totalCount");
const activeCount = document.getElementById("activeCount");
const soldCount = document.getElementById("soldCount");

const bookCount = document.getElementById("bookCount");
const labCount = document.getElementById("labCount");
const electronicsCount = document.getElementById("electronicsCount");
const otherCount = document.getElementById("otherCount");

async function loadMarketplace() {
  const snap = await db.collection("marketplace").orderBy("createdAt", "desc").get();

  list.innerHTML = "";

  let total = 0, active = 0, sold = 0;
  let books = 0, lab = 0, electronics = 0, other = 0;

  snap.forEach(doc => {
    const d = doc.data();
    total++;

    if (d.status === "sold") sold++;
    else active++;

    if (d.category === "book") books++;
    else if (d.category === "lab") lab++;
    else if (d.category === "electronics") electronics++;
    else other++;

    if (
      (categoryFilter.value !== "all" && d.category !== categoryFilter.value) ||
      (statusFilter.value !== "all" && d.status !== statusFilter.value)
    ) return;

    const div = document.createElement("div");
    div.className = "product";

    div.innerHTML = `
      <img src="${d.imageUrl}">
      <h4>${d.title}</h4>
      <p>₹${d.price} • ${d.condition}</p>
      <span class="badge ${d.status}">${d.status.toUpperCase()}</span>
    `;

    if (d.status === "active") {
      const btn = document.createElement("button");
      btn.textContent = "Mark as Sold";
      btn.onclick = async () => {
        await db.collection("marketplace").doc(doc.id).update({ status: "sold" });
        loadMarketplace();
      };
      div.appendChild(btn);
    }

    list.appendChild(div);
  });

  totalCount.textContent = total;
  activeCount.textContent = active;
  soldCount.textContent = sold;

  bookCount.textContent = books;
  labCount.textContent = lab;
  electronicsCount.textContent = electronics;
  otherCount.textContent = other;
}

categoryFilter.onchange = loadMarketplace;
statusFilter.onchange = loadMarketplace;
