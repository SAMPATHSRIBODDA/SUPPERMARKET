'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Lock, Phone, Facebook, Twitter, Search, Heart, ShoppingCart, ChevronDown, Menu, Star, MapPin, Package, Plus, Minus, Trash2, X, TrendingUp, Clock, CreditCard, Home, ArrowRight, Check, AlertCircle } from 'lucide-react';

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

const PenumudiesApp = () => {
  // State Management
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<any | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [generatedOTP, setGeneratedOTP] = useState<string>('');
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isAdminLogin, setIsAdminLogin] = useState<boolean>(false);
  
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
  
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('COD');
  const [orders, setOrders] = useState<any[]>([]);
  const [showAddAddress, setShowAddAddress] = useState<boolean>(false);
  const [processingOrder, setProcessingOrder] = useState<boolean>(false);
  const [showAccountMenu, setShowAccountMenu] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const [searchPageQuery, setSearchPageQuery] = useState<string>('');
  const [adminOrders, setAdminOrders] = useState<any[]>([]);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>('');
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch orders from database
  const fetchOrders = useCallback(async () => {
    if (!currentUser || !currentUser.mobile) return;

    try {
      const response = await fetch(`/api/orders/manage?userMobile=${currentUser.mobile}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }, [currentUser]);

  // Fetch admin orders
  const fetchAdminOrders = useCallback(async () => {
    try {
      let url = '/api/admin/orders';
      if (selectedOrderStatus) {
        url += `?status=${selectedOrderStatus}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAdminOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching admin orders:', error);
    }
  }, [selectedOrderStatus]);

  // Poll orders when on orders or profile page
  useEffect(() => {
    if (currentPage === 'orders' || currentPage === 'profile') {
      fetchOrders();
      
      // Set up polling every 3 seconds
      pollIntervalRef.current = setInterval(() => {
        fetchOrders();
      }, 3000);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [currentPage, fetchOrders]);

  // Poll admin orders when on admin-orders page
  useEffect(() => {
    if (currentPage === 'admin-orders') {
      fetchAdminOrders();
      
      // Set up polling every 3 seconds
      const intervalId = setInterval(() => {
        fetchAdminOrders();
      }, 3000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [currentPage, fetchAdminOrders]);

  // Load products from database on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products/update');
        if (response.ok) {
          const data = await response.json();
          if (data.products && data.products.length > 0) {
            console.log('✓ Loaded', data.products.length, 'products from database');
            setDbProducts(data.products);
          }
        }
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    loadProducts();
  }, []);

  // Use database products if available, otherwise fall back to empty array
  const productDatabase = dbProducts.length > 0 ? dbProducts : [];

  const categories = ['All', 'Dairy', 'Bakery', 'Snacks', 'Beverages', 'Instant Food', 'Personal Care', 'Fruits'];

  const deliverySlots = [
    { id: 1, label: 'Today, 2:00 PM - 4:00 PM', available: true },
    { id: 2, label: 'Today, 4:00 PM - 6:00 PM', available: true },
    { id: 3, label: 'Today, 6:00 PM - 8:00 PM', available: false },
    { id: 4, label: 'Tomorrow, 8:00 AM - 10:00 AM', available: true },
  ];

  // Search System
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase().trim();
    const typoMap: { [key: string]: string } = { 'mlk': 'milk', 'buter': 'butter', 'bred': 'bread' };
    const correctedQuery = typoMap[lowerQuery] || lowerQuery;
    
    let results = productDatabase.filter(product => {
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
  }, [productDatabase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(updated);
      setShowSearchDropdown(false);
      setSearchPageQuery(searchQuery);
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
  }, [mergeGuestCart]);

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
    const [adminUsername, setAdminUsername] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    const handleUserLogin = () => {
      setError('');
      if (!mobile || !password) {
        setError('Please fill in all fields');
        return;
      }

      const user = users.find(u => u.mobile === mobile);
      if (!user) {
        setError('Account not found. Please create an account first.');
        return;
      }

      if (user.password !== password) {
        setError('Invalid credentials.');
        return;
      }

      setCurrentUser(user);
      setSuccess('Login successful!');
      setTimeout(() => setCurrentPage('home'), 1500);
    };

    const handleAdminLogin = () => {
      setError('');
      if (!adminUsername || !adminPassword) {
        setError('Please fill in all fields');
        return;
      }

      // Admin credentials validation
      if (adminUsername === 'sampath_111' && adminPassword === 'Siddu@22') {
        setCurrentAdmin({ username: adminUsername });
        setSuccess('Admin login successful!');
        setTimeout(() => setCurrentPage('admin-dashboard'), 1500);
      } else {
        setError('Invalid username or password');
      }
    };

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {!isAdminLogin ? (
            <div className="bg-white rounded-lg shadow-lg p-8">
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
                    onKeyPress={(e) => e.key === 'Enter' && handleUserLogin()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUserLogin()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button onClick={handleUserLogin} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                  Log In
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <button onClick={() => setCurrentPage('signup')} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Create an account
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsAdminLogin(true);
                    setError('');
                    setSuccess('');
                  }} 
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Admin Login
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Admin Login</h2>
              
              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
              {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}

              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Username"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="password"
                    placeholder="Password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <button onClick={handleAdminLogin} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
                  Admin Login
                </button>
              </div>

              <div className="mt-6 text-center">
                <button 
                  onClick={() => {
                    setIsAdminLogin(false);
                    setError('');
                    setSuccess('');
                    setAdminUsername('');
                    setAdminPassword('');
                  }} 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Back to User Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const SignUpPage = () => {
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSignUp = () => {
      setError('');
      if (!mobile || !password || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }

      if (!/^\d{10}$/.test(mobile)) {
        setError('Please enter a valid 10-digit mobile number');
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

      if (users.find(u => u.mobile === mobile)) {
        setError('Mobile number already registered');
        return;
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOTP(otp);
      setOtpExpiry(Date.now() + 5 * 60 * 1000);
      setPendingUser({ mobile, password, name: `User${mobile.slice(-4)}` });

      setSuccess(`OTP sent: ${otp}`);
      setTimeout(() => setCurrentPage('otp'), 2000);
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
              <input type="tel" placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={handleSignUp} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Send OTP</button>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-semibold tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
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

    const filteredProducts = productDatabase.filter(product => {
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

              <div className="flex-1 max-w-2xl relative">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-500" size={20} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSearchDropdown(true)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                {showSearchDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
                    {searchQuery === '' ? (
                      <div className="p-4">
                        <div className="text-sm text-gray-600 mb-2 font-semibold">Trending</div>
                        {['Milk', 'Bread', 'Butter'].map((trend, idx) => (
                          <button
                            key={idx}
                            onClick={() => { 
                              setSearchQuery(trend); 
                              setSearchPageQuery(trend);
                              performSearch(trend); 
                              setShowSearchDropdown(false);
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
                              setShowSearchDropdown(false); 
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
                              setShowSearchDropdown(false);
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
                  onClick={() => setShowAccountMenu(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <User size={24} className="text-gray-700" />
                </button>

                {showAccountMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-xl z-50">
                    {currentUser ? (
                      <>
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
                      </>
                    ) : (
                      <>
                        <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-blue-50">
                          <div className="font-bold text-gray-800 text-lg">Account Menu</div>
                        </div>

                        <div className="p-3 space-y-2">
                          <button
                            onClick={() => {
                              setShowAccountMenu(false);
                              setCurrentPage('login');
                              window.scrollTo(0, 0);
                            }}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 justify-center"
                          >
                            <Lock size={18} />
                            Login
                          </button>

                          <button
                            onClick={() => {
                              setShowAccountMenu(false);
                              setCurrentPage('signup');
                            }}
                            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2 justify-center"
                          >
                            <User size={18} />
                            Sign Up
                          </button>

                          <button
                            onClick={() => {
                              setShowAccountMenu(false);
                              setIsAdminLogin(true);
                              setCurrentPage('login');
                              window.scrollTo(0, 0);
                            }}
                            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2 justify-center"
                          >
                            <Lock size={18} />
                            Admin Panel
                          </button>

                          <button
                            onClick={() => {
                              setShowAccountMenu(false);
                              setCurrentUser(null);
                              setCurrentPage('home');
                              setSuccess('Welcome! You are browsing as a guest.');
                              setTimeout(() => setSuccess(''), 2000);
                            }}
                            className="w-full bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-700 transition flex items-center gap-2 justify-center"
                          >
                            <User size={18} />
                            Guest Account
                          </button>
                        </div>
                      </>
                    )}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowCart(false)}>
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowWishlist(false)}>
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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

        {/* Logout Confirmation */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
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
      performSearch(searchPageQuery);
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

    const handleAddAddress = () => {
      if (!newAddress.name || !newAddress.phone || !newAddress.address || !newAddress.pincode || !newAddress.city) {
        setError('Please fill all fields');
        setTimeout(() => setError(''), 3000);
        return;
      }

      const address = { ...newAddress, id: Date.now() };
      setAddresses([...addresses, address]);
      setNewAddress({ name: '', phone: '', address: '', pincode: '', city: '' });
      setSuccess('Address added successfully');
      setTimeout(() => setSuccess(''), 2000);
    };

    const handleDeleteAddress = (addressId: any) => {
      setAddresses(addresses.filter(addr => addr.id !== addressId));
      setSuccess('Address deleted');
      setTimeout(() => setSuccess(''), 2000);
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
                <h2 className="text-xl font-bold text-gray-800">{currentUser?.name}</h2>
                <p className="text-gray-600">{currentUser?.mobile}</p>
              </div>
            </div>

            <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">My Addresses</h2>
                <button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  + Add New Address
                </button>
              </div>

              {showAddAddress && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Complete Address"
                    value={newAddress.address}
                    onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleAddAddress}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Save Address
                  </button>
                </div>
              )}

              {addresses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>No addresses saved yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <div key={addr.id} className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{addr.name}</div>
                          <div className="text-sm text-gray-600">{addr.phone}</div>
                          <div className="text-sm text-gray-600 mt-1">{addr.address}</div>
                          <div className="text-sm text-gray-600">{addr.city} - {addr.pincode}</div>
                        </div>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Package size={24} />
              Recent Orders
            </h2>

            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No orders yet</p>
                <button
                  onClick={() => setCurrentPage('home')}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {orders.slice(0, 5).map(order => (
                  <div key={order._id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-bold">Order #{order.orderId}</div>
                        <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        order.status === 'Shipped' || order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </div>
                      <div className="text-lg font-bold text-blue-600">₹{order.total.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {orders.length > 5 && (
              <button
                onClick={() => setCurrentPage('orders')}
                className="w-full mt-4 text-blue-600 hover:text-blue-700 font-medium py-2"
              >
                View All Orders →
              </button>
            )}
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
        const slotData = deliverySlots.find(s => s.id === selectedSlot);
        const cartTotal = calculateCartTotal().total;

        // Prepare order data for API
        const orderPayload = {
          orderId,
          userId: currentUser?.id,
          userMobile: currentUser?.mobile,
          userName: currentUser?.name,
          items: activeCart.map(item => ({
            productId: item.productId,
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
          paymentMethod,
          total: cartTotal,
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
          throw new Error('Failed to place order');
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
        setTimeout(() => {
          setSuccess('');
          setCurrentPage('orders');
          // Fetch updated orders
          fetchOrders();
        }, 1500);
      } catch (error) {
        console.error('Error placing order:', error);
        setError('Failed to place order. Please try again.');
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
                  <h2 className="text-xl font-bold">Delivery Address</h2>
                  <button onClick={() => setShowAddAddress(!showAddAddress)} className="text-blue-600 text-sm">+ Add New</button>
                </div>

                {showAddAddress && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                    <input type="text" placeholder="Name" value={newAddress.name} onChange={(e) => setNewAddress({...newAddress, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                    <input type="tel" placeholder="Phone" value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                    <input type="text" placeholder="Address" value={newAddress.address} onChange={(e) => setNewAddress({...newAddress, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Pincode" value={newAddress.pincode} onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})} className="px-3 py-2 border rounded-lg" />
                      <input type="text" placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className="px-3 py-2 border rounded-lg" />
                    </div>
                    <button onClick={handleAddAddress} className="w-full bg-blue-600 text-white py-2 rounded-lg">Save Address</button>
                  </div>
                )}

                {addresses.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No addresses. Add one.</p>
                ) : (
                  <div className="space-y-3">
                    {addresses.map(addr => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddress(addr.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer ${
                          selectedAddress === addr.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="font-semibold">{addr.name}</div>
                        <div className="text-sm text-gray-600">{addr.phone}</div>
                        <div className="text-sm text-gray-600">{addr.address}, {addr.city} - {addr.pincode}</div>
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
                      className={`w-full p-4 border-2 rounded-lg text-left ${
                        paymentMethod === method ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      {method}
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
                onClick={handlePlaceOrder}
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
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2 text-blue-600 mb-6">← Back</button>

          <h1 className="text-3xl font-bold mb-8">My Orders</h1>

          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Package size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No orders yet</p>
              <button onClick={() => setCurrentPage('home')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-bold text-lg">Order #{order.id}</div>
                      <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                      {order.status}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item: CartItem) => (
                      <div key={item.productId} className="flex items-center gap-3 text-sm">
                        <div className="text-2xl">{item.image}</div>
                        <div className="flex-1">{item.name} x {item.quantity}</div>
                        <div className="font-semibold">₹{item.price * item.quantity}</div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 flex justify-between">
                    <div className="text-sm">
                      <div className="font-semibold">Address:</div>
                      <div className="text-gray-600">{order.address.address}, {order.address.city}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Total</div>
                      <div className="text-2xl font-bold text-blue-600">₹{order.total.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Admin Orders Page
  const AdminOrdersPage = () => {
    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
      try {
        const response = await fetch('/api/admin/orders', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            status: newStatus,
          }),
        });

        if (response.ok) {
          setSuccess('Order status updated successfully!');
          setTimeout(() => setSuccess(''), 2000);
          fetchAdminOrders();
        } else {
          setError('Failed to update order status');
          setTimeout(() => setError(''), 3000);
        }
      } catch (error) {
        console.error('Error updating order:', error);
        setError('Error updating order status');
        setTimeout(() => setError(''), 3000);
      }
    };

    const statusOptions = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Admin - Order Management</h1>
            <button
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back
            </button>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">{success}</div>}

          <div className="mb-6 flex gap-3">
            <button
              onClick={() => setSelectedOrderStatus('')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedOrderStatus === '' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              All Orders ({adminOrders.length})
            </button>
            {statusOptions.map(status => (
              <button
                key={status}
                onClick={() => setSelectedOrderStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedOrderStatus === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {adminOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Package size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {adminOrders.map(order => (
                <div key={order._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
                  <div className="grid md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Order ID</div>
                      <div className="font-bold text-lg">{order.orderId}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString()}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Customer</div>
                      <div className="font-semibold">{order.userName}</div>
                      <div className="text-xs text-gray-600">{order.userMobile}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Total</div>
                      <div className="font-bold text-lg text-blue-600">₹{order.total.toFixed(2)}</div>
                      <div className="text-xs text-gray-600">{order.items.length} items</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Status</div>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.orderId, e.target.value)}
                        className={`px-3 py-2 rounded-lg border font-semibold text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          order.status === 'Delivered' ? 'bg-green-100 border-green-300' :
                          order.status === 'Cancelled' ? 'bg-red-100 border-red-300' :
                          order.status === 'Shipped' ? 'bg-blue-100 border-blue-300' :
                          'bg-yellow-100 border-yellow-300'
                        }`}
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Address</div>
                      <div className="text-sm font-medium truncate">{order.address?.city}</div>
                      <div className="text-xs text-gray-600 truncate">{order.address?.address?.substring(0, 30)}</div>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="text-xs text-gray-600 mb-2">Items:</div>
                    <div className="flex flex-wrap gap-3">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                          <span className="text-lg">{item.image}</span>
                          <div className="text-xs">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-gray-500">x{item.quantity}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Admin Dashboard Page
  const AdminDashboard = () => {
    // Fetch admin orders when dashboard loads
    React.useEffect(() => {
      fetchAdminOrders();
      
      // Set up polling every 3 seconds
      const intervalId = setInterval(() => {
        fetchAdminOrders();
      }, 3000);

      return () => {
        clearInterval(intervalId);
      };
    }, [fetchAdminOrders]);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                <p className="text-green-100 mt-2">Welcome, {currentAdmin?.username}</p>
              </div>
              <button
                onClick={() => {
                  setCurrentAdmin(null);
                  setIsAdminLogin(false);
                  setCurrentPage('login');
                  setSuccess('Logged out successfully');
                  setTimeout(() => setSuccess(''), 2000);
                }}
                className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">{success}</div>}
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-800">{adminOrders.length}</p>
                </div>
                <Package size={40} className="text-blue-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Pending Orders</p>
                  <p className="text-3xl font-bold text-gray-800">{adminOrders.filter(o => o.status === 'Pending').length}</p>
                </div>
                <Clock size={40} className="text-yellow-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Delivered Orders</p>
                  <p className="text-3xl font-bold text-gray-800">{adminOrders.filter(o => o.status === 'Delivered').length}</p>
                </div>
                <Check size={40} className="text-green-500 opacity-20" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setCurrentPage('admin-orders')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition flex items-center gap-3"
              >
                <Package size={24} />
                <span>Manage Orders</span>
              </button>

              <button
                onClick={() => {
                  setCurrentAdmin(null);
                  setIsAdminLogin(false);
                  setCurrentPage('login');
                }}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition flex items-center gap-3"
              >
                <ArrowRight size={24} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Orders</h2>

            {adminOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package size={48} className="mx-auto text-gray-300 mb-3" />
                <p>No orders found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Order ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminOrders.slice(0, 10).map(order => (
                      <tr key={order._id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{order.orderId}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div>{order.userName}</div>
                          <div className="text-xs text-gray-500">{order.userMobile}</div>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-blue-600">₹{order.total.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {adminOrders.length > 10 && (
              <button
                onClick={() => setCurrentPage('admin-orders')}
                className="w-full mt-4 text-blue-600 hover:text-blue-700 font-medium py-2"
              >
                View All Orders →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      {currentPage === 'admin-orders' && <AdminOrdersPage />}
      {currentPage === 'admin-dashboard' && <AdminDashboard />}
    </>
  );
};

export default PenumudiesApp;
