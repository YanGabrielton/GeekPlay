const API_BASE_URL = 'http://localhost:7070';

window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
        document.getElementById("token").value = token;
    }
});

const registroBotao = document.getElementById('registrar');
const container = document.getElementById('container');
const loginBotao = document.getElementById('login');


registroBotao.addEventListener('click', () => {
    container.classList.add("active");
});

loginBotao.addEventListener('click', () => {
    container.classList.remove("active");
});

async function fazerLogin() {
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("password").value.trim();
    const mensagem = document.getElementById("mensagemLogin");

    if (!email || !senha) {
        mensagem.textContent = "Por favor, preencha todos os campos.";
        mensagem.className = "mensagem alert alert-warning mt-3 text-center";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (data.success === true) {
            localStorage.setItem("jwtToken", data.token);
            localStorage.setItem("usuario", JSON.stringify(data.usuario));
            alert(`${data.message} ${data.usuario.nome}`);
            window.location.href = "/pg-index";
              loginPages.classList.add("hidden");


           


        } else {
            mensagem.textContent = data.message || "Login falhou. Verifique seus dados.";
            mensagem.className = "mensagem alert alert-danger mt-3 text-center";
        }
    } catch (error) {
        console.error("Erro:", error);
        mensagem.textContent = "Erro na conexão com o servidor.";
        mensagem.className = "mensagem alert alert-danger mt-3 text-center";
    }
}

async function fazerRegistro() {
    const nome = document.getElementById("registerNome").value.trim();
    const email = document.getElementById("email1").value.trim();
    const senha = document.getElementById("password1").value.trim();
    const mensagem = document.getElementById("mensagem");

    if (!nome || !email || !senha) {
        mensagem.textContent = "Por favor, preencha todos os campos.";
        mensagem.className = "mensagem alert alert-warning mt-3 text-center";
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const dominiosPermitidos = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com"];
    const dominioEmail = email.split("@")[1];

    if (!emailRegex.test(email) || !dominiosPermitidos.includes(dominioEmail)) {
        mensagem.textContent = "Digite um e-mail válido dos domínios permitidos (gmail, hotmail, yahoo, outlook).";
        mensagem.className = "mensagem alert alert-warning mt-3 text-center";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/usuarios`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, senha })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            mensagem.textContent = "";
            alert("Registro bem-sucedido! seja bem-vindo, " + data.usuario.nome);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            localStorage.setItem('jwtToken', data.token);
            window.location.href = "/pg-index";
        } else {
            if (data.message) {
                mensagem.textContent = data.message;
                if (data.message.includes("senha")) {
                    mensagem.className = "mensagem alert alert-danger mt-3 text-center";
                } else if (data.message.includes("Nome")) {
                    mensagem.className = "mensagem alert alert-warning mt-3 text-center";
                } else if (data.message.includes("E-mail")) {
                    mensagem.className = "mensagem alert alert-warning mt-3 text-center";
                } else {
                    mensagem.className = "mensagem alert alert-danger mt-3 text-center";
                }
            } else {
                mensagem.textContent = "Erro desconhecido ao registrar.";
                mensagem.className = "mensagem alert alert-danger mt-3 text-center";
            }
        }
    } catch (error) {
        console.error("Erro durante o registro:", error);
        mensagem.textContent = "Erro de conexão com o servidor.";
        mensagem.className = "mensagem alert alert-danger mt-3 text-center";
    }
}

async function solicitarRecuperacao() {
    const email = document.getElementById("emailRecuperacao").value.trim();
    const mensagem = document.getElementById("mensagemRecuperacao");

    if (!email) {
        mensagem.textContent = "Por favor, insira seu email.";
        mensagem.className = "text-danger mt-2";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/solicitar-recuperacao`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (data.success) {
            mensagem.textContent = "Instruções enviadas para o e-mail: " + data.email;
            mensagem.className = "text-success mt-2";
            console.log("Token:", data.token);
        } else {
            mensagem.textContent = data.message || "Falha ao solicitar recuperação.";
            mensagem.className = "text-danger mt-2";
        }
    } catch (error) {
        mensagem.textContent = "Erro de conexão com o servidor.";
        mensagem.className = "text-danger mt-2";
        console.error("Erro:", error);
    }
}

async function redefinirSenha() {
    const novaSenha = document.getElementById("novaSenha").value.trim();
    const token = document.getElementById("token").value.trim();

    if (!novaSenha || !token) {
        alert("Por favor, forneça a nova senha e o token.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/pages/redefinir-senha.html`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: token,
                novaSenha: novaSenha
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert("Senha redefinida com sucesso!");
            window.location.href = "/pg-login";
        } else {
            alert("Erro: " + (data.message || "Não foi possível redefinir a senha."));
        }
    } catch (error) {
        console.error("Erro durante a redefinição:", error);
        alert("Erro na conexão com o servidor.");
    }
}

async function apiRequest(url, method = 'GET', body = null) {
    const token = localStorage.getItem('jwtToken');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const config = {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    };

    const response = await fetch(url, config);
    return response.json();
}

function logout() {
    localStorage.removeItem('jwtToken');
    window.location.href = "/pg-login";
    alert("Você foi desconectado com sucesso.");
}