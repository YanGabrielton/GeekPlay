// Variáveis globais
let paginaAtual = 1;
let generoSelecionado = "";
let termoBusca = "";
let userFavorites = [];

// Funções de favoritos
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

async function toggleFavorite(itemId, itemTitle, tipoItem = 'manga') {
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
            idApi: itemId.toString(),
            tipoItem: tipoItem,
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

            showToast('Mangá removido dos favoritos!', false);
            return false;
        }
        
        if (!response.ok) throw new Error('Erro ao adicionar favorito');
        
        userFavorites.push({
            idApi: itemId.toString(),
            tipoItem: tipoItem,
            titulo: itemTitle
        })
        
        showToast('Mangá adicionado aos favoritos!', true);
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

// Eventos
document.addEventListener('DOMContentLoaded', () => {
  loadUserFavorites();
  carregarMangas(paginaAtual);

  document.getElementById('form').addEventListener('submit', (e) => {
    e.preventDefault();
    termoBusca = document.getElementById('search').value.trim();
    paginaAtual = 1;
    carregarMangas(paginaAtual);
  });

  document.getElementById('btnProxima').addEventListener('click', () => {
    paginaAtual++;
    carregarMangas(paginaAtual);
  });

  document.getElementById('btnAnterior').addEventListener('click', () => {
    if (paginaAtual > 1) {
      paginaAtual--;
      carregarMangas(paginaAtual);
    }
  });
});

function buscarMangas(genero) {
  generoSelecionado = genero;
  paginaAtual = 1;
  carregarMangas(paginaAtual);
}

async function carregarMangas(pagina) {
  const container = document.getElementById('anime-cards-container');
  const loader = document.getElementById('loader');
  container.innerHTML = '';
  loader.style.display = 'block';

  await loadUserFavorites();

  try {
    let url = `https://api.jikan.moe/v4/manga?page=${pagina}&limit=12&order_by=popularity`;
    if (termoBusca) {
      url = `https://api.jikan.moe/v4/manga?q=${termoBusca}&page=${pagina}&limit=12`;
    } else if (generoSelecionado) {
      url += `&genres=${mapearGenero(generoSelecionado)}`;
    }

    const resposta = await fetch(url);
    const dados = await resposta.json();

    if (!dados.data.length) {
      container.innerHTML = '<p class="text-center text-light">Nenhum resultado encontrado.</p>';
      return;
    }

    dados.data.forEach(manga => {
      const isFavorite = userFavorites.some(fav => 
          fav.idApi === manga.mal_id.toString() && fav.tipoItem === 'manga');
      
      const card = document.createElement('div');
      card.className = 'col-md-3 mb-4';
      card.innerHTML = `
      <div class="card bg-dark text-white h-100">
        <img src="${manga.images.jpg.image_url}" class="card-img-top" alt="${manga.title}"
             onerror="this.src='https://via.placeholder.com/300x450?text=Poster+Indisponível'">
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
                    data-manga-id="${manga.mal_id}"
                    data-manga-title="${manga.title}">
              <i class="fas fa-external-link-alt me-2"></i> Ver em MyAnimeList
            </button>
          </div>
        </div>
      </div>
      `;
      container.appendChild(card);
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

  } catch (erro) {
    console.error('Erro:', erro);
    container.innerHTML = '<p class="text-center text-danger">Erro ao carregar os dados.</p>';
  } finally {
    loader.style.display = 'none';
  }
}

// Función simplificada para redirigir a MyAnimeList
function verMaisManga(mangaId) {
  window.open(`https://myanimelist.net/manga/${mangaId}`, '_blank');
}

function mapearGenero(nomeGenero) {
  const generos = {
    shounen: 27,
    seinen: 42,
    yaoi: 28
  };
  return generos[nomeGenero.toLowerCase()] || '';
}