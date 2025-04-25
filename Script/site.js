let list = document.querySelector('.slider-choose .list-choose');
let items = list.querySelectorAll('.slider-choose .list-choose .item-service')
let dots = document.querySelectorAll('.slider-choose .dots li');
let prev = document.getElementById('prev');
let next = document.getElementById('next');

let active = 0;
let lengthItems = items.length - 1;

/*ITEM NEWS */




next.onclick = function(){
    
    if(active + 1 > lengthItems){
        active = 0;
    }else {
        active = active + 1;    
    }



    reloadSlider();

}

prev.onclick = function(){
    if(active - 1 < 0){
        active = lengthItems;
    }else
    {
        active = active - 1;
    }
 
    reloadSlider();

}




function reloadSlider() {
    let checkLeft = items[active].offsetLeft;
    list.style.left = -checkLeft + 'px';



    let lastActiveDot = document.querySelector('.slider-choose .dots li.active');
    lastActiveDot.classList.remove('active');

    dots[active].classList.add('active');

}

dots.forEach((li, key) => {
    li.addEventListener('click', function() {
        active = key;
        reloadSlider();
    });
});


/* Carrosel news */

// Carrossel 2

let listNews = document.querySelector('.slider-news .list-news');
let itemNews = listNews.querySelectorAll('.item-news');
let dotsNews = document.querySelectorAll('.slider-news .dots li');
let prevNews = document.getElementById('prev-news');
let nextNews = document.getElementById('next-news');

let activeNews = 0;

nextNews.onclick = function() {
    activeNews = (activeNews + 1) % itemNews.length; // Looping para o início
    reloadNewsSlider();
}

prevNews.onclick = function() {
    activeNews = (activeNews - 1 + itemNews.length) % itemNews.length // Looping para o fim
    reloadNewsSlider();
}

function reloadNewsSlider() {
    let checkLeft = itemNews[activeNews].offsetLeft;
    listNews.style.left = -checkLeft + 'px';

    let lastActiveDotNews = document.querySelector('.slider-news .dots li.active');
    if (lastActiveDotNews) {
        lastActiveDotNews.classList.remove('active');
    }

    dotsNews[activeNews].classList.add('active');
}

dotsNews.forEach((li, key) => {
    li.addEventListener('click', function() {
        activeNews = key;
        reloadNewsSlider();
    });
});

let paginaAtual = 1;
let tipoFiltro = ""; // Ex: 'TV', 'Movie', etc.
let termoBusca = "";

// ---------------- FUNÇÃO PRINCIPAL ----------------

