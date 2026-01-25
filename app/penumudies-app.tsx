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
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [generatedOTP, setGeneratedOTP] = useState<string>('');
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
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
  const [searchPage, setSearchPage] = useState<boolean>(false);
  const [searchPageQuery, setSearchPageQuery] = useState<string>('');
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Product Database
  const productDatabase = [
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
  }, []);

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

    const handleLogin = () => {
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
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Log In
            </button>
          </div>

          <div className="mt-6 text-center">
            <button onClick={() => setCurrentPage('signup')} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Create an account
            </button>
          </div>
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
                          setShowAddAddress(true);
                          setCurrentPage('addresses');
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center gap-3"
                      >
                        <MapPin size={18} className="text-gray-600" />
                        <span className="font-medium">Manage Addresses</span>
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

    const handlePlaceOrder = () => {
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

      setTimeout(() => {
        const orderId = `ORD${Date.now()}`;
        const order = {
          id: orderId,
          userId: currentUser?.id,
          items: activeCart,
          address: addresses.find(a => a.id === selectedAddress),
          slot: deliverySlots.find(s => s.id === selectedSlot),
          paymentMethod,
          total: calculateCartTotal().total,
          status: 'Confirmed',
          createdAt: new Date().toISOString()
        };

        setOrders([...orders, order]);
        if (currentUser) {
          setCart([]);
        } else {
          setGuestCart([]);
        }

        setProcessingOrder(false);
        setSuccess('Order placed!');
        setTimeout(() => {
          setSuccess('');
          setCurrentPage('orders');
        }, 2000);
      }, 2000);
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
    </>
  );
};

export default PenumudiesApp;
