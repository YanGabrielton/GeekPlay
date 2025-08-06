const API_BASE_URL = 'http://localhost:7070';

let paginaAtual = 1;
let tipoFiltro = "";
let faixaEtariaFiltro = "";
let generoFiltro = "";
let termoBusca = "";
let ultimosMangasCarregados = [];
let estaCarregando = false;
let userFavorites = [];

function mapearGenero(nomeGenero) {
    const generos = {
        'shounen': 27,
        'seinen': 42,
        'yaoi': 28,
        'acao': 1,
        'comedia': 4,
        'aventura': 2,
        'fantasia': 10,
        'sci-fi': 24,
        'romance': 22,
        'drama': 8
    };
    return generos[nomeGenero.toLowerCase()] || '';
}

function buscarMangas(genero) {
    generoFiltro = genero;
    paginaAtual = 1;
    fetchMangas(paginaAtual, tipoFiltro, termoBusca, generoFiltro, true);
}

async function fetchMangas(pagina = 1, tipo = "", busca = "", filtro = "", forcarAtualizacao = false, atualizarHistorico = true) {
    if (estaCarregando) return;
    estaCarregando = true;
    
    try {
        let genero = "";
        if (filtro) {
            genero = filtro;
        }

        if (!forcarAtualizacao && pagina === paginaAtual && tipo === tipoFiltro && 
            busca === termoBusca && genero === generoFiltro && 
            ultimosMangasCarregados.length > 0) {
            return;
        }

        paginaAtual = pagina;
        tipoFiltro = tipo;
        termoBusca = busca;
        generoFiltro = genero;

        const container = document.getElementById('anime-cards-container');
        const loader = document.getElementById('loader');
        
        loader.style.display = 'block';
        container.innerHTML = '';

        await loadUserFavorites();

        let url = `https://api.jikan.moe/v4/manga?page=${pagina}&limit=24`;
        
        if (busca) url += `&q=${encodeURIComponent(busca)}`;
        if (tipo) url += `&type=${tipo}`;
        if (genero) {
            const generoId = mapearGenero(genero);
            if (generoId) {
                url += `&genres=${generoId}`;
            }
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro na API');
        
        const data = await response.json();
        const mangas = data.data || [];
        ultimosMangasCarregados = mangas;

        if (mangas.length === 0) {
            container.innerHTML = '<p class="text-center w-100">Nenhum mangá encontrado.</p>';
            updatePagination(0, false);
            return;
        }

        renderizarMangas(mangas);

        updatePagination(
            data.pagination?.last_visible_page || 1,
            data.pagination?.has_next_page || false
        );
        
        highlightActiveFilter(filtro);
        
        if (atualizarHistorico) {
            const params = new URLSearchParams();
            if (pagina > 1) params.set('page', pagina);
            if (tipo) params.set('type', tipo);
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

function renderizarMangas(mangas) {
    const container = document.getElementById('anime-cards-container');
    container.innerHTML = '';

    mangas.forEach(manga => {
        const isFavorite = userFavorites.some(fav => 
            fav.idApi === manga.mal_id.toString() && fav.tipoItem === 'manga');
        
        const col = document.createElement('div');
        col.className = 'col-sm-12 col-md-6 col-lg-3 mb-4';
        
        col.innerHTML = `
        <div class="card bg-dark text-white h-100">
            <img src="${manga.images?.jpg?.image_url || 'https://via.placeholder.com/300x450?text=Poster+Indisponível'}" 
                 class="card-img-top" alt="${manga.title}">
            <div class="card-body d-flex flex-column justify-content-between">
                <div>
                    <h5 class="card-title">${manga.title}</h5>
                    <p class="card-text">Score: ${manga.score || "N/A"}</p>
                </div>
                <div class="d-flex flex-column gap-2 mt-3">
                    <button class="btn ${isFavorite ? 'btn-warning' : 'btn-outline-warning'} favorite-btn" 
                            data-manga-id="${manga.mal_id}" 
                            data-manga-title="${manga.title}">
                        <i class="fas fa-star me-2"></i> ${isFavorite ? 'Favoritado' : 'Favoritar'}
                    </button>
                    <button class="btn btn-outline-info ver-mais-btn"
                            data-manga-id="${manga.mal_id}">
                        <i class="fas fa-external-link-alt me-2"></i> Ver em MyAnimeList
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
            const mangaId = this.getAttribute('data-manga-id');
            const mangaTitle = this.getAttribute('data-manga-title');
            const wasAdded = await toggleFavorite(mangaId, mangaTitle, 'manga');
            
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
            const mangaId = this.getAttribute('data-manga-id');
            window.open(`https://myanimelist.net/manga/${mangaId}`, '_blank');
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
            btn1.onclick = () => fetchMangas(1, tipoFiltro, termoBusca, generoFiltro, true);
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
            btn.onclick = () => fetchMangas(i, tipoFiltro, termoBusca, generoFiltro, true);
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
            btnLast.onclick = () => fetchMangas(totalPages, tipoFiltro, termoBusca, generoFiltro, true);
            pagination.appendChild(btnLast);
        }
    }
}

function highlightActiveFilter(filtroAtivo) {
    document.querySelectorAll('.btn-outline-light').forEach(item => {
        item.classList.remove('active');
    });

    if (filtroAtivo) {
        const itensAtivos = document.querySelectorAll(`.btn-outline-light[onclick*="${filtroAtivo}"]`);
        itensAtivos.forEach(item => {
            item.classList.add('active');
        });
    }
}

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

async function toggleFavorite(itemId, itemTitle, tipoItem = 'manga') {
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
            
            showToast('Mangá removido dos favoritos!', false);
            return false;
        }
        
        if (!response.ok) throw new Error('Erro ao adicionar favorito');
        
        userFavorites.push({
            idApi: itemId.toString(),
            tipoItem: tipoItem,
            titulo: itemTitle
        });
        
        showToast('Mangá adicionado aos favoritos!', true);
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

function setupHistoryNavigation() {
    window.addEventListener('popstate', (event) => {
        if (event.state) {
            paginaAtual = event.state.pagina || 1;
            tipoFiltro = event.state.tipo || "";
            termoBusca = event.state.busca || "";
            
            const filtro = event.state.filtro || "";
            highlightActiveFilter(filtro);
            
            updateFilterControls();
            fetchMangas(paginaAtual, tipoFiltro, termoBusca, filtro, true, false);
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
            fetchMangas(1, tipoFiltro, termoBusca, '', true);
        });
    }

    const btnAnterior = document.getElementById('btnAnterior');
    if (btnAnterior) {
        btnAnterior.addEventListener('click', () => {
            if (paginaAtual > 1) {
                fetchMangas(paginaAtual - 1, tipoFiltro, termoBusca, generoFiltro, true);
            }
        });
    }

    const btnProxima = document.getElementById('btnProxima');
    if (btnProxima) {
        btnProxima.addEventListener('click', () => {
            fetchMangas(paginaAtual + 1, tipoFiltro, termoBusca, generoFiltro, true);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    paginaAtual = parseInt(urlParams.get('page')) || 1;
    tipoFiltro = urlParams.get('type') || "";
    generoFiltro = urlParams.get('genre') || "";
    termoBusca = urlParams.get('search') || "";
    
    setupHistoryNavigation();
    setupEventListeners();
    updateFilterControls();
    fetchMangas(paginaAtual, tipoFiltro, termoBusca, generoFiltro, true, false);
    
    window.history.replaceState(
        { 
            pagina: paginaAtual, 
            tipo: tipoFiltro, 
            busca: termoBusca, 
            filtro: generoFiltro
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