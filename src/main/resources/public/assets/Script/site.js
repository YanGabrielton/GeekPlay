// ---------------- VARIÁVEIS GLOBAIS ----------------
let paginaAtual = 1;
let tipoFiltro = "";
let faixaEtariaFiltro = "";
let termoBusca = "";

// ---------------- FUNÇÃO PRINCIPAL ----------------
async function fetchAnimes(pagina = 1, tipo = "", busca = "", faixaEtaria = "") {
  try {
    const container = document.getElementById('anime-cards-container');
    const loader = document.getElementById('loader');
    const btnProxima = document.getElementById('btnProxima');

    loader.style.display = 'block';
    container.innerHTML = '';

    // Montando a URL com base nos filtros
    let url = `https://api.jikan.moe/v4/anime?page=${pagina}`;

    if (busca) url += `&q=${encodeURIComponent(busca)}`;
    if (tipo) url += `&type=${tipo}`;
    if (faixaEtaria) {
      // Mapeando as opções para os valores da API
      const ratingMap = {
        'pg13': 'pg13',
        '17': 'r17',
        '18': 'r'
      };
      const apiRating = ratingMap[faixaEtaria] || faixaEtaria;
      url += `&rating=${apiRating}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar dados da API');

    const data = await response.json();

    const totalPages = data.pagination.last_visible_page;
    const hasNextPage = data.pagination.has_next_page;

    if (pagina > totalPages) paginaAtual = totalPages;

    const limitados = data.data.slice(0, 20);

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

// ---------------- PAGINAÇÃO ----------------
function updatePagination(totalPages, hasNextPage) {
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  const btnAnterior = document.getElementById('btnAnterior');
  btnAnterior.style.opacity = paginaAtual <= 1 ? '0.5' : '1';
  btnAnterior.style.pointerEvents = paginaAtual <= 1 ? 'none' : 'auto';

  const btnProxima = document.getElementById('btnProxima');
  btnProxima.style.opacity = !hasNextPage ? '0.5' : '1';
  btnProxima.style.pointerEvents = !hasNextPage ? 'none' : 'auto';

  if (paginaAtual !== 1) {
    const btnPrimeira = document.createElement('button');
    btnPrimeira.className = 'btn btn-light mx-1';
    btnPrimeira.textContent = '1';
    btnPrimeira.addEventListener('click', () => {
      paginaAtual = 1;
      fetchAnimes(paginaAtual, tipoFiltro, termoBusca, faixaEtariaFiltro);
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
      fetchAnimes(paginaAtual, tipoFiltro, termoBusca, faixaEtariaFiltro);
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
      fetchAnimes(paginaAtual, tipoFiltro, termoBusca, faixaEtariaFiltro);
    });
    paginationContainer.appendChild(btnUltima);
  }
}

// ---------------- EVENTOS ----------------
document.getElementById('btnProxima').addEventListener('click', () => {
  paginaAtual++;
  fetchAnimes(paginaAtual, tipoFiltro, termoBusca, faixaEtariaFiltro);
});

document.getElementById('btnAnterior').addEventListener('click', () => {
  if (paginaAtual > 1) {
    paginaAtual--;
    fetchAnimes(paginaAtual, tipoFiltro, termoBusca, faixaEtariaFiltro);
  }
});

document.getElementById('form').addEventListener('submit', (e) => {
  e.preventDefault(); // Impede o reload da página
  termoBusca = document.getElementById('search').value.trim(); // o ID do input no seu form é 'search'
  paginaAtual = 1;
  fetchAnimes(paginaAtual, tipoFiltro, termoBusca, faixaEtariaFiltro);
});


// ---------------- DROPDOWN ANIMES ----------------
function setupDropdownAnimes() {
  const dropdownItems = document.querySelectorAll('#dropdownAnime + ul.dropdown-menu .dropdown-item');
  
  dropdownItems.forEach(item => {
    if (item.getAttribute('href') === './Anime.html') {
      // Item "Todos os Animes"
      item.addEventListener('click', (e) => {
        e.preventDefault();
        faixaEtariaFiltro = "";
        paginaAtual = 1;
        
        // Atualizar estado ativo
        dropdownItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        fetchAnimes();
      });
    } else {
      // Itens com filtros específicos
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const rating = item.getAttribute('onclick').match(/'([^']+)'/)[1];
        faixaEtariaFiltro = rating;
        paginaAtual = 1;
        
        // Atualizar estado ativo
        dropdownItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        fetchAnimes();
      });
    }
  });
}

// ---------------- INICIALIZAÇÃO ----------------
document.addEventListener('DOMContentLoaded', () => {
  // Configurar dropdown
  setupDropdownAnimes();
  
  // Marcar "Todos os Animes" como ativo por padrão
  const todosAnimesItem = document.querySelector('#dropdownAnime + ul.dropdown-menu .dropdown-item[href="./Anime.html"]');
  if (todosAnimesItem) {
    todosAnimesItem.classList.add('active');
  }

  // Carregar animes inicialmente (todos)
  fetchAnimes();
});

