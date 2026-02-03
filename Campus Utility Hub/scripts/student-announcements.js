document.addEventListener("DOMContentLoaded", () => {

    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = "/index.html";
            return;
        }
        loadAnnouncements();
    });
});

const list = document.getElementById("announcementsList");
const filter = document.getElementById("categoryFilter");

function formatDate(date) {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
}

async function loadAnnouncements() {
    const now = new Date();
    const selectedCategory = filter.value;

    const snap = await db
        .collection("announcements")
        .where("expiryAt", ">", now)
        .orderBy("expiryAt")
        .get();

    list.innerHTML = "";

    if (snap.empty) {
        list.innerHTML = "<p>No announcements available.</p>";
        return;
    }

    snap.forEach(doc => {
        const d = doc.data();

        if (selectedCategory !== "all" && d.category !== selectedCategory) return;

        const div = document.createElement("div");
        div.className = "announcement-card";

        div.innerHTML = `
            <h3>${d.title}</h3>
            <div class="meta">
                Admin • ${ formatDate(d.createdAt.toDate()) }
            </div>
            <span class="category">${d.category.toUpperCase()}</span>
            <p>${d.content}</p>
        `;

        list.appendChild(div);
    });
}

filter.addEventListener("change", loadAnnouncements);
