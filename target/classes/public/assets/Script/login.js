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
        const response = await fetch("http://localhost:7070/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: document.getElementById("email").value,
                senha: document.getElementById("password").value
            })
        });
        const data = await response.json();
        if (response.ok) {
            alert("Login bem-sucedido!");
        } else {
            alert("Erro: " + data.error);
        }
    }