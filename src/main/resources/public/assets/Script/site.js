// ---------------- VARIÁVEIS GLOBAIS ----------------
let paginaAtual = 1;
let tipoFiltro = "";
let faixaEtariaFiltro = "";
let termoBusca = "";
let ultimosAnimesCarregados = [];
let estaCarregando = false;
let userFavorites = [];

// Mapeamento CORRETO para a API Jikan
const CLASSIFICACOES = {
  'pg13': 'pg',       // La API usa 'pg' para PG-13
  '17': 'r17',        // +17
  '18': 'r',          // +18 (Restricted)
  'hentai': 'rx'      // Contenido adulto
};

// ---------------- FUNÇÕES DE EPISÓDIOS ----------------
async function getAnimeEpisodes(animeName) {
  try {
    console.log(`Buscando episódios para: ${animeName}`);
    const normalizedName = animeName.toLowerCase().replace(/\s+/g, '-');
    const response = await fetch(`https://theanimesapi.herokuapp.com/anime/${normalizedName}`);
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Dados dos episódios recebidos:", data);
    
    return data.episodes || [];
  } catch (error) {
    console.error("Erro ao buscar episódios:", error);
    return [];
  }
}

async function verMaisAnime(animeId, animeTitle) {
  try {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'block';
    
    // Buscar detalhes completos do anime na Jikan
    const detalhesResponse = await fetch(`https://api.jikan.moe/v4/anime/${animeId}`);
    const detalhesData = await detalhesResponse.json();
    
    // Buscar episódios na TheAnimesAPI
    const episodes = await getAnimeEpisodes(animeTitle);
    
    // Salvar todos os dados para usar na página de assistir
    localStorage.setItem("animeData", JSON.stringify({
      id: animeId,
      title: animeTitle,
      details: detalhesData.data,
      episodes: episodes
    }));
    
    window.location.href = "assistir.html";
  } catch (error) {
    console.error('Erro ao carregar anime:', error);
    alert("Erro ao carregar os episódios do anime");
  } finally {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
  }
}

// ---------------- FUNÇÕES DE FAVORITOS ----------------
async function loadUserFavorites() {
    const token = localStorage.getItem('jwtToken');
    if (!token) return;
    
    try {
        const response = await fetch('http://localhost:7070/favoritos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            userFavorites = data.favoritos || [];
        }
    } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
    }
}

