"use strict";

// Helpers
//
const isTouchDevice = () => {
	return (('ontouchstart' in window) ||
		(navigator.maxTouchPoints > 0) ||
		(navigator.msMaxTouchPoints > 0));
}

// Main Menu
//
if (isTouchDevice()) {
	const subMenuNavs = document.querySelectorAll('.has-sub-menu > a');
	subMenuNavs.forEach(mainMenuNav => {
		mainMenuNav.addEventListener('click', event => {
			if (!isTouchDevice()) {
				return;
			}

			subMenuNavs.forEach(item => {
				if (item === mainMenuNav) {
					return;
				}

				item.classList.remove('is-dropdown-open');
			});

			if (mainMenuNav.classList.contains('is-dropdown-open')) {
				return;
			}

			event.preventDefault();
			mainMenuNav.classList.add('is-dropdown-open');
		});
	});
}

// Menu classes based on available free space
//
const navigationMenusTopNavs = document.querySelectorAll('.navigation-main > .has-sub-menu');

const getMenuWidth = (element, initialWidth = 0) => {
	const submenu = element && element.querySelector('.navigation-sub-menu');

	if (!submenu) {
		return initialWidth;
	}


	return getMenuWidth(submenu, initialWidth + submenu.clientWidth);
}

const setMenuClasses = () => {
	const windowWidth = window.innerWidth;
	navigationMenusTopNavs.forEach(navigationMenusTopNav => {
		if (navigationMenusTopNav.classList.contains('navigation-main-item-static')) {
			return;
		}

		navigationMenusTopNav.classList.remove('nav-open-left');
		const width = getMenuWidth(navigationMenusTopNav);

		if (navigationMenusTopNav.offsetLeft + width > windowWidth) {
			navigationMenusTopNav.classList.add('nav-open-left');
		}
	});
}

setMenuClasses();

let resizeTimer;

window.addEventListener('resize', () => {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(() => {
		setMenuClasses();
	}, 350);
});

// Mobile menu
//
const mobileMenuWrap = document.querySelector('.head-slot-nav-mobile-link-wrapper');
const mobileNavWrap = document.querySelector('.navigation-mobile-wrap');
const mobileMenuToggle = document.querySelector('.head-slot-nav-mobile-link');
const mobileMenu = document.querySelector('.mobile-menu');
const expandOnButton = mobileMenu?.dataset.buttonExpand != null;

const setMobileMenuMaxheight = () => {
	mobileMenu.style.maxHeight = `${window.innerHeight - document.querySelector('.header').getBoundingClientRect().bottom + 70}px`;
};

const handleMobileMenuOpen = () => {
	document.body.classList.add('mobile-menu-open');
	mobileMenuToggle.ariaExpanded = 'true';
	mobileMenu.ariaHidden = 'false';
	trapFocus(mobileMenuWrap, mobileNavWrap);
	setMobileMenuMaxheight();
}

const handleMobileMenuDismiss = () => {
	document.body.classList.remove('mobile-menu-open');
	mobileMenuToggle.ariaExpanded = 'false';
	mobileMenu.ariaHidden = 'true';
	removeTrapFocus(mobileMenuToggle);
	mobileMenu.style.maxHeight = '';
}

const isMobileMenuOpen = () => {
	return document.body.classList.contains('mobile-menu-open');
};

document.body.addEventListener('click', (event) => {
	const { target } = event;
	const mobileNav = target.closest('.navigation-mobile-item');
	const isMobileNavButton = target.classList.contains('head-slot-nav-mobile-link') || !!target.closest('.head-slot-nav-mobile-link');

	// Handle mobile menu item expand
	if (mobileNav && mobileNav.querySelector('ul')) {
		if (expandOnButton) {
			if (target.closest('.navigation-mobile-item-link-expand')) {
				mobileNav.classList.toggle('menu-item-expanded');
			}
		} else {
			event.preventDefault();
			mobileNav.classList.toggle('menu-item-expanded');
		}
	}

	// Handle mobile menu show / hide
	if (isMobileNavButton && document.body.classList.contains('mobile-menu-open')) {
		handleMobileMenuDismiss();
		return;
	}

	if (isMobileNavButton) {
		handleMobileMenuOpen();
		return;
	}

	if (isMobileMenuOpen() && !target.closest('.mobile-menu')) {
		event.preventDefault();
		handleMobileMenuDismiss();
	}
});

if (mobileMenuWrap) {
	mobileMenuWrap.addEventListener('keyup', (event) => {
		if (event.code.toUpperCase() === 'ESCAPE') {
			handleMobileMenuDismiss();
		}
	});
}

// Sidebar drawer button toggle
//
const sidebarDrawerButton = document.querySelector('.button-sidebar-drawer-open');
const sidebarDrawer = document.querySelector('.page-layout-sidebar');

const handleSidebarOpen = () => {
	document.body.classList.add('page-layout-sidebar-drawer-open');
	document.body.classList.add('overflow-hidden-tablet');
	trapFocus(sidebarDrawer, sidebarDrawer.querySelector('.page-layout-sidebar-drawer-header'));
}

const handleSidebarDismiss = () => {
	document.body.classList.remove('page-layout-sidebar-drawer-open');
	document.body.classList.remove('overflow-hidden-tablet');
	removeTrapFocus(sidebarDrawerButton);
}

const isSidebarOpen = () => {
	return document.body.classList.contains('page-layout-sidebar-drawer-open');
};

if (sidebarDrawerButton && sidebarDrawer) {
	document.body.addEventListener('click', (event) => {
		const { target } = event;

		if (target.classList.contains('js-button-sidebar-drawer-dismiss')) {
			handleSidebarDismiss();
			return;
		}

		if (target.classList.contains('button-sidebar-drawer-open')) {
			handleSidebarOpen();
			return;
		}

		if (isSidebarOpen() && !target.closest('.page-layout-sidebar')) {
			handleSidebarDismiss();
			event.preventDefault();
		}
	});

	sidebarDrawer.addEventListener('keyup', (event) => {
		if (event.code.toUpperCase() === 'ESCAPE') {
			handleSidebarDismiss();
		}
	});
}

