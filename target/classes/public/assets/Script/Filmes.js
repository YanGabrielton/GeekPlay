const API_KEY  = 'api_key=5e6bffe0291551af5a19b5bb46bc276a';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_URL  = `${BASE_URL}/discover/movie?include_adult=false&include_video=true&language=pt-br&page=1&sort_by=popularity.desc&${API_KEY}`;
const IMG_URL  = 'https://image.tmdb.org/t/p/w500';

const mainFilme = document.getElementById('mainFilme');
const form       = document.getElementById('form');
const search     = document.getElementById('search');
const searchURL  = `${BASE_URL}/search/movie?${API_KEY}`;

pegarFilmes(API_URL);

function pegarFilmes(url) {
  fetch(url)
    .then(res => res.json())
    .then(data => mostrarFilmes(data.results))
    .catch(err => console.error('Erro ao buscar filmes:', err));
}

function mostrarFilmes(data) {
  mainFilme.innerHTML = '';
  data.forEach(movie => {
    const { title, poster_path, vote_average, overview } = movie;
    // Cria coluna responsiva
    const col = document.createElement('div');
    col.className = 'col-sm-12 col-md-6 col-lg-4';
    // Conteúdo da movie card
    col.innerHTML = `
      <div class="movie">
        <img src="${IMG_URL+poster_path}" alt="${title}" title="${title}">
        <div class="movie-info">
          <h3>${title}</h3>
          <span class="${getColor(vote_average)}">${vote_average}</span>
        </div>
        <div class="descricao">
          <h3>Resumo</h3>
          <p>${overview}</p>
        </div>
      </div>
    `;
    mainFilme.appendChild(col);
  });
}
function getColor(vote) {
  if (vote >= 7) return 'badge bg-success';
  if (vote >= 5) return 'badge bg-warning';
  return 'badge bg-danger';
  }

form.addEventListener('submit', e => {
  e.preventDefault();
  const term = search.value.trim();
  pegarFilmes(term ? `${searchURL}&query=${encodeURIComponent(term)}` : API_URL);
});

let paginaAtual = 1; // Página inicial
const btnAnterior = document.getElementById('btnAnterior');
const btnProxima = document.getElementById('btnProxima');

// Atualiza a URL e busca os filmes da página atual
function carregarPagina(pagina) {
  const url = `${BASE_URL}/discover/movie?include_adult=false&include_video=true&language=pt-br&page=${pagina}&sort_by=popularity.desc&${API_KEY}`;
  pegarFilmes(url);
}

// Evento botão Próxima
btnProxima.addEventListener('click', () => {
  paginaAtual++;
  carregarPagina(paginaAtual);
  window.scrollTo(0, 0); // Rolagem para o topo
});

// Evento botão Anterior
btnAnterior.addEventListener('click', () => {
  if (paginaAtual > 1) {
    paginaAtual--;
    carregarPagina(paginaAtual);
    window.scrollTo(0, 0); // Rolagem para o topo
  }
});

function mostrarFilmes(data) {
  mainFilme.innerHTML = '';
  data.forEach(movie => {
    const { title, poster_path, vote_average, overview, id } = movie;
    const col = document.createElement('div');
    col.className = 'col-sm-6 col-md-4 col-lg-3 mb-4';
    
    col.innerHTML = `
      <div class="movie-card">
        <div class="poster-container">
          <img src="${IMG_URL + poster_path}" class="movie-poster" alt="${title}">
          <div class="movie-info">
            <h3>${title}</h3>
            <span class="${getColor(vote_average)}">${vote_average}</span>
          </div>
        </div>
        
        <div class="movie-overlay">
          <div class="overlay-content">
            <h4>Resumo</h4>
            <p>${overview || 'Nenhum resumo disponível.'}</p>
            
            <!-- Botão de favorito - só aparece no hover -->
            <button class="favorite-btn" data-movie-id="${id}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              Favoritar
            </button>
          </div>
        </div>
      </div>
    `;
    
    mainFilme.appendChild(col);
  });

  // Event listeners para os favoritos
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      this.classList.toggle('active');
      const movieId = this.getAttribute('data-movie-id');
      toggleFavorite(movieId);
    });
  });
}



























// é para mostrar no console se está pegando console.log(data);
/* modo Tradicional da função*/
  //    fetch(url).then(function(res) {
  //     return res.json();
  // });

/*Agora este é o Arrow Function reduzindo a necessidade de criar
uma função tradicional*/ 
  // fetch(url).then(res => res.json());

  /*Ambas as versões fazem a mesma coisa: pegam a resposta da fetch e a transformam em JSON. No entanto, a versão com arrow function é mais concisa e fácil de ler. */
  












/*linha 8: fetch(url): Faz uma requisição HTTP para a URL especificada e retorna uma promessa que resolve com a resposta da requisição.*/ 
/*linha 8: .then(res => res.json()): O primeiro .then recebe a resposta da requisição (res) e a converte para JSON usando res.json(). Isso retorna uma nova promessa que resolve com os dados JSON.*/ 
/*linha 8:  o segundo .then(data => { console.log(data); }) é adicionado para processar os dados que foram convertidos para JSON na etapa anterior,
linha 8: .then(data => { console.log(data); }): O segundo .then recebe os dados JSON resultantes da promessa anterior e executa uma função que simplesmente imprime esses dados no console.*/



/*A razão para adicionar o segundo .then é que a conversão para JSON (res.json()) é uma operação assíncrona que retorna uma promessa. Portanto, precisamos de outro .then para lidar com os dados JSON após a conversão. Sem o segundo .then, não teríamos acesso aos dados convertidos para JSON.*/
