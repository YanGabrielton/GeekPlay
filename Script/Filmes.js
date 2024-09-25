const API_KEY= '5e6bffe0291551af5a19b5bb46bc276a'; /*MEU CODIGO DA API MOVIEDB*/
const BASE_URL= 'https://api.themoviedb.org/3/';
const API_KEY= 'BASE_URL +';



const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1ZTZiZmZlMDI5MTU1MWFmNWExOWI1YmI0NmJjMjc2YSIsIm5iZiI6MTcyNzIyODU5Mi4zMzY4NTcsInN1YiI6IjY2ZjM2MzhhZjViNDk3ODY0MzIyZGMxNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.q5HuKWoVvigDtiuph-ubhFYmi0deWaJ6RB7cL69eyeQ'
    }
  };
  
  fetch('https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=true&language=pt-br&page=1&sort_by=popularity.desc', options)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err)); /*terminar*/ */