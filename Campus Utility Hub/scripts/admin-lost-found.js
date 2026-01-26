auth.onAuthStateChanged(async user => {
        if (!user) {
            window.location.href = "/loginpage.html";
            return;
        }

       const snap = await db.collection("users").doc(user.uid).get();

            const role = snap.data().role;


            if (role !== "admin" && role !== "superadmin") {
                alert("Access Denied: Admins only.");
                auth.signOut();
                return;
            }
});

const itemsGrid = document.getElementById("itemsGrid");
const categoryFilter = document.getElementById("categoryFilter");

const activeCountEl = document.getElementById("activeCount");
const recoveredCountEl = document.getElementById("recoveredCount");

async function loadItems() {
    const snap = await db.collection("lostFound").get();

    let active = 0;
    let recovered = 0;

    itemsGrid.innerHTML = "";

    snap.forEach(doc => {
        const d = doc.data();

        if (d.status === "active") active++;
        else recovered++;


        if (
            categoryFilter.value !== "all" &&
            d.category !== categoryFilter.value
        ) return;

        const div = document.createElement("div");
        div.className = "item-card";

        div.innerHTML = `
            <img src="${d.imageUrl}">
            <h4>${d.title}</h4>
            <p>${d.description}</p>
            <span class="badge ${d.status}">
                ${d.status.toUpperCase()}
            </span>
        `;

        if (d.status === "active") {
            const btn = document.createElement("button");
            btn.className = "recover-btn";
            btn.textContent = "Mark as Recovered";
            btn.onclick = async () => {
                await db.collection("lostFound").doc(doc.id).update({
                    status: "recovered"
                });
                loadItems();
            };
            div.appendChild(btn);
        }

        itemsGrid.appendChild(div);
    });

    activeCountEl.textContent = active;
    recoveredCountEl.textContent = recovered;
}

categoryFilter.addEventListener("change", loadItems);

loadItems();