document.addEventListener('change', (event) => {
	if (event.target.parentNode?.classList.contains('select-custom')) {
		const select = event.target;
		const label = select.parentNode.querySelector('label');
		label.textContent = select.options[select.selectedIndex].text;
	}
});

// Review links / scroll
//
(() => {
	const reviewsLink = document.querySelectorAll('a[href*="#product-reviews"]');
	const reviews = document.getElementById('product-reviews');

	if (reviewsLink && reviews) {
		reviewsLink.forEach(link => {
			link.addEventListener('click', () => {
				reviews.expand();
			});
		});
	}

	if (window.location.hash === '#product-reviews' && reviews) {
		setTimeout(() => {
			reviews.expand();
		}, 0);

		setTimeout(() => {
			reviews.scrollIntoView();
		}, 200);
	}
})();

// Collapsible / Expandable
//
class CollapsibleExpandable extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.collapsed = this.getAttribute('expanded') === 'false';
		this.rootElement = this.querySelector('.facet');
		this.toggleElement = this.querySelector('.facet-toggle');

		this.onToggle = this.onToggle.bind(this);
		this.toggleElement.addEventListener('click', this.onToggle);

		// Expandable list
		this.list = this.querySelector('.facet-options-list');
		this.listCollapsed = this.list && this.list.getAttribute('aria-expanded') === 'false';
		this.expandListToggle = this.querySelector('.facet-button-more');

		this.onListToggle = this.onListToggle.bind(this);

		if (this.expandListToggle) {
			this.expandListToggle.addEventListener('click', this.onListToggle);
		}
	}

	disconnectedCallback() {
		this.toggleElement.removeEventListener('click', this.onToggle);

		if (this.expandListToggle) {
			this.expandListToggle.removeEventListener('click', this.onListToggle());
		}
	}

	onToggle(event) {
		event.preventDefault();
		this.handleToggle();
	}

	collapse() {
		this.setAttribute('expanded', 'false');
		this.rootElement.setAttribute('aria-expanded', 'false');
		this.collapsed = true;
	}

	expand() {
		this.setAttribute('expanded', 'true');
		this.rootElement.setAttribute('aria-expanded', 'true');
		this.collapsed = false;
	}

	handleToggle() {
		if (this.collapsed) {
			this.expand();
		} else {
			this.collapse();
		}
	}

	onListToggle(event) {
		if (event) {
			event.preventDefault();
		}
		this.handleToggleList();
	}

	collapseList() {
		this.list.setAttribute('aria-expanded', 'false');
		this.expandListToggle.innerHTML = '&plus; Show More';
		this.listCollapsed = true;
	}

	expandList() {
		this.list.setAttribute('aria-expanded', 'true');
		this.expandListToggle.innerHTML = '&minus; Show Less';
		this.listCollapsed = false;
	}

	handleToggleList() {
		if (this.listCollapsed) {
			this.expandList();
		} else {
			this.collapseList();
		}
	}
}

customElements.define('collapsible-expandable', CollapsibleExpandable);

// Generic Modal Dialog
//
class ModalDialog extends HTMLElement {
	constructor() {
		super();
		this.querySelector('[id^="ModalClose-"]').addEventListener(
			'click',
			this.hide.bind(this)
		);
		this.addEventListener('keyup', (event) => {
			if (event.code.toUpperCase() === 'ESCAPE') {
				this.hide();
			}
		});
		if (this.classList.contains('media-modal')) {
			this.addEventListener('pointerup', (event) => {
				if (event.pointerType === 'mouse' && !event.target.closest('deferred-media, product-model')) {
					this.hide();
				}
			});
		} else {
			this.addEventListener('click', (event) => {
				if (event.target.nodeName === 'MODAL-DIALOG') {
					this.hide();
				}
			});
		}
	}

	connectedCallback() {
		if (this.moved) {
			return;
		}

		this.moved = true;
		document.body.appendChild(this);
	}

	show(opener) {
		this.openedBy = opener;
		document.body.classList.add('overflow-hidden');
		this.setAttribute('open', '');
		trapFocus(this, this.querySelector('[role="dialog"]'));
		window.pauseAllMedia();
	}

	hide() {
		document.body.classList.remove('overflow-hidden');
		this.removeAttribute('open');
		removeTrapFocus(this.openedBy);
		window.pauseAllMedia();
	}
}

customElements.define('modal-dialog', ModalDialog);

// Global modal opener
//
class ModalOpener extends HTMLElement {
	constructor() {
		super();

		const button = this.querySelector('button');

		if (!button) {
			return;
		}

		button.addEventListener('click', () => {
			const modal = document.querySelector(this.getAttribute('data-modal'));
			if (modal) {
				modal.show(button);
			}
		});
	}
}

customElements.define('modal-opener', ModalOpener);

// Variations
//
class VariantSelects extends HTMLElement {
	constructor() {
		super();
		this.product = this.getProductData();

		if (!this.product.variants && !this.product.options) {
			return;
		}

		this.addEventListener('change', this.onVariantChange);
		this.updateOptions();
		this.updateMasterId();

		this.hideOutOfStock = this.dataset.variantsVisibility === 'hide';
		this.disableOutOfStock = this.dataset.variantsVisibility === 'disable';
		this.hideSingle = this.dataset.hideSingle === 'true';
		this.formId = this.dataset.formId;
		this.optionsMap = this.getValidVariants();
		this.outOfStockOptionsMap = this.getOutOfStockVariants();

		if (this.tagName === 'VARIANT-SELECTS') {
			this.dropdowns = this.querySelectorAll('select');

			this.dropdowns.forEach(select => {
				select.addEventListener('change', this.onDropdownChange.bind(this));
			});

			if (this.dropdowns[0] !== null) {
				this.onDropdownChange();
			}
		}

		this.updateVisibility();
	}

