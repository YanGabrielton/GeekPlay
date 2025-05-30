// ---------------- VARIÁVEIS GLOBAIS ----------------

// Variável que controla a página atual
let paginaAtual = 1;

// Variável que armazena o filtro de tipo selecionado (ex: "manga", "manhwa", etc.)
let tipoFiltro = "";

// Variável para armazenar o termo de busca digitado na barra de pesquisa
let termoBusca = "";

/**
 * Função principal para buscar e exibir os mangás da API Jikan.
 * Esta função monta a URL com base na página, filtro e termo de busca, 
 * realiza a requisição, renderiza os cards e atualiza a navegação numérica.
 * @param {number} pagina - Página atual a ser exibida.
 * @param {string} tipo - Filtro para tipo de mangá (ex: "manga", "manhwa").
 * @param {string} busca - Termo de busca para filtrar os títulos.
 */
async function fetchMangas(pagina = 1, tipo = "", busca = "") {
  try {
    // Seleciona o container onde os cards dos mangás serão exibidos
    const container = document.getElementById('manga-cards-container');
    // Seleciona o elemento de carregamento (loader/spinner)
    const loader = document.getElementById('loader');
    // Seleciona o botão "Próxima Página"
    const btnProxima = document.getElementById('btnProxima');

    // Exibe o loader para indicar que os dados estão sendo carregados
    loader.style.display = 'block';

    // Limpa o container, removendo resultados anteriores
    container.innerHTML = '';

    // Monta a URL base para a requisição, utilizando a página atual
    let url = `https://api.jikan.moe/v4/manga?page=${pagina}`;
    
    // Se existir um termo de busca, adiciona-o à URL (devidamente codificado)
    if (busca) {
      url += `&q=${encodeURIComponent(busca)}`;
    }
    
    // Faz a requisição GET para a API
    const response = await fetch(url);
    // Se a resposta não for bem-sucedida, lança um erro
    if (!response.ok) throw new Error('Erro ao buscar dados da API');
    
    // Converte a resposta para JSON
    const data = await response.json();
    
    // Extrai as informações de paginação do objeto retornado pela API
    const paginationInfo = data.pagination;
    const totalPages = paginationInfo.last_visible_page;  // Última página com dados
    const hasNextPage = paginationInfo.has_next_page;       // Booleano: existe próxima página?
    
    // Se a página requisitada for maior que o total, ajusta para a última página
    if (pagina > totalPages) {
      paginaAtual = totalPages;
    }
    
    // Filtra os mangás de acordo com o tipo (se o filtro estiver definido)
    const mangasFiltrados = data.data.filter(manga => {
      if (!tipo) return true; // Se nenhum filtro é definido, retorna todos os mangás
      return manga.type && manga.type.toLowerCase() === tipo.toLowerCase();
    });
    
    // Limita os resultados a 20 mangás por página
    const limitados = mangasFiltrados.slice(0, 20);
    
    // Se não houver nenhum mangá após aplicar os filtros e limitação...
    if (limitados.length === 0) {
      // Exibe uma mensagem no container
      container.innerHTML = '<p class="text-center w-100">Nenhum mangá encontrado.</p>';
      // Desativa o botão "Próxima" (reduz opacidade e desabilita o clique)
      btnProxima.style.opacity = '0.5';
      btnProxima.style.pointerEvents = 'none';
    } else {
      // Caso haja resultados, garante que o botão "Próxima" esteja ativo
      btnProxima.style.opacity = '1';
      btnProxima.style.pointerEvents = 'auto';
      
      // Para cada mangá encontrado, cria um card e insere no container
      limitados.forEach(manga => {
        // Cria uma coluna com classes do Bootstrap para responsividade
        const col = document.createElement('div');
        col.className = 'col-sm-12 col-md-6 col-lg-3';
        
        // Define o HTML do card, incluindo imagem, título, tipo, nota e link para leitura
        col.innerHTML = `
          <div class="card mb-4 h-100">
            <img src="${manga.images.jpg.image_url}" class="card-img-top" alt="${manga.title}">
            <div class="card-body d-flex flex-column justify-content-between">
              <div>
                <h5 class="card-title">${manga.title}</h5>
                <p class="card-text">${manga.type || 'Mangá'}</p>
                <p class="card-text"><strong>Nota:</strong> ${manga.score || 'N/A'}</p>
              </div>
              <a href="${manga.url}" target="_blank" class="btn btn-primary mt-2">Ler</a>
            </div>
          </div>
        `;
        // Adiciona o card criado ao container
        container.appendChild(col);
      });
    }
    
    // Atualiza os controles de paginação numérica conforme as informações obtidas
    updatePagination(totalPages, hasNextPage);
  
  } catch (error) {
    // Em caso de erro na requisição, exibe a mensagem de erro no console
    console.error('Erro ao carregar os dados:', error);
  } finally {
    // Esconde o loader, independentemente de sucesso ou erro
    document.getElementById('loader').style.display = 'none';
  }
}

/**
 * Função para construir a navegação numérica das páginas.
 * Essa função cria botões para a primeira e última páginas, além de um grupo de botões intermediários.
 * @param {number} totalPages - Total de páginas disponíveis, conforme retornado pela API.
 * @param {boolean} hasNextPage - Indica se há uma página seguinte.
 */
