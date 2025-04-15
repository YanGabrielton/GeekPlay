
function changeBg(bgImage, newImage) {
    document.querySelector('.banner').style.backgroundImage = `url('./img/${bgImage}')`;
    document.querySelector('.Movie-title').src =`../img/telas de fundo carosel${newImage}`;

    banner.style.backgroundSize = 'cover';
    banner.style.backgroundPosition = 'center';

    contents.forEach(content => { 
        content.classList.remove('active');
        if (content.classList.contains(title))  {
            content.classList.add('active');
        }
    });
}