	onDropdownChange() {
		this.updateOptionsInDropdown(0);

		if (this.product.options.length > 1) {
			this.updateOptionsInDropdown(1);
		}

		if (this.product.options.length === 3) {
			this.updateOptionsInDropdown(2);
		}
	}

	updateOptionsInDropdown(selectorIndex) {
		const selector = this.dropdowns[selectorIndex];
		const originalValue = selector.value;
		selector.replaceChildren();

		let key = 'root';
		if (selectorIndex === 1) {
			key = this.dropdowns[0].value;
		} else if (selectorIndex === 2) {
			key = this.dropdowns[0].value + ' / ' + this.dropdowns[1].value;
		}

		const availableOptions = this.optionsMap[key];
		const outOfStockOptions = this.outOfStockOptionsMap[key];

		for (let i = 0; i < availableOptions.length; i++) {
			const option = availableOptions[i];
			const newOption = document.createElement('option');
			newOption.value = option;
			newOption.append(option);

			if (this.disableOutOfStock && outOfStockOptions?.includes(option)) {
				newOption.disabled = 'true';
			}

			selector.append(newOption);
		}

		if (availableOptions.includes(originalValue)) {
			selector.value = originalValue;
		}
	}

	getValidVariants() {
		const optionsMap = {};
		for (let i = 0; i < this.product.variants.length; i++) {
			const variant = this.product.variants[i];

			// Make sure we don't hide the currently visited variant if it's out of stock.
			if (this.hideOutOfStock && !variant.available && this.currentVariant.id !== variant.id) {
				continue;
			}

			// Gathering values for the 1st drop-down.
			optionsMap['root'] = optionsMap['root'] || [];
			optionsMap['root'].push(variant.option1);
			optionsMap['root'] = [...new Set(optionsMap['root'])];

			// Gathering values for the 2nd drop-down.
			if (this.product.options.length > 1) {
				const key = variant.option1;
				optionsMap[key] = optionsMap[key] || [];
				optionsMap[key].push(variant.option2);
				optionsMap[key] = [...new Set(optionsMap[key])];
			}

			// Gathering values for the 3rd drop-down.
			if (this.product.options.length === 3) {
				const key = variant.option1 + ' / ' + variant.option2;
				optionsMap[key] = optionsMap[key] || [];
				optionsMap[key].push(variant.option3);
				optionsMap[key] = [...new Set(optionsMap[key])];
			}
		}

		return optionsMap;
	}

	getOutOfStockVariants() {
		const optionsMap = {};
		for (let i = 0; i < this.product.variants.length; i++) {
			const variant = this.product.variants[i];

			if (variant.available) {
				continue;
			}

			// Gathering values for the 1st drop-down.
			optionsMap['root'] = optionsMap['root'] || [];
			optionsMap['root'].push(variant.option1);
			optionsMap['root'] = [...new Set(optionsMap['root'])];

			// Gathering values for the 2nd drop-down.
			if (this.product.options.length > 1) {
				const key = variant.option1;
				optionsMap[key] = optionsMap[key] || [];
				optionsMap[key].push(variant.option2);
				optionsMap[key] = [...new Set(optionsMap[key])];
			}

			// Gathering values for the 3rd drop-down.
			if (this.product.options.length === 3) {
				const key = variant.option1 + ' / ' + variant.option2;
				optionsMap[key] = optionsMap[key] || [];
				optionsMap[key].push(variant.option3);
				optionsMap[key] = [...new Set(optionsMap[key])];
			}
		}

		return optionsMap;
	}

	onVariantChange() {
		this.updateOptions();
		this.updateMasterId();
		this.toggleAddButton(true, '');

		this.updatePickupAvailability();

		if (!this.currentVariant) {
			this.toggleAddButton(true, '');
			this.setUnavailable();
			this.setStockBadge(null);
		} else {
			this.updateMedia();
			this.updateURL();
			this.updateVariantInput();
			this.renderProductInfo();
		}
	}

	updateOptions() {
		this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
	}

	updateMasterId() {
		if (!this.product) {
			return null;
		}

		this.currentVariant = this.getVariantData().find((variant) => {
			return !variant.options.map((option, index) => {
				return this.options[index] === option;
			}).includes(false);
		});
	}

	updateMedia() {
		const mediaGallery = document.getElementById(`MediaGallery-${this.dataset.section}`);

		if (!this.currentVariant || !this.currentVariant.featured_media) {
			return;
		}

		if (mediaGallery?.setActiveMedia) {
			mediaGallery.setActiveMedia(this.currentVariant.featured_media.id, mediaGallery.getAttribute('hide-variants') === 'true');
		}
	}

	updateURL() {
		if (!this.currentVariant || this.dataset.updateUrl === 'false') {
			return;
		}
		window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
	}

