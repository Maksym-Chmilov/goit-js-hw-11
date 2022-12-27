import './css/styles.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import NewService from './js/server';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const galleryEl = document.querySelector('.gallery');
const form = document.querySelector('#search-form');
const sentinel = document.querySelector('#sentinel');

const newService = new NewService();

const lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
  scrollZoom: false,
});

form.addEventListener('submit', onSearch);

const onEntry = entries => {
  entries.forEach(async entry => {
    if (entry.isIntersecting && newService.query !== '') {
      const object = await newService.fetchImages();
      const {
        data: { hits, totalHits },
      } = object;
      createCard(hits);
      if (totalHits / 40 <= newService.page - 1) {
        Notify.failure(
          'We are sorry, but you have reached the end of search results.'
        );
        observer.unobserve(sentinel);
      }
      lightbox.refresh();
    }
  });
};

const observer = new IntersectionObserver(onEntry, {
  rootMargin: '150px',
});

async function onSearch(e) {
  try {
    e.preventDefault();

    newService.query = e.currentTarget.searchQuery.value;

    if (newService.query === '') {
      return Notify.failure('You did not enter anything to search.');
    }

    newService.resetPage();
    clearImages();

    const object = await newService.fetchImages();
    const {
      data: { hits, totalHits },
    } = object;

    if (hits.length === 0) {
      return Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    createCard(hits);

    observer.observe(sentinel);

    lightbox.refresh();

    if (totalHits <= 40) {
      Notify.failure(
        'We are sorry, but you have reached the end of search results.'
      );
    }

    Notify.success(`Hooray! We found ${totalHits} images.`);

    form.reset();
  } catch (error) {
    console.log(error);
  }
}

function createCard(images) {
  const newCard = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        ` 
      <a class="gallery__link" href="${largeImageURL}">
        <div class="photo-card">
            <img src="${webformatURL}" alt="${tags}" loading="lazy"  />
            <div class="info">
                <p class="info-item">
                <b>Likes </b><br>
                ${likes}
                </p>
                <p class="info-item">
                <b>Views </b><br>
                ${views}
                </p>
                <p class="info-item">
                <b>Comments </b><br>
                ${comments}
                </p>
                <p class="info-item">
                <b>Downloads </b><br>
                ${downloads}
                </p>
            </div>
        </div>
      </a>   
    `
    )
    .join('');
  galleryEl.insertAdjacentHTML('beforeend', newCard);
  return newCard;
}

function clearImages() {
  galleryEl.innerHTML = '';
}
