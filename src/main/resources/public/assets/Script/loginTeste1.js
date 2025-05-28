const registroBotao = document.getElementById('registrar');
const container = document.getElementById('container');
const loginBotao=document.getElementById('login');
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
            // Redireciona ou faz algo após login
            window.location.href = "/src/main/resources/public/index.html";
        } else {
            alert("Erro: " + data.message); // Usa message em vez de error
        }

    } catch (error) {
        alert("Erro na conexão com o servidor");
        console.error("Erro:", error);
    }
}
async function fazerRegistro() {
    try {
        const response = await fetch("http://localhost:7070/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome: document.getElementById("nome").value,
                email: document.getElementById("email1").value,
                senha: document.getElementById("password1").value
            })
        });
        const data = await response.json();
        if (data.success) {
            alert("Registro bem-sucedido! Você pode fazer login agora.");
            container.classList.remove("active");
        } else {
            alert("Erro: " + data.message);
        }
    } catch (error) {
        alert("Erro na conexão com o servidor");
        console.error("Erro:", error);
    }
}