	updateVariantInput() {
		const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment`);

		productForms.forEach((productForm) => {
			const input = productForm.querySelector('input[name="id"]');
			input.value = this.currentVariant.id;
			input.dispatchEvent(new Event('change', { bubbles: true }));
		});
	}

	updatePickupAvailability() {
		const pickUpAvailability = document.querySelector('pickup-availability');

		if (!pickUpAvailability || !pickUpAvailability.fetchAvailability) {
			return;
		}

		if (this.currentVariant && this.currentVariant.available) {
			pickUpAvailability.fetchAvailability(this.currentVariant.id);
		} else {
			pickUpAvailability.removeAttribute('available');
			pickUpAvailability.innerHTML = '';
		}
	}

	updateVisibility() {
		const hasSingleVariantAvailable = Object.keys(this.optionsMap).reduce((acc, key) => {
			return this.optionsMap[key].length === 1;
		}, false);
		const parent = this.closest('.product-variants');

		if (this.hideSingle && this.hideOutOfStock && hasSingleVariantAvailable) {
			parent?.classList.add('hidden');
		} else {
			parent?.classList.add('variants-visible');
			parent?.classList.remove('variants-hidden');
		}
	}

	renderProductInfo() {
		fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.section}`)
			.then((response) => response.text())
			.then((responseText) => {
				const id = `price-${this.dataset.section}`;
				const html = new DOMParser().parseFromString(responseText, 'text/html')
				const destination = document.getElementById(id);
				const source = html.getElementById(id);

				if (source && destination) {
					destination.innerHTML = source.innerHTML;
				}

				const price = document.getElementById(`price-${this.dataset.section}`);

				if (price) {
					price.classList.remove('visibility-hidden');
				}

				this.toggleAddButton(!this.currentVariant.available, window.variantStrings.outOfStock);
				this.setSku(this.currentVariant.sku);
				this.setBarcode(this.currentVariant.barcode);
				this.setStockBadge(this.currentVariant);
			});
	}

	setSku(sku) {
		const skuField = document.getElementById(`ProductSku-${this.dataset.section}`);

		if (!skuField) {
			return;
		}

		if (!sku) {
			skuField.parentNode.classList.add('visually-hidden');
			return;
		}

		skuField.parentNode.classList.remove('visually-hidden');
		skuField.textContent = sku;
	}

	setBarcode(barcode) {
		const barcodeField = document.getElementById(`ProductBarcode-${this.dataset.section}`);

		if (!barcodeField) {
			return;
		}

		if (!barcode) {
			barcodeField.parentNode.classList.add('visually-hidden');
			return;
		}

		barcodeField.parentNode.classList.remove('visually-hidden');
		barcodeField.textContent = barcode ?? '';
	}

	setStockBadge(variant) {
		const product = document.getElementById(`Product-${this.dataset.section}`);
		const productForm = document.getElementById(`product-form-${this.dataset.section}`);
		const stockBadge = product.querySelector('.badge-stock');

		if (!productForm || !product || !stockBadge) {
			return;
		}

		if (!variant) {
			stockBadge.parentNode.classList.add('hidden');
			return;
		}

		const { variantStock = [] } = window;
		const availableStock = variantStock.find(({ id }) => id === variant.id);

		if (availableStock == null) {
			return;
		}

		stockBadge.parentNode.classList.remove('hidden');
		const threshold = parseInt(productForm.getAttribute('data-stock-threshold'), 10);
		const stockBadgeLabel = stockBadge.querySelector('.js-stock-text');

		if (availableStock.inventory_policy === 'continue' || variant.inventory_management == null) {
			stockBadge.classList.remove('badge-stock-warning');
			stockBadge.classList.remove('badge-stock-out');
			stockBadge.classList.add('badge-stock-in');
			stockBadgeLabel.textContent = window.variantStrings.alwaysInStock;
			return;
		}

		if (!variant.available) {
			stockBadge.classList.remove('badge-stock-warning');
			stockBadge.classList.remove('badge-stock-in');
			stockBadge.classList.add('badge-stock-out');
			stockBadgeLabel.textContent = window.variantStrings.outOfStock;
			return;
		}

		if (threshold > 0 && availableStock.quantity <= threshold) {
			stockBadge.classList.remove('badge-stock-in');
			stockBadge.classList.remove('badge-stock-out');
			stockBadge.classList.add('badge-stock-warning');
			stockBadgeLabel.textContent = window.variantStrings.numberLeft.replace('[quantity]', availableStock.quantity);
			return;
		}

		stockBadge.classList.remove('badge-stock-warning');
		stockBadge.classList.remove('badge-stock-out');
		stockBadge.classList.add('badge-stock-in');
		stockBadgeLabel.textContent = window.variantStrings.inStock;
		if ( window.themeSettings.showItemsInStock ) {
			stockBadgeLabel.textContent = window.variantStrings.inStock.replace( '[quantity]', availableStock.quantity );
		}
	}

	toggleAddButton(disable = true, text) {
		const productForm = document.getElementById(`product-form-${this.dataset.section}`);
		if (!productForm) {
			return;
		}

		const addButton = productForm.querySelector('[name="add"]');
		const addButtonText = productForm.querySelector('[name="add"] > span');

		if (!addButton) {
			return;
		}

		if (disable) {
			addButton.setAttribute('disabled', 'disabled');

			if (text) {
				addButtonText.textContent = text;
			}
		} else {
			addButton.removeAttribute('disabled');
			addButtonText.textContent = window.variantStrings.addToCart;
		}
	}

	setUnavailable() {
		const form = document.getElementById(`product-form-${this.dataset.section}`);
		const addButton = form.querySelector('[name="add"]');
		const addButtonText = form.querySelector('[name="add"] > span');
		const price = document.getElementById(`price-${this.dataset.section}`);
		const product = document.getElementById(`Product-${this.dataset.section}`);

		if (!addButton) {
			return;
		}

		addButtonText.textContent = window.variantStrings.unavailable;

		if (price) {
			price.classList.add('visibility-hidden');
		}
	}

	getProductData() {
		this.productData = this.productData || {
			options: JSON.parse(this.querySelector('[type="application/json"][data-id="product-options"]').textContent),
			variants: JSON.parse(this.querySelector('[type="application/json"][data-id="product-variants"]').textContent),
		}
		return this.productData;
	}

	getVariantData() {
		this.variantData = this.variantData || this.getProductData().variants;
		return this.variantData;
	}
}

if (!customElements.get('variant-selects')) {
	customElements.define('variant-selects', VariantSelects);
}

class VariantRadios extends VariantSelects {
	constructor() {
		super();

		if (this.tagName === 'VARIANT-RADIOS') {
			this.fieldsets = this.querySelectorAll('fieldset');
			this.fieldsets.forEach(fieldset => {
				fieldset.addEventListener('change', this.onRadioChange.bind(this));
			});

			if (this.fieldsets[0] != null) {
				this.onRadioChange();
			}
		}
	}

	onRadioChange() {
		this.updateRadiosInFieldset(0);

		if (this.product.options.length > 1) {
			this.updateRadiosInFieldset(1);
		}

		if (this.product.options.length === 3) {
			this.updateRadiosInFieldset(2);
		}
	}

	getFieldsetCheckedValue(fieldset) {
		return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value
	}

