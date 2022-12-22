if (!customElements.get('product-form')) {
	customElements.define('product-form', class ProductForm extends HTMLElement {
		constructor() {
			super();

			this.form = this.querySelector('form');
			this.form.querySelector('[name=id]').disabled = false;
			this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
			this.minicart = document.querySelector('mini-cart');
		}

		onSubmitHandler(event) {
			event.preventDefault();
			const submitButton = this.querySelector('[type="submit"]');
			if (submitButton.classList.contains('loading')) {
				return;
			}

			this.handleErrorMessage();

			submitButton.setAttribute('aria-disabled', true);
			submitButton.classList.add('loading');
			this.querySelector('.button-overlay-spinner').classList.remove('hidden');

			const config = fetchConfig('javascript');
			config.headers['X-Requested-With'] = 'XMLHttpRequest';
			delete config.headers['Content-Type'];

			const formData = new FormData(this.form);
			formData.append('sections', this.minicart.getSectionsToRender().map((section) => section.id));
			formData.append('sections_url', window.location.pathname);
			config.body = formData;

			fetch(`${routes.cart_add_url}`, config)
				.then((response) => response.json())
				.then((response) => {
					if (response.status) {
						this.handleErrorMessage(response.description);
						return;
					}

					this.minicart.renderContents(response);
					this.minicart.open(submitButton);
				})
				.catch((e) => {
					console.error(e);
				})
				.finally(() => {
					submitButton.classList.remove('loading');
					submitButton.removeAttribute('aria-disabled');
					this.querySelector('.button-overlay-spinner').classList.add('hidden');
				});
		}

		handleErrorMessage(errorMessage = false) {
			this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form-error-message-wrapper');
			this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form-error-message');

			this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

			if (errorMessage) {
				this.errorMessage.textContent = errorMessage;
			}
		}
	});
}
