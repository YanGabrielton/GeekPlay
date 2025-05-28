const registroBotao = document.getElementById('registrar');
const container = document.getElementById('container');
const loginBotao = document.getElementById('login');

// Funções para alternar entre login e registro
registroBotao.addEventListener('click', () => {
    container.classList.add("active");
});

loginBotao.addEventListener('click', () => {
    container.classList.remove("active");
});

// Função de login melhorada
async function fazerLogin() {
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("password").value.trim();

    // Validação de campos vazios
    if (!email || !senha) {
        alert("Por favor, preencha todos os campos.");
        return;
    }
    try {
        const response = await fetch("http://localhost:7070/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: document.getElementById("email").value,
                senha: document.getElementById("password").value
            })
        });
        const data = await response.json(); 
        if (data.success) {
            alert("Login bem-sucedido! Bem-vindo, " + data.usuario.nome);
            window.location.href = "/src/main/resources/public/index.html";
        } else {
            alert("Erro: " + data.message);
        }
    } catch (error) {
        alert("Erro na conexão com o servidor");
        console.error("Erro:", error);
    }
}

async function fazerRegistro() {
    const nome  = document.getElementById("registerNome").value.trim();
    const email = document.getElementById("email1").value.trim();
    const senha = document.getElementById("password1").value.trim();

    if (!nome || !email || !senha) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        const response = await fetch("http://localhost:7070/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // mesmo padrão do fazerLogin:
            body: JSON.stringify({
                nome: document.getElementById("registerNome").value,
                email: document.getElementById("email1").value,
                senha: document.getElementById("password1").value
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert("Registro bem-sucedido! Bem-vindo, " + data.usuario.nome);
            window.location.href = "/src/main/resources/public/index.html";
        } else {
            alert("Erro: " + (data.message || "Erro desconhecido ao registrar."));
        }

    } catch (error) {
        console.error("Erro durante o registro:", error);
        alert("Erro na conexão com o servidor");
    }
}
