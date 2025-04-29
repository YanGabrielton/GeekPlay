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
