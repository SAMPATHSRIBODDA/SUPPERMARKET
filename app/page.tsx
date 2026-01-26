'use client';

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Lock, Phone, Facebook, Twitter, Search, Heart, ShoppingCart, ChevronDown, Menu, Star, MapPin, Package, Plus, Minus, Trash2, X, TrendingUp, Clock, CreditCard, Home, ArrowRight, Check, AlertCircle, Edit2 } from 'lucide-react';

interface User {
  mobile: string;
  name: string;
  password?: string;
  token?: string;
  id?: string;
}

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  oldPrice: number;
  stock: number;
  category: string;
  image: string;
  popular: boolean;
  deliveryTime: string;
}

interface CartItem extends Product {
  productId: number;
  quantity: number;
}

interface Address {
  id: string | number;
  title?: string;
  name?: string;
  address: string;
  city: string;
  state?: string;
  zip?: string;
  pincode?: string;
  phone?: string;
}

interface TimeSlot {
  id: string | number;
  time?: string;
  label?: string;
  available: boolean;
}

const PenumudiesApp = () => {
  // State Management
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [generatedOTP, setGeneratedOTP] = useState<string>('');
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showLoginSuccess, setShowLoginSuccess] = useState<boolean>(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editNameLoading, setEditNameLoading] = useState<boolean>(false);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('popular');
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [guestCart, setGuestCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState<boolean>(false);
  
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [guestWishlist, setGuestWishlist] = useState<Product[]>([]);
  const [showWishlist, setShowWishlist] = useState<boolean>(false);
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('COD');
  const [orders, setOrders] = useState<any[]>([]);
  const [showAddAddress, setShowAddAddress] = useState<boolean>(false);
  const [processingOrder, setProcessingOrder] = useState<boolean>(false);
  const [showAccountMenu, setShowAccountMenu] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const [showAdminLogoutConfirm, setShowAdminLogoutConfirm] = useState<boolean>(false);
  const [searchPage, setSearchPage] = useState<boolean>(false);
  const [searchPageQuery, setSearchPageQuery] = useState<string>('');
  const [showRazorpayModal, setShowRazorpayModal] = useState<boolean>(false);
  const [razorpayOrderId, setRazorpayOrderId] = useState<string>('');
  const [razorpayAmount, setRazorpayAmount] = useState<number>(0);
  const [showTracking, setShowTracking] = useState<boolean>(false);
  
  // Admin Panel State
  const [adminLoggedIn, setAdminLoggedIn] = useState<boolean>(false);
  const [adminToken, setAdminToken] = useState<string>('');
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminAuthError, setAdminAuthError] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editStock, setEditStock] = useState<string>('');
  const [adminLoading, setAdminLoading] = useState<boolean>(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState<boolean>(false);
  
  // Admin - Add Product Form
  const [showAddProductForm, setShowAddProductForm] = useState<boolean>(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    price: '',
    oldPrice: '',
    stock: '',
    category: 'Dairy',
    image: '',
    popular: false,
    deliveryTime: '30 mins',
    description: '',
  });
  
  // Admin - Order Management
  const [adminOrders, setAdminOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderStatus, setOrderStatus] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [deliveryPartner, setDeliveryPartner] = useState<string>('');
  const [deliveryPartnerPhone, setDeliveryPartnerPhone] = useState<string>('');
  const [currentLat, setCurrentLat] = useState<string>('');
  const [currentLng, setCurrentLng] = useState<string>('');
  const [trackingMessage, setTrackingMessage] = useState<string>('');
  const [adminActiveTab, setAdminActiveTab] = useState<string>('products');
  const [isEditingAdminOrder, setIsEditingAdminOrder] = useState<boolean>(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Auto-dismiss login success message after 2 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (showLoginSuccess) {
      timer = setTimeout(() => {
        setShowLoginSuccess(false);
      }, 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showLoginSuccess]);

  // Product Database
  const defaultProductDatabase: Product[] = [
    { id: 1, name: 'Amul Fresh Milk', brand: 'Amul', price: 62, oldPrice: 65, stock: 150, category: 'Dairy', image: '🥛', popular: true, deliveryTime: '8 mins' },
    { id: 2, name: 'Mother Dairy Milk 1L', brand: 'Mother Dairy', price: 60, oldPrice: 65, stock: 200, category: 'Dairy', image: '🥛', popular: true, deliveryTime: '8 mins' },
    { id: 3, name: 'Britannia Bread', brand: 'Britannia', price: 45, oldPrice: 50, stock: 80, category: 'Bakery', image: '🍞', popular: true, deliveryTime: '10 mins' },
    { id: 4, name: 'Amul Butter 500g', brand: 'Amul', price: 285, oldPrice: 300, stock: 45, category: 'Dairy', image: '🧈', popular: true, deliveryTime: '8 mins' },
    { id: 5, name: 'Cadbury Dairy Milk', brand: 'Cadbury', price: 50, oldPrice: 60, stock: 120, category: 'Snacks', image: '🍫', popular: true, deliveryTime: '12 mins' },
    { id: 6, name: 'Lays Chips Classic', brand: 'Lays', price: 20, oldPrice: 25, stock: 200, category: 'Snacks', image: '🍟', popular: true, deliveryTime: '12 mins' },
    { id: 7, name: 'Coca Cola 2L', brand: 'Coca Cola', price: 90, oldPrice: 100, stock: 100, category: 'Beverages', image: '🥤', popular: true, deliveryTime: '15 mins' },
    { id: 8, name: 'Maggi Noodles 12 Pack', brand: 'Maggi', price: 144, oldPrice: 160, stock: 90, category: 'Instant Food', image: '🍜', popular: true, deliveryTime: '10 mins' },
    { id: 9, name: 'Dettol Handwash', brand: 'Dettol', price: 95, oldPrice: 110, stock: 70, category: 'Personal Care', image: '🧼', popular: true, deliveryTime: '15 mins' },
    { id: 10, name: 'Organic Bananas 1kg', brand: 'Fresh', price: 55, oldPrice: 60, stock: 120, category: 'Fruits', image: '🍌', popular: true, deliveryTime: '8 mins' },
  ];
  
  const productDatabase = products.length > 0 ? products : defaultProductDatabase;

  const categories = ['All', 'Dairy', 'Bakery', 'Snacks', 'Beverages', 'Instant Food', 'Personal Care', 'Fruits'];

  const deliverySlots = [
    { id: 1, label: 'Today, 2:00 PM - 4:00 PM', available: true },
    { id: 2, label: 'Today, 4:00 PM - 6:00 PM', available: true },
    { id: 3, label: 'Today, 6:00 PM - 8:00 PM', available: true },
    { id: 4, label: 'Tomorrow, 8:00 AM - 10:00 AM', available: true },
  ];

  // Search System
  const performSearch = useCallback((query: string, searchProducts: Product[]) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase().trim();
    const typoMap: { [key: string]: string } = { 'mlk': 'milk', 'buter': 'butter', 'bred': 'bread' };
    const correctedQuery = typoMap[lowerQuery] || lowerQuery;
    
    const searchDatabase = searchProducts.length > 0 ? searchProducts : defaultProductDatabase;
    let results = searchDatabase.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(correctedQuery);
      const brandMatch = product.brand.toLowerCase().includes(correctedQuery);
      const categoryMatch = product.category.toLowerCase().includes(correctedQuery);
      return nameMatch || brandMatch || categoryMatch;
    });

    results.sort((a, b) => {
      if (a.stock > 0 && b.stock === 0) return -1;
      if (a.stock === 0 && b.stock > 0) return 1;
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return a.name.localeCompare(b.name);
    });

    setSearchResults(results);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery, products);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      setShowSearchDropdown(false);
      setSearchPageQuery(searchQuery);
      setSearchPage(true);
      setCurrentPage('search');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCart([]);
    setWishlist([]);
    setAddresses([]);
    setOrders([]);
    setShowLogoutConfirm(false);
    setShowAccountMenu(false);
    setCurrentPage('login');
    setSuccess('Logged out successfully');
    setTimeout(() => setSuccess(''), 2000);
  };

  // Edit Profile Handler - Inline Name Edit
  const handleSaveName = async () => {
    if (!editName.trim()) {
      setError('Name cannot be empty');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (editName.trim().length < 2) {
      setError('Name must be at least 2 characters');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (currentUser && editName.trim() === currentUser.name) {
      setIsEditingName(false);
      return;
    }
    
    setEditNameLoading(true);
    try {
      // Call backend API to update name
      const response = await fetch('/api/users/update-name', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify({
          name: editName.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update name');
      }

      const updatedUserData = await response.json();
      
      // Update current user
      if (currentUser) {
        const updatedUser = { ...currentUser, name: editName.trim() };
        setCurrentUser(updatedUser);
        
        // Update in users list
        const updatedUsers = users.map(u => u.mobile === currentUser.mobile ? updatedUser : u);
        setUsers(updatedUsers);
      }
      
      setSuccess('Name updated successfully!');
      setIsEditingName(false);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update name';
      setError(errorMsg);
      setTimeout(() => setError(''), 3000);
    } finally {
      setEditNameLoading(false);
    }
  };

  const handleCancelEditName = () => {
    if (currentUser) {
      setEditName(currentUser.name);
    }
    setIsEditingName(false);
  };

  // Load Products on Mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products/update');
        if (response.ok) {
          const data = await response.json();
          if (data.products && data.products.length > 0) {
            setProducts(data.products);
          }
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    };
    loadProducts();
  }, []);

  // Load Orders on Mount
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await fetch('/api/orders/manage');
        if (response.ok) {
          const data = await response.json();
          if (data.orders && data.orders.length > 0) {
            // Set both user orders and admin orders
            setOrders(data.orders);
            setAdminOrders(data.orders);
          }
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      }
    };
    loadOrders();
  }, []);

  // Real-time Orders Sync - Refresh every 5 seconds when admin panel is open
  useEffect(() => {
    if ((currentPage !== 'admin' && currentPage !== 'orders') || showTracking || isEditingAdminOrder || !adminLoggedIn || showAddProductForm) return; // Don't refresh while tracking modal, editing order, admin not logged in, or adding product

    const interval = setInterval(async () => {
      try {
        let url = '/api/orders/manage';
        // If user is viewing their orders, filter by their mobile
        if (currentPage === 'orders' && currentUser?.mobile) {
          url += `?userMobile=${currentUser.mobile}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.orders) {
            setOrders(data.orders);
            setAdminOrders(data.orders);
          }
        }
      } catch (err) {
        console.error('Failed to refresh orders:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentPage, currentUser ? currentUser.mobile : null, showTracking, isEditingAdminOrder, adminLoggedIn, showAddProductForm]);

  // Cart Management
  useEffect(() => {
    const savedGuestCart = localStorage.getItem('guestCart');
    if (savedGuestCart) {
      setGuestCart(JSON.parse(savedGuestCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('guestCart', JSON.stringify(guestCart));
  }, [guestCart]);

  const mergeGuestCart = useCallback(() => {
    if (currentUser && guestCart.length > 0) {
      const merged = [...cart];
      guestCart.forEach(guestItem => {
        const existing = merged.find(item => item.productId === guestItem.productId);
        if (existing) {
          existing.quantity += guestItem.quantity;
        } else {
          merged.push(guestItem);
        }
      });
      setCart(merged);
      setGuestCart([]);
    }
  }, [currentUser, guestCart, cart]);

  useEffect(() => {
    mergeGuestCart();
  }, [currentUser]);

  const addToCart = (product: Product) => {
    if (product.stock === 0) {
      setError('Product out of stock');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const activeCart = currentUser ? cart : guestCart;
    const setActiveCart = currentUser ? setCart : setGuestCart;
    const existingItem = activeCart.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        setError('Cannot add more than available stock');
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      setActiveCart(activeCart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setActiveCart([...activeCart, {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        stock: product.stock,
        id: product.id,
        brand: product.brand,
        oldPrice: product.oldPrice,
        category: product.category,
        popular: product.popular,
        deliveryTime: product.deliveryTime
      }]);
    }

    setSuccess(`${product.name} added to cart`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const updateCartQuantity = (productId: number, newQuantity: number) => {
    const activeCart = currentUser ? cart : guestCart;
    const setActiveCart = currentUser ? setCart : setGuestCart;
    const product = productDatabase.find(p => p.id === productId);

    if (!product) return;

    if (newQuantity === 0) {
      setActiveCart(activeCart.filter(item => item.productId !== productId));
    } else if (newQuantity <= product.stock) {
      setActiveCart(activeCart.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } else {
      setError('Cannot exceed available stock');
      setTimeout(() => setError(''), 3000);
    }
  };

  const removeFromCart = (productId: number) => {
    const activeCart = currentUser ? cart : guestCart;
    const setActiveCart = currentUser ? setCart : setGuestCart;
    setActiveCart(activeCart.filter(item => item.productId !== productId));
  };

  const calculateCartTotal = () => {
    const activeCart = currentUser ? cart : guestCart;
    const subtotal = activeCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const deliveryFee = subtotal > 500 ? 0 : 40;
    const total = subtotal + tax + deliveryFee;
    return { subtotal, tax, deliveryFee, total };
  };

  // Wishlist System
  const toggleWishlist = (product: Product) => {
    const activeWishlist = currentUser ? wishlist : guestWishlist;
    const setActiveWishlist = currentUser ? setWishlist : setGuestWishlist;
    const exists = activeWishlist.find(item => item.id === product.id);
    
    if (exists) {
      setActiveWishlist(activeWishlist.filter(item => item.id !== product.id));
      setSuccess(`${product.name} removed from wishlist`);
    } else {
      setActiveWishlist([...activeWishlist, product]);
      setSuccess(`${product.name} added to wishlist`);
    }
    setTimeout(() => setSuccess(''), 2000);
  };

  const isInWishlist = (productId: number) => {
    const activeWishlist = currentUser ? wishlist : guestWishlist;
    return activeWishlist.some(item => item.id === productId);
  };

  const moveToCart = (product: Product) => {
    addToCart(product);
    toggleWishlist(product);
  };

  // Authentication Pages
  const LoginPage = () => {
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
      setError('');
      if (!mobile || !password) {
        setError('Please fill in all fields');
        return;
      }

      try {
        const response = await fetch('/api/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobile,
            password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Login failed');
          return;
        }

        // Set current user with token for API calls
        setCurrentUser({
          ...data.user,
          password: password // Store for session
        });
        
        setShowLoginSuccess(true);
        setMobile('');
        setPassword('');
        
        // Navigate to home after success message appears
        setTimeout(() => setCurrentPage('home'), 1000);
      } catch (err) {
        setError('Login failed. Please try again.');
        console.error('Login error:', err);
      }
    };

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Welcome to Penumudies</h2>
          
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}

          <div className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="tel"
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-black text-black"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-black text-black"
              />
            </div>

            <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Log In
            </button>
          </div>

          <div className="mt-6 text-center space-y-3">
            <button onClick={() => setCurrentPage('signup')} className="text-blue-600 hover:text-blue-700 text-sm font-medium block w-full">
              Create an account
            </button>
            <div className="border-t pt-3">
              <button onClick={() => setCurrentPage('admin')} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition text-sm">
                🔐 Admin Panel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SignUpPage = () => {
    const [mobile, setMobile] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSignUp = async () => {
      setError('');
      if (!mobile || !name || !password || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }

      if (!/^\d{10}$/.test(mobile)) {
        setError('Please enter a valid 10-digit mobile number');
        return;
      }

      if (name.trim().length < 2) {
        setError('Name must be at least 2 characters');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      try {
        const response = await fetch('/api/users/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobile,
            name: name.trim(),
            password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Signup failed');
          return;
        }

        // Set current user with token for API calls
        setCurrentUser({
          ...data.user,
          password: password
        });

        setSuccess('Account created successfully!');
        setMobile('');
        setName('');
        setPassword('');
        setConfirmPassword('');
        
        // Navigate to home after success
        setTimeout(() => setCurrentPage('home'), 1500);
      } catch (err) {
        setError('Signup failed. Please try again.');
        console.error('Signup error:', err);
      }
    };

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
          <p className="text-gray-600 mb-8">Join Penumudies today</p>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}

          <div className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="tel" placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-black text-black" />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-black text-black" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-black text-black" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-black text-black" />
            </div>
            <button onClick={handleSignUp} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Create Account</button>
          </div>

          <div className="mt-6 text-center">
            <span className="text-gray-600 text-sm">Already have an account? </span>
            <button onClick={() => setCurrentPage('login')} className="text-blue-600 hover:text-blue-700 text-sm font-medium">Log In</button>
          </div>
        </div>
      </div>
    );
  };

  const OTPPage = () => {
    const [otp, setOtp] = useState('');
    const [timeLeft, setTimeLeft] = useState(300);

    useEffect(() => {
      const timer = setInterval(() => {
        if (otpExpiry !== null) {
          const remaining = Math.max(0, Math.floor((otpExpiry - Date.now()) / 1000));
          setTimeLeft(remaining);
          if (remaining === 0) clearInterval(timer);
        }
      }, 1000);
      return () => clearInterval(timer);
    }, [otpExpiry]);

    const handleVerifyOTP = () => {
      setError('');
      if (!otp) {
        setError('Please enter OTP');
        return;
      }

      if (!otpExpiry || Date.now() > otpExpiry) {
        setError('OTP expired');
        return;
      }
      if (otp !== generatedOTP) {
        setError('Invalid OTP');
        return;
      }

      if (pendingUser) {
        setUsers([...users, { ...pendingUser, id: Date.now().toString() } as User]);
      }
      setSuccess('Account created!');
      
      setTimeout(() => {
        setPendingUser(null);
        setCurrentPage('login');
      }, 2000);
    };

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Verify OTP</h2>
          <p className="text-gray-600 mb-8">Enter OTP sent to {pendingUser?.mobile}</p>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}

          <div className="space-y-6">
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-semibold tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-black text-black"
            />

            <div className="text-center">
              <p className="text-sm text-gray-600">Time: <span className="font-semibold text-blue-600">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span></p>
            </div>

            <button onClick={handleVerifyOTP} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Verify & Create Account
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Homepage
  const HomePage = () => {
    const activeCart = currentUser ? cart : guestCart;
    const activeWishlist = currentUser ? wishlist : guestWishlist;

    const searchDatabase = products.length > 0 ? products : defaultProductDatabase;
    const filteredProducts = searchDatabase.filter(product => {
      return selectedCategory === 'All' || product.category === selectedCategory;
    }).sort((a, b) => {
      if (sortBy === 'popular') return b.popular ? 1 : -1;
      if (sortBy === 'priceLow') return a.price - b.price;
      if (sortBy === 'priceHigh') return b.price - a.price;
      return 0;
    });

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold text-xl">P</div>
                <span className="font-bold text-xl text-gray-800 hidden sm:block">Penumudies</span>
              </div>

              <div className="flex-1 max-w-2xl relative" ref={searchDropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-500" size={20} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchDropdownOpen(true);
                    }}
                    onFocus={() => {
                      setSearchDropdownOpen(true);
                    }}
                    onBlur={(e) => {
                      // Delay closing to allow click on dropdown items
                      setTimeout(() => {
                        if (!searchDropdownRef.current?.contains(document.activeElement)) {
                          setSearchDropdownOpen(false);
                        }
                      }, 100);
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400 text-black transition"
                  />
                </div>

                {searchDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-xl max-h-96 overflow-y-auto z-50" onMouseDown={(e) => e.preventDefault()}>
                    {searchQuery === '' ? (
                      <div className="p-4">
                        <div className="text-sm text-gray-600 mb-2 font-semibold">Trending</div>
                        {['Milk', 'Bread', 'Butter'].map((trend, idx) => (
                          <button
                            key={idx}
                            onClick={() => { 
                              setSearchQuery(trend); 
                              setSearchPageQuery(trend);
                              setSearchDropdownOpen(false);
                              setCurrentPage('search');
                            }}
                            className="block w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-sm"
                          >
                            {trend}
                          </button>
                        ))}
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="p-2">
                        {searchResults.slice(0, 5).map(product => (
                          <div
                            key={product.id}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                            onClick={() => { 
                              setSearchDropdownOpen(false); 
                              setSearchPageQuery(searchQuery);
                              setCurrentPage('search');
                            }}
                          >
                            <div className="text-3xl">{product.image}</div>
                            <div className="flex-1">
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.brand}</div>
                            </div>
                            <div className="font-bold">₹{product.price}</div>
                          </div>
                        ))}
                        {searchResults.length > 5 && (
                          <button
                            onClick={() => {
                              setSearchDropdownOpen(false);
                              setSearchPageQuery(searchQuery);
                              setCurrentPage('search');
                            }}
                            className="w-full p-3 text-blue-600 hover:bg-blue-50 rounded-lg font-medium text-sm"
                          >
                            View all {searchResults.length} results
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500">No results found</div>
                    )}
                  </div>
                )}
              </div>

              <button onClick={() => setShowWishlist(true)} className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Heart size={24} className={activeWishlist.length > 0 ? 'fill-red-500 text-red-500' : 'text-gray-700'} />
                {activeWishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{activeWishlist.length}</span>
                )}
              </button>

              <button
                onClick={() => currentUser ? setCurrentPage('orders') : setError('Please login')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Package size={24} className="text-gray-700" />
              </button>

              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => {
                    if (currentUser) {
                      setShowAccountMenu(!showAccountMenu);
                    } else {
                      setCurrentPage('login');
                    }
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <User size={24} className="text-gray-700" />
                </button>

                {showAccountMenu && currentUser && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-xl z-50">
                    <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">{currentUser.name}</div>
                          <div className="text-sm text-gray-600">{currentUser.mobile}</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowAccountMenu(false);
                          setCurrentPage('profile');
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center gap-3"
                      >
                        <User size={18} className="text-gray-600" />
                        <span className="font-medium">My Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowAccountMenu(false);
                          setCurrentPage('orders');
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center gap-3"
                      >
                        <Package size={18} className="text-gray-600" />
                        <span className="font-medium">My Orders</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowAccountMenu(false);
                          setShowWishlist(true);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center gap-3"
                      >
                        <Heart size={18} className="text-gray-600" />
                        <span className="font-medium">My Wishlist</span>
                      </button>
                    </div>

                    <div className="border-t p-2">
                      <button
                        onClick={() => {
                          setShowAccountMenu(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 rounded-lg flex items-center gap-3 text-red-600"
                      >
                        <ArrowRight size={18} />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={() => setShowCart(true)} className="relative p-2 hover:bg-gray-100 rounded-lg">
                <ShoppingCart size={24} className="text-gray-700" />
                {activeCart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {activeCart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="border-t px-4 py-2">
            <div className="max-w-7xl mx-auto flex gap-4 overflow-x-auto">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${
                    selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition">
                <div className="relative p-4">
                  <div className="text-5xl text-center mb-2">{product.image}</div>
                  
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md"
                  >
                    <Heart size={18} className={isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                  </button>

                  {product.stock === 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      Out of Stock
                    </div>
                  )}

                  <div className="mb-2">
                    <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-gray-500">{product.brand}</p>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold">₹{product.price}</span>
                    <span className="text-xs text-gray-400 line-through">₹{product.oldPrice}</span>
                  </div>

                  {activeCart.find(item => item.productId === product.id) ? (
                    <div className="flex items-center justify-between border border-blue-600 rounded-lg">
                      <button
                        onClick={() => {
                          const item = activeCart.find(item => item.productId === product.id);
                          if (item) updateCartQuantity(product.id, item.quantity - 1);
                        }}
                        className="px-3 py-2 text-blue-600 hover:bg-blue-50"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-semibold text-blue-600">
                        {activeCart.find(item => item.productId === product.id)?.quantity}
                      </span>
                      <button
                        onClick={() => {
                          const item = activeCart.find(item => item.productId === product.id);
                          if (item) updateCartQuantity(product.id, item.quantity + 1);
                        }}
                        className="px-3 py-2 text-blue-600 hover:bg-blue-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className={`w-full py-2 rounded-lg font-semibold ${
                        product.stock === 0 ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Panel */}
        {showCart && (
          <div className="fixed inset-0 z-50" onClick={() => setShowCart(false)}>
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Cart ({activeCart.reduce((s, i) => s + i.quantity, 0)})</h2>
                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={24} />
                </button>
              </div>

              {activeCart.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">Cart is empty</p>
                  <button onClick={() => setShowCart(false)} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="flex-1 p-4 space-y-4">
                    {activeCart.map(item => (
                      <div key={item.productId} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                        <div className="text-3xl">{item.image}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{item.name}</h3>
                          <p className="text-xs text-gray-500">₹{item.price} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateCartQuantity(item.productId, item.quantity - 1)} className="p-1 bg-white border rounded">
                            <Minus size={14} />
                          </button>
                          <span className="font-semibold w-8 text-center">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.productId, item.quantity + 1)} className="p-1 bg-white border rounded">
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="font-bold">₹{item.price * item.quantity}</div>
                        <button onClick={() => removeFromCart(item.productId)} className="p-1 text-red-600">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t p-4 bg-white">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span className="font-semibold">₹{calculateCartTotal().subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax (5%)</span>
                        <span className="font-semibold">₹{calculateCartTotal().tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Delivery</span>
                        <span className="font-semibold">{calculateCartTotal().deliveryFee === 0 ? 'FREE' : `₹${calculateCartTotal().deliveryFee}`}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total</span>
                        <span className="text-blue-600">₹{calculateCartTotal().total.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (currentUser) {
                          setShowCart(false);
                          setCurrentPage('checkout');
                        } else {
                          setError('Please login to checkout');
                          setTimeout(() => setError(''), 3000);
                        }
                      }}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Wishlist Panel */}
        {showWishlist && (
          <div className="fixed inset-0 z-50" onClick={() => setShowWishlist(false)}>
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Wishlist ({activeWishlist.length})</h2>
                <button onClick={() => setShowWishlist(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={24} />
                </button>
              </div>

              {activeWishlist.length === 0 ? (
                <div className="p-8 text-center">
                  <Heart size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Wishlist is empty</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {activeWishlist.map(product => (
                    <div key={product.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <div className="text-3xl">{product.image}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold">₹{product.price}</span>
                          <span className="text-xs text-gray-400 line-through">₹{product.oldPrice}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => moveToCart(product)}
                          disabled={product.stock === 0}
                          className={`px-3 py-1 text-xs rounded font-semibold ${
                            product.stock === 0 ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 text-white'
                          }`}
                        >
                          Add to Cart
                        </button>
                        <button onClick={() => toggleWishlist(product)} className="px-3 py-1 text-xs border rounded">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            <div className="flex items-center gap-2">
              <Check size={20} />
              <span>{success}</span>
            </div>
          </div>
        )}

        {showLoginSuccess && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            <div className="flex items-center gap-2">
              <Check size={20} />
              <span>Login successful!</span>
            </div>
          </div>
        )}



        {/* Logout Confirmation */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 border-2 border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Logout</h2>
              <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  No, Stay
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Search Results Page
  const SearchPage = () => {
    const activeCart = currentUser ? cart : guestCart;
    const activeWishlist = currentUser ? wishlist : guestWishlist;

    React.useEffect(() => {
      setSearchQuery(searchPageQuery);
    }, [searchPageQuery]);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b px-4 py-4">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
            >
              ← Back to Home
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              Search Results for "{searchPageQuery}"
            </h1>
            <p className="text-gray-600 mt-1">{searchResults.length} products found</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {searchResults.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <Search size={64} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">No results found</h2>
              <p className="text-gray-600 mb-6">Try searching for something else</p>
              <button
                onClick={() => setCurrentPage('home')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Browse All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {searchResults.map(product => (
                <div key={product.id} className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition">
                  <div className="relative p-4">
                    <div className="text-5xl text-center mb-2">{product.image}</div>
                    
                    <button
                      onClick={() => toggleWishlist(product)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md"
                    >
                      <Heart size={18} className={isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                    </button>

                    {product.stock === 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Out of Stock
                      </div>
                    )}

                    <div className="mb-2">
                      <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                      <p className="text-xs text-gray-500">{product.brand}</p>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold">₹{product.price}</span>
                      <span className="text-xs text-gray-400 line-through">₹{product.oldPrice}</span>
                    </div>

                    {activeCart.find(item => item.productId === product.id) ? (
                      <div className="flex items-center justify-between border border-blue-600 rounded-lg">
                        <button
                          onClick={() => {
                            const item = activeCart.find(item => item.productId === product.id);
                            if (item) updateCartQuantity(product.id, item.quantity - 1);
                          }}
                          className="px-3 py-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-semibold text-blue-600">
                          {activeCart.find(item => item.productId === product.id)?.quantity}
                        </span>
                        <button
                          onClick={() => {
                            const item = activeCart.find(item => item.productId === product.id);
                            if (item) updateCartQuantity(product.id, item.quantity + 1);
                          }}
                          className="px-3 py-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className={`w-full py-2 rounded-lg font-semibold ${
                          product.stock === 0 ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Profile & Addresses Page
  const ProfilePage = () => {
    const [newAddress, setNewAddress] = useState({ name: '', phone: '', address: '', pincode: '', city: '' });

    // Fetch addresses from database when profile loads
    useEffect(() => {
      const fetchAddresses = async () => {
        if (!currentUser?.mobile) return;
        
        try {
          const response = await fetch(`/api/addresses?userMobile=${currentUser.mobile}`);
          if (response.ok) {
            const data = await response.json();
            if (data.addresses && Array.isArray(data.addresses)) {
              // Map database addresses to local format
              const mappedAddresses = data.addresses.map((addr: any) => ({
                id: addr._id,
                name: addr.name,
                phone: addr.phone,
                address: addr.address,
                city: addr.city,
                pincode: addr.pincode,
              }));
              setAddresses(mappedAddresses);
            }
          }
        } catch (err) {
          console.error('Error fetching addresses:', err);
        }
      };

      fetchAddresses();
    }, [currentUser?.mobile]);

    const handleAddAddress = async () => {
      if (!newAddress.name || !newAddress.phone || !newAddress.address || !newAddress.pincode || !newAddress.city) {
        setError('Please fill all fields');
        setTimeout(() => setError(''), 3000);
        return;
      }

      try {
        // Save address to database
        const response = await fetch('/api/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userMobile: currentUser?.mobile,
            name: newAddress.name,
            phone: newAddress.phone,
            address: newAddress.address,
            pincode: newAddress.pincode,
            city: newAddress.city,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save address');
        }

        const result = await response.json();
        
        // Add address to local state with the database ID
        const address: Address = { 
          ...newAddress, 
          id: result.address._id 
        };
        setAddresses([...addresses, address]);
        setNewAddress({ name: '', phone: '', address: '', pincode: '', city: '' });
        setSuccess('Address added successfully and saved to database');
        setTimeout(() => setSuccess(''), 2000);
      } catch (err) {
        console.error('Error saving address:', err);
        setError(err instanceof Error ? err.message : 'Failed to save address');
        setTimeout(() => setError(''), 3000);
      }
    };

    const handleDeleteAddress = async (addressId: string | number) => {
      try {
        const response = await fetch(`/api/addresses?addressId=${addressId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete address');
        }

        setAddresses(addresses.filter(addr => addr.id !== addressId));
        setSuccess('Address deleted');
        setTimeout(() => setSuccess(''), 2000);
      } catch (err) {
        console.error('Error deleting address:', err);
        setError('Failed to delete address');
        setTimeout(() => setError(''), 3000);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            ← Back to Home
          </button>

          <h1 className="text-3xl font-bold text-gray-800 mb-8">My Profile</h1>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-4xl mb-4">
                  {currentUser?.name.charAt(0).toUpperCase()}
                </div>
                
                {/* Inline Name Edit */}
                <div className="w-full">
                  {isEditingName ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        maxLength={50}
                        className="w-full px-3 py-2 border-2 border-blue-500 rounded-lg focus:outline-none text-center text-gray-800 font-bold text-lg"
                        placeholder="Enter name"
                      />
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={handleSaveName}
                          disabled={editNameLoading}
                          className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Check size={16} />
                          Save
                        </button>
                        <button
                          onClick={handleCancelEditName}
                          disabled={editNameLoading}
                          className="px-4 py-1.5 bg-gray-400 text-white rounded-lg hover:bg-gray-500 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <h2 className="text-xl font-bold text-gray-800">{currentUser?.name}</h2>
                      <button
                        onClick={() => {
                          if (currentUser) {
                            setEditName(currentUser.name);
                            setIsEditingName(true);
                          }
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit name"
                      >
                        <Edit2 size={18} className="text-gray-600 hover:text-blue-600" />
                      </button>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 mt-2">{currentUser?.mobile}</p>
              </div>
            </div>

            <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Account Information</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Mobile Number</label>
                      <div className="text-lg text-gray-800 font-semibold">{currentUser?.mobile}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Account Status</label>
                      <div className="text-lg text-green-600 font-semibold">✅ Active</div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">🚀 Quick Actions</h2>
                  <button
                    onClick={() => setCurrentPage('orders')}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
                  >
                    <Package size={20} />
                    View My Orders
                  </button>
                </div>

                <div className="border-t pt-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">📍 Note</h2>
                  <p className="text-gray-600 text-sm">
                    Addresses can be added during checkout. You can save multiple delivery addresses for quick checkout next time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Checkout Page
  const CheckoutPage = () => {
    const activeCart = currentUser ? cart : guestCart;
    const [newAddress, setNewAddress] = useState({ name: '', phone: '', address: '', pincode: '', city: '' });

    const handleAddAddress = () => {
      if (!newAddress.name || !newAddress.phone || !newAddress.address || !newAddress.pincode || !newAddress.city) {
        setError('Please fill all fields');
        setTimeout(() => setError(''), 3000);
        return;
      }

      const address = { ...newAddress, id: Date.now() };
      setAddresses([...addresses, address]);
      setSelectedAddress(address.id);
      setShowAddAddress(false);
      setNewAddress({ name: '', phone: '', address: '', pincode: '', city: '' });
      setSuccess('Address added');
      setTimeout(() => setSuccess(''), 2000);
    };

    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const handleInitiateRazorpayPayment = async () => {
      if (!selectedAddress) {
        setError('Select delivery address');
        setTimeout(() => setError(''), 3000);
        return;
      }

      if (!selectedSlot) {
        setError('Select delivery slot');
        setTimeout(() => setError(''), 3000);
        return;
      }

      if (paymentMethod !== 'UPI') {
        handlePlaceOrder();
        return;
      }

      setProcessingOrder(true);
      setError('');

      try {
        const total = calculateCartTotal().total;
        const orderId = `ORD${Date.now()}`;

        // Create order on server
        const response = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            orderId,
            customerName: currentUser?.name || 'Guest',
            customerEmail: 'customer@penumudies.com',
            customerPhone: currentUser?.mobile || '9999999999',
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create order');
        }

        if (!data.orderId) {
          console.error('Missing orderId in response:', data);
          throw new Error('Failed to create order - Invalid response');
        }

        // Load Razorpay script
        const res = await loadRazorpayScript();
        if (!res) {
          throw new Error('Razorpay script failed to load');
        }

        // Show Razorpay payment modal
        const options = {
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          order_id: data.orderId,
          handler: async (response: any) => {
            try {
              // Verify payment
              const verifyResponse = await fetch('/api/orders/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyResponse.json();

              if (verifyData.success) {
                // Create order in app
                const order = {
                  id: orderId,
                  userId: currentUser?.id,
                  items: activeCart,
                  address: addresses.find(a => a.id === selectedAddress),
                  slot: deliverySlots.find((s: any) => s.id === selectedSlot),
                  paymentMethod,
                  paymentId: response.razorpay_payment_id,
                  total: calculateCartTotal().total,
                  status: 'Paid',
                  createdAt: new Date().toISOString()
                };

                setOrders([...orders, order]);
                refreshAdminOrders(); // Refresh admin panel immediately with new order
                if (currentUser) {
                  setCart([]);
                } else {
                  setGuestCart([]);
                }

                setProcessingOrder(false);
                setSuccess('Payment successful! Order placed.');
                setTimeout(() => {
                  setSuccess('');
                  setCurrentPage('orders');
                }, 2000);
              } else {
                setError('Payment verification failed');
                setProcessingOrder(false);
              }
            } catch (err) {
              setError('Payment verification error');
              setProcessingOrder(false);
            }
          },
          modal: {
            ondismiss: () => {
              // User closed/cancelled the payment modal
              setProcessingOrder(false);
              setError('Payment cancelled by user');
              setTimeout(() => setError(''), 3000);
            },
          },
          prefill: {
            name: currentUser?.name || 'Guest',
            contact: currentUser?.mobile || '9999999999',
          },
          notes: {
            address: addresses.find(a => a.id === selectedAddress)?.address,
          },
          theme: {
            color: '#3b82f6',
          },
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
      } catch (error: any) {
        console.error('Payment error:', error);
        const errorMessage = error?.message || 'Failed to initiate payment';
        setError(errorMessage);
        setProcessingOrder(false);
      }
    };

    const handlePlaceOrder = async () => {
      if (!selectedAddress) {
        setError('Select delivery address');
        setTimeout(() => setError(''), 3000);
        return;
      }

      if (!selectedSlot) {
        setError('Select delivery slot');
        setTimeout(() => setError(''), 3000);
        return;
      }

      setProcessingOrder(true);

      try {
        const orderId = `ORD${Date.now()}`;
        const addressData = addresses.find(a => a.id === selectedAddress);
        const slotData = deliverySlots.find((s: any) => s.id === selectedSlot);

        // Prepare order data for API
        const orderPayload = {
          orderId,
          userId: currentUser?.id,
          userMobile: currentUser?.mobile || '',
          userName: currentUser?.name || 'Guest',
          items: activeCart.map(item => ({
            productId: item.id,
            name: item.name,
            brand: item.brand,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          address: {
            name: addressData?.name,
            phone: addressData?.phone,
            address: addressData?.address,
            city: addressData?.city,
            pincode: addressData?.pincode,
          },
          deliverySlot: {
            id: slotData?.id,
            label: slotData?.label,
          },
          paymentMethod: paymentMethod || 'COD',
          total: calculateCartTotal().total,
          status: 'Pending',
        };

        // Send order to database
        const response = await fetch('/api/orders/manage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderPayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to place order');
        }

        const result = await response.json();

        // Update local state and clear cart
        setOrders([...orders, result.order]);
        if (currentUser) {
          setCart([]);
        } else {
          setGuestCart([]);
        }

        setProcessingOrder(false);
        setSuccess('Order placed successfully!');
        
        // Refresh both user and admin orders
        await fetchOrders();
        
        setTimeout(() => {
          setSuccess('');
          setCurrentPage('orders');
        }, 1500);
      } catch (error) {
        console.error('Error placing order:', error);
        setError(error instanceof Error ? error.message : 'Failed to place order');
        setProcessingOrder(false);
        setTimeout(() => setError(''), 3000);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2 text-blue-600 mb-6">
            ← Back
          </button>

          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    📍 Delivery Address
                  </h2>
                  <button 
                    onClick={() => setShowAddAddress(!showAddAddress)} 
                    className="bg-blue-600 text-white text-sm px-3 py-1 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    {showAddAddress ? '✕ Cancel' : '+ Add New Address'}
                  </button>
                </div>

                {showAddAddress && (
                  <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 space-y-3">
                    <h3 className="font-semibold text-gray-800 mb-4">Add New Delivery Address</h3>
                    <input 
                      type="text" 
                      placeholder="Full Name *" 
                      value={newAddress.name} 
                      onChange={(e) => setNewAddress({...newAddress, name: e.target.value})} 
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-gray-400 text-black" 
                    />
                    <input 
                      type="tel" 
                      placeholder="Phone Number *" 
                      value={newAddress.phone} 
                      onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} 
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-gray-400 text-black" 
                    />
                    <input 
                      type="text" 
                      placeholder="Complete Address *" 
                      value={newAddress.address} 
                      onChange={(e) => setNewAddress({...newAddress, address: e.target.value})} 
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-gray-400 text-black" 
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        placeholder="Pincode *" 
                        value={newAddress.pincode} 
                        onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})} 
                        className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-gray-400 text-black" 
                      />
                      <input 
                        type="text" 
                        placeholder="City *" 
                        value={newAddress.city} 
                        onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} 
                        className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-gray-400 text-black" 
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={handleAddAddress} 
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
                      >
                        ✓ Save Address
                      </button>
                      <button 
                        onClick={() => setShowAddAddress(false)} 
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {addresses.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <MapPin size={40} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-600 font-medium">No addresses added yet</p>
                    <p className="text-gray-500 text-sm">Add your first delivery address above</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map(addr => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddress(addr.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                          selectedAddress === addr.id 
                            ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">
                            {selectedAddress === addr.id ? '✓' : '📍'}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">{addr.name}</div>
                            <div className="text-sm text-gray-600">{addr.phone}</div>
                            <div className="text-sm text-gray-600 mt-1">{addr.address}</div>
                            <div className="text-sm text-gray-600">{addr.city} - {addr.pincode}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Delivery Slot</h2>
                <div className="grid grid-cols-2 gap-3">
                  {deliverySlots.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => slot.available && setSelectedSlot(slot.id)}
                      disabled={!slot.available}
                      className={`p-3 border-2 rounded-lg text-sm ${
                        selectedSlot === slot.id ? 'border-blue-600 bg-blue-50' : slot.available ? 'border-gray-200' : 'border-gray-200 bg-gray-50 text-gray-400'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Payment</h2>
                <div className="space-y-3">
                  {['COD', 'UPI', 'Card'].map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`w-full p-4 border-2 rounded-lg text-left flex items-center justify-between ${
                        paymentMethod === method ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <span className="font-medium">{method}</span>
                      {method === 'UPI' && paymentMethod === method && (
                        <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full">Powered by Razorpay</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 h-fit sticky top-4">
              <h2 className="text-xl font-bold mb-4">Summary</h2>
              
              <div className="space-y-3 mb-4">
                {activeCart.map(item => (
                  <div key={item.productId} className="flex gap-2 text-sm">
                    <div className="text-xl">{item.image}</div>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-gray-500">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-semibold">₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{calculateCartTotal().subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>₹{calculateCartTotal().tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery</span>
                  <span>{calculateCartTotal().deliveryFee === 0 ? 'FREE' : `₹${calculateCartTotal().deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="text-blue-600">₹{calculateCartTotal().total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleInitiateRazorpayPayment}
                disabled={processingOrder}
                className={`w-full mt-6 py-3 rounded-lg font-semibold ${
                  processingOrder ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {processingOrder ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Orders Page
  const OrdersPage = () => {
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const getStatusColor = (status: string) => {
      const colors: { [key: string]: string } = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Confirmed': 'bg-blue-100 text-blue-800',
        'Processing': 'bg-purple-100 text-purple-800',
        'Packed': 'bg-indigo-100 text-indigo-800',
        'Shipped': 'bg-cyan-100 text-cyan-800',
        'Out for Delivery': 'bg-orange-100 text-orange-800',
        'Delivered': 'bg-green-100 text-green-800',
        'Cancelled': 'bg-red-100 text-red-800',
        'Paid': 'bg-green-100 text-green-800',
      };
      return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status: string) => {
      const icons: { [key: string]: string } = {
        'Pending': '⏳',
        'Confirmed': '✓',
        'Processing': '⚙️',
        'Packed': '📦',
        'Shipped': '🚚',
        'Out for Delivery': '📍',
        'Delivered': '🎉',
        'Cancelled': '❌',
        'Paid': '✓',
      };
      return icons[status] || '📋';
    };

    // Real-time Orders Sync - Refresh every 5 seconds to get admin's tracking updates
    useEffect(() => {
      if (!currentUser || currentPage !== 'orders' || showTracking) return; // Don't refresh while tracking is open

      const interval = setInterval(async () => {
        try {
          // Fetch only current user's orders
          const url = currentUser?.mobile ? `/api/orders/manage?userMobile=${currentUser.mobile}` : '/api/orders/manage';
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (data.orders) {
              // Update user's orders with latest data from DB
              setOrders(data.orders);
            }
          }
        } catch (err) {
          console.error('Failed to refresh user orders:', err);
        }
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }, [currentPage, currentUser, showTracking]);

    // Real-time tracking updates - refresh selected order while tracking modal is open
    useEffect(() => {
      if (!currentUser || currentPage !== 'orders' || !showTracking || !selectedOrder) return; // Only refresh while tracking modal is open

      const interval = setInterval(async () => {
        try {
          // Fetch only current user's orders to get the latest data
          const url = currentUser?.mobile ? `/api/orders/manage?userMobile=${currentUser.mobile}` : '/api/orders/manage';
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (data.orders) {
              // Find and update the selected order with latest data
              const updatedOrder = data.orders.find(o => o.orderId === selectedOrder.orderId);
              if (updatedOrder) {
                setSelectedOrder(updatedOrder);
              }
            }
          }
        } catch (err) {
          console.error('Failed to refresh tracking order:', err);
        }
      }, 3000); // Refresh every 3 seconds while tracking is open

      return () => clearInterval(interval);
    }, [currentPage, currentUser, showTracking]);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2 text-blue-600 mb-6 hover:text-blue-700">← Back</button>

          <h1 className="text-3xl font-bold mb-8">📦 My Orders</h1>

          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Package size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No orders yet</p>
              <button onClick={() => setCurrentPage('home')} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Orders List */}
              <div className="md:col-span-2 space-y-4">
                {orders.map(order => (
                  <div 
                    key={order.orderId || order.id}
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowTracking(true);
                    }}
                    className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition border-l-4 border-blue-600"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="font-bold text-lg">Order #{(order.orderId || order.id).slice(-8)}</div>
                        <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {order.status}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items.map((item: any) => (
                        <div key={item.productId} className="flex items-center gap-3 text-sm">
                          <div className="text-2xl">{item.image}</div>
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-gray-500">Qty: {item.quantity}</div>
                          </div>
                          <div className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Total</div>
                        <div className="text-lg font-bold text-blue-600">₹{order.total.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Payment</div>
                        <div className="font-medium">{order.paymentMethod}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Delivery</div>
                        <div className="font-medium">{order.address?.city || 'N/A'}</div>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                        setShowTracking(true);
                      }}
                      className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
                    >
                      📍 Track Order
                    </button>
                  </div>
                ))}
              </div>

              {/* Order Tracking Details */}
              {selectedOrder && showTracking && (
                <div className="bg-white rounded-lg shadow-lg p-6 h-fit sticky top-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">📍 Order Tracking</h2>
                    <button 
                      onClick={() => setShowTracking(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Order Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-mono font-bold"> {(selectedOrder.orderId || selectedOrder.id).slice(-8)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Status: </span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)} {selectedOrder.status}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Ordered:</span>
                      <span className="ml-1">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Items Packing Status */}
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-800 mb-3">📦 Items Status</h3>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item: CartItem, idx: number) => {
                        const packedStatuses = ['Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
                        const isPacked = packedStatuses.includes(selectedOrder.status);
                        
                        return (
                          <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                            <div className="text-xl">{item.image}</div>
                            <div className="flex-1 text-sm">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-gray-500">Qty: {item.quantity}</div>
                            </div>
                            <div className={`text-xl ${isPacked ? '✓' : '⏳'}`}>
                              {isPacked ? '✓' : '⏳'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  <div>
                    <h3 className="font-bold text-gray-800 mb-4">⏱️ Timeline</h3>
                    <div className="relative space-y-4">
                      {/* Status Points */}
                      {(['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered']).map((status, idx) => {
                        const isCompleted = (['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].indexOf(status) <= ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].indexOf(selectedOrder.status));
                        const isCurrent = status === selectedOrder.status;

                        return (
                          <div key={idx} className="flex gap-4">
                            {/* Timeline Dot */}
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                isCurrent 
                                  ? 'bg-blue-600 text-white scale-125' 
                                  : isCompleted 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-200 text-gray-400'
                              }`}>
                                {isCurrent ? '●' : isCompleted ? '✓' : '○'}
                              </div>
                              {idx < 5 && (
                                <div className={`w-0.5 h-12 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                              )}
                            </div>

                            {/* Status Label */}
                            <div className="flex-1 pt-1">
                              <div className={`font-medium ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                                {getStatusIcon(status)} {status}
                              </div>
                              {isCurrent && (
                                <div className="text-xs text-blue-600 font-semibold mt-1">Currently here →</div>
                              )}
                              {isCompleted && !isCurrent && (
                                <div className="text-xs text-gray-500">✓ Completed</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Estimated Delivery */}
                  <div className="mt-6 p-3 bg-green-50 border-l-4 border-green-500 rounded">
                    <div className="text-xs text-gray-600">Estimated Delivery</div>
                    <div className="font-bold text-green-700">
                      {selectedOrder.status === 'Delivered' ? '✓ Delivered' : '📦 2 days from now'}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="text-xs font-semibold text-gray-600 mb-2">📍 Delivery To</div>
                    <div className="text-sm text-gray-800">
                      {selectedOrder.address?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedOrder.address?.address}, {selectedOrder.address?.city} - {selectedOrder.address?.pincode}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node)) {
        // Only close if clicked outside search area completely
        const target = e.target as HTMLElement;
        if (!target.closest('input[placeholder="Search products..."]')) {
          setSearchDropdownOpen(false);
        }
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Admin Login Handler
  const handleAdminLogin = async () => {
    if (!adminUsername || !adminPassword) {
      setAdminAuthError('Please enter username and password');
      return;
    }

    setAdminLoading(true);
    setAdminAuthError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        setAdminAuthError(data.error || 'Login failed');
        return;
      }

      const data = await response.json();
      setAdminToken(data.token);
      setAdminLoggedIn(true);
      setAdminPassword('');
      setSuccess('Admin login successful');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setAdminAuthError('Failed to login');
    } finally {
      setAdminLoading(false);
    }
  };

  // Admin Logout Handler
  const handleAdminLogout = () => {
    setAdminLoggedIn(false);
    setAdminToken('');
    setAdminUsername('');
    setAdminPassword('');
    setEditingProduct(null);
    setShowAdminLogoutConfirm(false);
    setCurrentPage('login');
    setSuccess('Admin logged out successfully');
    setTimeout(() => setSuccess(''), 2000);
  };

  // Fetch Products Handler
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products/update');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  // Update Product Handler
  const handleUpdateProduct = async () => {
    if (!editingProduct || (!editPrice && !editStock)) {
      setError('Please enter price or stock value');
      return;
    }

    setAdminLoading(true);
    setError(''); // Clear any previous errors
    try {
      const updateData: any = { id: editingProduct.id || editingProduct._id };
      if (editPrice) updateData.price = parseFloat(editPrice);
      if (editStock) updateData.stock = parseInt(editStock);

      console.log('Sending update data:', updateData); // Debug log

      const response = await fetch('/api/products/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Update failed');
        setAdminLoading(false);
        return;
      }

      // Update products array with the new product data
      const updatedProducts = products.map(p => 
        (p.id === editingProduct.id || p._id === editingProduct._id) ? { ...data.product } : p
      );
      setProducts(updatedProducts);
      
      // Reset form
      setEditingProduct(null);
      setEditPrice('');
      setEditStock('');
      setSuccess('Product updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update product. Please try again.');
    } finally {
      setAdminLoading(false);
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async (productId: string | number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    setAdminLoading(true);
    setError(''); // Clear any previous errors
    try {
      const deleteData = { id: productId };
      console.log('Sending delete data:', deleteData); // Debug log

      const response = await fetch('/api/products/update', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deleteData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Delete failed');
        setAdminLoading(false);
        return;
      }

      // Remove product from the products array
      setProducts(products.filter(p => p.id !== productId && p._id !== productId));
      setSuccess('Product deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete product. Please try again.');
    } finally {
      setAdminLoading(false);
    }
  };

  // Add New Product Handler
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.brand || !newProduct.price || !newProduct.oldPrice || !newProduct.image) {
      setError('Please fill all required fields');
      return;
    }

    setAdminLoading(true);
    setError(''); // Clear any previous errors
    try {
      const response = await fetch('/api/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          brand: newProduct.brand,
          price: parseFloat(newProduct.price),
          oldPrice: parseFloat(newProduct.oldPrice),
          stock: parseInt(newProduct.stock) || 0,
          category: newProduct.category,
          image: newProduct.image,
          popular: newProduct.popular,
          deliveryTime: newProduct.deliveryTime,
          description: newProduct.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to add product');
        setAdminLoading(false);
        return;
      }

      // Add the new product to the products array
      setProducts([...products, { ...data.product }]);
      
      // Reset form
      setNewProduct({
        name: '',
        brand: '',
        price: '',
        oldPrice: '',
        stock: '',
        category: 'Dairy',
        image: '',
        popular: false,
        deliveryTime: '30 mins',
        description: '',
      });
      setShowAddProductForm(false);
      setSuccess('Product added successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Add product error:', err);
      setError('Failed to add product. Please try again.');
    } finally {
      setAdminLoading(false);
    }
  };

  // Fetch Orders Handler
  const fetchOrders = async () => {
    setAdminLoading(true);
    try {
      // Fetch all orders for admin
      const response = await fetch('/api/orders/manage');
      if (response.ok) {
        const data = await response.json();
        setAdminOrders(data.orders);
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setAdminLoading(false);
    }
  };

  // Update Order Status Handler
  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder || !orderStatus) {
      setError('Select order and status');
      return;
    }

    setAdminLoading(true);
    setError('');
    try {
      const response = await fetch('/api/orders/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.orderId,
          status: orderStatus,
          notes: orderNotes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Update failed');
        setAdminLoading(false);
        return;
      }

      // Update both admin orders and user orders arrays
      const updatedOrders = adminOrders.map(o => o.orderId === selectedOrder.orderId ? data.order : o);
      setAdminOrders(updatedOrders);
      setOrders(updatedOrders);
      
      // Update the selected order so users tracking see the change immediately
      setSelectedOrder(data.order);
      
      setSuccess('Order updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Order update error:', err);
      setError('Failed to update order');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleUpdateTracking = async () => {
    if (!selectedOrder) {
      setError('Select an order first');
      return;
    }

    setAdminLoading(true);
    setError('');
    try {
      const response = await fetch('/api/orders/tracking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.orderId,
          status: orderStatus || selectedOrder.status,
          location: currentLat && currentLng ? {
            latitude: parseFloat(currentLat),
            longitude: parseFloat(currentLng),
          } : undefined,
          deliveryPartner: deliveryPartner ? {
            name: deliveryPartner,
            phone: deliveryPartnerPhone,
          } : undefined,
          message: trackingMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Tracking update failed');
        setAdminLoading(false);
        return;
      }

      // Update both admin orders and user orders arrays
      const updatedOrders = adminOrders.map(o => o.orderId === selectedOrder.orderId ? data.order : o);
      setAdminOrders(updatedOrders);
      setOrders(updatedOrders);
      
      // Update the selected order so users tracking see the change immediately
      setSelectedOrder(data.order);
      
      setSuccess('Tracking updated successfully');
      setCurrentLat('');
      setCurrentLng('');
      setTrackingMessage('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Tracking update error:', err);
      setError('Failed to update tracking');
    } finally {
      setAdminLoading(false);
    }
  };

  // Refresh Admin Orders Function
  const refreshAdminOrders = async () => {
    try {
      const response = await fetch('/api/orders/manage');
      if (response.ok) {
        const data = await response.json();
        if (data.orders) {
          setAdminOrders(data.orders);
        }
      }
    } catch (err) {
      console.error('Failed to refresh orders:', err);
    }
  };

  // Admin Panel Component
  const AdminPanel = () => {
    if (!adminLoggedIn) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center mb-8">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">A</div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
              <p className="text-gray-600 mt-2">Manage products and inventory</p>
            </div>

            {adminAuthError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                <AlertCircle size={18} />
                {adminAuthError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Enter username: admin"
                  autoComplete="off"
                  maxLength={100}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-gray-700 text-gray-800 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter password: admin@123"
                  autoComplete="off"
                  maxLength={100}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-gray-700 text-gray-800 font-medium"
                />
              </div>
              <button
                onClick={handleAdminLogin}
                disabled={adminLoading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 font-medium"
              >
                {adminLoading ? 'Loading...' : 'Login'}
              </button>
              <button
                onClick={() => setCurrentPage('home')}
                className="w-full text-gray-600 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
              >
                Back to Home
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600"><span className="font-semibold">Demo Credentials:</span></p>
              <p className="text-sm text-gray-600">Username: <code className="bg-white px-2 py-1 rounded">admin</code></p>
              <p className="text-sm text-gray-600">Password: <code className="bg-white px-2 py-1 rounded">admin@123</code></p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold">A</div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, Admin</span>
              <button
                onClick={() => setShowAdminLogoutConfirm(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Admin Tabs */}
          <div className="max-w-7xl mx-auto px-4 border-t">
            <div className="flex gap-6">
              <button
                onClick={() => setAdminActiveTab('products')}
                className={`py-3 px-4 font-medium border-b-2 transition ${
                  adminActiveTab === 'products'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package size={20} />
                  Products
                </div>
              </button>
              <button
                onClick={() => {
                  setAdminActiveTab('orders');
                  fetchOrders();
                }}
                className={`py-3 px-4 font-medium border-b-2 transition ${
                  adminActiveTab === 'orders'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp size={20} />
                  Orders
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
              <Check size={18} />
              {success}
            </div>
          )}

          {/* Products Tab */}
          {adminActiveTab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Package size={24} />
                  Products Inventory
                </h2>

                <div className="flex gap-3 mb-4">
                  <button
                    onClick={fetchProducts}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Refresh Products
                  </button>
                  <button
                    onClick={() => setShowAddProductForm(!showAddProductForm)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Add New Product
                  </button>
                </div>

                {/* Add Product Form */}
                {showAddProductForm && (
                  <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Add New Product</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Product Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                        <input
                          type="text"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          placeholder="e.g., Fresh Milk"
                          autoComplete="off"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600 text-gray-800"
                        />
                      </div>

                      {/* Brand */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                        <input
                          type="text"
                          value={newProduct.brand}
                          onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                          placeholder="e.g., Amul"
                          autoComplete="off"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600 text-gray-800"
                        />
                      </div>

                      {/* Current Price */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Price (₹) *</label>
                        <input
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          placeholder="0"
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                        />
                      </div>

                      {/* Original Price */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (₹) *</label>
                        <input
                          type="number"
                          value={newProduct.oldPrice}
                          onChange={(e) => setNewProduct({ ...newProduct, oldPrice: e.target.value })}
                          placeholder="0"
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                        />
                      </div>

                      {/* Stock */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                        <input
                          type="number"
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                          placeholder="0"
                          min="0"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                        >
                          <option>Dairy</option>
                          <option>Bakery</option>
                          <option>Snacks</option>
                          <option>Beverages</option>
                          <option>Instant Food</option>
                          <option>Personal Care</option>
                          <option>Fruits</option>
                          <option>Vegetables</option>
                          <option>Other</option>
                        </select>
                      </div>

                      {/* Image (Emoji) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image / Emoji *</label>
                        <input
                          type="text"
                          value={newProduct.image}
                          onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                          placeholder="e.g., 🥛 or paste emoji"
                          maxLength={2}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-2xl text-center text-gray-800"
                        />
                      </div>

                      {/* Delivery Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time</label>
                        <input
                          type="text"
                          value={newProduct.deliveryTime}
                          onChange={(e) => setNewProduct({ ...newProduct, deliveryTime: e.target.value })}
                          placeholder="e.g., 30 mins"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600 text-gray-800"
                        />
                      </div>

                      {/* Description */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          placeholder="Product description..."
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600 text-gray-800 resize-none"
                        />
                      </div>

                      {/* Popular Checkbox */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newProduct.popular}
                          onChange={(e) => setNewProduct({ ...newProduct, popular: e.target.checked })}
                          id="popular"
                          className="h-4 w-4"
                        />
                        <label htmlFor="popular" className="text-sm text-gray-700">Mark as Popular</label>
                      </div>
                    </div>

                    {/* Form Buttons */}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={handleAddProduct}
                        disabled={adminLoading}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 font-medium flex items-center justify-center gap-2"
                      >
                        <Plus size={18} />
                        {adminLoading ? 'Adding...' : 'Add Product'}
                      </button>
                      <button
                        onClick={() => setShowAddProductForm(false)}
                        className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Product</th>
                        <th className="text-left py-3 px-2">Price</th>
                        <th className="text-left py-3 px-2">Stock</th>
                        <th className="text-left py-3 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(products.length > 0 ? products : defaultProductDatabase).map(product => (
                        <tr key={product.id || product._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{product.image}</span>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.brand}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2">₹{product.price}</td>
                          <td className="py-3 px-2">
                            <span className={`px-3 py-1 rounded-full text-sm ${product.stock > 20 ? 'bg-green-100 text-green-700' : product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            {/* Only allow editing real database products (with string IDs), not demo products (with numeric IDs) */}
                            {typeof product.id === 'string' ? (
                              <button
                                onClick={() => {
                                  setEditingProduct(product);
                                  setEditPrice(product.price.toString());
                                  setEditStock(product.stock.toString());
                                }}
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                              >
                                <Edit2 size={16} />
                                Edit
                              </button>
                            ) : (
                              <span className="text-gray-400 text-sm">Demo</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Edit Product Form */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  {editingProduct ? 'Edit Product' : 'Select a Product'}
                </h3>

                {editingProduct ? (
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <div className="text-6xl mb-2">{editingProduct.image}</div>
                      <h4 className="font-semibold text-gray-800">{editingProduct.name}</h4>
                      <p className="text-sm text-gray-500">{editingProduct.brand}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                      <input
                        type="number"
                        value={editStock}
                        onChange={(e) => setEditStock(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateProduct}
                        disabled={adminLoading}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 font-medium"
                      >
                        {adminLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteProduct(editingProduct.id)}
                      disabled={adminLoading}
                      className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400"
                    >
                      Delete Product
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Click Edit on any product to manage it</p>
                )}
              </div>
            </div>
          </div>
          )}

          {/* Orders Tab */}
          {adminActiveTab === 'orders' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Orders List */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Package size={24} />
                    Order Management
                  </h2>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2">Order ID</th>
                          <th className="text-left py-3 px-2">Customer</th>
                          <th className="text-left py-3 px-2">Amount</th>
                          <th className="text-left py-3 px-2">Status</th>
                          <th className="text-left py-3 px-2">Payment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminOrders.length > 0 ? (
                          adminOrders.map(order => (
                            <tr key={order._id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => {
                              setSelectedOrder(order);
                              setOrderStatus(order.status);
                              setOrderNotes(order.notes || '');
                              setIsEditingAdminOrder(true);
                            }}>
                              <td className="py-3 px-2 font-mono text-xs">{order.orderId?.slice(0, 8)}...</td>
                              <td className="py-3 px-2">
                                <div className="font-medium">{order.userName}</div>
                                <div className="text-xs text-gray-500">{order.userMobile}</div>
                              </td>
                              <td className="py-3 px-2 font-semibold">₹{order.total?.toFixed(2)}</td>
                              <td className="py-3 px-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                  order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                  order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                  order.status === 'Paid' ? 'bg-purple-100 text-purple-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-xs">
                                {order.paymentMethod === 'UPI' ? '🔵 UPI' : order.paymentMethod === 'COD' ? '💵 COD' : '💳 Card'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-gray-500">No orders found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div>
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-24 max-h-screen overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      {selectedOrder ? 'Order Management' : 'Select an Order'}
                    </h3>
                    {selectedOrder && (
                      <button
                        onClick={() => {
                          setSelectedOrder(null);
                          setIsEditingAdminOrder(false);
                        }}
                        className="text-gray-500 hover:text-gray-700 text-xl"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {selectedOrder ? (
                    <div className="space-y-4">
                      <div className="pb-4 border-b">
                        <div className="text-xs text-gray-600">Order ID</div>
                        <div className="font-mono text-sm">{selectedOrder.orderId}</div>
                      </div>

                      <div className="pb-4 border-b">
                        <div className="text-xs text-gray-600">Customer</div>
                        <div className="font-medium">{selectedOrder.userName}</div>
                        <div className="text-sm text-gray-600">{selectedOrder.userMobile}</div>
                      </div>

                      <div className="pb-4 border-b">
                        <div className="text-xs text-gray-600">Amount</div>
                        <div className="text-xl font-bold text-blue-600">₹{selectedOrder.total?.toFixed(2)}</div>
                      </div>

                      {/* Delivery Address Section */}
                      {selectedOrder.address && (
                        <div className="pb-4 border-b bg-orange-50 p-3 rounded-lg">
                          <div className="text-xs text-orange-600 font-bold mb-2">📍 Delivery Address</div>
                          <div className="space-y-1 text-sm">
                            {selectedOrder.address.name && (
                              <div className="font-medium text-gray-800">{selectedOrder.address.name}</div>
                            )}
                            <div className="text-gray-700">{selectedOrder.address.address}</div>
                            <div className="text-gray-600">
                              {selectedOrder.address.city}
                              {selectedOrder.address.pincode && `, ${selectedOrder.address.pincode}`}
                            </div>
                            {selectedOrder.address.phone && (
                              <div className="text-gray-600">📱 {selectedOrder.address.phone}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Delivery Slot Section */}
                      {selectedOrder.deliverySlot && (
                        <div className="pb-4 border-b bg-purple-50 p-3 rounded-lg">
                          <div className="text-xs text-purple-600 font-bold mb-2">⏰ Delivery Slot</div>
                          <div className="text-sm font-medium text-gray-800">{selectedOrder.deliverySlot.label}</div>
                        </div>
                      )}

                      {/* Payment Method Section */}
                      <div className="pb-4 border-b">
                        <div className="text-xs text-gray-600">Payment Method</div>
                        <div className="font-medium">{selectedOrder.paymentMethod || 'COD'}</div>
                      </div>

                      {/* Order Status Section */}
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="text-sm font-bold text-blue-900 mb-3">📋 Order Status</h4>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                          <select
                            value={orderStatus}
                            onChange={(e) => setOrderStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          >
                            <option value="">-- Select Status --</option>
                            <option>Pending</option>
                            <option>Confirmed</option>
                            <option>Processing</option>
                            <option>Packed</option>
                            <option>Shipped</option>
                            <option>Out for Delivery</option>
                            <option>Delivered</option>
                            <option>Cancelled</option>
                          </select>
                        </div>

                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                          <textarea
                            value={orderNotes}
                            onChange={(e) => setOrderNotes(e.target.value)}
                            placeholder="Add order notes..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                            rows={2}
                          />
                        </div>

                        <button
                          onClick={handleUpdateOrderStatus}
                          disabled={adminLoading}
                          className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 font-medium text-sm transition"
                        >
                          {adminLoading ? 'Updating...' : '✓ Update Status'}
                        </button>
                      </div>

                      {/* Tracking & Location Section */}
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="text-sm font-bold text-green-900 mb-3">📍 Live Tracking</h4>
                        
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Partner</label>
                          <input
                            type="text"
                            value={deliveryPartner}
                            onChange={(e) => setDeliveryPartner(e.target.value)}
                            placeholder="e.g., Rajesh Kumar"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-sm"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Partner Phone</label>
                          <input
                            type="tel"
                            value={deliveryPartnerPhone}
                            onChange={(e) => setDeliveryPartnerPhone(e.target.value)}
                            placeholder="e.g., 9876543210"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                            <input
                              type="text"
                              value={currentLat}
                              onChange={(e) => setCurrentLat(e.target.value)}
                              placeholder="e.g., 17.3850"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                            <input
                              type="text"
                              value={currentLng}
                              onChange={(e) => setCurrentLng(e.target.value)}
                              placeholder="e.g., 78.4867"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-sm"
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Message</label>
                          <textarea
                            value={trackingMessage}
                            onChange={(e) => setTrackingMessage(e.target.value)}
                            placeholder="e.g., Package picked up from warehouse / Out for delivery"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-sm"
                            rows={2}
                          />
                        </div>

                        <button
                          onClick={handleUpdateTracking}
                          disabled={adminLoading}
                          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 font-medium text-sm transition"
                        >
                          {adminLoading ? 'Updating...' : '🚚 Update Tracking'}
                        </button>
                      </div>

                      {/* Current Tracking Status */}
                      {selectedOrder.trackingUpdates && selectedOrder.trackingUpdates.length > 0 && (
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <h4 className="text-sm font-bold text-purple-900 mb-3">📊 All Tracking Updates ({selectedOrder.trackingUpdates.length})</h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {selectedOrder.trackingUpdates.map((update: any, idx: number) => (
                              <div key={idx} className="text-xs bg-white p-3 rounded border border-purple-100 hover:shadow-sm transition">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="font-bold text-purple-700">{update.status}</div>
                                    <div className="text-gray-600 mt-1">{update.message}</div>
                                    {update.location && (update.location.latitude || update.location.longitude) && (
                                      <div className="text-gray-500 mt-1">
                                        📍 {update.location.latitude}, {update.location.longitude}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-gray-400 text-xs whitespace-nowrap ml-2">
                                    {new Date(update.timestamp).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Current Delivery Status */}
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="text-sm font-bold text-green-900 mb-3">🚚 Current Status</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="text-xs text-green-600 font-medium">Current Status</div>
                            <div className="text-lg font-bold text-green-700">{selectedOrder.status}</div>
                          </div>

                          {selectedOrder.deliveryPartner && (
                            <div className="border-t border-green-200 pt-3">
                              <div className="text-xs text-green-600 font-medium">Delivery Partner</div>
                              <div className="text-sm font-medium">{selectedOrder.deliveryPartner.name}</div>
                              <div className="text-xs text-gray-600">📞 {selectedOrder.deliveryPartner.phone}</div>
                            </div>
                          )}

                          {selectedOrder.currentLocation && (
                            <div className="border-t border-green-200 pt-3">
                              <div className="text-xs text-green-600 font-medium">Current Location</div>
                              <div className="text-xs text-gray-600">
                                📍 {selectedOrder.currentLocation.latitude}, {selectedOrder.currentLocation.longitude}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Updated: {new Date(selectedOrder.currentLocation.updatedAt).toLocaleString()}
                              </div>
                            </div>
                          )}

                          {selectedOrder.estimatedDeliveryDate && (
                            <div className="border-t border-green-200 pt-3">
                              <div className="text-xs text-green-600 font-medium">Estimated Delivery</div>
                              <div className="text-sm">{new Date(selectedOrder.estimatedDeliveryDate).toLocaleDateString()}</div>
                            </div>
                          )}

                          {selectedOrder.actualDeliveryDate && (
                            <div className="border-t border-green-200 pt-3">
                              <div className="text-xs text-green-600 font-medium">Delivered On</div>
                              <div className="text-sm font-medium text-green-700">
                                ✅ {new Date(selectedOrder.actualDeliveryDate).toLocaleString()}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Click on any order to manage it</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {currentPage === 'login' && <LoginPage />}
      {currentPage === 'signup' && <SignUpPage />}
      {currentPage === 'otp' && <OTPPage />}
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'search' && <SearchPage />}
      {currentPage === 'profile' && <ProfilePage />}
      {currentPage === 'checkout' && <CheckoutPage />}
      {currentPage === 'orders' && <OrdersPage />}
      {currentPage === 'admin' && <AdminPanel />}

      {/* Admin Logout Confirmation */}
      {showAdminLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 border-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Admin Logout</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to logout from admin panel?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAdminLogoutConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                No, Stay
              </button>
              <button
                onClick={handleAdminLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PenumudiesApp;
                