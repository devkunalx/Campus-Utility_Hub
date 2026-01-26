document.addEventListener("DOMContentLoaded", () => {

    if (typeof auth === "undefined" || typeof db === "undefined") {
        alert("Firebase not loaded");
        return;
    }

    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = "/loginpage.html";
            return;
        }

        const snap = await db.collection("users").doc(user.uid).get();

        if (!snap.exists || snap.data().role !== "superadmin") {
            alert("Access Denied: Super Admins Only");
            await auth.signOut();
            window.location.href = "/loginpage.html";
            return;
        }

        document.body.style.display = "block";
        loadAdmins();
    });

});

document.getElementById("addAdminBtn").addEventListener("click", async () => {
    const email = document.getElementById("newAdminEmail").value.trim();
    if (!email) return alert("Enter email");

    const exisistingUser = await db.collection("users")
        .where("email", "==", email)
        .get();

    if (exisistingUser.empty) {
        alert("User not found");
        return;
    }

    const userDoc = exisistingUser.docs[0];
    await db.collection("users").doc(userDoc.id).update({
        role: "admin"
    });

    alert("Admin added successfully");
    document.getElementById("newAdminEmail").value = "";
    loadAdmins();
});

async function loadAdmins() {
    const tbody = document.getElementById("adminList");
    tbody.innerHTML = "";

    const snap = await db.collection("users")
        .where("role", "in", ["admin", "superadmin"])
        .get();

    snap.forEach(doc => {
        const user = doc.data();
        tbody.innerHTML += `
            <tr>
                <td>${user.name || "-"}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
            </tr>
        `;
    });
}
