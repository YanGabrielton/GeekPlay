const API_KEY= 'api_key=5e6bffe0291551af5a19b5bb46bc276a'; /*MEU CODIGO DA API MOVIEDB*/
const BASE_URL= 'https://api.themoviedb.org/3';
const API_URL= BASE_URL +'/discover/movie?include_adult=false&include_video=true&language=pt-br&page=1&sort_by=popularity.desc&'+API_KEY;
const IMG_URL= 'https://image.tmdb.org/t/p/w500'
const mainFilme = document.getElementById('mainFilme'); /*com isso estou pegando o id da Main do qual é ID="mainFilme"*/

const searchURL= BASE_URL +'/search/movie?'+API_KEY; /*criando variavel para receber a url da documentação Search do MovieDB*/ 

const form= document.getElementById('form');
const search= document.getElementById('search');



pegarFilmes(API_URL);


function pegarFilmes(url){

/* buscar (url).então*/ 
  fetch(url).then(res => res.json()).then(data =>{
    mostrarFilmes(data.results);
    console.log(data.results)
   
  
  })
  .catch(error => {
    console.error('Erro ao buscar os filmes da API:', error); // Adicionei um tratamento de erro
  });
}






/*função para mostrar os filmes na tela*/

function mostrarFilmes(data){


  mainFilme.innerHTML='';
data.forEach(movie=>{                               
  const{title,poster_path,vote_average,overview}=movie;
  const MovieEl = document.createElement('div');
  MovieEl.classList.add('movie');
  MovieEl.innerHTML= `
  <img src="${IMG_URL+poster_path}" alt="${title}">
        
  <div class="movie-info">
      <h3>${title}</h3>
      <span class="${getColor(vote_average)}">${vote_average}</span>
  </div>
  <div class="descricao">
      <h3>Resumo</h3>
      ${overview};
  </div>
  
  `
  mainFilme.appendChild(MovieEl);
})

}
/*fazendo a parte da avalização para automaticamente mudar a cor de acordo com o rating*/ 
function getColor(vote){
  if(vote>=8){
    return 'green';
  }else if(vote>=5){
    return 'orange';
  
  }else{
    return'red';
  }
}



form.addEventListener('submit', (pesquisa) =>{
pesquisa.preventDefault();

const searchTerm= search.value.trim();
if(searchTerm){
  pegarFilmes(searchURL+'&query='+searchTerm)  /** aqui vc coloca o searchURL para fazer a busca**/
}else{
   pegarFilmes(API_URL);              // location.reload(); /** caso não tenha uma pesquisa ele atualiza a pagina. porem vou usar outro comando**/
}

})


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
