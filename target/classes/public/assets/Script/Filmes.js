
const API_KEY = 'api_key=5e6bffe0291551af5a19b5bb46bc276a';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_URL = `${BASE_URL}/discover/movie?include_adult=false&include_video=true&language=pt-br&page=1&sort_by=popularity.desc&${API_KEY}`;
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

const mainFilme = document.getElementById('mainFilme');
const form = document.getElementById('form');
const search = document.getElementById('search');
const searchURL = `${BASE_URL}/search/movie?${API_KEY}`;

let paginaAtual = 1;
const btnAnterior = document.getElementById('btnAnterior');
const btnProxima = document.getElementById('btnProxima');

// Carrega os filmes iniciais
pegarFilmes(API_URL);

function pegarFilmes(url) {
    fetch(url)
        .then(res => res.json())
        .then(data => mostrarFilmes(data.results))
        .catch(err => console.error('Erro ao buscar filmes:', err));
}

async function mostrarFilmes(data) {
    mainFilme.innerHTML = '';
    
    // Verifica se o usuário está logado e obtém seus favoritos
    let userFavorites = [];
    const token = localStorage.getItem('jwtToken');
    
    if (token) {
        try {
            const response = await fetch('/favoritos', {
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
        const { id, title, poster_path, vote_average, overview } = movie;
        const isFavorite = userFavorites.some(fav => fav.id_api === id.toString() && fav.tipo_item === 'filme');
        
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
                        <span class="rating ${getColorClass(vote_average)}">${vote_average.toFixed(1)}</span>
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
                    </div>
                </div>
            </div>
        `;
        
        mainFilme.appendChild(col);
    });

    // Adiciona eventos aos botões de favorito
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.stopPropagation();
            const movieId = this.getAttribute('data-movie-id');
            const movieTitle = this.getAttribute('data-movie-title');
            const wasAdded = await toggleFavorite(movieId, movieTitle);
            
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

async function toggleFavorite(movieId, movieTitle) {
  try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
          alert('Você precisa estar logado para favoritar filmes');
          window.location.href = './Login.html';
          return null;
      }

      // Verifica se já é favorito
      const checkResponse = await fetch(`${API_BASE_URL}/favoritos/verificar/${movieId}?tipo_item=filme`, {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });
      
      if (!checkResponse.ok) throw new Error('Erro ao verificar favorito');
      
      const checkData = await checkResponse.json();
      const isFavorite = checkData.isFavorito;

      if (isFavorite) {
          // Remove dos favoritos
          const deleteResponse = await fetch(`${API_BASE_URL}/favoritos/${movieId}?tipo_item=filme`, {
              method: 'DELETE',
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          
          if (!deleteResponse.ok) throw new Error('Erro ao remover favorito');
          
          showToast('Filme removido dos favoritos!', false);
          return false;
      } else {
          // Adiciona aos favoritos
          const addResponse = await fetch(`${API_BASE_URL}/favoritos`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  id_api: movieId,
                  tipo_item: 'filme',
                  titulo: movieTitle
              })
          });
          
          if (!addResponse.ok) throw new Error('Erro ao adicionar favorito');
          
          showToast('Filme adicionado aos favoritos!', true);
          return true;
      }
  } catch (error) {
      console.error('Erro ao atualizar favoritos:', error);
      showToast('Erro ao atualizar favoritos', false);
      return null;
  }
}
function getColorClass(vote) {
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

// Paginação
function carregarPagina(pagina) {
    const url = `${BASE_URL}/discover/movie?include_adult=false&include_video=true&language=pt-br&page=${pagina}&sort_by=popularity.desc&${API_KEY}`;
    pegarFilmes(url);
}

// Eventos de paginação
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
    }
});

// Busca
form.addEventListener('submit', e => {
    e.preventDefault();
    const term = search.value.trim();
    pegarFilmes(term ? `${searchURL}&query=${encodeURIComponent(term)}` : API_URL);
});