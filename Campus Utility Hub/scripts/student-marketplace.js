const CLOUD_NAME = "der582qc8";
const UPLOAD_PRESET = "lost_found";

const titleInput = document.getElementById("titleInput");
const priceInput = document.getElementById("priceInput");
const conditionSelect = document.getElementById("conditionSelect");
const categorySelect = document.getElementById("categorySelect");
const imageInput = document.getElementById("imageInput");
const postBtn = document.getElementById("postBtn");
const phoneNumber = document.getElementById("phoneNumber")

const itemsGrid = document.getElementById("itemsGrid");
const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");


auth.onAuthStateChanged(user => {
  if (!user) location.href = "/loginpage.html";
});

async function uploadImage(file) {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: form }
  );

  const data = await res.json();
  return data.secure_url;
}

/* POST */
postBtn.onclick = async () => {
  const user = auth.currentUser;
  if (!user || !imageInput.files[0]) {return alert("Missing fields")};

  
  if(phoneNumber.value.length != 10){
    phoneNumber.value = ""
    return alert("Enter a 10 digit contact number")
  }

if( titleInput.value.trim() === ""  || priceInput.value.toString() === ""){
  return alert("fill all the fields")
}

  const imageUrl = await uploadImage(imageInput.files[0]);

  await db.collection("marketplace").add({
    title: titleInput.value,
    price: priceInput.value,
    condition: conditionSelect.value,
    category: categorySelect.value,
    phoneNumber: phoneNumber.value,
    imageUrl,
    sellerId: user.uid,
    status: "available",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  titleInput.value =  priceInput.value = "";
  imageInput.value = "";

  loadItems();
};

async function loadItems() {
  const cat = filterCategory.value;

  const snap = await db.collection("marketplace")
    .orderBy("createdAt", "desc")
    .get();

  itemsGrid.innerHTML = "";

  snap.forEach(doc => {
    const d = doc.data();

    if (cat !== "all" && d.category !== cat) return;
    if (d.status !== "available") return;

    const div = document.createElement("div");
    div.className = "item-card";

    div.innerHTML = `
      <img src="${d.imageUrl}">
      <h4>${d.title}</h4>
      <span class="price">₹${d.price}</span>
      <p>
      <small>${d.condition.toUpperCase()}</small>
      <small>${d.phoneNumber}</small>
      </p>
    `;

    if (auth.currentUser.uid === d.sellerId) {
      const btn = document.createElement("button");
      btn.className = "delete-btn";
      btn.textContent = "Delete";
      btn.onclick = async () => {
        await db.collection("marketplace").doc(doc.id).delete();
        loadItems();
      };
      div.appendChild(btn);
    }

    itemsGrid.appendChild(div);
  });
}

filterCategory.addEventListener('change', loadItems)

loadItems();
 