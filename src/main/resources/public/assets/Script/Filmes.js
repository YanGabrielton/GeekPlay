const API_BASE_URL = 'http://localhost:7070';
const API_KEY = 'api_key=5e6bffe0291551af5a19b5bb46bc276a';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

// Variables globales
let paginaAtual = 1;
let generoFiltro = "";
let termoBusca = "";
let ultimosFilmesCarregados = [];
let estaCarregando = false;
let userFavorites = [];
let totalPaginas = 1;

// Elementos del DOM
const mainFilme = document.getElementById('mainFilme');
const form = document.getElementById('form');
const search = document.getElementById('search');
const btnAnterior = document.getElementById('btnAnterior');
const btnProxima = document.getElementById('btnProxima');
const loader = document.getElementById('loader');

<<<<<<< Updated upstream
pegarFilmes(API_URL);
=======
// Mapeo de géneros
const GENEROS = {
    27: 'Terror',
    28: 'Ação',
    35: 'Comédia',
    10749: 'Romance',
    878: 'Ficção Científica',
    53: 'Suspense',
    10752: 'Guerra'
};
>>>>>>> Stashed changes

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    paginaAtual = parseInt(urlParams.get('page')) || 1;
    generoFiltro = urlParams.get('genre') || "";
    termoBusca = urlParams.get('search') || "";
    
    setupHistoryNavigation();
    setupEventListeners();
    updateFilterControls();
    fetchFilmes(paginaAtual, generoFiltro, termoBusca, true, false);
    
    window.history.replaceState(
        { 
            pagina: paginaAtual, 
            genero: generoFiltro, 
            busca: termoBusca
        },
        '',
        window.location.href
    );
});

