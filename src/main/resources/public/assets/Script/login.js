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
            body: JSON.stringify({ email, senha })
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

// Função de registro melhorada
async function fazerRegistro() {
    const nome = document.getElementById("registerNome").value.trim();
    const email = document.getElementById("email1").value.trim();
    const senha = document.getElementById("password1").value.trim();

    // Validação de campos vazios
    if (!nome || !email || !senha) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        const response = await fetch("http://localhost:7070/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, senha })
        });
        
        const data = await response.json(); // 🔁 lido uma vez aqui
        
        if (!response.ok) {
            const errorMsg = data.message || data.mensagem || "Erro desconhecido durante o registro";
            throw new Error(`(${response.status}) ${errorMsg}`);
        }
        
        if (data.success) {
            alert("Registro bem-sucedido! Você pode fazer login agora. " + data.usuario.nome);
            window.location.href = "/src/main/resources/public/index.html";
            const container = document.getElementById("container");
            if (container) container.classList.remove("active");
        } else {
            alert("Erro: " + (data.message || "Erro desconhecido."));
        }
        
    } catch (error) {
        alert("Erro na conexão com o servidor");
        console.error("Erro:", error);
    }
}