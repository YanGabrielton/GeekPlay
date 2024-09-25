const API_KEY= 'api_key=5e6bffe0291551af5a19b5bb46bc276a'; /*MEU CODIGO DA API MOVIEDB*/
const BASE_URL= 'https://api.themoviedb.org/3';
const API_URL= BASE_URL +'/discover/movie?include_adult=false&include_video=true&language=pt-br&page=1&sort_by=popularity.desc&'+API_KEY;
const IMG_URL= 'https://image.tmdb.org/t/p/w500'





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
data.forEach(movie=>{                               
  const{title,poster_path,vote_average,overview}=movie;
  const MovieEl = document.createElement('div');
  MovieEl.classList.add('movie');
  MovieEl.innerHtml= `<img src="${IMG_URL+poster_path}" alt="${title}">
        
  <div class="movie-info">
      <h3>${title}</h3>
      <span class="${getColor(vote_average)}">${vote_average}</span>
  </div>
  <div class="descricao">
      <h3>Resumo</h3>
      ${overview};
  </div>`
})

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
