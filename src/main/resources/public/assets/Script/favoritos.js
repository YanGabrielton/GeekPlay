document.addEventListener('DOMContentLoaded', async function() {
    const favoritesContainer = document.getElementById('favorites-container');
    const emptyState = document.getElementById('empty-state');
    const API_KEY = 'api_key=5e6bffe0291551af5a19b5bb46bc276a';
    const BASE_URL = 'https://api.themoviedb.org/3';
    const IMG_URL = 'https://image.tmdb.org/t/p/w500';

    // Verifica se o usuário está logado
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = './Login.html';
        return;
    }

    // Carrega os favoritos
    async function loadFavorites() {
        try {
            const response = await fetch('/favoritos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Erro ao buscar favoritos');
            
            const data = await response.json();
            const favorites = data.favoritos || [];
            
            if (favorites.length === 0) {
                showEmptyState();
                return;
            }

            hideEmptyState();
            favoritesContainer.innerHTML = '';

            // Carrega os detalhes de cada filme favorito
            const moviePromises = favorites.map(fav => {
                if (fav.tipo_item === 'filme') {
                    return fetch(`${BASE_URL}/movie/${fav.id_api}?${API_KEY}&language=pt-BR`)
                        .then(res => res.json())
                        .then(movie => ({ 
                            ...movie, 
                            tipo: 'filme',
                            favoritoId: fav.id_api 
                        }));
                }
                // Adicione aqui outros tipos (anime, manga) se necessário
                return Promise.resolve(null);
            });

            const items = await Promise.all(moviePromises);
            items.filter(item => item !== null).forEach(item => {
                displayFavoriteItem(item);
            });

        } catch (error) {
            console.error('Erro:', error);
            showEmptyState();
        }
    }

    // Remove um item dos favoritos
    async function removeFromFavorites(itemId, tipoItem) {
        try {
            const response = await fetch(`/favoritos/${itemId}?tipo_item=${tipoItem}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Erro ao remover favorito');
            
            loadFavorites(); // Recarrega a lista após remoção
            showToast('Item removido dos favoritos!', false);
            
        } catch (error) {
            console.error('Erro:', error);
            showToast('Erro ao remover favorito', false);
        }
    }

    // Exibe um item favorito na tela (mesmo estilo da página de filmes)
    function displayFavoriteItem(item) {
        const { id, title, poster_path, vote_average, overview, tipo } = item;
        
        const col = document.createElement('div');
        col.className = 'col-sm-6 col-md-4 col-lg-3 mb-4';
        
        col.innerHTML = `
            <div class="movie-card">
                <div class="poster-container">
                    <button class="remove-favorite" data-item-id="${id}" data-item-type="${tipo}" title="Remover dos favoritos">
                        <i class="fas fa-heart"></i>
                    </button>
                    <img src="${poster_path ? IMG_URL + poster_path : 'https://via.placeholder.com/300x450?text=Poster+Indisponível'}" 
                         class="movie-poster" 
                         alt="${title}"
                         onerror="this.src='https://via.placeholder.com/300x450?text=Poster+Indisponível'">
                    <div class="movie-info">
                        <h3 class="movie-title">${title}</h3>
                        <span class="rating ${getColorClass(vote_average)}">${vote_average?.toFixed(1) || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="movie-overlay">
                    <div class="overlay-content">
                        <h4>Resumo</h4>
                        <p>${overview || 'Nenhum resumo disponível.'}</p>
                    </div>
                </div>
            </div>
        `;
        
        favoritesContainer.appendChild(col);
    }

    function showEmptyState() {
        favoritesContainer.classList.add('d-none');
        emptyState.classList.remove('d-none');
    }

    function hideEmptyState() {
        emptyState.classList.add('d-none');
        favoritesContainer.classList.remove('d-none');
    }

    function getColorClass(vote) {
        if (!vote) return 'bg-secondary text-white';
        if (vote >= 7) return 'bg-success text-white';
        if (vote >= 5) return 'bg-warning text-dark';
        return 'bg-danger text-white';
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

    // Event listeners
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-favorite')) {
            const btn = e.target.closest('.remove-favorite');
            const itemId = btn.getAttribute('data-item-id');
            const tipoItem = btn.getAttribute('data-item-type');
            removeFromFavorites(itemId, tipoItem);
        }
    });

    // Inicialização
    loadFavorites();

    // Função de logout
    function logout() {
        localStorage.removeItem('jwtToken');
        window.location.href = './Login.html';
    }

    // Torna a função logout global para ser acessível pelo HTML
    window.logout = logout;
});