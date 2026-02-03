const CLOUD_NAME = "der582qc8";
const UPLOAD_PRESET = "lost_found";

const titleInput = document.getElementById("titleInput");
const descInput = document.getElementById("descInput");
const categorySelect = document.getElementById("categorySelect");
const imageInput = document.getElementById("imageInput");
const postBtn = document.getElementById("postBtn");

const itemsGrid = document.getElementById("itemsGrid");
const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");


document.addEventListener("DOMContentLoaded", () => {

    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = "/index.html";
            return;
        }
    });

async function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
    );

    const data = await res.json();
    return data.secure_url;
}


postBtn.addEventListener("click", async () => {


    if (!imageInput.files[0]) {
        alert("Select image");
        return;
    }

    if(titleInput.value.trim() == "" || descInput.value.trim() == ""){
        alert("Fill all the fields")
    }

    const imageUrl = await uploadImage(imageInput.files[0]);

    await db.collection("lostFound").add({
        title: titleInput.value,
        description: descInput.value,
        category: categorySelect.value,
        imageUrl,
        status: "active",
        userId: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    titleInput.value = "";
    descInput.value = "";
    imageInput.value = "";

    loadItems();
});


async function loadItems() {
    const selectedCategory = filterCategory.value;

    const snap = await db
        .collection("lostFound")
        .orderBy("createdAt", "desc")
        .get();

    itemsGrid.innerHTML = "";

    snap.forEach(doc => {
        const d = doc.data();

        if (d.status === "recovered") return;

        if (d.category !== selectedCategory) {
            return;
        }

        const div = document.createElement("div");
        div.className = "item";

        div.innerHTML = `
            <img src="${d.imageUrl}">
            <h4>${d.title}</h4>
            <p>${d.description}</p>
            <small>${d.category.toUpperCase()}</small>
        `;


        if (auth.currentUser.uid === d.userId) {
            const btn = document.createElement("button");
            btn.textContent = "Mark as Recovered";
            btn.className = "recover-btn";
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
}

filterCategory.addEventListener("change", loadItems);

loadItems()
})