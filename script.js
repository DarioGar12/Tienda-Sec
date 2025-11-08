class EcommerceApp {
    constructor() {
        this.products = [
            { 
                id: 1, 
                name: "Laptop Gaming HP Victus", 
                price: 3499.99, 
                originalPrice: 3999.99,
                image: "💻", 
                category: "Tecnología",
                description: "Laptop gaming con procesador Intel i7, 16GB RAM, RTX 3060",
                specs: ["Intel i7-12700H", "16GB RAM DDR5", "1TB SSD NVMe", "RTX 3060 6GB"],
                stock: 8,
                rating: 4.8,
                reviews: 124
            },
            { 
                id: 2, 
                name: "iPhone 15 Pro Max", 
                price: 4899.99, 
                originalPrice: 5299.99,
                image: "📱", 
                category: "Tecnología",
                description: "iPhone 15 Pro Max 256GB, cámara triple 48MP",
                specs: ["Pantalla 6.7\"", "256GB almacenamiento", "Cámara 48MP", "iOS 17"],
                stock: 15,
                rating: 4.9,
                reviews: 89
            },
            { 
                id: 3, 
                name: "Sony WH-1000XM5", 
                price: 1299.99, 
                originalPrice: 1499.99,
                image: "🎧", 
                category: "Audio",
                description: "Auriculares inalámbricos con cancelación de ruido líder",
                specs: ["30h batería", "Cancelación activa", "Carga rápida", "Asistente voz"],
                stock: 22,
                rating: 4.7,
                reviews: 203
            },
            { 
                id: 4, 
                name: "iPad Air 5ta Gen", 
                price: 2799.99, 
                originalPrice: 2999.99,
                image: "📟", 
                category: "Tecnología",
                description: "iPad Air con chip M1, pantalla Liquid Retina",
                specs: ["Chip M1", "10.9\" Liquid Retina", "64GB", "Compatibilidad Apple Pencil"],
                stock: 12,
                rating: 4.6,
                reviews: 67
            },
            { 
                id: 5, 
                name: "Samsung Galaxy Watch 6", 
                price: 899.99, 
                originalPrice: 999.99,
                image: "⌚", 
                category: "Tecnología",
                description: "Smartwatch con monitorización avanzada de salud",
                specs: ["Pantalla AMOLED", "Monitoreo sueño", "GPS integrado", "Resistente agua"],
                stock: 18,
                rating: 4.5,
                reviews: 156
            },
            { 
                id: 6, 
                name: "Canon EOS R6 Mark II", 
                price: 7599.99, 
                originalPrice: 8499.99,
                image: "📷", 
                category: "Fotografía",
                description: "Cámara mirrorless profesional full frame",
                specs: ["Sensor 24.2MP", "4K 60fps", "Estabilización 8 stops", "Wi-Fi/Bluetooth"],
                stock: 5,
                rating: 4.9,
                reviews: 42
            },
            { 
                id: 7, 
                name: "MacBook Air M2", 
                price: 5199.99, 
                originalPrice: 5699.99,
                image: "💻", 
                category: "Tecnología",
                description: "MacBook Air con chip M2, diseño ultradelgado",
                specs: ["Chip M2", "13.6\" Liquid Retina", "8GB RAM", "256GB SSD"],
                stock: 10,
                rating: 4.8,
                reviews: 178
            },
            { 
                id: 8, 
                name: "PlayStation 5", 
                price: 2399.99, 
                originalPrice: 2699.99,
                image: "🎮", 
                category: "Gaming",
                description: "Consola de última generación con SSD ultrarrápido",
                specs: ["SSD 825GB", "4K 120fps", "Ray Tracing", "Compatibilidad PS4"],
                stock: 7,
                rating: 4.7,
                reviews: 312
            }
        ];
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupPage();
            this.setupEventListeners();
            this.updateUI();
        });
    }

    setupPage() {
        const path = window.location.pathname;
        if (path.includes('index.html') || path === '/') this.loadProducts();
        if (path.includes('cart.html')) this.loadCart();
        if (path.includes('checkout.html')) {
            if (!this.isAuthenticated()) return this.redirectToLogin();
            this.loadOrderSummary();
        }
        if (path.includes('confirmation.html')) this.loadConfirmation();
    }

    setupEventListeners() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());

        this.setupAuthForms();
        this.setupPaymentForm();

        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (!this.isAuthenticated()) this.redirectToLogin();
                else window.location.href = 'checkout.html';
            });
        }
    }

    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    generateToken(user) {
        const tokenData = { userId: user.id, email: user.email, exp: Date.now() + 24*60*60*1000 };
        return btoa(JSON.stringify(tokenData));
    }

    validateToken(token) {
        try {
            const data = JSON.parse(atob(token));
            return data.exp > Date.now();
        } catch { return false; }
    }

    isAuthenticated() {
        const token = sessionStorage.getItem('authToken');
        return token && this.validateToken(token);
    }

    getCurrentUser() {
        const token = sessionStorage.getItem('authToken');
        if (!token) return null;
        try {
            const tokenData = JSON.parse(atob(token));
            const users = JSON.parse(localStorage.getItem('secure_users') || '[]');
            return users.find(u => u.id === tokenData.userId) || null;
        } catch { return null; }
    }

    async register({ name, email, password }) {
        if (!this.validateEmail(email)) throw new Error('Email inválido');
        if (!this.validatePassword(password)) throw new Error('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');

        const users = JSON.parse(localStorage.getItem('secure_users') || '[]');
        if (users.find(u => u.email === email)) throw new Error('El usuario ya existe');

        const passwordHash = await this.hashPassword(password);
        const newUser = { id: Date.now(), name, email, password: passwordHash, createdAt: new Date().toISOString() };
        users.push(newUser);
        localStorage.setItem('secure_users', JSON.stringify(users));

        const token = this.generateToken(newUser);
        sessionStorage.setItem('authToken', token);
        return newUser;
    }

    async login(email, password) {
        const users = JSON.parse(localStorage.getItem('secure_users') || '[]');
        const user = users.find(u => u.email === email);
        if (!user) throw new Error('Usuario no encontrado');

        const passwordHash = await this.hashPassword(password);
        if (user.password !== passwordHash) throw new Error('Contraseña incorrecta');

        const token = this.generateToken(user);
        sessionStorage.setItem('authToken', token);
        return user;
    }

    logout() {
        sessionStorage.removeItem('authToken');
        this.updateUI();
        this.redirectToHome();
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    validatePassword(password) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
    }

    // Métodos de carrito
    loadProducts() {
        const container = document.getElementById('products-container');
        if (!container) return;

        container.innerHTML = this.products.map(product => `
            <div class="product-card">
                <div class="product-badge">${product.stock < 10 ? 'Últimas unidades' : 'En stock'}</div>
                <div class="product-image">${product.image}</div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-category">${product.category}</p>
                    <p class="product-description">${product.description}</p>
                    <div class="product-specs">
                        ${product.specs.map(spec => `<span class="spec-tag">${spec}</span>`).join('')}
                    </div>
                    <div class="product-rating">
                        <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5-Math.floor(product.rating))}</span>
                        <span class="rating-value">${product.rating}</span>
                        <span class="reviews">(${product.reviews})</span>
                    </div>
                    <div class="price-container">
                        <p class="product-price">S/${product.price.toFixed(2)}</p>
                        ${product.originalPrice ? `<p class="product-original-price">S/${product.originalPrice.toFixed(2)}</p>` : ''}
                    </div>
                    <button class="add-to-cart" data-id="${product.id}">Agregar al Carrito</button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', e => this.addToCart(parseInt(e.target.dataset.id)));
        });
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        let cart = JSON.parse(localStorage.getItem('secure_cart') || '[]');
        const existing = cart.find(i => i.id === productId);
        if (existing) {
            if (existing.quantity >= product.stock) {
                this.showNotification(`No hay suficiente stock de ${product.name}`, 'error');
                return;
            }
            existing.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1, addedAt: new Date().toISOString() });
        }

        localStorage.setItem('secure_cart', JSON.stringify(cart));
        this.updateCartCount();
        this.showNotification(`${product.name} agregado al carrito`, 'success');
    }

    // Métodos de checkout y orden
    loadCart() {
        const container = document.getElementById('cart-container');
        if (!container) return;

        const cart = JSON.parse(localStorage.getItem('secure_cart') || '[]');
        if (!cart.length) {
            container.innerHTML = `<div class="empty-cart">
                <p>Tu carrito está vacío</p>
                <a href="index.html" class="back-to-shop">Volver a la tienda</a>
            </div>`;
            return;
        }

        container.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">${item.image}</div>
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>S/${item.price.toFixed(2)} c/u</p>
                    <p class="stock-info">Stock disponible: ${item.stock}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                    <button class="remove-btn" data-id="${item.id}">Eliminar</button>
                </div>
                <div class="cart-item-total">S/${(item.price*item.quantity).toFixed(2)}</div>
            </div>
        `).join('');

        this.updateCartTotal();

        container.querySelectorAll('.quantity-btn.minus').forEach(btn =>
            btn.addEventListener('click', e => this.updateCartItemQuantity(parseInt(e.target.dataset.id), -1))
        );
        container.querySelectorAll('.quantity-btn.plus').forEach(btn =>
            btn.addEventListener('click', e => this.updateCartItemQuantity(parseInt(e.target.dataset.id), 1))
        );
        container.querySelectorAll('.remove-btn').forEach(btn =>
            btn.addEventListener('click', e => this.removeFromCart(parseInt(e.target.dataset.id)))
        );
    }

    updateCartItemQuantity(id, change) {
        let cart = JSON.parse(localStorage.getItem('secure_cart') || '[]');
        const index = cart.findIndex(i => i.id === id);
        if (index !== -1) {
            const product = this.products.find(p => p.id === id);
            const newQuantity = cart[index].quantity + change;

            if (newQuantity <= 0) {
                cart.splice(index, 1);
            } else if (newQuantity > product.stock) {
                this.showNotification(`No hay suficiente stock de ${product.name}`, 'error');
                return;
            } else {
                cart[index].quantity = newQuantity;
            }

            localStorage.setItem('secure_cart', JSON.stringify(cart));
            this.loadCart();
            this.updateCartCount();
        }
    }

    removeFromCart(id) {
        let cart = JSON.parse(localStorage.getItem('secure_cart') || '[]');
        cart = cart.filter(i => i.id !== id);
        localStorage.setItem('secure_cart', JSON.stringify(cart));
        this.loadCart();
        this.updateCartCount();
    }

    updateCartTotal() {
        const cart = JSON.parse(localStorage.getItem('secure_cart') || '[]');
        const total = cart.reduce((sum,i)=>sum+(i.price*i.quantity),0);
        const totalEl = document.getElementById('total-price');
        if (totalEl) totalEl.textContent = total.toFixed(2);
    }

    updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('secure_cart') || '[]');
        const totalItems = cart.reduce((sum,i)=>sum+i.quantity,0);
        document.querySelectorAll('#cart-count').forEach(el => el.textContent = totalItems);
    }

    loadOrderSummary() {
        const container = document.getElementById('order-items');
        if (!container) return;

        const cart = JSON.parse(localStorage.getItem('secure_cart') || '[]');
        const subtotal = cart.reduce((sum,i)=>sum+i.price*i.quantity,0);
        const shipping = subtotal > 1000 ? 0 : 25;
        const total = subtotal + shipping;

        container.innerHTML = cart.map(item => `
            <div class="order-item">
                <span>${item.name} x${item.quantity}</span>
                <span>S/${(item.price*item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        container.innerHTML += `
            <div class="order-summary-line">
                <span>Subtotal:</span>
                <span>S/${subtotal.toFixed(2)}</span>
            </div>
            <div class="order-summary-line">
                <span>Envío:</span>
                <span>${shipping === 0 ? 'GRATIS' : `S/${shipping.toFixed(2)}`}</span>
            </div>
            <div class="order-summary-line total">
                <span>Total:</span>
                <span>S/${total.toFixed(2)}</span>
            </div>
        `;

        document.getElementById('order-total').textContent = total.toFixed(2);
    }

    setupPaymentForm() {
        const form = document.getElementById('payment-form');
        if (!form) return;
        form.addEventListener('submit', e => { e.preventDefault(); this.processPayment(); });

        const cardNumber = document.getElementById('card-number');
        if (cardNumber) cardNumber.addEventListener('input', e => this.formatCardNumber(e.target));

        const expiryDate = document.getElementById('expiry-date');
        if (expiryDate) expiryDate.addEventListener('input', e => this.formatExpiryDate(e.target));
    }

    formatCardNumber(input) {
        let value = input.value.replace(/\s+/g,'').replace(/[^0-9]/g,'');
        let parts = [];
        for(let i=0;i<value.length;i+=4) parts.push(value.substring(i,i+4));
        input.value = parts.join(' ');
    }

    formatExpiryDate(input) {
        let value = input.value.replace(/\D/g,'');
        if (value.length >= 2) {
            value = value.substring(0,2) + '/' + value.substring(2,4);
        }
        input.value = value;
    }

    async processPayment() {
        if (!this.isAuthenticated()) return this.redirectToLogin();

        const cart = JSON.parse(localStorage.getItem('secure_cart') || '[]');
        if (!cart.length) return this.showNotification('El carrito está vacío','error');

        const cardNumber = document.getElementById('card-number').value.replace(/\s/g,'');
        const expiryDate = document.getElementById('expiry-date').value;
        const cvv = document.getElementById('cvv').value;
        const cardName = document.getElementById('card-name').value;

        if (!this.validateCardNumber(cardNumber)) return this.showNotification('Número de tarjeta inválido','error');
        if (!this.validateExpiryDate(expiryDate)) return this.showNotification('Fecha de vencimiento inválida','error');
        if (!this.validateCVV(cvv)) return this.showNotification('CVV inválido','error');
        if (!cardName.trim()) return this.showNotification('Ingrese el nombre en la tarjeta','error');

        this.showNotification('Procesando pago...', 'info');

        setTimeout(()=> this.completeOrder(),2000);
    }

    completeOrder() {
        const cart = JSON.parse(localStorage.getItem('secure_cart') || '[]');
        const subtotal = cart.reduce((sum,i)=>sum+i.price*i.quantity,0);
        const shipping = subtotal > 1000 ? 0 : 25;
        const total = subtotal + shipping;

        const order = {
            id: 'ORD'+Date.now(),
            items: cart,
            subtotal: subtotal,
            shipping: shipping,
            total: total,
            user: this.getCurrentUser(),
            date: new Date().toISOString(),
            status: 'completed'
        };
        localStorage.removeItem('secure_cart');

        const orders = JSON.parse(localStorage.getItem('secure_orders') || '[]');
        orders.push(order);
        localStorage.setItem('secure_orders', JSON.stringify(orders));
        sessionStorage.setItem('lastOrder', JSON.stringify(order));

        window.location.href = 'confirmation.html';
    }

    loadConfirmation() {
        const order = JSON.parse(sessionStorage.getItem('lastOrder')||'{}');
        if (order.id) {
            document.getElementById('order-number').textContent = order.id;
            const deliveryDate = new Date();
            deliveryDate.setDate(deliveryDate.getDate()+7);
            document.getElementById('delivery-date').textContent = deliveryDate.toLocaleDateString('es-ES');

            document.getElementById('order-summary').innerHTML = `
                <div class="confirmation-summary">
                    <h3>Resumen de tu pedido</h3>
                    ${order.items.map(item => `
                        <div class="confirmation-item">
                            <span>${item.name} x${item.quantity}</span>
                            <span>S/${(item.price*item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                    <div class="confirmation-total">
                        <span>Total: S/${order.total.toFixed(2)}</span>
                    </div>
                </div>
            `;
        }
    }

    setupAuthForms() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (loginForm) loginForm.addEventListener('submit', async e => { e.preventDefault(); await this.handleLogin(); });
        if (registerForm) registerForm.addEventListener('submit', async e => { e.preventDefault(); await this.handleRegister(); });
    }

    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const messageDiv = document.getElementById('login-message');
        try { 
            await this.login(email,password);
            messageDiv.textContent='Inicio de sesión exitoso'; 
            messageDiv.className='message success';
            setTimeout(()=>window.location.href='index.html',1500);
        } catch(err){ 
            messageDiv.textContent=err.message; 
            messageDiv.className='message error'; 
        }
    }

    async handleRegister() {
        const name=document.getElementById('name').value;
        const email=document.getElementById('email').value;
        const password=document.getElementById('password').value;
        const confirmPassword=document.getElementById('confirm-password').value;
        const messageDiv=document.getElementById('register-message');
        try {
            if(password!==confirmPassword) throw new Error('Las contraseñas no coinciden');
            await this.register({name,email,password});
            messageDiv.textContent='Registro exitoso'; 
            messageDiv.className='message success';
            setTimeout(()=>window.location.href='index.html',1500);
        } catch(err){ 
            messageDiv.textContent=err.message; 
            messageDiv.className='message error'; 
        }
    }

    updateUI() {
        const user=this.getCurrentUser();
        const loginLink=document.getElementById('login-link');
        const registerLink=document.getElementById('register-link');
        const welcome=document.getElementById('welcome-message');
        const logout=document.getElementById('logout-btn');

        if(user){
            if(loginLink) loginLink.style.display='none';
            if(registerLink) registerLink.style.display='none';
            if(welcome){ welcome.textContent=`Hola, ${user.name}`; welcome.style.display='inline'; }
            if(logout) logout.style.display='inline-block';
        } else {
            if(loginLink) loginLink.style.display='inline';
            if(registerLink) registerLink.style.display='inline';
            if(welcome) welcome.style.display='none';
            if(logout) logout.style.display='none';
        }
        this.updateCartCount();
    }

    showNotification(msg,type='info'){
        const notification=document.createElement('div');
        notification.className=`notification ${type}`;
        notification.textContent=msg;
        notification.style.cssText=`position:fixed;top:20px;right:20px;padding:15px 20px;border-radius:5px;color:white;font-weight:bold;z-index:1000;background:${type==='success'?'#27ae60':type==='error'?'#e74c3c':'#3498db'};`;
        document.body.appendChild(notification);
        setTimeout(()=>notification.remove(),3000);
    }

    redirectToLogin(){ 
        this.showNotification('Debes iniciar sesión para continuar','error'); 
        setTimeout(()=>window.location.href='login.html',1500);
    }
    
    redirectToHome(){ 
        window.location.href='index.html';
    }
    
    validateCardNumber(num){ 
        return /^\d{13,19}$/.test(num); 
    }
    
    validateExpiryDate(date){
        if (!/^\d{2}\/\d{2}$/.test(date)) return false;
        const [month, year] = date.split('/').map(Number);
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;

        if (month < 1 || month > 12) return false;
        if (year < currentYear || (year === currentYear && month < currentMonth)) return false;

        return true;
    }
    
    validateCVV(cvv){ 
        return /^\d{3,4}$/.test(cvv); 
    }
}

const ecommerce = new EcommerceApp();
