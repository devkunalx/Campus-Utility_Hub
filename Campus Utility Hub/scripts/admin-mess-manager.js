 auth.onAuthStateChanged(async (user) => {
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

        document.body.style.display = "block";

    });

    const daySelect = document.getElementById("daySelect");
    const breakfastInput = document.getElementById("breakfastInput");
    const lunchInput = document.getElementById("lunchInput");
    const dinnerInput = document.getElementById("dinnerInput");
    const loadBtn = document.getElementById("loadMenuBtn");
    const saveBtn = document.getElementById("saveMenuBtn");
    const viewBreakfast = document.getElementById("viewBreakfast");
    const viewLunch = document.getElementById("viewLunch");
    const viewDinner = document.getElementById("viewDinner");

    loadBtn.addEventListener("click", async () => {
        const day = daySelect.value;
        loadMealFeedbackTable()

        try {
            const snap = await db.collection("messMenu").doc("week_01_2025").collection(day).doc("meals").get();

            if (!snap.exists) {
                breakfastInput.value = "";
                lunchInput.value = "";
                dinnerInput.value = "";

                viewBreakfast.textContent = "—";
                viewLunch.textContent = "—";
                viewDinner.textContent = "—";

                alert("No menu found");
                return;
            }

            const data = snap.data();

            breakfastInput.value = data.breakfast || "";
            lunchInput.value = data.lunch || "";
            dinnerInput.value = data.dinner || "";

            viewBreakfast.textContent = data.breakfast || "—";
            viewLunch.textContent = data.lunch || "—";
            viewDinner.textContent = data.dinner || "—";

        } catch (err) {
            console.error(err);
            alert("Failed to load menu");
        }
    });

    saveBtn.addEventListener("click", async () => {
        const day = daySelect.value;

        if (!breakfastInput.value || !lunchInput.value || !dinnerInput.value) {
            alert("Fill all meals");
            return;
        }

        try {
            await db
                .collection("messMenu")
                .doc("week_01_2025")
                .collection(day)
                .doc("meals")
                .set({
                    breakfast: breakfastInput.value.trim(),
                    lunch: lunchInput.value.trim(),
                    dinner: dinnerInput.value.trim(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            viewBreakfast.textContent = breakfastInput.value;
            viewLunch.textContent = lunchInput.value;
            viewDinner.textContent = dinnerInput.value;

            alert("Menu saved");

        } catch (err) {
            console.error(err);
            alert("Save failed");
        }
    });

async function loadMealFeedbackTable() {
    const tbody = document.getElementById("feedbackBody");
    const selectedDay = daySelect.value;

    tbody.innerHTML = `<tr><td colspan="3">Loading feedback...</td></tr>`;


        const snap = await db
            .collection("mealRatings")
            .where("day", "==", selectedDay) 
            .orderBy("createdAt", "desc")
            .limit(50)
            .get();

        if (snap.empty) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3">No feedback for ${selectedDay}</td>
                </tr>`;
            return;
        }

        tbody.innerHTML = "";

        snap.forEach(doc => {
            const d = doc.data();
            
            const feedback = (d.feedback == undefined) ? "-" : d.feedback

            tbody.innerHTML += `
                <tr>
                    <td>${d.mealType}</td>
                    <td>${"★".repeat(d.rating)}</td>
                    <td>${feedback}</td>
                </tr>
            `;
        });

    
    }