async function toggleFavorite(itemId, itemTitle, tipoItem = 'anime') {
    try {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            alert('Você precisa estar logado para favoritar itens');
            window.location.href = './Login.html';
            return null;
        }

        const response = await fetch('http://localhost:7070/favoritos', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            idApi: itemId.toString(),    // ← camelCase
            tipoItem: tipoItem,          // ← camelCase
            titulo: itemTitle
        })
        });

        if (response.status === 400) {
            const deleteResponse = await fetch(
                `http://localhost:7070/favoritos/${itemId}?tipo_item=${tipoItem}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!deleteResponse.ok) throw new Error('Erro ao remover favorito');
            
            userFavorites = userFavorites.filter(fav => 
                !(fav.idApi === itemId.toString() && fav.tipoItem === tipoItem));
            
            showToast('Item removido dos favoritos!', false);
            return false;
        }
        
        if (!response.ok) throw new Error('Erro ao adicionar favorito');
        
        userFavorites.push({
            idApi: itemId.toString(),
            tipoItem: tipoItem,
            titulo: itemTitle
        });
        
        showToast('Item adicionado aos favoritos!', true);
        return true;
        
    } catch (error) {
        console.error('Erro ao atualizar favoritos:', error);
        showToast(error.message, false);
        return null;
    }
}

function showToast(message, isSuccess) {
    const toast = document.createElement('div');
    toast.className = `position-fixed bottom-0 end-0 p-3 ${isSuccess ? 'bg-success' : 'bg-danger'}`;
    toast.innerHTML = `
        <div class="toast show">
            <div class="toast-body text-white">
                ${message}
            </div>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ---------------- FUNÇÃO PRINCIPAL ----------------
async function fetchAnimes(pagina = 1, tipo = "", busca = "", faixaEtaria = "", forcarAtualizacao = false, atualizarHistorico = true) {
  if (estaCarregando) return;
  estaCarregando = true;
  
  try {
    if (!forcarAtualizacao && pagina === paginaAtual && tipo === tipoFiltro && 
        busca === termoBusca && faixaEtaria === faixaEtariaFiltro && ultimosAnimesCarregados.length > 0) {
      return;
    }

    paginaAtual = pagina;
    tipoFiltro = tipo;
    termoBusca = busca;
    faixaEtariaFiltro = faixaEtaria;

    const container = document.getElementById('anime-cards-container');
    const loader = document.getElementById('loader');
    
    loader.style.display = 'block';
    container.innerHTML = '';

    await loadUserFavorites();

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

    renderizarAnimes(animes);

    updatePagination(
      data.pagination?.last_visible_page || 1,
      data.pagination?.has_next_page || false
    );
    
    highlightActiveFilter();
    
    if (atualizarHistorico) {
      const params = new URLSearchParams();
      if (pagina > 1) params.set('page', pagina);
      if (tipo) params.set('type', tipo);
      if (faixaEtaria) params.set('rating', CLASSIFICACOES[faixaEtaria] || '');
      if (busca) params.set('search', busca);
      
      const novaURL = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({ 
        pagina, 
        tipo, 
        busca, 
        faixaEtaria 
      }, '', novaURL);
    }

  } catch (error) {
    console.error('Erro:', error);
    container.innerHTML = '<p class="text-center w-100">Erro ao carregar. Tente novamente.</p>';
  } finally {
    loader.style.display = 'none';
    estaCarregando = false;
  }
}

// ---------------- FUNCIÓN PARA RESALTAR FILTRO ACTIVO ----------------
function highlightActiveFilter() {
  document.querySelectorAll('.dropdown-item').forEach(item => {
    item.classList.remove('active');
  });

  if (faixaEtariaFiltro) {
    const filterMap = {
      'pg': 'pg13',
      'r17': '17',
      'r': '18',
      'rx': 'hentai'
    };
    
    const filterValue = filterMap[faixaEtariaFiltro] || faixaEtariaFiltro;
    document.querySelectorAll(`.dropdown-item[onclick*="${filterValue}"]`).forEach(item => {
      item.classList.add('active');
    });
  }
}

// ---------------- MANIPULAÇÃO DO HISTÓRICO ----------------
function setupHistoryNavigation() {
  window.addEventListener('popstate', (event) => {
    if (event.state) {
      paginaAtual = event.state.pagina || 1;
      tipoFiltro = event.state.tipo || "";
      termoBusca = event.state.busca || "";
      
      const ratingParam = event.state.faixaEtaria;
      faixaEtariaFiltro = ratingParam ? 
        Object.keys(CLASSIFICACOES).find(key => CLASSIFICACOES[key] === ratingParam) || "" : "";
      
      updateFilterControls();
      fetchAnimes(paginaAtual, tipoFiltro, termoBusca, faixaEtariaFiltro, true, false);
    }
  });
}

function updateFilterControls() {
  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.value = termoBusca;
  }
}

// ---------------- EVENTOS ----------------
function setupEventListeners() {
  const form = document.getElementById('form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      termoBusca = document.getElementById('search').value.trim();
      fetchAnimes(1, tipoFiltro, termoBusca, faixaEtariaFiltro, true);
    });
  }

  const btnAnterior = document.getElementById('btnAnterior');
  if (btnAnterior) {
    btnAnterior.addEventListener('click', () => {
      if (paginaAtual > 1) {
        fetchAnimes(paginaAtual - 1, tipoFiltro, termoBusca, faixaEtariaFiltro, true);
      }
    });
  }

  const btnProxima = document.getElementById('btnProxima');
  if (btnProxima) {
    btnProxima.addEventListener('click', () => {
      fetchAnimes(paginaAtual + 1, tipoFiltro, termoBusca, faixaEtariaFiltro, true);
    });
  }

  document.querySelectorAll('.dropdown-item[onclick*="fetchAnimes"]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const match = item.getAttribute('onclick').match(/fetchAnimes\((.+)\)/);
      if (match) {
        const args = match[1].split(',').map(arg => arg.trim().replace(/'/g, ''));
        args.push(true);
        args.push(true);
        fetchAnimes(...args);
      }
    });
  });
}

