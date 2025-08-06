// Configurações
const timeRunning = 300; // Duração da animação em ms
const timeAutoNext = 7000; // Tempo entre transições automáticas

// Elementos do DOM
const nextDom = document.getElementById('next');
const prevDom = document.getElementById('prev');
const carouselDom = document.querySelector('.carousel');
const SliderDom = carouselDom.querySelector('.carousel .list');
const thumbnailBorderDom = carouselDom.querySelector('.carousel .thumbnail');
let SliderItemsDom = SliderDom.querySelectorAll('.item');
let thumbnailItemsDom = thumbnailBorderDom.querySelectorAll('.item');

// Variáveis de controle
let runTimeOut;
let runNextAuto;
let isAnimating = false;
let currentIndex = 0;

// Inicialização
updateSliderAndThumbnail();
startAutoNext();

// Função para atualizar slides e miniaturas
function updateSliderAndThumbnail() {
    // Atualiza as referências dos elementos
    SliderItemsDom = SliderDom.querySelectorAll('.item');
    thumbnailItemsDom = thumbnailBorderDom.querySelectorAll('.item');

    // Garante que o primeiro slide seja visível
    SliderItemsDom.forEach((item, index) => {
        item.style.opacity = index === 0 ? '1' : '0';
        item.style.zIndex = index === 0 ? '1' : '0';
    });

    // Atualiza a miniatura ativa
    thumbnailItemsDom.forEach((thumb, index) => {
        thumb.classList.toggle('active', index === 0);
    });
}

// Função principal para mostrar o slide
function showSlider(type) {
    if (isAnimating) return;
    isAnimating = true;

    clearTimeout(runTimeOut);
    carouselDom.classList.remove('next', 'prev');

    if (type === 'next') {
        // Move o primeiro slide para o final
        SliderDom.appendChild(SliderItemsDom[0]);
        thumbnailBorderDom.appendChild(thumbnailItemsDom[0]);
        carouselDom.classList.add('next');
        currentIndex = (currentIndex + 1) % SliderItemsDom.length;
    } else {
        // Move o último slide para o início
        SliderDom.insertBefore(SliderItemsDom[SliderItemsDom.length - 1], SliderItemsDom[0]);
        thumbnailBorderDom.insertBefore(thumbnailItemsDom[thumbnailItemsDom.length - 1], thumbnailItemsDom[0]);
        carouselDom.classList.add('prev');
        currentIndex = (currentIndex - 1 + SliderItemsDom.length) % SliderItemsDom.length;
    }

    // Aplica a animação
    runTimeOut = setTimeout(() => {
        carouselDom.classList.remove('next', 'prev');
        isAnimating = false;
        updateSliderAndThumbnail();
    }, timeRunning);

    resetAutoNext();
}

// Navegação direta para um slide específico
function goToSlide(targetIndex) {
    if (isAnimating || targetIndex === currentIndex) return;

    isAnimating = true;
    carouselDom.classList.remove('next', 'prev');

    // Calcula a direção e o número de passos
    let steps = targetIndex - currentIndex;
    const direction = steps > 0 ? 'next' : 'prev';
    steps = Math.abs(steps);

    // Reorganiza os slides e miniaturas
    for (let i = 0; i < steps; i++) {
        if (direction === 'next') {
            SliderDom.appendChild(SliderDom.querySelectorAll('.item')[0]);
            thumbnailBorderDom.appendChild(thumbnailBorderDom.querySelectorAll('.item')[0]);
        } else {
            SliderDom.insertBefore(SliderDom.querySelectorAll('.item')[SliderItemsDom.length - 1], SliderDom.querySelectorAll('.item')[0]);
            thumbnailBorderDom.insertBefore(thumbnailBorderDom.querySelectorAll('.item')[thumbnailItemsDom.length - 1], thumbnailBorderDom.querySelectorAll('.item')[0]);
        }
    }

    currentIndex = targetIndex;
    carouselDom.classList.add(direction);

    runTimeOut = setTimeout(() => {
        carouselDom.classList.remove('next', 'prev');
        isAnimating = false;
        updateSliderAndThumbnail();
    }, timeRunning);

    resetAutoNext();
}

// Controle de auto-avanço
function startAutoNext() {
    clearTimeout(runNextAuto);
    runNextAuto = setTimeout(() => {
        nextDom.click();
    }, timeAutoNext);
}

function resetAutoNext() {
    clearTimeout(runNextAuto);
    runNextAuto = setTimeout(() => {
        nextDom.click();
    }, timeAutoNext);
}

// Eventos
nextDom.onclick = function() {
    showSlider('next');
};

prevDom.onclick = function() {
    showSlider('prev');
};

// Navegação por miniaturas
thumbnailItemsDom.forEach((thumb, index) => {
    thumb.addEventListener('click', () => {
        goToSlide(index);
    });
});

// Pausa e retomada do auto-avanço
carouselDom.addEventListener('mouseenter', () => {
    clearTimeout(runNextAuto);
});

carouselDom.addEventListener('mouseleave', () => {
    resetAutoNext();
});

// Atualiza listeners para miniaturas após mudanças no DOM
function updateThumbnailListeners() {
    thumbnailItemsDom = thumbnailBorderDom.querySelectorAll('.item');
    thumbnailItemsDom.forEach((thumb, index) => {
        thumb.removeEventListener('click', goToSlide); // Remove listeners antigos
        thumb.addEventListener('click', () => {
            goToSlide(index);
        });
    });
}


if (localStorage.getItem("usuario")) {


    document.getElementById("login-link").classList.add("hidden");
}

function logout() {
    localStorage.removeItem('jwtToken');
    window.location.href = "/pg-login";
    alert("Você foi desconectado com sucesso.");
}