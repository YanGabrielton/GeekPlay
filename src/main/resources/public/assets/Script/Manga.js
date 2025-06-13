// Variáveis globais
let paginaAtual = 1;
let generoSelecionado = "";
let termoBusca = "";

document.addEventListener('DOMContentLoaded', () => {
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
      const card = document.createElement('div');
      card.className = 'col-md-3 mb-4';
      card.innerHTML = `
      <div class="card bg-dark text-white h-100">
  <img src="${manga.images.jpg.image_url}" class="card-img-top" alt="${manga.title}">
  <div class="card-body d-flex flex-column justify-content-between">
    <div>
      <h5 class="card-title">${manga.title}</h5>
      <p class="card-text">Score: ${manga.score || "N/A"}</p>
    </div>
    <div class="d-flex flex-column gap-2 mt-3">
      <button class="btn btn-outline-warning favorite-btn" data-manga-id="${manga.mal_id}">
        <i class="fas fa-star me-2"></i> Favoritar
      </button>
      <a href="${manga.url}" target="_blank" class="btn btn-outline-info">
        <i class="fas fa-book-open me-2"></i> Ver mais
      </a>
    </div>
  </div>
</div>
`;
      container.appendChild(card);
    });
  } catch (erro) {
    container.innerHTML = '<p class="text-center text-danger">Erro ao carregar os dados.</p>';
    console.error('Erro:', erro);
  } finally {
    loader.style.display = 'none';
  }
}

function mapearGenero(nomeGenero) {
  const generos = {
    shounen: 27,
    seinen: 42,
    yaoi: 28
  };
  return generos[nomeGenero.toLowerCase()] || '';
}
