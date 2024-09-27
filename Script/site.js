let list = document.querySelector('.slider-choose .list-choose');
let items = list.querySelectorAll('.slider-choose .list-choose .item-service')
let dots = document.querySelectorAll('.slider-choose .dots li');
let prev = document.getElementById('prev');
let next = document.getElementById('next');

let active = 0;
let lengthItems = items.length - 1;

/*ITEM NEWS */




next.onclick = function(){
    
    if(active + 1 > lengthItems){
        active = 0;
    }else {
        active = active + 1;    
    }



    reloadSlider();

}

prev.onclick = function(){
    if(active - 1 < 0){
        active = lengthItems;
    }else
    {
        active = active - 1;
    }
 
    reloadSlider();

}




function reloadSlider() {
    let checkLeft = items[active].offsetLeft;
    list.style.left = -checkLeft + 'px';



    let lastActiveDot = document.querySelector('.slider-choose .dots li.active');
    lastActiveDot.classList.remove('active');

    dots[active].classList.add('active');

}

dots.forEach((li, key) => {
    li.addEventListener('click', function() {
        active = key;
        reloadSlider();
    });
});


/* Carrosel news */

// Carrossel 2

let listNews = document.querySelector('.slider-news .list-news');
let itemNews = listNews.querySelectorAll('.item-news');
let dotsNews = document.querySelectorAll('.slider-news .dots li');
let prevNews = document.getElementById('prev-news');
let nextNews = document.getElementById('next-news');

let activeNews = 0;

nextNews.onclick = function() {
    activeNews = (activeNews + 1) % itemNews.length; // Looping para o início
    reloadNewsSlider();
}

prevNews.onclick = function() {
    activeNews = (activeNews - 1 + itemNews.length) % itemNews.length // Looping para o fim
    reloadNewsSlider();
}

function reloadNewsSlider() {
    let checkLeft = itemNews[activeNews].offsetLeft;
    listNews.style.left = -checkLeft + 'px';

    let lastActiveDotNews = document.querySelector('.slider-news .dots li.active');
    if (lastActiveDotNews) {
        lastActiveDotNews.classList.remove('active');
    }

    dotsNews[activeNews].classList.add('active');
}

dotsNews.forEach((li, key) => {
    li.addEventListener('click', function() {
        activeNews = key;
        reloadNewsSlider();
    });
});