// Función principal para obtener películas
async function fetchFilmes(pagina = 1, genero = "", busca = "", forcarAtualizacao = false, atualizarHistorico = true) {
    if (estaCarregando) return;
    estaCarregando = true;
    
    try {
        if (!forcarAtualizacao && pagina === paginaAtual && 
            busca === termoBusca && genero === generoFiltro && 
            ultimosFilmesCarregados.length > 0) {
            return;
        }

        paginaAtual = pagina;
        generoFiltro = genero;
        termoBusca = busca;

        loader.style.display = 'block';
        mainFilme.innerHTML = '';

        await loadUserFavorites();

        let url;
        if (busca) {
            url = `${BASE_URL}/search/movie?${API_KEY}&query=${encodeURIComponent(busca)}&page=${pagina}&language=pt-BR`;
        } else if (genero) {
            url = `${BASE_URL}/discover/movie?${API_KEY}&with_genres=${genero}&page=${pagina}&language=pt-BR&sort_by=popularity.desc`;
        } else {
            url = `${BASE_URL}/discover/movie?${API_KEY}&page=${pagina}&language=pt-BR&sort_by=popularity.desc`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro na API');
        
        const data = await response.json();
        const filmes = data.results || [];
        totalPaginas = data.total_pages || 1;
        ultimosFilmesCarregados = filmes;

        if (filmes.length === 0) {
            mainFilme.innerHTML = '<p class="text-center w-100">Nenhum filme encontrado.</p>';
            updatePagination(0, false);
            return;
        }

        mostrarFilmes(filmes);
        updatePagination(totalPaginas, pagina < totalPaginas);
        highlightActiveFilter(genero);
        
        if (atualizarHistorico) {
            const params = new URLSearchParams();
            if (pagina > 1) params.set('page', pagina);
            if (genero) params.set('genre', genero);
            if (busca) params.set('search', busca);
            
            const novaURL = `${window.location.pathname}?${params.toString()}`;
            window.history.pushState({ 
                pagina, 
                genero, 
                busca
            }, '', novaURL);
        }

    } catch (error) {
        console.error('Erro:', error);
        mainFilme.innerHTML = '<p class="text-center w-100">Erro ao carregar. Tente novamente.</p>';
    } finally {
        loader.style.display = 'none';
        estaCarregando = false;
    }
}

// Función para mostrar películas
async function mostrarFilmes(filmes) {
    mainFilme.innerHTML = '';

<<<<<<< Updated upstream
    let userFavorites = [];
    const token = localStorage.getItem('jwtToken');

    if (token) {
        try {
            const response = await fetch(`${API_BASE_URL}/favoritos`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const favoritesData = await response.json();
                userFavorites = favoritesData.favoritos || [];
            }
        } catch (error) {
            console.error('Erro ao carregar favoritos:', error);
        }
    }

    data.forEach(movie => {
=======
    filmes.forEach(movie => {
>>>>>>> Stashed changes
        const { id, title, poster_path, vote_average, overview } = movie;
        const isFavorite = userFavorites.some(fav => fav.idApi === id.toString() && fav.tipoItem === 'filme');

        const col = document.createElement('div');
        col.className = 'col-sm-6 col-md-4 col-lg-3 mb-4';

        col.innerHTML = `
            <div class="movie-card">
                <div class="poster-container">
                    <img src="${poster_path ? IMG_URL + poster_path : 'https://via.placeholder.com/300x450?text=Poster+Indisponível'}" 
                         class="movie-poster" 
                         alt="${title}"
                         onerror="this.src='https://via.placeholder.com/300x450?text=Poster+Indisponível'">
                    <div class="movie-info">
                        <h3 class="movie-title">${title}</h3>
                        <span class="rating ${getColorClass(vote_average)}">${vote_average ? vote_average.toFixed(1) : 'N/A'}</span>
                    </div>
                </div>
                
                <div class="movie-overlay">
                    <div class="overlay-content">
                        <h4>Resumo</h4>
                        <p>${overview || 'Nenhum resumo disponível.'}</p>
                        
                        <button class="favorite-btn ${isFavorite ? 'active' : ''}" 
                                data-movie-id="${id}" 
                                data-movie-title="${title}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            ${isFavorite ? 'Remover' : 'Favoritar'}
                        </button>
                        <button class="btn-trailer" onclick="mostrarTrailer(${id})">
                            Assistir trailer
                        </button>
                    </div>
                </div>
            </div>
        `;

        mainFilme.appendChild(col);
    });

<<<<<<< Updated upstream
=======
    // Event listeners para botones de favoritos
>>>>>>> Stashed changes
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', async function (e) {
            e.stopPropagation();
            const movieId = this.getAttribute('data-movie-id');
            const movieTitle = this.getAttribute('data-movie-title');
            const wasAdded = await toggleFavorite(movieId, movieTitle, 'filme');

            if (wasAdded !== null) {
                this.classList.toggle('active', wasAdded);
                this.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    ${wasAdded ? 'Remover' : 'Favoritar'}
                `;
            }
        });
    });
}

// Función para actualizar la paginación
function updatePagination(totalPages, hasNextPage) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    pagination.innerHTML = '';

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
            btn1.onclick = () => fetchFilmes(1, generoFiltro, termoBusca, true);
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
            btn.onclick = () => fetchFilmes(i, generoFiltro, termoBusca, true);
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
            btnLast.onclick = () => fetchFilmes(totalPages, generoFiltro, termoBusca, true);
            pagination.appendChild(btnLast);
        }
    }
}

// Funciones de favoritos
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

async function toggleFavorite(itemId, itemTitle, tipoItem = 'filme') {
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
            
            showToast('Filme removido dos favoritos!', false);
            return false;
        }
        
        if (!response.ok) throw new Error('Erro ao adicionar favorito');
        
        userFavorites.push({
            idApi: itemId.toString(),
            tipoItem: tipoItem,
            titulo: itemTitle
        });
        
        showToast('Filme adicionado aos favoritos!', true);
        return true;
        
    } catch (error) {
        console.error('Erro ao atualizar favoritos:', error);
        showToast('Erro: ' + error.message, false);
        return null;
    }
}

// Funciones auxiliares
function getColorClass(vote) {
    if (!vote) return 'bg-secondary';
    if (vote >= 7) return 'bg-success text-white';
    if (vote >= 5) return 'bg-warning text-dark';
    return 'bg-danger text-white';
}

function showToast(message, isSuccess) {
    const toast = document.createElement('div');
    toast.className = `position-fixed bottom-0 end-0 p-3`;
    toast.style.zIndex = '9999';
    toast.innerHTML = `
       <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-body ${isSuccess ? 'bg-success' : 'bg-danger'} text-white rounded">
                ${message}
            </div>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

<<<<<<< Updated upstream
function carregarPagina(pagina) {
    const url = `${BASE_URL}/discover/movie?include_adult=false&include_video=true&language=pt-br&page=${pagina}&sort_by=popularity.desc&${API_KEY}`;
    pegarFilmes(url);
}

btnProxima.addEventListener('click', () => {
    paginaAtual++;
    carregarPagina(paginaAtual);
    window.scrollTo(0, 0);
});

btnAnterior.addEventListener('click', () => {
    if (paginaAtual > 1) {
        paginaAtual--;
        carregarPagina(paginaAtual);
        window.scrollTo(0, 0);
=======
// Manejo del historial
function setupHistoryNavigation() {
    window.addEventListener('popstate', (event) => {
        if (event.state) {
            paginaAtual = event.state.pagina || 1;
            generoFiltro = event.state.genero || "";
            termoBusca = event.state.busca || "";
            
            highlightActiveFilter(generoFiltro);
            updateFilterControls();
            fetchFilmes(paginaAtual, generoFiltro, termoBusca, true, false);
        }
    });
}

function updateFilterControls() {
    if (search) {
        search.value = termoBusca;
>>>>>>> Stashed changes
    }
}

<<<<<<< Updated upstream
form.addEventListener('submit', e => {
    e.preventDefault();
    const term = search.value.trim();
    pegarFilmes(term ? `${searchURL}&query=${encodeURIComponent(term)}` : API_URL);
});
=======
// Configuración de event listeners
function setupEventListeners() {
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            termoBusca = search.value.trim();
            fetchFilmes(1, generoFiltro, termoBusca, true);
        });
    }
>>>>>>> Stashed changes

    if (btnAnterior) {
        btnAnterior.addEventListener('click', () => {
            if (paginaAtual > 1) {
                fetchFilmes(paginaAtual - 1, generoFiltro, termoBusca, true);
            }
        });
    }

    if (btnProxima) {
        btnProxima.addEventListener('click', () => {
            fetchFilmes(paginaAtual + 1, generoFiltro, termoBusca, true);
        });
    }
}

// Resaltar filtro activo
function highlightActiveFilter(generoAtivo) {
    document.querySelectorAll('.btn-outline-light').forEach(item => {
        item.classList.remove('active');
    });

    if (generoAtivo) {
        const itensAtivos = document.querySelectorAll(`.btn-outline-light[onclick*="${generoAtivo}"]`);
        itensAtivos.forEach(item => {
            item.classList.add('active');
        });
    }
}

// Función para mostrar trailer (mantenida de la versión original)
async function mostrarTrailer(movieId) {
    try {
        const trailerUrl = `${BASE_URL}/movie/${movieId}/videos?${API_KEY}`;
        const response = await fetch(trailerUrl);
        const data = await response.json();
    
        const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
    
        let trailerHTML = '';
        if (trailer) {
            const youtubeUrl = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
            trailerHTML = `
                <div class="ratio ratio-16x9 mb-3">
                    <iframe src="${youtubeUrl}" frameborder="0" allowfullscreen allow="autoplay"></iframe>
                </div>
            `;
        } else {
            trailerHTML = '<p>Trailer não disponível.</p>';
        }
    
        // Buscar provedores de streaming
        const providerUrl = `${BASE_URL}/movie/${movieId}/watch/providers?${API_KEY}`;
        const providerRes = await fetch(providerUrl);
        const providerData = await providerRes.json();
    
        let plataformasHTML = '<p>Plataformas não encontradas.</p>';
    
        if (providerData.results && providerData.results.BR && providerData.results.BR.flatrate) {
            const plataformas = providerData.results.BR.flatrate;
    
            plataformasHTML = `
                <h5>Disponível em:</h5>
                <div class="d-flex flex-wrap gap-2">
                    ${plataformas.map(p => `
                        <div class="text-center">
                            <img src="https://image.tmdb.org/t/p/w45${p.logo_path}" alt="${p.provider_name}" title="${p.provider_name}" />
                            <small class="d-block">${p.provider_name}</small>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    
        document.getElementById('trailer-container').innerHTML = `
            ${trailerHTML}
            <hr>
            ${plataformasHTML}
        `;
<<<<<<< Updated upstream
      } else {
        trailerHTML = '<p>Trailer não disponível.</p>';
      }
  
      const providerUrl = `${BASE_URL}/movie/${movieId}/watch/providers?${API_KEY}`;
      const providerRes = await fetch(providerUrl);
      const providerData = await providerRes.json();
  
      let plataformasHTML = '<p>Plataformas não encontradas.</p>';
  
      if (providerData.results && providerData.results.BR && providerData.results.BR.flatrate) {
        const plataformas = providerData.results.BR.flatrate;
  
        plataformasHTML = `
          <h5>Disponível em:</h5>
          <div class="d-flex flex-wrap gap-2">
            ${plataformas.map(p => `
              <div class="text-center">
                <img src="https://image.tmdb.org/t/p/w45${p.logo_path}" alt="${p.provider_name}" title="${p.provider_name}" />
                <small class="d-block">${p.provider_name}</small>
              </div>
            `).join('')}
          </div>
        `;
      }
  
      document.getElementById('trailer-container').innerHTML = `
        ${trailerHTML}
        <hr>
        ${plataformasHTML}
      `;
  
      const myModal = new bootstrap.Modal(document.getElementById('exampleModalCenter'));
      myModal.show();
  
=======
    
        // Abre o modal
        const myModal = new bootstrap.Modal(document.getElementById('exampleModalCenter'));
        myModal.show();
    
>>>>>>> Stashed changes
    } catch (error) {
        console.error('Erro ao buscar trailer ou plataformas:', error);
        alert('Erro ao carregar trailer ou plataformas de streaming.');
    }
}

// Función para buscar por género (mantenida para compatibilidad con los botones en HTML)
function buscarFilmesPorGenero(generoId) {
    generoFiltro = generoId;
    paginaAtual = 1;
    fetchFilmes(paginaAtual, generoFiltro, '', true);
}