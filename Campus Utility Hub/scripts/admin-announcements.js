let editingId = null;

auth.onAuthStateChanged(async user => {
  if (!user) {
    location.href = "/index.html";
    return;
  }

  const snap = await db.collection("users").doc(user.uid).get();
  if (!snap.exists || snap.data().role === "student") {
    alert("Admins only");
    await auth.signOut();
    location.href = "/index.html";
  }
});

const titleInput = document.getElementById("titleInput");
const contentInput = document.getElementById("contentInput");
const categorySelect = document.getElementById("categorySelect");
const expiryInput = document.getElementById("expiryInput");
const saveBtn = document.getElementById("saveBtn");
const list = document.getElementById("announcementList");

const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");

function formatDate(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${d}-${m}-${y} ${h}:${min}`;
}

saveBtn.addEventListener("click", async () => {
  if (!titleInput.value || !contentInput.value || !expiryInput.value) {
    alert("Fill all fields");
    return;
  }

  const data = {
    title: titleInput.value.trim(),
    content: contentInput.value.trim(),
    category: categorySelect.value,
    expiryAt: firebase.firestore.Timestamp.fromDate(
      new Date(expiryInput.value)
    ),
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    createdBy: auth.currentUser.uid
  };

  if (editingId) {
    await db.collection("announcements").doc(editingId).update(data);
    editingId = null;
  } else {
    await db.collection("announcements").add(data);
  }

  titleInput.value = "";
  contentInput.value = "";
  expiryInput.value = "";

  loadAnnouncements();
});

async function loadAnnouncements() {
  const now = new Date();
  const searchText = searchInput.value.toLowerCase();
  const selectedCategory = filterCategory.value;

  const snap = await db
    .collection("announcements")
    .orderBy("createdAt", "desc")
    .get();

  list.innerHTML = "";

  snap.forEach(doc => {
    const d = doc.data();

    if (!d.title.toLowerCase().includes(searchText)) return;

    if (selectedCategory !== "all" && d.category !== selectedCategory) return;

    const expired = d.expiryAt.toDate() < now;

    const div = document.createElement("div");
    div.className = `announcement ${(expired) ? "expired" : ""}`;

    div.innerHTML = `
      <h4>${d.title}</h4>
      <p>${d.content}</p>
      <small>
        ${d.category.toUpperCase()} |
        Expires: ${formatDate(d.expiryAt.toDate())}
      </small>
      <div class="actions">
        <button   onclick="editAnnouncement('${doc.id}')">Edit</button>
        <button class="action delete" onclick="deleteAnnouncement('${doc.id}')">
          Delete
        </button>
      </div>
    `;

    list.appendChild(div);

if (expired) {
  const actions = div.querySelectorAll(".action");
  actions.forEach(btn => {
    btn.disabled = true;
  });
}

  });
}

window.editAnnouncement = async (id) => {
  const doc = await db.collection("announcements").doc(id).get();
  const d = doc.data();

  titleInput.value = d.title;
  contentInput.value = d.content;
  categorySelect.value = d.category;
  expiryInput.value = d.expiryAt
    .toDate()
    .toISOString()
    .slice(0, 16);

  editingId = id;
};

window.deleteAnnouncement = async (id) => {
  if (confirm("Delete announcement?")) {
    await db.collection("announcements").doc(id).delete();
    loadAnnouncements();
  }
};

searchInput.addEventListener("input", loadAnnouncements);
filterCategory.addEventListener("change", loadAnnouncements);

loadAnnouncements();
