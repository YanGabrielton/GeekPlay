// ---------------- VARIÁVEIS GLOBAIS ----------------

// Variável que controla a página atual
let paginaAtual = 1;

// Variável que armazena o filtro de tipo selecionado (ex: "tv", "movie", etc.)
let tipoFiltro = "";

// Variável para armazenar o termo de busca digitado na barra de pesquisa
let termoBusca = "";

/**
 * Função principal para buscar e exibir os animes da API Jikan.
 * Esta função monta a URL com base na página, filtro e termo de busca,
 * realiza a requisição, renderiza os cards e atualiza a navegação numérica.
 * @param {number} pagina - Página atual a ser exibida.
 * @param {string} tipo - Filtro para tipo de anime (ex: "tv", "movie").
 * @param {string} busca - Termo de busca para filtrar os títulos.
 */
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
                <p class="card-text"><strong>Nota:</strong> ${anime.score || 'N/A'}</p>
              </div>
              <a href="${anime.url}" target="_blank" class="btn btn-primary mt-2">Ver mais</a>
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

function updatePagination(totalPages, hasNextPage) {
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  const btnAnterior = document.getElementById('btnAnterior');
  if (paginaAtual <= 1) {
    btnAnterior.style.opacity = '0.5';
    btnAnterior.style.pointerEvents = 'none';
  } else {
    btnAnterior.style.opacity = '1';
    btnAnterior.style.pointerEvents = 'auto';
  }

  const btnProxima = document.getElementById('btnProxima');
  if (!hasNextPage) {
    btnProxima.style.opacity = '0.5';
    btnProxima.style.pointerEvents = 'none';
  } else {
    btnProxima.style.opacity = '1';
    btnProxima.style.pointerEvents = 'auto';
  }

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
    if (i === paginaAtual) {
      btnPage.classList.add('active');
    }
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