const API_BASE_URL = 'http://localhost:7070';

document.addEventListener('DOMContentLoaded', async function() {
    const favoritesContainer = document.getElementById('favorites-container');
    const emptyState = document.getElementById('empty-state');

    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = '/pg-login';
        return;
    }

    function showEmptyState() {
        emptyState.classList.remove('d-none');
        favoritesContainer.innerHTML = '';
    }

    function hideEmptyState() {
        emptyState.classList.add('d-none');
    }

    function handleAuthError() {
        localStorage.removeItem('jwtToken');
        alert('Sessão expirada. Por favor, faça login novamente.');
        window.location.href = '/pg-login';
    }

    async function loadFavorites() {
        try {
            showLoading(true);
            
            const response = await fetch(`${API_BASE_URL}/favoritos`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                handleAuthError();
                return;
            }

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const favorites = data.favoritos || [];
            
            if (favorites.length === 0) {
                showEmptyState();
                return;
            }

            hideEmptyState();
            favoritesContainer.innerHTML = '';

            await Promise.all(favorites.map(async fav => {
                try {
                    let itemDetails = {};
                    
                    switch(fav.tipo_item) {
                        case 'filme':
                            itemDetails = await loadMovieDetails(fav.id_api);
                            break;
                            
                        case 'anime':
                            itemDetails = await loadAnimeDetails(fav.id_api);
                            break;
                            
                        case 'manga':
                            itemDetails = await loadMangaDetails(fav.id_api);
                            break;
                            
                        default:
                            itemDetails = {
                                title: fav.titulo,
                                overview: 'Tipo de mídia não suportado',
                                poster_path: null
                            };
                    }
                    
                    displayFavoriteItem({
                        ...fav,
                        ...itemDetails
                    });
                } catch (error) {
                    console.error(`Erro ao carregar ${fav.tipo_item}:`, error);
                    displayFavoriteItem({
                        id_api: fav.id_api,
                        title: fav.titulo,
                        tipo_item: fav.tipo_item,
                        overview: 'Detalhes não disponíveis',
                        poster_path: null
                    });
                }
            }));

            addRemoveEventListeners();

        } catch (error) {
            console.error('Erro ao carregar favoritos:', error);
            showEmptyState();
        } finally {
            showLoading(false);
        }
    }

    async function loadMovieDetails(id) {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=5e6bffe0291551af5a19b5bb46bc276a&language=pt-BR`);
        if (!response.ok) throw new Error('Erro ao buscar filme');
        
        const movie = await response.json();
        return {
            title: movie.title,
            overview: movie.overview || 'Sem sinopse disponível',
            poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
            year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A'
        };
    }

    async function loadAnimeDetails(id) {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
        if (!response.ok) throw new Error('Erro ao buscar anime');
        
        const animeData = await response.json();
        const anime = animeData.data;
        return {
            title: anime.title || anime.title_english || 'Sem título',
            overview: anime.synopsis || 'Sem sinopse disponível',
            poster_path: anime.images?.jpg?.image_url || null,
            year: anime.year || anime.aired?.prop?.from?.year || 'N/A'
        };
    }

    async function loadMangaDetails(id) {
        const response = await fetch(`https://api.jikan.moe/v4/manga/${id}`);
        if (!response.ok) throw new Error('Erro ao buscar mangá');
        
        const mangaData = await response.json();
        const manga = mangaData.data;
        return {
            title: manga.title || manga.title_english || 'Sem título',
            overview: manga.synopsis || 'Sem sinopse disponível',
            poster_path: manga.images?.jpg?.image_url || null,
            year: manga.published?.prop?.from?.year || 'N/A'
        };
    }

    function displayFavoriteItem(item) {
        const col = document.createElement('div');
        col.className = 'col-sm-6 col-md-4 col-lg-3 mb-4';
        
        col.innerHTML = `
            <div class="movie-card">
                <button class="remove-favorite btn btn-danger btn-sm" 
                        data-item-id="${item.id_api}" 
                        data-item-type="${item.tipo_item}" 
                        title="Remover dos favoritos">
                    <i class="fas fa-trash"></i>
                </button>
                <div class="poster-container">
                    <img src="${item.poster_path || 'https://via.placeholder.com/300x450?text=Poster+Indisponível'}" 
                         class="movie-poster" 
                         alt="${item.title}"
                         onerror="this.src='https://via.placeholder.com/300x450?text=Poster+Indisponível'">
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">${item.title}</h3>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge ${getBadgeClass(item.tipo_item)}">${formatType(item.tipo_item)}</span>
                        ${item.year ? `<small class="text-muted">${item.year}</small>` : ''}
                    </div>
                </div>
                <div class="movie-overlay">
                    <div class="overlay-content">
                        <h4>${item.title}</h4>
                        <p class="mb-2"><strong>Tipo:</strong> ${formatType(item.tipo_item)}</p>
                        ${item.year ? `<p class="mb-2"><strong>Ano:</strong> ${item.year}</p>` : ''}
                        <p>${item.overview || 'Nenhum resumo disponível.'}</p>
                    </div>
                </div>
            </div>
        `;
        
        favoritesContainer.appendChild(col);
    }

    function formatType(type) {
        const types = {
            'filme': 'Filme',
            'anime': 'Anime',
            'manga': 'Mangá'
        };
        return types[type] || type;
    }

    function getBadgeClass(type) {
        const classes = {
            'filme': 'bg-primary',
            'anime': 'bg-danger',
            'manga': 'bg-success'
        };
        return classes[type] || 'bg-secondary';
    }

    function showLoading(show) {
        const loader = document.getElementById('loading-spinner');
        if (loader) {
            loader.style.display = show ? 'block' : 'none';
        }
    }

    function addRemoveEventListeners() {
        document.querySelectorAll('.remove-favorite').forEach(button => {
            button.addEventListener('click', async function() {
                if (!confirm('Tem certeza que deseja remover dos favoritos?')) return;
                
                const idApi = this.getAttribute('data-item-id');
                const tipoItem = this.getAttribute('data-item-type');
                
                try {
                    showLoading(true);
                    const response = await fetch(`${API_BASE_URL}/favoritos/${idApi}?tipo_item=${tipoItem}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token.trim()}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.status === 401) {
                        handleAuthError();
                        return;
                    }

                    if (!response.ok) {
                        throw new Error('Erro ao remover favorito');
                    }

                    loadFavorites();
                    
                } catch (error) {
                    console.error('Erro ao remover favorito:', error);
                    alert('Erro ao remover favorito. Tente novamente.');
                } finally {
                    showLoading(false);
                }
            });
        });
    }

    function setupSearch() {
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const items = favoritesContainer.querySelectorAll('.movie-card');
                
                items.forEach(item => {
                    const title = item.querySelector('.movie-title').textContent.toLowerCase();
                    item.closest('.col').style.display = title.includes(searchTerm) ? 'block' : 'none';
                });
            });
        }
    }

    loadFavorites();
    setupSearch();
});



if (localStorage.getItem("usuario")) {


    document.getElementById("login-link").classList.add("hidden");
}


function logout() {
    localStorage.removeItem('jwtToken');
    window.location.href = "/pg-login";
    alert("Você foi desconectado com sucesso.");
}