async function fetchAnimes(pagina = 1, tipo = "", busca = "") {
  try {
    const container = document.getElementById('anime-cards-container');
    const loader = document.getElementById('loader');
    const btnProxima = document.getElementById('btnProxima');

    loader.style.display = 'block';
    container.innerHTML = '';

    let url = `https://api.jikan.moe/v4/anime?page=${pagina}`;
    if (busca) {
      url += `&q=${encodeURIComponent(busca)}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar dados da API');
    const data = await response.json();

    const paginationInfo = data.pagination;
    const totalPages = paginationInfo.last_visible_page;
    const hasNextPage = paginationInfo.has_next_page;

    if (pagina > totalPages) {
      paginaAtual = totalPages;
    }

    const animesFiltrados = data.data.filter(anime => {
      if (!tipo) return true;
      return anime.type && anime.type.toLowerCase() === tipo.toLowerCase();
    });

    const limitados = animesFiltrados.slice(0, 20);

    if (limitados.length === 0) {
      container.innerHTML = '<p class="text-center w-100">Nenhum anime encontrado.</p>';
      btnProxima.style.opacity = '0.5';
      btnProxima.style.pointerEvents = 'none';
    } else {
      btnProxima.style.opacity = '1';
      btnProxima.style.pointerEvents = 'auto';

      limitados.forEach(anime => {
        const col = document.createElement('div');
        col.className = 'col-sm-12 col-md-6 col-lg-3';

        col.innerHTML = `
          <div class="card mb-4 h-100">
            <img src="${anime.images.jpg.image_url}" class="card-img-top" alt="${anime.title}">
            <div class="card-body d-flex flex-column justify-content-between">
              <div>
                <h5 class="card-title">${anime.title}</h5>
                <p class="card-text">${anime.type || 'Anime'}</p>
                <p class="card-text"><strong>Nota:</strong> ${anime.score ?? 'N/A'}</p>
              </div>
              <a href="${anime.url}" target="_blank" class="btn btn-primary mt-2">Assistir</a>
            </div>
          </div>
        `;
        container.appendChild(col);
      });
    }

    updatePagination(totalPages, hasNextPage);

  } catch (error) {
    console.error('Erro ao carregar os dados:', error);
  } finally {
    document.getElementById('loader').style.display = 'none';
  }
}

// ---------------- PAGINAÇÃO ----------------

function updatePagination(totalPages, hasNextPage) {
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  const btnAnterior = document.getElementById('btnAnterior');
  btnAnterior.style.opacity = paginaAtual <= 1 ? '0.5' : '1';
  btnAnterior.style.pointerEvents = paginaAtual <= 1 ? 'none' : 'auto';

  const btnProxima = document.getElementById('btnProxima');
  btnProxima.style.opacity = hasNextPage ? '1' : '0.5';
  btnProxima.style.pointerEvents = hasNextPage ? 'auto' : 'none';

  if (paginaAtual !== 1) {
    const btnPrimeira = document.createElement('button');
    btnPrimeira.className = 'btn btn-light mx-1';
    btnPrimeira.textContent = '1';
    btnPrimeira.addEventListener('click', () => {
      paginaAtual = 1;
      fetchAnimes(paginaAtual, tipoFiltro, termoBusca);
    });
    paginationContainer.appendChild(btnPrimeira);

    if (paginaAtual > 3) {
      const ellipsis = document.createElement('span');
      ellipsis.textContent = '...';
      ellipsis.className = 'mx-1';
      paginationContainer.appendChild(ellipsis);
    }
  }

  const maxButtons = 5;
  let startPage = Math.max(paginaAtual - Math.floor(maxButtons / 2), 2);
  let endPage = startPage + maxButtons - 1;
  if (endPage >= totalPages) {
    endPage = totalPages - 1;
    startPage = Math.max(endPage - maxButtons + 1, 2);
  }

  for (let i = startPage; i <= endPage; i++) {
    const btnPage = document.createElement('button');
    btnPage.className = 'btn btn-light mx-1';
    btnPage.textContent = i;
    if (i === paginaAtual) btnPage.classList.add('active');
    btnPage.addEventListener('click', () => {
      paginaAtual = i;
      fetchAnimes(paginaAtual, tipoFiltro, termoBusca);
    });
    paginationContainer.appendChild(btnPage);
  }

  if (paginaAtual !== totalPages && totalPages > 1) {
    if (paginaAtual < totalPages - 2) {
      const ellipsis = document.createElement('span');
      ellipsis.textContent = '...';
      ellipsis.className = 'mx-1';
      paginationContainer.appendChild(ellipsis);
    }

    const btnUltima = document.createElement('button');
    btnUltima.className = 'btn btn-light mx-1';
    btnUltima.textContent = totalPages;
    btnUltima.addEventListener('click', () => {
      paginaAtual = totalPages;
      fetchAnimes(paginaAtual, tipoFiltro, termoBusca);
    });
    paginationContainer.appendChild(btnUltima);
  }
}

// ---------------- EVENTOS ----------------

document.getElementById('btnProxima').addEventListener('click', () => {
  paginaAtual++;
  fetchAnimes(paginaAtual, tipoFiltro, termoBusca);
});

document.getElementById('btnAnterior').addEventListener('click', () => {
  if (paginaAtual > 1) {
    paginaAtual--;
    fetchAnimes(paginaAtual, tipoFiltro, termoBusca);
  }
});

document.getElementById('btnBuscar').addEventListener('click', () => {
  termoBusca = document.getElementById('barraPesquisa').value.trim();
  paginaAtual = 1;
  fetchAnimes(paginaAtual, tipoFiltro, termoBusca);
});

// ---------------- CHAMADA INICIAL ----------------

fetchAnimes();

