// Global variables
let products = [];
let cart = [];
let userBalance = 1000;
let currentSlide = 0;
let currentReviewIndex = 0;
let reviews = [];
let couponApplied = false;
let discountRate = 0;



// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    fetchProducts();
    fetchReviews();

    setupEventListeners();
    startBannerAutoSlide();
    startReviewAutoSlide();
      const savedBalance = localStorage.getItem('smartShopBalance');
    if (savedBalance) {
        userBalance = parseInt(savedBalance);
        updateBalanceDisplay();
    }
});


// Fetch products from FakeStore API
const fetchProducts = () => {
    fetch('https://fakestoreapi.com/products')
        .then((response) => response.json())
        .then((data) => {
            products = data;
            displayProducts(products);
        })
        .catch((error) => {
            console.error('Error fetching products:', error);
            productsGrid.innerHTML = '<p class="text-center text-red-500 col-span-full">Failed to load products. Please try again later.</p>';
        });
}
const productsGrid = document.getElementById('products-grid');
// Display products in the grid
const displayProducts = (productsToDisplay) => {
    productsGrid.innerHTML = '';
    
    if (productsToDisplay.length === 0) {
        productsGrid.innerHTML = '<p class="text-center text-gray-500 col-span-full py-8">No products found.</p>';
        return;
    }
    
    productsToDisplay.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300';
        productCard.innerHTML = `
            <div class="h-48 overflow-hidden">
                <img src="${product.image}" alt="${product.title}" class="w-full h-full object-contain p-4">
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-lg mb-2 truncate">${product.title}</h3>
                <div class="flex items-center mb-2">
                    <div class="flex text-yellow-400 mr-2">
                        ${generateStarRating(product.rating.rate)}
                    </div>
                    <span class="text-gray-500 text-sm">(${product.rating.count})</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-xl font-bold text-black-600">BDT ${product.price}</span>
                    <button class="add-to-cart bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300" data-id="${product.id}">
                         Add to Cart
                    </button>
                </div>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
    
    // Add event listeners to "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            addToCart(productId);
        });
    });
}

// Generate star rating HTML
const generateStarRating = (rating) => {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}




const emptyCartMessage = document.getElementById('empty-cart-message');
const cartModal = document.getElementById('cart-modal');
const cartItems = document.getElementById('cart-items');
// Add product to cart
const addToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification(`${product.title} added to cart!`);
}
const closeCart = document.getElementById('close-cart');
// Remove product from cart
const removeFromCart = (productId) => {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

// Update cart quantity
const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.quantity = newQuantity;
        updateCart();
    }
}
const cartCount = document.getElementById('cart-count');
const updateCart = () => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        emptyCartMessage.classList.remove('hidden');
        return;
    }
    
    emptyCartMessage.classList.add('hidden');
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item flex items-center bg-gray-50 p-4 rounded-lg';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-contain mr-4">
            <div class="flex-grow">
                <h4 class="font-semibold truncate">${item.title}</h4>
                <p class="text-blue-600 font-bold">$${item.price}</p>
            </div>
            <div class="flex items-center">
                <button class="decrease-quantity w-8 h-8 bg-gray-200 rounded-l-lg" data-id="${item.id}">-</button>
                <span class="quantity w-10 h-8 bg-gray-100 flex items-center justify-center">${item.quantity}</span>
                <button class="increase-quantity w-8 h-8 bg-gray-200 rounded-r-lg" data-id="${item.id}">+</button>
            </div>
            <button class="remove-item ml-4 text-red-500 hover:text-red-700" data-id="${item.id}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItems.appendChild(cartItem);
    });
    const cartBtn = document.getElementById('cart-btn');
    // Add event listeners to cart item buttons
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const cartItem = cart.find(item => item.id === productId);
            if (cartItem) {
                updateCartQuantity(productId, cartItem.quantity - 1);
            }
        });
    });
    
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const cartItem = cart.find(item => item.id === productId);
            if (cartItem) {
                updateCartQuantity(productId, cartItem.quantity + 1);
            }
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            removeFromCart(productId);
        });
    });
    
    calculateCartTotals();
}
const cartSubtotal = document.getElementById('cart-subtotal');
const deliveryCharge = document.getElementById('delivery-charge');
const shippingCost = document.getElementById('shipping-cost');
const discountAmount = document.getElementById('discount-amount');
const cartTotal = document.getElementById('cart-total');
const couponCode = document.getElementById('coupon-code');
const applyCoupon = document.getElementById('apply-coupon');
// Calculate cart totals
const calculateCartTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = 50;
    const shipping = 30;
    
    let discount = 0;
    if (couponApplied) {
        discount = subtotal * discountRate;
    }
    
    const total = subtotal + delivery + shipping - discount;

    cartSubtotal.textContent = `BDT ${subtotal.toFixed(2)}`;
    deliveryCharge.textContent = `BDT ${delivery.toFixed(2)}`;
    shippingCost.textContent = `BDT ${shipping.toFixed(2)}`;
    discountAmount.textContent = `BDT -${discount.toFixed(2)}`;
    cartTotal.textContent = `BDT ${total.toFixed(2)}`;

    // Check if user has sufficient balance
    if (total > userBalance) {
        checkoutBtn.disabled = true;
        checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
        balanceWarning.classList.remove('hidden');
    } else {
        checkoutBtn.disabled = false;
        checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        balanceWarning.classList.add('hidden');
    }
}

// Apply coupon code
const applyCouponCode = () => {
    const code = couponCode.value.trim();
    
    if (code === 'IIUC2025') {
        couponApplied = true;
        discountRate = 0.1;
        showNotification('Coupon applied successfully! 10% discount added.');
        calculateCartTotals();
    } else {
        couponApplied = false;
        discountRate = 0;
        showNotification('Invalid coupon code. Please try again.', 'error');
        calculateCartTotals();
    }
}
const clearCartBtn = document.getElementById('clear-cart');
// Clear cart
const clearCart = () => {
    cart = [];
    couponApplied = false;
    discountRate = 0;
    couponCode.value = '';
    updateCart();
    showNotification('Cart cleared successfully!');
}
const checkoutBtn = document.getElementById('checkout');
// Checkout process
const checkout = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = 50;
    const shipping = 30;
    const discount = subtotal * discountRate;
    const total = subtotal + delivery + shipping - discount;
    
    if (total > userBalance) {
        showNotification('Insufficient balance! Please add more money to your account.', 'error');
        return;
    }
    
    userBalance -= total;
    updateBalanceDisplay();
    localStorage.setItem('smartShopBalance', userBalance.toString());
       cart = [];
    couponApplied = false;
    discountRate = 0;
    couponCode.value = '';
    updateCart();
    
    cartModal.classList.add('hidden');
    
    showNotification(`Order placed successfully! $${total.toFixed(2)} deducted from your balance.`, 'success');
}
const userBalanceDisplay = document.getElementById('user-balance');
const balanceDisplay = document.getElementById('balance-display');
const balanceWarning = document.getElementById('balance-warning');

const updateBalanceDisplay = () => {
    userBalanceDisplay.textContent = userBalance;
    balanceDisplay.textContent = userBalance;
}
const addMoneyBtn = document.getElementById('add-money');
// Add money to user balance
const addMoney = () => {
    userBalance += 1000;
    updateBalanceDisplay();
    
    localStorage.setItem('smartShopBalance', userBalance.toString());
    
    showNotification('1000 BDT added to your balance!', 'success');
}
const slides = document.querySelectorAll('.slide');
const bannerIndicators = document.querySelectorAll('.banner-indicator');
// Banner slide functions
const showSlide = (index) => {
    slides.forEach(slide => slide.classList.remove('active'));
    bannerIndicators.forEach(indicator => indicator.classList.remove('active'));
    
    slides[index].classList.add('active');
    bannerIndicators[index].classList.add('active');
    currentSlide = index;
}

const nextSlide = () => {
    let nextIndex = currentSlide + 1;
    if (nextIndex >= slides.length) nextIndex = 0;
    showSlide(nextIndex);
}

const prevSlide = () => {
    let prevIndex = currentSlide - 1;
    if (prevIndex < 0) prevIndex = slides.length - 1;
    showSlide(prevIndex);
}

const startBannerAutoSlide = () => {
    setInterval(nextSlide, 5000);
}

// Fetch reviews from API
const fetchReviews = () => {
    fetch('https://jsonplaceholder.typicode.com/comments')
        .then((response) => response.json())
        .then((comments) => {
            reviews = comments.slice(0, 10).map(comment => ({
                id: comment.id,
                name: comment.name,
                email: comment.email,
                body: comment.body,
                rating: Math.floor(Math.random() * 5) + 1, 
                date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString()
            }));
            displayReviews();
        })
        .catch((error) => {
            console.error('Error fetching reviews:', error);
            reviews = [
                
                {
                    id: 1,
                    name: "Shayed Hamim",
                    email: "shayed@gmail.com",
                    body: "Great products and fast delivery! I'm very satisfied with my purchase.",
                    rating: 5,
                    date: "2023-05-15"
                },
                {
                    id: 2,
                    name: "Ariyan Dey",
                    email: "ariyan@gmail.com",
                    body: "The quality of the products exceeded my expectations. Will definitely shop here again!",
                    rating: 4,
                    date: "2023-06-22"
                },
                {
                    id: 3,
                    name: "Mohammad Johan",
                    email: "johan@gmail.com",
                    body: "Good prices and excellent customer service. Highly recommended!",
                    rating: 5,
                    date: "2023-07-10"
                }
            ];
            displayReviews();
        });
}
const reviewSlider = document.getElementById('review-slider');
const reviewIndicators = document.querySelectorAll('.review-indicator');

// Display reviews in the slider
const displayReviews = () => {
    if (!reviewSlider) return;
    
    reviewSlider.innerHTML = '';
    
    reviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'min-w-full p-4';
        reviewElement.innerHTML = `
            <div class="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
                <div class="flex items-center mb-4">
                    <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span class="text-blue-600 font-bold">${review.name.charAt(0)}</span>
                    </div>
                    <div>
                        <h4 class="font-bold">${review.name}</h4>
                        <div class="flex text-yellow-400 text-sm">
                            ${generateStarRating(review.rating)}
                        </div>
                    </div>
                </div>
                <p class="text-gray-700 mb-4">"${review.body}"</p>
                <p class="text-gray-500 text-sm">${review.date}</p>
            </div>
        `;
        reviewSlider.appendChild(reviewElement);
    });
    
    showReview(0);
}

// Review navigation functions
const showReview = (index) => {
    if (!reviewSlider || reviews.length === 0) return;
    
    currentReviewIndex = index;
    reviewSlider.style.transform = `translateX(-${currentReviewIndex * 100}%)`;
    
    if (reviewIndicators.length > 0) {
        reviewIndicators.forEach((indicator, i) => {
            if (i === currentReviewIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
}
const reviewPrev = document.getElementById('review-prev');
const reviewNext = document.getElementById('review-next');
const nextBtn = document.getElementById('next-btn');
const nextReview = () => {
    let nextIndex = currentReviewIndex + 1;
    if (nextIndex >= reviews.length) nextIndex = 0;
    showReview(nextIndex);
}
const prevBtn = document.getElementById('prev-btn');
const prevReview = () => {
    let prevIndex = currentReviewIndex - 1;
    if (prevIndex < 0) prevIndex = reviews.length - 1;
    showReview(prevIndex);
}

const startReviewAutoSlide = () => {
    setInterval(nextReview, 6000);
}

const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const sortBy = document.getElementById('sort-by');
// Search and filter products
const filterProducts = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const sortOption = sortBy.value;
    
    let filteredProducts = products;

    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.title.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }

    if (category !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
            product.category === category
        );
    }
    
    if (sortOption === 'price-low') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'rating') {
        filteredProducts.sort((a, b) => b.rating.rate - a.rating.rate);
    }
    
    displayProducts(filteredProducts);
}
const contactForm = document.getElementById('contact-form');
const thankYouMessage = document.getElementById('thank-you-message');
// Contact form submission
const submitContactForm = (event) => {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    let valid = true;
    
    // Reset error messages
    document.getElementById('name-error').classList.add('hidden');
    document.getElementById('email-error').classList.add('hidden');
    document.getElementById('message-error').classList.add('hidden');
    
    if (!name.trim()) {
        document.getElementById('name-error').classList.remove('hidden');
        valid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById('email-error').classList.remove('hidden');
        valid = false;
    }
    
    if (!message.trim()) {
        document.getElementById('message-error').classList.remove('hidden');
        valid = false;
    }
    
    if (valid) {
        contactForm.classList.add('hidden');
        thankYouMessage.classList.remove('hidden');

        contactForm.reset();
        
        setTimeout(() => {
            thankYouMessage.classList.add('hidden');
            contactForm.classList.remove('hidden');
        }, 5000);
    }
}

// Show notification
const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 10);
    
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
const backToTopBtn = document.getElementById('back-to-top');
// Scroll to top
const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
const mobileMenuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const setupEventListeners = () => {
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active-link'));
            this.classList.add('active-link');
            
            if (window.innerWidth < 768) {
                mobileMenu.classList.add('hidden');
            }
        });
    });
    
    mobileMenuToggle.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
    });
    
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
    
    bannerIndicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => showSlide(index));
    });
    
    cartBtn.addEventListener('click', () => cartModal.classList.remove('hidden'));
    closeCart.addEventListener('click', () => cartModal.classList.add('hidden'));
    
    applyCoupon.addEventListener('click', applyCouponCode);
    
    clearCartBtn.addEventListener('click', clearCart);

    checkoutBtn.addEventListener('click', checkout);

    reviewPrev.addEventListener('click', prevReview);
    reviewNext.addEventListener('click', nextReview);
    if (reviewIndicators.length > 0) {
        reviewIndicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => showReview(index));
        });
    }
    
    // Search and filter
    searchInput.addEventListener('input', filterProducts);
    categoryFilter.addEventListener('change', filterProducts);
    sortBy.addEventListener('change', filterProducts)
    contactForm.addEventListener('submit', submitContactForm);
    addMoneyBtn.addEventListener('click', addMoney);
    backToTopBtn.addEventListener('click', scrollToTop);
    window.addEventListener('click', function(event) {
        if (event.target === cartModal) {
            cartModal.classList.add('hidden');
        }
    });
}