// ---------------- RENDERIZAR ANIMES ----------------
function renderizarAnimes(animes) {
  const container = document.getElementById('anime-cards-container');
  container.innerHTML = '';

  animes.forEach(anime => {
    const isFavorite = userFavorites.some(fav => 
        fav.idApi === anime.mal_id.toString() && fav.tipoItem === 'anime');
    
    const col = document.createElement('div');
    col.className = 'col-sm-12 col-md-6 col-lg-3';
    
    col.innerHTML = `
    <div class="card mb-4 h-100">
      <img src="${anime.images.jpg.image_url}" class="card-img-top" alt="${anime.title}" 
           onerror="this.src='https://via.placeholder.com/300x450?text=Poster+Indisponível'">
      <div class="card-body d-flex flex-column justify-content-between">
        <div>
          <h5 class="card-title">${anime.title}</h5>
          <p class="card-text">${anime.type || 'Anime'}</p>
          <p class="card-text"><strong>Nota:</strong> ${anime.score || 'N/A'}</p>
          ${anime.rating ? `<p class="card-text"><strong>Classificação:</strong> ${anime.rating}</p>` : ''}
        </div>
        <div class="d-flex flex-column gap-2 mt-3">
          <button class="btn btn-primary ver-mais-btn"
                  data-anime-id="${anime.mal_id}"
                  data-anime-title="${anime.title}">
            <i class="fas fa-play-circle me-2"></i> Ver Episódios
          </button>
          <button class="btn ${isFavorite ? 'btn-warning' : 'btn-outline-warning'} favorite-btn" 
                  data-anime-id="${anime.mal_id}" 
                  data-anime-title="${anime.title}">
            <i class="fas fa-star me-2"></i> ${isFavorite ? 'Favoritado' : 'Favoritar'}
          </button>
        </div>
      </div>
    </div>
    `;
    container.appendChild(col);
  });

  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();
      const animeId = this.getAttribute('data-anime-id');
      const animeTitle = this.getAttribute('data-anime-title');
      const wasAdded = await toggleFavorite(animeId, animeTitle, 'anime');
      
      if (wasAdded !== null) {
        this.classList.toggle('btn-warning', wasAdded);
        this.classList.toggle('btn-outline-warning', !wasAdded);
        this.innerHTML = `
          <i class="fas fa-star me-2"></i> ${wasAdded ? 'Favoritado' : 'Favoritar'}
        `;
      }
    });
  });

  document.querySelectorAll('.ver-mais-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const animeId = this.getAttribute('data-anime-id');
      const animeTitle = this.getAttribute('data-anime-title');
      await verMaisAnime(animeId, animeTitle);
    });
  });
}

// ---------------- PAGINAÇÃO ----------------
function updatePagination(totalPages, hasNextPage) {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;
  
  pagination.innerHTML = '';

  const btnAnterior = document.getElementById('btnAnterior');
  const btnProxima = document.getElementById('btnProxima');

  if (btnAnterior) {
    btnAnterior.style.opacity = paginaAtual > 1 ? '1' : '0.5';
    btnAnterior.style.pointerEvents = paginaAtual > 1 ? 'auto' : 'none';
  }
  
  if (btnProxima) {
    btnProxima.style.opacity = hasNextPage ? '1' : '0.5';
    btnProxima.style.pointerEvents = hasNextPage ? 'auto' : 'none';
  }

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

// ---------------- INICIALIZAÇÃO ----------------
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  paginaAtual = parseInt(urlParams.get('page')) || 1;
  tipoFiltro = urlParams.get('type') || "";
  
  const ratingParam = urlParams.get('rating');
  faixaEtariaFiltro = ratingParam ? 
    Object.keys(CLASSIFICACOES).find(key => CLASSIFICACOES[key] === ratingParam) || "" : "";
    
  termoBusca = urlParams.get('search') || "";
  
  setupHistoryNavigation();
  setupEventListeners();
  updateFilterControls();
  fetchAnimes(paginaAtual, tipoFiltro, termoBusca, faixaEtariaFiltro, true, false);
  
  window.history.replaceState(
    { 
      pagina: paginaAtual, 
      tipo: tipoFiltro, 
      busca: termoBusca, 
      faixaEtaria: CLASSIFICACOES[faixaEtariaFiltro] || '' 
    },
    '',
    window.location.href
  );
});