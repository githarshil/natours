// Handle login form submission
const handleLogin = async (email, password) => {
  try {
    const res = await fetch('/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();

    if (data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    } else {
      showAlert('error', data.message);
    }
  } catch (err) {
    showAlert('error', 'Something went wrong. Please try again.');
  }
};

// Handle signup form submission
const handleSignup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await fetch('/api/v1/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        passwordConfirm,
      }),
    });

    const data = await res.json();

    if (data.status === 'success') {
      showAlert('success', 'Account created successfully! Logging you in...');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    } else {
      showAlert('error', data.message || 'Signup failed');
    }
  } catch (err) {
    showAlert('error', 'Something went wrong. Please try again.');
  }
};

// Handle logout
const handleLogout = async () => {
  try {
    const res = await fetch('/api/v1/users/logout', {
      method: 'GET',
    });

    const data = await res.json();
    if (data.status === 'success') {
      location.reload(true); // Reload from server (no cache)
    }
  } catch (err) {
    showAlert('error', 'Error logging out! Try again.');
  }
};

// Handle user data update (name, email, photo)
const handleUpdateUserData = async (formData) => {
  try {
    const res = await fetch('/api/v1/users/updateMe', {
      method: 'PATCH',
      body: formData,
    });

    const data = await res.json();

    if (data.status === 'success') {
      showAlert('success', 'Your profile updated successfully!');
      window.setTimeout(() => {
        location.reload();
      }, 1500);
    } else {
      showAlert('error', data.message || 'Update failed');
    }
  } catch (err) {
    showAlert('error', 'Error updating profile! Try again.');
  }
};

// Show alerts/messages
const showAlert = (type, msg) => {
  // Remove any existing alerts
  const existingAlert = document.querySelector('.alert');
  if (existingAlert) existingAlert.remove();

  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.body.insertAdjacentHTML('afterbegin', markup);

  // Auto-remove alert after 5 seconds
  window.setTimeout(() => {
    const alert = document.querySelector('.alert');
    if (alert) alert.remove();
  }, 5000);
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Login form submission
  const loginForm = document.querySelector('.form--login');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      handleLogin(email, password);
    });
  }

  // Signup form submission
  const signupForm = document.querySelector('.form--signup');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const passwordConfirm = document.getElementById(
        'signup-passwordConfirm',
      ).value;
      handleSignup(name, email, password, passwordConfirm);
    });
  }

  // Logout button
  const logoutBtn = document.querySelector('.logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // User data update form (account settings)
  const userDataForm = document.querySelector('.form-user-data');
  if (userDataForm) {
    userDataForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(userDataForm);
      handleUpdateUserData(formData);
    });
  }

  // Toggle between login and signup forms
  const signupBtn = document.querySelector('.form__toggle--signup');
  const loginBtn = document.querySelector('.form__toggle--login');
  const loginFormSection = document.querySelector('.form-section--login');
  const signupFormSection = document.querySelector('.form-section--signup');

  if (signupBtn) {
    signupBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loginFormSection.style.display = 'none';
      signupFormSection.style.display = 'block';
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      signupFormSection.style.display = 'none';
      loginFormSection.style.display = 'block';
    });
  }
});