	updateRadiosInFieldset(selectorIndex) {
		const selector = this.fieldsets[selectorIndex];
		const optionName = selector.dataset.optionName;
		const originalValue = this.getFieldsetCheckedValue(selector);

		selector.replaceChildren();

		let key = 'root';
		if (selectorIndex === 1) {
			const value0 = this.getFieldsetCheckedValue(this.fieldsets[0]);
			key = value0;
		} else if (selectorIndex === 2) {
			const value0 = this.getFieldsetCheckedValue(this.fieldsets[0]);
			const value1 = this.getFieldsetCheckedValue(this.fieldsets[1]);
			key = value0 + ' / ' + value1;
		}

		const legend = document.createElement('legend');
		legend.textContent = optionName;
		selector.append(legend);

		const availableOptions = this.optionsMap[key];
		const outOfStockOptions = this.outOfStockOptionsMap[key];

		let checkFirst = false;
		if (!availableOptions.includes(originalValue)) {
			checkFirst = true;
		}

		for (let i = 0; i < availableOptions.length; i++) {
			const option = availableOptions[i];
			const id = `${this.dataset.section}-${selectorIndex}-${i}`;

			const newLabel = document.createElement('label');
			newLabel.value = option;
			newLabel.htmlFor = id;
			newLabel.textContent = option;

			const newOption = document.createElement('input');
			newOption.id = id;
			newOption.type = 'radio';
			newOption.name = optionName;
			newOption.value = option;
			newOption.setAttribute('form', this.formId);

			if (originalValue === option || checkFirst) {
				newOption.checked = true;
				checkFirst = false;
			}

			if (this.disableOutOfStock && outOfStockOptions?.includes(option)) {
				newOption.disabled = 'true';
			}

			selector.append(newOption);
			selector.append(newLabel);
			selector.append(document.createTextNode(' '));
		}
	}

	updateOptions() {
		const fieldsets = Array.from(this.querySelectorAll('fieldset'));
		this.options = fieldsets.map((fieldset) => {
			return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
		});
	}
}

customElements.define('variant-radios', VariantRadios);

// Expandable list
//
class ExpandableList extends HTMLElement {
	constructor() {
		super();

		this.elements = {
			root: this.querySelector('ul'),
			expandableNavs: this.querySelectorAll('.has-sub-menu')
		};

		if (!this.elements.expandableNavs.length) {
			return;
		}

		this.elements.expandableNavs.forEach((nav) => {
			const navLink = nav.querySelector('a');
			navLink.addEventListener('click', this.onToggle.bind(this, nav));
		});
	}

	onToggle(navElement, event) {
		event.preventDefault();
		event.stopImmediatePropagation();

		const submenu = navElement.querySelector('ul');
		const closeOthers = this.getAttribute('close-others');
		const isExpanded = submenu.getAttribute('aria-expanded') === 'true';

		if (isExpanded) {
			this.onContract(navElement)
		} else {
			this.onExpand(navElement);

			if (closeOthers) {
				const closestRoot = navElement.closest('ul');
				const siblings = [...closestRoot.querySelectorAll(':scope > .has-sub-menu')].filter(item => {
					return item !== navElement;
				});
				siblings.forEach(this.onContract);
			}
		}
	}

	onExpand(element) {
		const submenu = element.querySelector('ul');
		element.classList.add('is-expanded');
		submenu.setAttribute('aria-expanded', 'true');
	}

	onContract(element) {
		const submenu = element.querySelector('ul');
		element.classList.remove('is-expanded');
		submenu.setAttribute('aria-expanded', 'false');
	}
}

customElements.define('expandable-list', ExpandableList);

// Quantity Input
//
class QuantityInput extends HTMLElement {
	constructor() {
		super();
		this.input = this.querySelector('input');
		this.changeEvent = new Event('change', { bubbles: true })

		this.querySelectorAll('button').forEach(
			(button) => button.addEventListener('click', this.onButtonClick.bind(this))
		);
	}

	onButtonClick(event) {
		event.preventDefault();
		const previousValue = this.input.value;

		event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
		if (previousValue !== this.input.value) {
			this.input.dispatchEvent(this.changeEvent);
		}
	}
}

customElements.define('quantity-input', QuantityInput);

class CartRemoveButton extends HTMLElement {
	constructor() {
		super();
		this.addEventListener('click', (event) => {
			event.preventDefault();
			const cartItems = this.closest('cart-items');
			const miniCart = this.closest('mini-cart');

			if (cartItems) {
				cartItems.updateQuantity(this.dataset.index, 0);
			}

			if (miniCart) {
				miniCart.updateQuantity(this.dataset.index, 0);
			}
		});
	}
}

customElements.define('cart-remove-button', CartRemoveButton);

class CartItems extends HTMLElement {
	constructor() {
		super();

		this.lineItemStatusElement = document.getElementById('shopping-cart-line-item-status');

		this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
			.reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);

		this.debouncedOnChange = debounce((event) => {
			this.onChange(event);
		}, 500);

