// ---------------- VARIÁVEIS GLOBAIS ----------------
let paginaAtual = 1;
let tipoFiltro = "";
let faixaEtariaFiltro = "";
let termoBusca = "";
let ultimosAnimesCarregados = [];

// Mapeamento CORRETO para a API Jikan
const CLASSIFICACOES = {
  'pg13': 'pg13',
  '17': 'r17',
  '18': 'r', 
  'hentai': 'rx'
};

// ---------------- FUNÇÃO PRINCIPAL ----------------
async function fetchAnimes(pagina = 1, tipo = "", busca = "", faixaEtaria = "", forcarAtualizacao = false) {
  try {
    // Verificar se já temos esses dados (exceto quando forçar atualização)
    if (!forcarAtualizacao && pagina === paginaAtual && tipo === tipoFiltro && 
        busca === termoBusca && faixaEtaria === faixaEtariaFiltro && ultimosAnimesCarregados.length > 0) {
      return;
    }

    // Atualizar estado global
    paginaAtual = pagina;
    tipoFiltro = tipo;
    termoBusca = busca;
    faixaEtariaFiltro = faixaEtaria;

    const container = document.getElementById('anime-cards-container');
    const loader = document.getElementById('loader');
    
    loader.style.display = 'block';
    container.innerHTML = '';

    // Montar URL da API
    let url = `https://api.jikan.moe/v4/anime?page=${pagina}&limit=24`;
    
    if (busca) url += `&q=${encodeURIComponent(busca)}`;
    if (tipo) url += `&type=${tipo}`;
    if (faixaEtaria && CLASSIFICACOES[faixaEtaria]) {
      url += `&rating=${CLASSIFICACOES[faixaEtaria]}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro na API');
    
    const data = await response.json();
    const animes = data.data || [];
    ultimosAnimesCarregados = animes;

    if (animes.length === 0) {
      container.innerHTML = '<p class="text-center w-100">Nenhum anime encontrado.</p>';
      updatePagination(0, false);
      return;
    }

    // Renderizar cards
    renderizarAnimes(animes);

    // Atualizar paginação
    updatePagination(
      data.pagination?.last_visible_page || 1,
      data.pagination?.has_next_page || false
    );

  } catch (error) {
    console.error('Erro:', error);
    container.innerHTML = '<p class="text-center w-100">Erro ao carregar. Tente novamente.</p>';
  } finally {
    loader.style.display = 'none';
  }
}

function renderizarAnimes(animes) {
  const container = document.getElementById('anime-cards-container');
  container.innerHTML = '';

  animes.forEach(anime => {
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

// ---------------- PAGINAÇÃO ----------------
function updatePagination(totalPages, hasNextPage) {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  const btnAnterior = document.getElementById('btnAnterior');
  const btnProxima = document.getElementById('btnProxima');

  btnAnterior.style.opacity = paginaAtual > 1 ? '1' : '0.5';
  btnAnterior.style.pointerEvents = paginaAtual > 1 ? 'auto' : 'none';
  
  btnProxima.style.opacity = hasNextPage ? '1' : '0.5';
  btnProxima.style.pointerEvents = hasNextPage ? 'auto' : 'none';

  if (totalPages > 1) {
    const startPage = Math.max(1, paginaAtual - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    if (startPage > 1) {
      const btn1 = document.createElement('button');
      btn1.className = 'btn btn-light mx-1';
      btn1.textContent = '1';
      btn1.onclick = () => fetchAnimes(1, tipoFiltro, termoBusca, faixaEtariaFiltro, true);
      pagination.appendChild(btn1);
      
      if (startPage > 2) {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'mx-1';
        ellipsis.textContent = '...';
        pagination.appendChild(ellipsis);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      const btn = document.createElement('button');
      btn.className = `btn mx-1 ${i === paginaAtual ? 'btn-primary' : 'btn-light'}`;
      btn.textContent = i;
      btn.onclick = () => fetchAnimes(i, tipoFiltro, termoBusca, faixaEtariaFiltro, true);
      pagination.appendChild(btn);
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'mx-1';
        ellipsis.textContent = '...';
        pagination.appendChild(ellipsis);
      }
      
      const btnLast = document.createElement('button');
      btnLast.className = 'btn btn-light mx-1';
      btnLast.textContent = totalPages;
      btnLast.onclick = () => fetchAnimes(totalPages, tipoFiltro, termoBusca, faixaEtariaFiltro, true);
      pagination.appendChild(btnLast);
    }
  }
}

// ---------------- EVENTOS ----------------
document.addEventListener('DOMContentLoaded', () => {
  // Evento de busca
  document.getElementById('form').addEventListener('submit', (e) => {
    e.preventDefault();
    termoBusca = document.getElementById('search').value.trim();
    fetchAnimes(1, tipoFiltro, termoBusca, faixaEtariaFiltro, true);
  });

  // Botões de paginação
  document.getElementById('btnAnterior').addEventListener('click', () => {
    if (paginaAtual > 1) {
      fetchAnimes(paginaAtual - 1, tipoFiltro, termoBusca, faixaEtariaFiltro, true);
    }
  });

  document.getElementById('btnProxima').addEventListener('click', () => {
    fetchAnimes(paginaAtual + 1, tipoFiltro, termoBusca, faixaEtariaFiltro, true);
  });

  // Dropdown de filtros
  document.querySelectorAll('.dropdown-item[onclick*="fetchAnimes"]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const match = item.getAttribute('onclick').match(/fetchAnimes\((.+)\)/);
      if (match) {
        const args = match[1].split(',').map(arg => arg.trim().replace(/'/g, ''));
        args.push(true); // Forçar atualização
        fetchAnimes(...args);
      }
    });
  });

  // Carregar inicialmente
  fetchAnimes(1, '', '', '', true);
});