// ===================== PASSO 1: PEGANDO OS ELEMENTOS DO DOM =====================

// Botões de navegação (próximo e anterior)
let nextDom = document.getElementById('next');
let prevDom = document.getElementById('prev');

// Container principal do carrossel
let carouselDom = document.querySelector('.carousel');

// Lista de slides (os itens principais do carrossel)
let SliderDom = carouselDom.querySelector('.carousel .list');

// Container das miniaturas (thumbnails)
let thumbnailBorderDom = document.querySelector('.carousel .thumbnail');

// Todos os itens dentro do thumbnail
let thumbnailItemsDom = thumbnailBorderDom.querySelectorAll('.item');

// Barra de tempo (aquela linha no topo)
let timeDom = document.querySelector('.carousel .time');

// Move a primeira miniatura para o final da lista (ajuste inicial)
thumbnailBorderDom.appendChild(thumbnailItemsDom[0]);

// Tempo de duração da animação (em milissegundos)
let timeRunning = 3000;


// ===================== EVENTOS DE CLIQUE =====================

// Quando clicar no botão "next", executa a função para mostrar o próximo slide
nextDom.onclick = function(){
    showSlider('next');    
}

// Quando clicar no botão "prev", executa a função para mostrar o slide anterior
prevDom.onclick = function(){
    showSlider('prev');    
}

// ===================== AUTO AVANÇO =====================

// Guarda o timeout para remover classes de animação
let runTimeOut;

// Avança automaticamente para o próximo slide após o tempo definido
let runNextAuto = setTimeout(() => {
    next.click();
}, timeAutoNext);

// ===================== FUNÇÃO PRINCIPAL DE NAVEGAÇÃO =====================
function showSlider(type){
    // Pega novamente os slides e miniaturas atualizados
    let SliderItemsDom = SliderDom.querySelectorAll('.carousel .list .item');
    let thumbnailItemsDom = document.querySelectorAll('.carousel .thumbnail .item');
    
    if(type === 'next'){
        // Move o primeiro slide para o final (efeito de próximo)
        SliderDom.appendChild(SliderItemsDom[0]);
        // Move a primeira miniatura para o final
        thumbnailBorderDom.appendChild(thumbnailItemsDom[0]);
        // Adiciona a classe 'next' para iniciar as animações CSS
        carouselDom.classList.add('next');
    } else {
        // Move o último slide para o início (efeito de anterior)
        SliderDom.prepend(SliderItemsDom[SliderItemsDom.length - 1]);
        // Move a última miniatura para o início
        thumbnailBorderDom.prepend(thumbnailItemsDom[thumbnailItemsDom.length - 1]);
        // Adiciona a classe 'prev' para iniciar as animações CSS
        carouselDom.classList.add('prev');
    }

    // Remove a classe de animação após o tempo de execução
    clearTimeout(runTimeOut);
    runTimeOut = setTimeout(() => {
        carouselDom.classList.remove('next');
        carouselDom.classList.remove('prev');
    }, timeRunning);

    // Reinicia o temporizador de auto avanço
    clearTimeout(runNextAuto);
    runNextAuto = setTimeout(() => {
        next.click();
    }, timeAutoNext)
}
