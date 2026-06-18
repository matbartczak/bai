const API_BASE = "http://localhost:8000/";

function redirect_register(){
    window.location.href = "/register.html";
}

async function login() {

    const loginBtn = document.getElementById("login-btn");

    const spinner = document.getElementById("spinner");

    const loginText = document.getElementById("login-text");

    // START LOADING
    spinner.classList.remove("hidden");

    loginText.textContent = "Logowanie..";

    loginBtn.disabled = true;

    try {

        const response = await fetch(
            API_BASE + 'login/',
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                credentials: "include",

                body: JSON.stringify({
                    username: document.getElementById("username").value,
                    password: document.getElementById("password").value
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            sessionStorage.setItem(
                "temp_token",
                data.temp_token
            );

            window.location.href = "/verify.html";

        } else {

            let errorText = "";

            Object.entries(data).forEach(([field, messages]) => {

                if (!Array.isArray(messages)) {
                    messages = [messages];
                }

                messages.forEach(msg => {

                    errorText += `${field} - ${msg}\n`;
                });
            });

            alert(errorText);
        }

    } catch (error) {

        console.error(error);

        alert("Błąd połączenia z serwerem");

    } finally {

        // STOP LOADING
        spinner.classList.add("hidden");

        loginText.textContent = "Login";

        loginBtn.disabled = false;
    }
}

function verify() {
    const temp_token = sessionStorage.getItem("temp_token");

    const translations = {
        "Invalid or expired code": "Nieprawidłowy lub wygasły kod",
        "Missing temp_token or code": "Brak danych logowania",
        "User not found": "Nie znaleziono użytkownika",
        "Invalid or expired token": "Token wygasł lub jest nieprawidłowy"
    };

    fetch(API_BASE + 'verify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({
            temp_token: temp_token,
            code: document.getElementById("code").value,
        })
    })
    .then(async res => {
        const data = await res.json();

        if (res.ok) {
            sessionStorage.removeItem("temp_token");
            window.location.href = "/main.html";
        } else {
            let errorText = "";

            Object.entries(data).forEach(([field, messages]) => {

                if (!Array.isArray(messages)) {
                    messages = [messages];
                }

                messages.forEach(msg => {
                    const translatedMsg = translations[msg] || msg;
                    errorText += `${field} - ${translatedMsg}\n`;
                });
            });

            alert(errorText);
        }
    });
}


function register() {
    fetch( API_BASE + 'register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({
            username: document.getElementById("username").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
        })
    }).then(async res => {
        const data = await res.json();
        if (res.ok) {
            window.location.href = "/index.html";
        } else {

            let errorText = "";
            Object.entries(data).forEach(([field, messages]) => {
                
                if (!Array.isArray(messages)) {
                    messages = [messages];
                }

                messages.forEach(msg => {
                    errorText += `${field} - ${msg}\n`;
                });
            });

            alert(errorText);
            
        }
    });
}

function logout() {
  fetch(API_BASE + 'logout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include"
  })
  .then(() => {
    alert("Wylogowano pomyślnie");
    window.location.href = "/index.html";
  });
}

function get_logged_user(){
  fetch(API_BASE + 'user-info/', {
      credentials: "include"
  })
  .then(res => {
      if (res.status === 401) {
          return refreshToken(); // 🔥 try refresh
      }
      return res.json();
  })
  .then(data => {
    
    let html = "";
    html += `
    <div class="user-item">
        <h3>Login: ${data.username}</h3>
        <p>Email: ${data.email}</p>
    </div>
    `;

    document.getElementById("output").innerHTML = html;

  });
}

function get_users(){
  fetch(API_BASE + 'all-users/', {
      credentials: "include"
  })
  .then(res => {
      if (res.status === 401) {
          return refreshToken();
      }
      return res.json();
  })
  .then(data => {
    
    let html = "";


    data.forEach(user => {
        const groups = user.groups.join(", ");

        html += `
            <div class="user-item">
            <strong>${user.username}</strong><br>
            ${user.email}<br>
            <small>Grupy: ${groups}</small>
            </div>
        `;
        });

    document.getElementById("output").innerHTML = html;

  });
}

function refreshToken() {
    return fetch(API_BASE + 'refresh/', {
        method: 'POST',
        credentials: 'include'
    })
    .then(res => {
        if (!res.ok) {
            //console.log("RESULT IN REFRESH NOT OK")
            window.location.href = "/index.html";
            return null;
        }
        return null;
    });
}

function resendCode() {
    const temp_token = sessionStorage.getItem("temp_token");

    fetch(API_BASE + 'resend/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({
            temp_token: temp_token,
        })
    })
    .then(async res => {
        const data = await res.json();

        if (res.ok) {
            alert("Nowy kod 2FA został wysłany");
        } else {
            let errorText = "";

            Object.entries(data).forEach(([field, messages]) => {

                if (!Array.isArray(messages)) {
                    messages = [messages];
                }

                messages.forEach(msg => {
                    errorText += `${field} - ${msg}\n`;
                });
            });

            alert(errorText);
        }
    });
}

function redirect_login() {
    window.location.href = "/index.html";
}
