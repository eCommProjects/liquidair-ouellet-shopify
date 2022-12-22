if (!customElements.get('media-gallery')) {
	customElements.define('media-gallery', class MediaGallery extends HTMLElement {
		constructor() {
			super();
			this.elements = {
				mains: this.querySelectorAll('.product-media-main'),
				thumbnails: this.querySelectorAll('.product-media-thumbnail'),
			};

			if (!this.elements.thumbnails.length) {
				return;
			}

			this.elements.thumbnails.forEach((thumbnail) => {
				const mediaToggle = thumbnail.querySelector('button');
				if (!mediaToggle) {
					return;
				}
				mediaToggle.addEventListener('click', this.setActiveMedia.bind(this, mediaToggle.dataset.mediaId, false));
			});
		}

		setActiveMedia(mediaId, prepend) {
			const thumbnail = [...this.elements.thumbnails].find((element) => {
				return element.dataset.mediaId === mediaId.toString();
			});
			const isActive = thumbnail?.classList.contains('is-active');

			if (!thumbnail || isActive) {
				return;
			}

			const index = [...this.elements.thumbnails].indexOf(thumbnail);
			const activeMainMedia = [...this.elements.mains].find((element) => {
				return element.classList.contains('is-active');
			});
			this.elements.thumbnails.forEach((thumb) => {
				thumb.classList.remove('is-active');
			});
			activeMainMedia.classList.remove('is-active');

			const nextMainMedia = this.elements.mains[index];
			nextMainMedia.classList.add('is-active');
			thumbnail.classList.add('is-active');
			this.playActiveMedia(nextMainMedia);

			if (prepend) {
				thumbnail.parentElement.prepend(thumbnail);
			} else {
				thumbnail.scrollIntoView({
					behavior: 'smooth',
					block: 'nearest',
				});
			}
		}

		playActiveMedia(activeItem) {
			window.pauseAllMedia();
			const deferredMedia = activeItem.querySelector('deferred-media');

			if (deferredMedia) {
				deferredMedia.loadContent(false);
			}
		}
	});
}

if (!customElements.get('product-thumbnail-navigation')) {
	customElements.define('product-thumbnail-navigation', class ProductThumbnailNavigation extends HTMLElement {
		constructor() {
			super();
		}

		connectedCallback() {
			this.init();
		}

		init() {
			this.gallery = document.querySelector(`#${this.getAttribute('for')}`);
			this.elements = {
				gallery: this.gallery,
				scroller: this.gallery.querySelector('.product-media-scroller'),
				thumbnailWrapper: this.gallery.querySelector('.product-media-thumbnails'),
				thumbnails: this.gallery.querySelectorAll('.product-media-thumbnail'),
				buttonPrev: this.querySelector('.js-prev'),
				buttonNext: this.querySelector('.js-next'),
			};

			if (!this.elements.thumbnails.length) {
				return;
			}

			if (this.elements.scroller.clientHeight < this.elements.thumbnailWrapper.scrollHeight) {
				this.classList.remove('hidden');

				this.elements.buttonPrev.addEventListener('click', (event) => {
					event.preventDefault();
					this.prev();
				});

				this.elements.buttonNext.addEventListener('click', (event) => {
					event.preventDefault();
					this.next();
				});

				this.elements.thumbnailWrapper.addEventListener('scroll', () => {
					this.buttonAvailability();
				});
			}
		}

		prev() {
			const scrollPos = this.elements.thumbnailWrapper.scrollTop;
			this.elements.thumbnailWrapper.scroll(0, scrollPos - 300);
		}

		next() {
			const scrollPos = this.elements.thumbnailWrapper.scrollTop;
			this.elements.thumbnailWrapper.scroll(0, scrollPos + 300);
		}

		buttonAvailability() {
			const el = this.elements.thumbnailWrapper;
			const hasBottomed = el.scrollTop + el.clientHeight >= el.scrollHeight - 30;
			const hasTopped = el.scrollTop <= 30;
			this.elements.buttonPrev.classList.remove('pill-nav-item-disabled');
			this.elements.buttonNext.classList.remove('pill-nav-item-disabled');

			if (hasBottomed) {
				this.elements.buttonNext.classList.add('pill-nav-item-disabled');
			}

			if (hasTopped) {
				this.elements.buttonPrev.classList.add('pill-nav-item-disabled');
			}
		}
	});
}
