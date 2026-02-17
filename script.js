const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const modalCaption = document.getElementById('modalCaption');
const closeBtn = document.querySelector('.close');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
const loading = document.querySelector('.loading');
const gallery = document.getElementById('gallery');

let currentIndex = 0;
let imageData = [];
let currentFilter = 'all';

function renderFilters() {
    const filtersContainer = document.getElementById('filters');
    filtersContainer.innerHTML = '';

    const allCharacters = new Set();
    imageData.forEach(item => {
        if (item.characters && Array.isArray(item.characters)) {
            item.characters.forEach(char => allCharacters.add(char));
        }
    });

    const btnAll = document.createElement('button');
    btnAll.className = 'filter-btn active';
    btnAll.textContent = 'All';
    btnAll.dataset.filter = 'all';
    btnAll.addEventListener('click', () => handleFilterClick('all'));
    filtersContainer.appendChild(btnAll);

    allCharacters.forEach(char => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = char;
        btn.dataset.filter = char;
        btn.addEventListener('click', () => handleFilterClick(char));
        filtersContainer.appendChild(btn);
    });
}

function handleFilterClick(filterValue) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filterValue) {
            btn.classList.add('active');
        }
    });

    currentFilter = filterValue;
    renderGallery();
}

async function loadGalleryData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }
        imageData = await response.json();
        renderGallery();
    } catch (error) {
        console.error('Ошибка:', error);
        gallery.innerHTML = '<p class="error">Ошибка загрузки галереи</p>';
    }
}

function renderGallery() {
    gallery.innerHTML = '';

    let filteredData = imageData;

    if (currentFilter !== 'all') {
        filteredData = imageData.filter(item => {
            return item.characters && item.characters.includes(currentFilter);
        });
    }

    const groupedByAuthor = {};

    filteredData.forEach((item, index) => {
        const originalIndex = imageData.findIndex(orig => orig.image === item.image);
        
        const authorKey = item.authorName;
        if (!groupedByAuthor[authorKey]) {
            groupedByAuthor[authorKey] = [];
        }
        groupedByAuthor[authorKey].push({...item, originalIndex: originalIndex});
    });

    Object.values(groupedByAuthor).forEach(authorImages => {
        const panel = document.createElement('div');
        panel.className = 'panel';
        
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';
        
        const infoContainer = document.createElement('div');
        infoContainer.className = 'info-container';

        authorImages.forEach(imgData => {
            const imgWrapper = document.createElement('div');
            imgWrapper.className = 'img-wrapper';

            const img = document.createElement('img');
            img.src = imgData.image;
            img.alt = imgData.alt;
            img.dataset.index = imgData.originalIndex;

            img.addEventListener('click', function() {
                currentIndex = parseInt(this.dataset.index);
                openModal(this.src, imgData.alt);
            });

            imgWrapper.appendChild(img);

            if (imgData.ai) {
                const badge = document.createElement('div');
                badge.className = 'ai-badge';
                badge.textContent = 'AI';
                imgWrapper.appendChild(badge);
            }

            imageContainer.appendChild(imgWrapper);
        });

        const firstImage = authorImages[0];
        
        // const authorDiv = document.createElement('div');
        // authorDiv.className = 'author';
        // authorDiv.innerHTML = `Author: <a target="_blank" href="${firstImage.authorUrl}">${firstImage.authorName}</a>`;
        // infoContainer.appendChild(authorDiv);

        // authorImages.forEach(imgData => {
        //     const sourceDiv = document.createElement('div');
        //     sourceDiv.className = 'source';
        //     sourceDiv.innerHTML = `Source: <a target="_blank" href="${imgData.sourceUrl}">${imgData.sourceName}</a>`;
        //     infoContainer.appendChild(sourceDiv);
        // });
        
        panel.appendChild(imageContainer);
        // panel.appendChild(infoContainer);
        gallery.appendChild(panel);
    });
}

async function loadGalleryData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        imageData = await response.json();
        
        renderFilters();
        renderGallery();
    } catch (error) {
        console.error('Ошибка:', error);
        gallery.innerHTML = '<p class="error">Ошибка загрузки галереи</p>';
    }
}

function openModal(src, alt) {
    modal.style.display = "flex";
    loading.style.display = "block";
    modalImg.style.display = "none";
    modalCaption.textContent = `Загрузка...`;
    
    const img = new Image();
    img.onload = function() {
        modalImg.src = this.src;
        modalImg.style.display = "block";
        loading.style.display = "none";
        updateCaption();
    };
    img.onerror = function() {
        loading.textContent = "Ошибка загрузки изображения";
    };
    img.src = src;
}

function updateCaption() {
    const currentImage = imageData[currentIndex];

    let charsHtml = '';
    if (currentImage.characters && currentImage.characters.length > 0) {
        const charsString = currentImage.characters.join(', '); 
        charsHtml = `<div class="modal-chars">Characters: ${charsString}</div>`;
    }

    modalCaption.innerHTML = `
        Author: <a href="${currentImage.authorUrl}" target="_blank">${currentImage.authorName}</a> | 
        Source: <a href="${currentImage.sourceUrl}" target="_blank">${currentImage.sourceName}</a> 
        ${charsHtml}
    `;
}

function closeModal() {
    modal.style.display = "none";
    modalImg.src = "";
}

function showNextImage() {
    currentIndex = (currentIndex + 1) % imageData.length;
    const nextImage = imageData[currentIndex];
    
    loading.style.display = "block";
    modalImg.style.display = "none";
    
    const img = new Image();
    img.onload = function() {
        modalImg.src = this.src;
        modalImg.style.display = "block";
        loading.style.display = "none";
        updateCaption();
    };
    img.onerror = function() {
        loading.textContent = "Ошибка загрузки изображения";
    };
    img.src = nextImage.image;
}

function showPrevImage() {
    currentIndex = (currentIndex - 1 + imageData.length) % imageData.length;
    const prevImage = imageData[currentIndex];
    
    loading.style.display = "block";
    modalImg.style.display = "none";
    
    const img = new Image();
    img.onload = function() {
        modalImg.src = this.src;
        modalImg.style.display = "block";
        loading.style.display = "none";
        updateCaption();
    };
    img.onerror = function() {
        loading.textContent = "Ошибка загрузки изображения";
    };
    img.src = prevImage.image;
}

loadGalleryData();

closeBtn.addEventListener('click', closeModal);

modal.addEventListener('click', function(event) {
    if (event.target === modal) {
        closeModal();
    }
});

prevBtn.addEventListener('click', function(event) {
    event.stopPropagation();
    showPrevImage();
});

nextBtn.addEventListener('click', function(event) {
    event.stopPropagation();
    showNextImage();
});

document.addEventListener('keydown', function(event) {
    if (modal.style.display === "flex") {
        switch(event.key) {
            case 'Escape':
                closeModal();
                break;
            case 'ArrowLeft':
                showPrevImage();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
        }
    }
});

let touchStartX = 0;
let touchEndX = 0;

modal.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
});

modal.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    
    if (touchEndX < touchStartX - swipeThreshold) {
        showNextImage();
    }
    
    if (touchEndX > touchStartX + swipeThreshold) {
        showPrevImage();
    }
}