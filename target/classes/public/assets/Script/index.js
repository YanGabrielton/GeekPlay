// ===================== CONFIGURAÇÕES =====================
const timeRunning = 300; // Duração da animação em ms (igual ao original)
const timeAutoNext = 7000; // Tempo entre transições automáticas (igual ao original)

// ===================== ELEMENTOS DO DOM =====================
const nextDom = document.getElementById('next');
const prevDom = document.getElementById('prev');
const carouselDom = document.querySelector('.carousel');
const SliderDom = carouselDom.querySelector('.carousel .list');
const thumbnailBorderDom = document.querySelector('.carousel .thumbnail');
const timeDom = document.querySelector('.carousel .time');

// ===================== INICIALIZAÇÃO =====================
let thumbnailItemsDom = thumbnailBorderDom.querySelectorAll('.item');
let SliderItemsDom = SliderDom.querySelectorAll('.item');

// Sincronização inicial (igual ao original)
thumbnailBorderDom.appendChild(thumbnailItemsDom[0]);

// ===================== FUNÇÃO PRINCIPAL =====================
let runTimeOut;
let runNextAuto = setTimeout(() => {
    nextDom.click();
}, timeAutoNext);

function showSlider(type) {
    // Atualiza as referências dos elementos (correção importante)
    const SliderItemsDom = SliderDom.querySelectorAll('.item');
    const thumbnailItemsDom = thumbnailBorderDom.querySelectorAll('.item');
    
    // Limpa estados anteriores
    clearTimeout(runTimeOut);
    carouselDom.classList.remove('next', 'prev');
    
    if (type === 'next') {
        // Move elementos (mantendo a animação original)
        SliderDom.appendChild(SliderItemsDom[0]);
        thumbnailBorderDom.appendChild(thumbnailItemsDom[0]);
        carouselDom.classList.add('next');
    } else {
        // Move elementos (mantendo a animação original)
        SliderDom.prepend(SliderItemsDom[SliderItemsDom.length - 1]);
        thumbnailBorderDom.prepend(thumbnailItemsDom[thumbnailItemsDom.length - 1]);
        carouselDom.classList.add('prev');
    }
    
    // Remove classes após animação (igual ao original)
    runTimeOut = setTimeout(() => {
        carouselDom.classList.remove('next', 'prev');
    }, timeRunning);
    
    // Reinicia auto-avanço (igual ao original)
    clearTimeout(runNextAuto);
    runNextAuto = setTimeout(() => {
        nextDom.click();
    }, timeAutoNext);
}

// ===================== EVENTOS =====================
nextDom.onclick = function() {
    showSlider('next');    
}

prevDom.onclick = function() {
    showSlider('prev');    
}