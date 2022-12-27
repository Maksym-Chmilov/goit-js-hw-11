import axios from 'axios';
export default class NewService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
  }
  async fetchImages() {
    const response = await axios.get(
      `https://pixabay.com/api/?key=32396078-5569d1de9dd35c5ed352ed577&q=${this.searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${this.page}`
    );
    this.incrementPage();
    return response;
  }
  incrementPage() {
    this.page += 1;
  }
  resetPage() {
    this.page = 1;
  }
  get query() {
    return this.searchQuery;
  }
  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}