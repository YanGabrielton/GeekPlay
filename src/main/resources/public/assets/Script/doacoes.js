if (localStorage.getItem("jwtToken")) {


    document.getElementById("login-link").classList.add("hidden");
}


function logout() {
    localStorage.removeItem('jwtToken');
    window.location.href = "/pg-login";
    alert("Você foi desconectado com sucesso.");
}