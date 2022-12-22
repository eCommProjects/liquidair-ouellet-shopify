document.addEventListener('shopify:block:select', function (event) {
	const blockSelectedIsSlide = event.target.classList.contains('slideshow-slide');
	if (!blockSelectedIsSlide) {
		return;
	}

	const parentSlideshowComponent = event.target.closest('slideshow-component');
	parentSlideshowComponent.flickity.stopPlayer();

	const slideIndex = [...event.target.parentElement.childNodes].indexOf(event.target);

	setTimeout(function () {
		parentSlideshowComponent.flickity.select(slideIndex);
	}, 200);
});

document.addEventListener('shopify:block:deselect', function (event) {
	const blockDeselectedIsSlide = event.target.classList.contains('slideshow-slide');
	if (!blockDeselectedIsSlide) {
		return;
	}

	const parentSlideshowComponent = event.target.closest('slideshow-component');

	if (parentSlideshowComponent.autoPlayEnabled) {
		parentSlideshowComponent.flickity.playPlayer();
	}
});

document.addEventListener('shopify:section:load', function (event) {
	const mapLocations = event.target.querySelector('map-locations');
	const apiKey = mapLocations?.getAttribute('google-maps-api-key');

	if (!mapLocations || !apiKey) {
		return;
	}

	initializeGoogleMapsScript(apiKey);
});