function updatePagination(totalPages, hasNextPage) {
  // Seleciona o container onde os números das páginas serão exibidos
  const paginationContainer = document.getElementById('pagination');
  // Limpa os botões de paginação anteriores
  paginationContainer.innerHTML = '';
  
  // Controle dos botões "Anterior" e "Próxima" com base na página atual
  const btnAnterior = document.getElementById('btnAnterior');
  if (paginaAtual <= 1) {
    btnAnterior.style.opacity = '0.5';
    btnAnterior.style.pointerEvents = 'none';
  } else {
    btnAnterior.style.opacity = '1';
    btnAnterior.style.pointerEvents = 'auto';
  }
  
  const btnProxima = document.getElementById('btnProxima');
  if (!hasNextPage) {
    btnProxima.style.opacity = '0.5';
    btnProxima.style.pointerEvents = 'none';
  } else {
    btnProxima.style.opacity = '1';
    btnProxima.style.pointerEvents = 'auto';
  }
  
  // ------------ CONSTRUINDO A NAVEGAÇÃO NUMÉRICA -------------
  
  // Cria um botão para a primeira página, se não estiver já incluída no grupo
  if (paginaAtual !== 1) {
    const btnPrimeira = document.createElement('button');
    btnPrimeira.className = 'btn btn-light mx-1';
    btnPrimeira.textContent = '1';
    // Ao clicar, vai diretamente para a primeira página
    btnPrimeira.addEventListener('click', () => {
      paginaAtual = 1;
      fetchMangas(paginaAtual, tipoFiltro, termoBusca);
    });
    paginationContainer.appendChild(btnPrimeira);
    
    // Se houver uma diferença significativa, adiciona reticências para indicar a quebra
    if (paginaAtual > 3) {
      const ellipsis = document.createElement('span');
      ellipsis.textContent = '...';
      ellipsis.className = 'mx-1';
      paginationContainer.appendChild(ellipsis);
    }
  }
  
  // Define quantos botões numéricos intermediários serão exibidos
  const maxButtons = 5;
  // Calcula a página inicial do grupo intermediário para tentar centralizar a página atual
  let startPage = Math.max(paginaAtual - Math.floor(maxButtons / 2), 2);
  let endPage = startPage + maxButtons - 1;
  
  // Ajusta se o grupo ultrapassar o total de páginas
  if (endPage >= totalPages) {
    endPage = totalPages - 1;
    startPage = Math.max(endPage - maxButtons + 1, 2);
  }
  
  // Cria os botões intermediários do grupo
  for (let i = startPage; i <= endPage; i++) {
    const btnPage = document.createElement('button');
    btnPage.className = 'btn btn-light mx-1';
    btnPage.textContent = i;
    if (i === paginaAtual) {
      btnPage.classList.add('active');
    }
    btnPage.addEventListener('click', () => {
      paginaAtual = i;
      fetchMangas(paginaAtual, tipoFiltro, termoBusca);
    });
    paginationContainer.appendChild(btnPage);
  }
  
  // Cria um botão para a última página se a página atual não for a última
  if (paginaAtual !== totalPages && totalPages > 1) {
    // Adiciona reticências se houver uma lacuna entre o grupo e a última página
    if (paginaAtual < totalPages - 2) {
      const ellipsis = document.createElement('span');
      ellipsis.textContent = '...';
      ellipsis.className = 'mx-1';
      paginationContainer.appendChild(ellipsis);
    }
    
    const btnUltima = document.createElement('button');
    btnUltima.className = 'btn btn-light mx-1';
    btnUltima.textContent = totalPages;
    btnUltima.addEventListener('click', () => {
      paginaAtual = totalPages;
      fetchMangas(paginaAtual, tipoFiltro, termoBusca);
    });
    paginationContainer.appendChild(btnUltima);
  }
}

// ---------------- EVENTOS ----------------

/**
 * Evento para o seletor de tipo (dropdown).
 * Sempre que o usuário altera a seleção, atualiza o filtro, reinicia a página e realiza a busca.
 */
/**
 * Evento para o botão "Próxima Página".
 * Ao clicar, incrementa a página atual e busca os mangás da próxima página.
 */

document.getElementById('btnProxima').addEventListener('click', () => {
  paginaAtual++;
  fetchMangas(paginaAtual, tipoFiltro, termoBusca);
});

/**
 * Evento para o botão "Página Anterior".
 * Se a página atual for maior que 1, decrementa a página e realiza a busca.
 */
document.getElementById('btnAnterior').addEventListener('click', () => {
  if (paginaAtual > 1) {
    paginaAtual--;
    fetchMangas(paginaAtual, tipoFiltro, termoBusca);
  }
});

/**
 * Evento para o botão de busca (barra de pesquisa).
 * Ao clicar, captura o termo digitado, reinicia a paginação para 1 e busca os mangás.
 */
document.getElementById('btnBuscar').addEventListener('click', () => {
  termoBusca = document.getElementById('barraPesquisa').value.trim();
  paginaAtual = 1;
  fetchMangas(paginaAtual, tipoFiltro, termoBusca);
});

// ---------------- CHAMADA INICIAL ----------------

// Ao carregar a página, busca os mangás da primeira página
fetchMangas();