		this.addEventListener('change', this.debouncedOnChange.bind(this));
	}

	onChange(event) {
		this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
	}

	getSectionsToRender() {
		return [
			{
				id: 'main-cart-items',
				section: document.getElementById('main-cart-items').dataset.id,
				selector: '.js-contents',
			},
			{
				id: 'header',
				section: 'header',
				selector: '.head-slot-cart-link'
			},
			{
				id: 'cart-live-region-text',
				section: 'cart-live-region-text',
				selector: '.shopify-section'
			},
			{
				id: 'main-cart-footer',
				section: document.getElementById('main-cart-footer').dataset.id,
				selector: '.js-contents',
			}
		];
	}

	updateQuantity(line, quantity, name) {
		this.enableLoading(line);

		const body = JSON.stringify({
			line,
			quantity,
			sections: this.getSectionsToRender().map((section) => section.section),
			sections_url: window.location.pathname
		});

		fetch(`${routes.cart_change_url}`, {...fetchConfig(), ...{ body }})
			.then((response) => {
				return response.text();
			})
			.then((state) => {
				const parsedState = JSON.parse(state);
				this.classList.toggle('is-empty', parsedState.item_count === 0);
				const cartFooter = document.getElementById('main-cart-footer');

				if (cartFooter) {
					cartFooter.classList.toggle('is-empty', parsedState.item_count === 0);
				}

				this.getSectionsToRender().forEach((section => {
					const elementToReplace =
						document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);

					elementToReplace.innerHTML =
						this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
				}));

				this.updateLiveRegions(line, parsedState.item_count);
				const lineItem = document.getElementById(`CartItem-${line}`);
				if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
					lineItem.querySelector(`[name="${name}"]`).focus();
				}
				this.disableLoading();
			}).catch(() => {
			this.querySelectorAll('.cart-item-loading-overlay').forEach((overlay) => overlay.classList.add('hidden'));
			this.setError(window.cartStrings.error);
			this.disableLoading();
		});
	}

	setError(error) {
		document.getElementById('cart-errors').textContent = error;
	}

	updateLiveRegions(line, itemCount) {
		if (this.currentItemCount === itemCount) {
			document.getElementById(`Line-item-error-${line}`)
				.querySelector('.cart-item-error-text')
				.innerHTML = window.cartStrings.quantityError.replace(
				'[quantity]',
				document.getElementById(`quantity-input-${line}`).value
			);
		}

		this.currentItemCount = itemCount;
		this.lineItemStatusElement.setAttribute('aria-hidden', true);

		const cartStatus = document.getElementById('cart-live-region-text');
		cartStatus.setAttribute('aria-hidden', false);

		setTimeout(() => {
			cartStatus.setAttribute('aria-hidden', true);
		}, 1000);
	}

	getSectionInnerHTML(html, selector) {
		return new DOMParser()
			.parseFromString(html, 'text/html')
			.querySelector(selector).innerHTML;
	}

	enableLoading(line) {
		document.getElementById('main-cart-items').classList.add('cart-items-disabled');
		this.querySelectorAll(`#CartItem-${line} .cart-item-loading-overlay`).forEach((overlay) => overlay.classList.remove('hidden'));
		document.activeElement.blur();
		this.lineItemStatusElement.setAttribute('aria-hidden', false);
	}

	disableLoading() {
		document.getElementById('main-cart-items').classList.remove('cart-items-disabled');
	}
}

customElements.define('cart-items', CartItems);

class MiniCart extends CartItems {
	constructor() {
		super();

		this.toggle = this.querySelector('drawer-toggle');
	}

	open(opener) {
		this.toggle.open(opener);
	}

	close() {
		this.toggle.close();
	}

	getSectionsToRender() {
		return [
			{
				id: 'header',
				section: 'header',
				selector: '.head-slot-cart-link'
			},
			{
				id: 'header-mini-cart-content',
				section: 'header-mini-cart-content',
			},
			{
				id: 'header-mini-cart-footer',
				section: 'header-mini-cart-footer',
			},
		]
	}

	getSectionInnerHTML(html, selector = '.shopify-section') {
		return new DOMParser()
			.parseFromString(html, 'text/html')
			.querySelector(selector).innerHTML;
	}

	renderContents(parsedState) {
		this.getSectionsToRender().forEach((section => {
			const elementToReplace =
				document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);

			elementToReplace.innerHTML =
				this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
		}));
		this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
			.reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);
	}

	setError(error) {
		document.getElementById('mini-cart-error').textContent = error;
	}

	enableLoading() {
		this.querySelector('.mini-cart-wrap').classList.add('loading');
	}

	disableLoading() {
		this.querySelector('.mini-cart-wrap').classList.remove('loading');
	}

	updateLiveRegions(line, itemCount) {
		if (this.currentItemCount === itemCount) {
			document.getElementById(`MiniCart-Line-item-error-${line}`)
				.querySelector('.cart-item-error-text')
				.innerHTML = window.cartStrings.quantityError.replace(
				'[quantity]',
				document.getElementById(`Mini-Cart-Quantity-${line}`).value
			);
		}

		this.currentItemCount = itemCount;
	}
}

customElements.define('mini-cart', MiniCart);

// Language & Country selectors.
//
class LocalizationForm extends HTMLElement {
	constructor() {
		super();
		this.elements = {
			input: this.querySelector('input[name="locale_code"], input[name="country_code"]'),
			button: this.querySelector('button'),
			dropdown: this.querySelector('.dropdown'),
			panel: this.querySelector('.dropdown-list-wrap'),
		};
		this.elements.button.addEventListener('click', this.openSelector.bind(this));
		this.elements.button.addEventListener('focusout', this.closeSelector.bind(this));
		this.addEventListener('keyup', this.onContainerKeyUp.bind(this));

		this.querySelectorAll('a').forEach(item => item.addEventListener('click', this.onItemClick.bind(this)));
	}

	hidePanel() {
		this.elements.button.blur();
		this.elements.dropdown.setAttribute('aria-expanded', 'false');
		this.elements.button.setAttribute('aria-expanded', 'false');
		this.elements.panel.setAttribute('aria-hidden', 'true');
	}

	onContainerKeyUp(event) {
		if (event.code.toUpperCase() !== 'ESCAPE') {
			return;
		}

		this.hidePanel();
		this.elements.button.focus();
	}

	onItemClick(event) {
		event.preventDefault();
		const form = this.querySelector('form');
		this.elements.input.value = event.currentTarget.dataset.value;
		if (form) {
			form.submit();
		}
	}

	toggleSelector() {
		if (this.isOpen()) {
			this.hidePanel();
			return;
		}

		this.elements.button.focus();
		this.elements.panel.setAttribute('aria-hidden', 'false');
		this.elements.button.setAttribute('aria-expanded', 'true');
		this.elements.dropdown.setAttribute('aria-expanded', 'true');
	}

	isOpen() {
		return this.elements.panel.getAttribute('aria-hidden') === 'false';
	}

