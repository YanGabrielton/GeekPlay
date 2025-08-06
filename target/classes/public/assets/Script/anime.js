const API_BASE_URL = 'http://localhost:7070';

let paginaAtual = 1;
let tipoFiltro = "";
let faixaEtariaFiltro = "";
let generoFiltro = "";
let termoBusca = "";
let ultimosAnimesCarregados = [];
let estaCarregando = false;
let userFavorites = [];

const CLASSIFICACOES = {
  'pg13': 'pg',
  '17': 'r17',
  '18': 'r',
  'hentai': 'rx',
  'acao': 1,
  'comedia': 4
};

async function loadUserFavorites() {
    const token = localStorage.getItem('jwtToken');
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/favoritos`, {
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
            window.location.href = '/pg-login';
            return null;
        }

        const response = await fetch(`${API_BASE_URL}/favoritos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                idApi: itemId.toString(),
                tipoItem: tipoItem,
                titulo: itemTitle
            })
        });

        if (response.status === 400) {
            const deleteResponse = await fetch(
                `${API_BASE_URL}/favoritos/${itemId}?tipo_item=${tipoItem}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!deleteResponse.ok) throw new Error('Erro ao remover favorito');
            
            userFavorites = userFavorites.filter(fav => 
                !(fav.idApi === itemId.toString() && fav.tipoItem === tipoItem));
            
            showToast('Anime removido dos favoritos!', false);
            return false;
        }
        
        if (!response.ok) throw new Error('Erro ao adicionar favorito');
        
        userFavorites.push({
            idApi: itemId.toString(),
            tipoItem: tipoItem,
            titulo: itemTitle
        });
        
        showToast('Anime adicionado aos favoritos!', true);
        return true;
        
    } catch (error) {
        console.error('Erro ao atualizar favoritos:', error);
        showToast('Erro: ' + error.message, false);
        return null;
    }
}

function showToast(message, isSuccess) {
    const oldToasts = document.querySelectorAll('.custom-toast');
    oldToasts.forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `custom-toast position-fixed bottom-0 end-0 p-3`;
    toast.style.zIndex = '9999';
    
    toast.innerHTML = `
        <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-body ${isSuccess ? 'bg-success' : 'bg-danger'} text-white rounded">
                ${message}
            </div>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

async function fetchAnimes(pagina = 1, tipo = "", busca = "", filtro = "", forcarAtualizacao = false, atualizarHistorico = true) {
    if (estaCarregando) return;
    estaCarregando = true;
    
    try {
        let faixaEtaria = "";
        let genero = "";
        
        if (['pg13', '17', '18', 'hentai'].includes(filtro)) {
            faixaEtaria = filtro;
        } else if (['acao', 'comedia'].includes(filtro)) {
            genero = filtro;
        }

        if (!forcarAtualizacao && pagina === paginaAtual && tipo === tipoFiltro && 
            busca === termoBusca && faixaEtaria === faixaEtariaFiltro && genero === generoFiltro && 
            ultimosAnimesCarregados.length > 0) {
            return;
        }

        paginaAtual = pagina;
        tipoFiltro = tipo;
        termoBusca = busca;
        faixaEtariaFiltro = faixaEtaria;
        generoFiltro = genero;

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
        if (genero && CLASSIFICACOES[genero]) {
            url += `&genres=${CLASSIFICACOES[genero]}`;
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
        
        highlightActiveFilter(filtro);
        
        if (atualizarHistorico) {
            const params = new URLSearchParams();
            if (pagina > 1) params.set('page', pagina);
            if (tipo) params.set('type', tipo);
            if (faixaEtaria) params.set('rating', CLASSIFICACOES[faixaEtaria] || '');
            if (genero) params.set('genre', genero);
            if (busca) params.set('search', busca);
            
            const novaURL = `${window.location.pathname}?${params.toString()}`;
            window.history.pushState({ 
                pagina, 
                tipo, 
                busca, 
                filtro
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

function highlightActiveFilter(filtroAtivo) {
    document.querySelectorAll('.menu-anime').forEach(item => {
        item.classList.remove('active');
    });

    if (filtroAtivo) {
        const itensAtivos = document.querySelectorAll(`.menu-anime[onclick*="${filtroAtivo}"]`);
        itensAtivos.forEach(item => {
            item.classList.add('active');
        });
    }
}

function setupHistoryNavigation() {
    window.addEventListener('popstate', (event) => {
        if (event.state) {
            paginaAtual = event.state.pagina || 1;
            tipoFiltro = event.state.tipo || "";
            termoBusca = event.state.busca || "";
            
            const filtro = event.state.filtro || "";
            highlightActiveFilter(filtro);
            
            updateFilterControls();
            fetchAnimes(paginaAtual, tipoFiltro, termoBusca, filtro, true, false);
        }
    });
}

function updateFilterControls() {
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.value = termoBusca;
    }
}

function setupEventListeners() {
    const form = document.getElementById('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            termoBusca = document.getElementById('search').value.trim();
            fetchAnimes(1, tipoFiltro, termoBusca, '', true);
        });
    }

    const btnAnterior = document.getElementById('btnAnterior');
    if (btnAnterior) {
        btnAnterior.addEventListener('click', () => {
            if (paginaAtual > 1) {
                fetchAnimes(paginaAtual - 1, tipoFiltro, termoBusca, generoFiltro || faixaEtariaFiltro, true);
            }
        });
    }

    const btnProxima = document.getElementById('btnProxima');
    if (btnProxima) {
        btnProxima.addEventListener('click', () => {
            fetchAnimes(paginaAtual + 1, tipoFiltro, termoBusca, generoFiltro || faixaEtariaFiltro, true);
        });
    }
}

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
                        <i class="fas fa-external-link-alt me-2"></i> Ver en MyAnimeList
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
        btn.addEventListener('click', function() {
            const animeId = this.getAttribute('data-anime-id');
            window.open(`https://myanimelist.net/anime/${animeId}`, '_blank');
        });
    });
}

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
            btn1.onclick = () => fetchAnimes(1, tipoFiltro, termoBusca, generoFiltro || faixaEtariaFiltro, true);
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
            btn.onclick = () => fetchAnimes(i, tipoFiltro, termoBusca, generoFiltro || faixaEtariaFiltro, true);
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
            btnLast.onclick = () => fetchAnimes(totalPages, tipoFiltro, termoBusca, generoFiltro || faixaEtariaFiltro, true);
            pagination.appendChild(btnLast);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    paginaAtual = parseInt(urlParams.get('page')) || 1;
    tipoFiltro = urlParams.get('type') || "";
    
    const ratingParam = urlParams.get('rating');
    const genreParam = urlParams.get('genre');
    
    let filtroAtivo = '';
    if (ratingParam) {
        filtroAtivo = Object.keys(CLASSIFICACOES).find(key => CLASSIFICACOES[key] === ratingParam) || '';
    } else if (genreParam) {
        filtroAtivo = genreParam;
    }
    
    termoBusca = urlParams.get('search') || "";
    
    setupHistoryNavigation();
    setupEventListeners();
    updateFilterControls();
    fetchAnimes(paginaAtual, tipoFiltro, termoBusca, filtroAtivo, true, false);
    
    window.history.replaceState(
        { 
            pagina: paginaAtual, 
            tipo: tipoFiltro, 
            busca: termoBusca, 
            filtro: filtroAtivo
        },
        '',
        window.location.href
    );
});


document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem("jwtToken")) {
        document.getElementById("login-link").classList.add("hidden");
    }   });

    function logout() {
    localStorage.removeItem('jwtToken');
    window.location.href = "/pg-login";
    alert("Você foi desconectado com sucesso.");
}