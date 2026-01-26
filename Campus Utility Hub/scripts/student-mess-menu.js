const currentWeek = "week_01_2025";
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = "/loginpage.html";
            return;
        }

        loadMenu();
    })

    const submitBtn = document.getElementById("submitRatingBtn");
submitBtn.addEventListener("click", submitRating);

    const cancelBtn = document.getElementById("cancelRatingBtn")
        cancelBtn.addEventListener("click", () => {
            document.getElementById("ratingModal").style.display = "none";
        })

async function loadMenu() {
    const container = document.getElementById("menuContainer");
    container.innerHTML = "";

    for (let day of days) {
        const snap = await db.collection("messMenu").doc(currentWeek).collection(day).doc("meals").get();

        const meals = snap.data();

        container.innerHTML += `
            <div class="day-card">
                <h2>${day}</h2>
                ${createMeal("Breakfast", meals.breakfast, day, "breakfast")}
                ${createMeal("Lunch", meals.lunch, day, "lunch")}
                ${createMeal("Dinner", meals.dinner, day, "dinner")}
            </div>
        `;
    }
}

function createMeal(title, item, day, mealType) {
    return `
        <div class="meal">
            <h3>${title}</h3>
            <p>${item}</p>
            <button onclick="openRating('${day}','${mealType}')">Rate</button>
        </div>
    `;
}

const openRating = (day, mealType) => {
    document.getElementById("ratingModal").style.display = "flex";
    document.getElementById("ratingDay").value = day;
    document.getElementById("ratingMeal").value = mealType;
};

async function submitRating() {
  const rating = document.getElementById("ratingValue").value;
  const feedback = document.getElementById("ratingFeedback").value;
  const day = document.getElementById("ratingDay").value;
  const meal = document.getElementById("ratingMeal").value;

    const user = auth.currentUser; 

  const ratingDocId = `${currentWeek}_${day}_${meal}_${user.uid}`;

  const ratingRef = db.collection("mealRatings").doc(ratingDocId);
  const existingSnap = await ratingRef.get();

  if (existingSnap.exists) {
    alert("You have already rated this meal.");
    document.getElementById("ratingModal").style.display = "none";
    return;
  }

  await ratingRef.set({
    week: currentWeek,
    day,
    mealType: meal,
    rating: Number(rating),
    feedback,
    userId: user.uid,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  alert("Rating submitted successfully!");
  document.getElementById("ratingFeedback").value = ""
  document.getElementById("ratingModal").style.display = "none";
}