	openSelector() {
		this.elements.button.focus();
		this.elements.panel.setAttribute('aria-hidden', (this.elements.button.getAttribute('aria-hidden') === 'true'));
		this.elements.button.setAttribute('aria-expanded', (this.elements.button.getAttribute('aria-expanded') === 'false').toString());
		this.elements.dropdown.setAttribute('aria-expanded', (this.elements.dropdown.getAttribute('aria-expanded') === 'false'));
	}

	closeSelector(event) {
		const shouldClose = event.relatedTarget && (event.relatedTarget.nodeName === 'BUTTON' || event.relatedTarget.nodeName === 'MAIN');
		if (event.relatedTarget === null || shouldClose) {
			this.hidePanel();
		}
	}
}

customElements.define('localization-form', LocalizationForm);

class TabsComponent extends HTMLElement {
	constructor() {
		super();
	}

	setActiveTab(handle) {
		this.querySelectorAll('[data-handle]').forEach(tab => {
			tab.setAttribute('aria-hidden', 'true');

			if (tab.getAttribute('data-handle') === handle) {
				const carouselComponent = tab.querySelector('carousel-slider');
				tab.setAttribute('aria-hidden', 'false');

				if (carouselComponent) {
					carouselComponent.flickity.resize();
				}
			}
		});
	}
}

customElements.define('tabs-component', TabsComponent);

class TabsNavigation extends HTMLElement {
	constructor() {
		super();

		this.sliderId = this.getAttribute('for');
		this.navs = this.querySelectorAll('a, button');
		this.navs.forEach(nav => {
			nav.addEventListener('click', this.onNavigationClick.bind(this, nav));
		});
	}

	onNavigationClick(element, event) {
		event.preventDefault();
		this.setActiveTab(element);
	}

	setActiveTab(nav) {
		const target = nav.getAttribute('data-collection-handle');
		const tabsComponent = document.querySelector(`#${this.sliderId}`);

		if (!tabsComponent) {
			return;
		}

		tabsComponent.setActiveTab(target);

		this.navs.forEach(element => {
			if (element === nav) {
				element.classList.add('is-active');
			} else {
				element.classList.remove('is-active');
			}
		});
	}
}

customElements.define('tabs-navigation', TabsNavigation);

class DeferredMedia extends HTMLElement {
	constructor() {
		super();
		const poster = this.querySelector('[id^="Deferred-Poster-"]');

		if (!poster) {
			return;
		}

		poster.addEventListener('click', this.loadContent.bind(this));
	}

	loadContent(focus = true) {
		window.pauseAllMedia();

		if (!this.getAttribute('loaded')) {
			const content = document.createElement('div');
			content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

			this.setAttribute('loaded', true);
			const deferredElement = this.appendChild(content.querySelector('video, model-viewer, iframe'));
			if (focus) {
				deferredElement.focus();
			}
		}
	}
}

customElements.define('deferred-media', DeferredMedia);

// Drawers
//
class DrawerModal extends HTMLElement {
	constructor() {
		super();
		this.bodyClass = this.getAttribute('body-class');
		this.isOpen = false;

		this.addEventListener('keyup', (event) => {
			if (event.code.toUpperCase() === 'ESCAPE') {
				this.close();
			}
		});
	}

	open(opener) {
		this.isOpen = true;
		this.openedBy = opener;
		document.body.classList.add(this.bodyClass);
		document.body.classList.add('drawer-open');
	}

	close() {
		this.isOpen = false;
		document.body.classList.remove(this.bodyClass);
		document.body.classList.remove('drawer-open');

		if (this.openedBy) {
			removeTrapFocus(this.openedBy);
		}
	}
}

customElements.define('drawer-modal', DrawerModal);

class DrawerToggle extends HTMLElement {
	constructor() {
		super();
		this.toggleElement = this.querySelector('a') || this.querySelector('button');
		this.bodyClass = this.getAttribute('body-class');
		this.preventOpen = this.getAttribute('prevent-open') === 'true';

		if (this.preventOpen) {
			return;
		}

		this.toggleElement.addEventListener('click', (event) => {
			event.preventDefault();
			this.handleToggle();
		});
	}

	handleToggle(opener) {
		const drawer = document.querySelector(`#${this.getAttribute('for')}`);

		if (drawer.isOpen) {
			this.close();
		} else {
			this.open(opener);
		}
	}

	open(opener) {
		const drawer = document.querySelector(`#${this.getAttribute('for')}`);

		if (drawer) {
			drawer.open(opener || this.toggleElement);
			const drawerHeader = drawer.querySelector('.drawer-header');
			trapFocus(drawer, drawerHeader);
		}
	}

	close() {
		const drawer = document.querySelector(`#${this.getAttribute('for')}`);

		if (drawer && drawer.close) {
			drawer.close();
		}
	}
}

customElements.define('drawer-toggle', DrawerToggle);

document.body.addEventListener('click', (event) => {
	if (!document.body.classList.contains('drawer-open')) {
		return;
	}

	if (event.target.closest('.drawer')) {
		return;
	}

	if (event.target.closest('drawer-toggle')) {
		return;
	}

	// Close all drawers
	[...document.querySelectorAll('.drawer')].forEach((drawer) => {
		const dismiss = drawer.querySelector('drawer-toggle');

		if (dismiss) {
			dismiss.close();
		}
	});
});

