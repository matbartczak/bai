const API_BASE = "http://localhost:8000/";

function redirect_register(){
    window.location.href = "/register.html";
}

function login() {
    fetch( API_BASE + 'login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({
            username: document.getElementById("username").value,
            password: document.getElementById("password").value
        })
    })
    .then(async res => {
    const data = await res.json();

    if (res.ok) {
        sessionStorage.setItem("user_id", data.user_id);
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
    });
}

function verify() {
    const user_id = sessionStorage.getItem("user_id");
    console.log(user_id)

    fetch( API_BASE + 'verify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({
            user_id : user_id,
            code: document.getElementById("code").value,
        })
    })
    .then(async res => {
    const data = await res.json();

    if (res.ok) {
        window.location.href = "/main.html";
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
    window.location.href = "/index.html";
})
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
        <strong>${data.username}</strong><br>
        ${data.email}
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
          return refreshToken(); // 🔥 try refresh
      }
      return res.json();
  })
  .then(data => {
    
    let html = "";

    data.forEach(user => {
        html += `
            <div class="user-item">
            <strong>${user.username}</strong><br>
            ${user.email}
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