const registroBotao = document.getElementById('registrar');
const container = document.getElementById('container');
const loginBotao = document.getElementById('login');
/*agr que criei as variaveis e puxei os ID do html,
irei criar o addEventListener para fazer as Ações*/
/*usando um arrow function () =>*/ 
registroBotao.addEventListener('click',()=>{
    container.classList.add("active");
}
);
loginBotao.addEventListener('click',()=>{
    
    container.classList.remove("active");
}
);
// Adicionando o evento de clique ao botão de login


async function fazerLogin() {
    const email = document.getElementById("loginEmail").value.trim();
    const senha = document.getElementById("loginPassword").value.trim();

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

        if (response.ok) {
            alert("Login bem-sucedido!");
            // Redirecionar, se necessário:
            window.location.href = "sobre.html";
        } else {
            alert("Erro: " + (data.error || "Falha no login"));
        }
    } catch (error) {
        alert("Erro de rede: " + error.message);
    }
}

//java script extra para teste⬇️⬇


function fazerLogin() {
    const email = document.getElementById("loginEmail").value.trim();
    const senha = document.getElementById("loginPassword").value.trim();

    if (!email || !senha) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuario = usuarios.find(user => user.email === email && user.senha === senha);

    if (usuario) {
        alert("Login bem-sucedido!");
        // Redirecionar:
        window.location.href = "sobre.html";
    } else {
        alert("Email ou senha incorretos.");
    }
}
function fazerCadastro() {
    const nome = document.getElementById("registerNome").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const senha = document.getElementById("registerPassword").value.trim();

    if (!nome || !email || !senha) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Verifica se já existe um usuário com o mesmo e-mail
    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const existe = usuarios.find(user => user.email === email);

    if (existe) {
        alert("E-mail já cadastrado.");
        return;
    }

    // Armazena no localStorage
    usuarios.push({ nome, email, senha });
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    alert("Cadastro realizado com sucesso!");
    container.classList.remove("active"); // Volta para a tela de login
}