// Focus trap
function getFocusableElements(container) {
	return Array.from(
		container.querySelectorAll(
			"summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
		)
	);
}

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
	var elements = getFocusableElements(container);
	var first = elements[0];
	var last = elements[elements.length - 1];

	removeTrapFocus();

	trapFocusHandlers.focusin = (event) => {
		if (
			event.target !== container &&
			event.target !== last &&
			event.target !== first
		)
			return;

		document.addEventListener('keydown', trapFocusHandlers.keydown);
	};

	trapFocusHandlers.focusout = function () {
		document.removeEventListener('keydown', trapFocusHandlers.keydown);
	};

	trapFocusHandlers.keydown = function (event) {
		if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
		// On the last focusable element and tab forward, focus the first element.
		if (event.target === last && !event.shiftKey) {
			event.preventDefault();
			first.focus();
		}

		//  On the first focusable element and tab backward, focus the last element.
		if (
			(event.target === container || event.target === first) &&
			event.shiftKey
		) {
			event.preventDefault();
			last.focus();
		}
	};

	document.addEventListener('focusout', trapFocusHandlers.focusout);
	document.addEventListener('focusin', trapFocusHandlers.focusin);

	elementToFocus.focus();
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
	document.querySelector(":focus-visible");
} catch {
	focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
	const navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN']
	let currentFocusedElement = null;
	let mouseClick = null;

	window.addEventListener('keydown', (event) => {
		if (navKeys.includes(event.code.toUpperCase())) {
			mouseClick = false;
		}
	});

	window.addEventListener('mousedown', (event) => {
		mouseClick = true;
	});

	window.addEventListener('focus', () => {
		if (currentFocusedElement) {
			currentFocusedElement.classList.remove('focused');
		}

		if (mouseClick) {
			return;
		}

		currentFocusedElement = document.activeElement;
		currentFocusedElement.classList.add('focused');

	}, true);
}

function removeTrapFocus(elementToFocus = null) {
	document.removeEventListener('focusin', trapFocusHandlers.focusin);
	document.removeEventListener('focusout', trapFocusHandlers.focusout);
	document.removeEventListener('keydown', trapFocusHandlers.keydown);

	if (elementToFocus) {
		elementToFocus.focus();
	}
}

function debounce(func, wait, immediate) {
	let timeout;

	return function executedFunction() {
		const context = this;
		const args = arguments;

		const later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};

		const callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);

		if (callNow) {
			func.apply(context, args);
		}
	};
}

function fetchConfig(type = 'json') {
	return {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
	};
}

function pauseAllMedia() {
	document.querySelectorAll('.js-youtube').forEach((video) => {
		video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
	});
	document.querySelectorAll('.js-vimeo').forEach((video) => {
		video.contentWindow.postMessage('{"method":"pause"}', '*');
	});
	document.querySelectorAll('video').forEach((video) => video.pause());
	document.querySelectorAll('product-model').forEach((model) => {
		if (model.modelViewerUI) {
			model.modelViewerUI.pause();
		}
	});
}

(function () {
	// We wrap each RTE table by a specific class to allow wrapping
	document.querySelectorAll('.rte table').forEach(function (table) {
		table.outerHTML = '<div class="table-wrapper">' + table.outerHTML + '</div>';
	});
	document.querySelectorAll('.rte iframe').forEach(function (iframe) {
		// We scope the wrapping only for YouTube and Vimeo
		if (iframe.src.indexOf('youtube') !== - 1 || iframe.src.indexOf('youtu.be') !== - 1 || iframe.src.indexOf('vimeo') !== - 1) {
			iframe.outerHTML = '<div class="video-wrapper">' + iframe.outerHTML + '</div>'; // Re-set the src attribute on each iframe after page load for Chrome's "incorrect iFrame content on 'back'" bug.
			// https://code.google.com/p/chromium/issues/detail?id=395791. Need to specifically target video and admin bar

			iframe.src = iframe.src;
		}
	});
})();


/*
 * Shopify Common JS
 * Source: Dawn theme
 */
if ((typeof window.Shopify) == 'undefined') {
	window.Shopify = {};
}

Shopify.bind = function(fn, scope) {
	return function() {
		return fn.apply(scope, arguments);
	}
};

Shopify.setSelectorByValue = function(selector, value) {
	for (var i = 0, count = selector.options.length; i < count; i++) {
		var option = selector.options[i];
		if (value == option.value || value == option.innerHTML) {
			selector.selectedIndex = i;
			return i;
		}
	}
};

Shopify.addListener = function(target, eventName, callback) {
	target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on'+eventName, callback);
};

Shopify.postLink = function(path, options) {
	options = options || {};
	var method = options['method'] || 'post';
	var params = options['parameters'] || {};

	var form = document.createElement("form");
	form.setAttribute("method", method);
	form.setAttribute("action", path);

	for(var key in params) {
		var hiddenField = document.createElement("input");
		hiddenField.setAttribute("type", "hidden");
		hiddenField.setAttribute("name", key);
		hiddenField.setAttribute("value", params[key]);
		form.appendChild(hiddenField);
	}
	document.body.appendChild(form);
	form.submit();
	document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
	this.countryEl         = document.getElementById(country_domid);
	this.provinceEl        = document.getElementById(province_domid);
	this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

	Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler,this));

	this.initCountry();
	this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
	initCountry: function() {
		var value = this.countryEl.getAttribute('data-default');
		Shopify.setSelectorByValue(this.countryEl, value);
		this.countryHandler();
	},

	initProvince: function() {
		var value = this.provinceEl.getAttribute('data-default');
		if (value && this.provinceEl.options.length > 0) {
			Shopify.setSelectorByValue(this.provinceEl, value);
		}
	},

	countryHandler: function(e) {
		var opt       = this.countryEl.options[this.countryEl.selectedIndex];
		var raw       = opt.getAttribute('data-provinces');
		var provinces = JSON.parse(raw);

		this.clearOptions(this.provinceEl);
		if (provinces && provinces.length == 0) {
			this.provinceContainer.style.display = 'none';
		} else {
			for (var i = 0; i < provinces.length; i++) {
				var opt = document.createElement('option');
				opt.value = provinces[i][0];
				opt.innerHTML = provinces[i][1];
				this.provinceEl.appendChild(opt);
			}

			this.provinceContainer.style.display = "";
		}
	},

	clearOptions: function(selector) {
		while (selector.firstChild) {
			selector.removeChild(selector.firstChild);
		}
	},

	setOptions: function(selector, values) {
		for (var i = 0, count = values.length; i < values.length; i++) {
			var opt = document.createElement('option');
			opt.value = values[i];
			opt.innerHTML = values[i];
			selector.appendChild(opt);
		}
	}
};
