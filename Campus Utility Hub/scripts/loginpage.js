  const optionButtons = document.querySelectorAll('.option-btn');
  const signupLink = document.querySelector('.signup-link');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginForm = document.querySelector('.login-form');

  const signupModal = document.getElementById('signupModal');
  const openModalButton = document.getElementById('openSignupModal');
  const closeModalButton = document.querySelector('.close-button');
  const registrationForm = document.getElementById('registrationForm');

  const signInButton = document.querySelector('.sign-in-button');

  let currentLoginType = 'student';

  const setLoading = (btn, isLoading) => {
    if (!btn) return;
    btn.disabled = isLoading;
    btn.style.opacity = (isLoading) ? '0.7' : '1';
  };

  const signIn = async (email, password) => {
    try {
      setLoading(signInButton, true);

      const res = await auth.signInWithEmailAndPassword(email, password);
      const user = res.user;
      if (!user) throw new Error('No user returned.');

      const userDoc = await db.collection('users').doc(user.uid).get();
      const role = userDoc.exists ? userDoc.data().role : null;

      if (currentLoginType === 'admin' && role !== 'admin' && role !== 'superadmin') {
        await auth.signOut();
        alert("Access Denied: This is not an admin account.");
        return;
      }

      if (currentLoginType === 'student' && role !== 'student') {
        await auth.signOut();
        alert("Please use the Admin Login tab to sign in.");
        return;
      }

        window.location.href = "/dashboard.html";


    } catch (err) {
      console.error("Sign In Error:", err);
      alert(`Login Failed: ${err.message}`);
    } finally {
      setLoading(signInButton, false);
    }
  };


  const handleAuth = (e) => {
    if (e) e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) return alert("Enter email & password");

    signIn(email, password);
  };

  if (loginForm){loginForm.addEventListener('submit', handleAuth)};
  if (signInButton) {signInButton.addEventListener('click', handleAuth)};

  optionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      optionButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentLoginType = btn.getAttribute("data-login-type") || "student";

      signupLink.classList.toggle("hidden", currentLoginType === "admin");

      if (emailInput) {
        emailInput.placeholder = (currentLoginType === "admin") ? "Admin Email" : "Student Email";
      }
    });
  });


  if (openModalButton) {
    openModalButton.addEventListener('click', (e) => {
      e.preventDefault();
      signupModal.classList.remove('hidden');
    });
  }

  if (closeModalButton) {
    closeModalButton.addEventListener('click', () => {
      signupModal.classList.add('hidden');
      registrationForm.reset();
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === signupModal) {
      signupModal.classList.add('hidden');
      registrationForm?.reset();
    }
  });


const register = async (email, password, name) => {
  const btn = document.querySelector('.register-button');

  try {
    setLoading(btn, true);
    const res = await auth.createUserWithEmailAndPassword(email, password);
    const uid = res.user.uid;

    await db.collection("users").doc(uid).set({
      email,
      name,
      role: "student",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("Registration Successful! ");

    window.location.href = "dashboard.html"


  } catch (err) {
    console.error("Registration Error:", err);

    if (err.code === "auth/email-already-in-use") {
      alert("Already existing user with this Email ID");
    } else if (err.code === "auth/weak-password") {
      alert("Password should be at least 6 characters");
    } else {
      alert(err.message);
    }

  } finally {
    setLoading(btn, false);
  }
};


  if (registrationForm) {
    registrationForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const confirm = document.getElementById('regConfirmPassword').value;

      if (!name || !email || !password || !confirm) {
        return alert("Fill all fields");
      }
      if (password !== confirm) return alert("Passwords don't match");
      if (password.length < 6) return alert("Password too short");

      

      register(email, password, name);
    });
  }
