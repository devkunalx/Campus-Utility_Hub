const CURRENT_WEEK = "week_01_2025";

    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = "loginpage.html"
            return;
        }


            const doc = await db.collection("users").doc(user.uid).get();
        
            if ( doc.data().role === "student") {
              const hidden =  document.querySelector(".admin-nav")
              hidden.classList.add("hidden")
              const admin = document.querySelectorAll(".admin")
              admin.forEach(e =>{e.classList.add("hidden")})
            }

            else{
              const hidden =  document.querySelector(".student-nav")
              const student = document.querySelectorAll(".student")
              hidden.classList.add("hidden")
              student.forEach(e =>{e.classList.add("hidden")})

              
              if (doc.data().role !== "superadmin"){
              const adminAccountsLink = document.getElementById("adminAccountsLink")
                adminAccountsLink.classList.add("hidden")
              }
            }


            document.getElementById("name").textContent = doc.data().name;


            loadTodayMenu();
            loadLostFoundDashboard();
            loadMarketplacePreview();
            loadAnnouncements();
            loadUtilitiesStatus();


    });

  const signOutBtn = document.getElementById("signOutBtn")

  signOutBtn.addEventListener("click", () => {
        auth.signOut().then(() => window.location.href = "loginpage.html");
    });

async function loadTodayMenu() {
    const today = new Date();
    const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
    document.getElementById("todayDate").textContent = today.toDateString();

    const snap = await db.collection("messMenu").doc(CURRENT_WEEK).collection(dayName).doc("meals").get();
    if (snap.exists) {
        const data = snap.data();
        document.getElementById("breakfastMenu").textContent = data.breakfast || "—";
        document.getElementById("lunchMenu").textContent = data.lunch || "—";
        document.getElementById("dinnerMenu").textContent = data.dinner || "—";
    }
}


async function loadLostFoundDashboard() {
    const lostContainer = document.getElementById("lostItemsList");
    const foundContainer = document.getElementById("foundItemsList");

    lostContainer.innerHTML = "<p class='loading'>Loading...</p>";
    foundContainer.innerHTML = "<p class='loading'>Loading...</p>";

    try {
        const snap = await db
            .collection("lostFound")
            .orderBy("createdAt", "desc")
            .get();

        lostContainer.innerHTML = "";
        foundContainer.innerHTML = "";

        let lostCount = 0;
        let foundCount = 0;

        
        snap.forEach(doc => {
            const d = doc.data();

            const card = document.createElement("div");
            card.className = "marketplace-item";
            card.innerHTML = `
                <h5>${d.title}</h5>
                <img src="${d.imageUrl || '#'}" alt="item">
            `;

            if (d.category === "lost" && lostCount < 2) {
                lostContainer.appendChild(card);
                lostCount++;
            }

            if (d.category === "found" && foundCount < 2) {
                foundContainer.appendChild(card);
                foundCount++;
            }
        });

        if (lostCount === 0) {
            lostContainer.innerHTML = "<p class='loading'>No lost items</p>";
        }

        if (foundCount === 0) {
            foundContainer.innerHTML = "<p class='loading'>No found items</p>";
        }

    } catch (err) {
        console.error("Lost & Found dashboard error:", err);
        lostContainer.innerHTML = "<p class='loading'>Error loading data</p>";
        foundContainer.innerHTML = "<p class='loading'>Error loading data</p>";
    }
}


async function loadMarketplacePreview() {
    const container = document.getElementById("marketplaceItems");
    const snap = await db.collection("marketplace").where("status", "==", "available").limit(4).get();
    container.innerHTML = "";
    snap.forEach(doc => {
        const d = doc.data();
        container.innerHTML += `
            <div class="marketplace-item">
                <h5>${d.title}</h5>
                <img src="${d.imageUrl || '#'}" alt="item">
                <p>₹${d.price}</p>
                <p>${d.phoneNumber}</p>
            </div>`;
    });
}

async function loadAnnouncements() {
    const container = document.getElementById("latestAnnouncement");
    const snap = await db.collection("announcements").orderBy("createdAt", "desc").limit(2).get();
    if (!snap.empty) {
        const d = snap.docs[0].data();
        container.innerHTML = `<h4>${d.title}</h4><p>${d.content.substring(0, 100)}...</p>`;
    }
}

async function loadUtilitiesStatus() {
    const snap = await db.collection("utilitiesStatus").get();
    snap.forEach(doc => {
        const d = doc.data();
        const element = document.getElementById(`${doc.id}Status`);
            element.textContent = d.status.toUpperCase();
            element.className = `utility-status ${d.status}`;
    });
}


const menuToggle = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");

menuToggle.addEventListener("click", () => {
  sidebar.classList.add("active");
});
