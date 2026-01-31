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
  _id?: string;
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
  _id?: string;
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
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editNameLoading, setEditNameLoading] = useState<boolean>(false);
  const [isEditingMobile, setIsEditingMobile] = useState<boolean>(false);
  const [editMobile, setEditMobile] = useState<string>('');
  const [editMobileLoading, setEditMobileLoading] = useState<boolean>(false);
  
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
  const [showRazorpayModal, setShowRazorpayModal] = useState<boolean>(false);
  const [razorpayOrderId, setRazorpayOrderId] = useState<string>('');
  const [razorpayAmount, setRazorpayAmount] = useState<number>(0);
  const [showTracking, setShowTracking] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showSignupModal, setShowSignupModal] = useState<boolean>(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [loginMobile, setLoginMobile] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [signupMobile, setSignupMobile] = useState<string>('');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [otpTimer, setOtpTimer] = useState<number>(0);
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const [generatedOTP, setGeneratedOTP] = useState<string>('');
  const [pendingUser, setPendingUser] = useState<Partial<User> | null>(null);
  
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
  
  // Admin - Add Product Form
  const [showAddProductForm, setShowAddProductForm] = useState<boolean>(false);
  
  // Use refs for form inputs to prevent re-render issues
  const productNameRef = useRef<HTMLInputElement>(null);
  const productBrandRef = useRef<HTMLInputElement>(null);
  const productPriceRef = useRef<HTMLInputElement>(null);
  const productOldPriceRef = useRef<HTMLInputElement>(null);
  const productStockRef = useRef<HTMLInputElement>(null);
  const productCategoryRef = useRef<HTMLSelectElement>(null);
  const productImageRef = useRef<HTMLInputElement>(null);
  const productDeliveryTimeRef = useRef<HTMLInputElement>(null);
  const productDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const productPopularRef = useRef<HTMLInputElement>(null);
  
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
  const [categories, setCategories] = useState<string[]>(['All', 'Dairy', 'Bakery', 'Snacks', 'Beverages', 'Instant Food', 'Personal Care', 'Fruits']);
  const [showOtherCategoryInput, setShowOtherCategoryInput] = useState<boolean>(false);
  const [newCategoryInput, setNewCategoryInput] = useState<string>('');
  
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Restore user session and categories from localStorage on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('penumudies_user');
    const savedAdmin = localStorage.getItem('penumudies_admin');
    const savedCategories = localStorage.getItem('penumudies_categories');
    
    // Load categories from localStorage
    if (savedCategories) {
      try {
        const loadedCategories = JSON.parse(savedCategories);
        setCategories(loadedCategories);
        console.log('Categories restored from localStorage:', loadedCategories);
      } catch (err) {
        console.error('Failed to restore categories:', err);
      }
    }
    
    // PRIORITY: Admin session takes precedence
    if (savedAdmin) {
      try {
        const admin = JSON.parse(savedAdmin);
        setAdminLoggedIn(true);
        setAdminToken(admin.token);
        setAdminUsername(admin.username);
        setCurrentPage('admin');
        console.log('Admin session restored');
      } catch (err) {
        console.error('Failed to restore admin session:', err);
        localStorage.removeItem('penumudies_admin');
        // Fallback to user if admin fails
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            setCurrentUser(user);
            setCurrentPage('home');
          } catch (userErr) {
            console.error('Failed to restore user session:', userErr);
            localStorage.removeItem('penumudies_user');
          }
        }
      }
    } else if (savedUser) {
      // Only restore user if NO admin session exists
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setCurrentPage('home');
        console.log('User session restored');
      } catch (err) {
        console.error('Failed to restore user session:', err);
        localStorage.removeItem('penumudies_user');
      }
    }
  }, []);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('penumudies_categories', JSON.stringify(categories));
    console.log('Categories saved to localStorage:', categories);
  }, [categories]);

  // Use database products - fallback to empty array if no products loaded
  const productDatabase = products.length > 0 ? products : [];

  // Handle category selection change
  const handleCategoryChange = (selectedCategory: string) => {
    if (selectedCategory === 'Other') {
      setShowOtherCategoryInput(true);
    } else {
      setShowOtherCategoryInput(false);
      setNewCategoryInput('');
    }
  };

  // Add new category from Add Product form
  const handleAddNewCategory = () => {
    const trimmedCategory = newCategoryInput.trim();
    if (!trimmedCategory) {
      setError('Please enter a category name');
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (categories.includes(trimmedCategory)) {
      setError('Category already exists');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // Add category to state (this will also trigger localStorage save via useEffect)
    setCategories([...categories, trimmedCategory]);
    
    // Reset the input form
    setNewCategoryInput('');
    setShowOtherCategoryInput(false);
    
    // Reset dropdown to default
    if (productCategoryRef.current) {
      productCategoryRef.current.value = 'Dairy';
    }
    
    setSuccess(`✅ Category "${trimmedCategory}" added! Now select it from the dropdown.`);
    setTimeout(() => setSuccess(''), 4000);
  };

  const deliverySlots = [
    { id: 1, label: 'Today, 2:00 PM - 4:00 PM', available: true },
    { id: 2, label: 'Today, 4:00 PM - 6:00 PM', available: true },
    { id: 3, label: 'Today, 6:00 PM - 8:00 PM', available: true },
    { id: 4, label: 'Tomorrow, 8:00 AM - 10:00 AM', available: true },
  ];

  // ========== BULLETPROOF SEARCH IMPLEMENTATION ==========
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  
  // Pure search function - reads from ref directly
  const performSearch = (query: string) => {
    if (!query || query.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const results = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.brand.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );

    setSearchResults(results);
    setShowSearchResults(true);
  };
  
  // Handle search input - debounced
  const handleSearchInput = () => {
    // Clear any existing timeout
    if (searchDebounceRef.current !== null) {
      clearTimeout(searchDebounceRef.current);
    }

    // Get value from ref directly - NEVER from state
    const currentValue = searchInputRef.current?.value || '';
    
    // Set new debounce timeout
    searchDebounceRef.current = setTimeout(() => {
      performSearch(currentValue);
    }, 300);
  };
  
  // Clear search
  const clearSearch = () => {
    if (searchDebounceRef.current !== null) {
      clearTimeout(searchDebounceRef.current);
    }
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
      searchInputRef.current.focus();
    }
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCart([]);
    setWishlist([]);
    setAddresses([]);
    setOrders([]);
    setShowLogoutConfirm(false);
    setShowAccountMenu(false);
    setCurrentPage('home');
    localStorage.removeItem('penumudies_user');
    setSuccess('Logged out successfully');
    setTimeout(() => setSuccess(''), 2000);
  };

  // Modal Login Handler - Database API
  const handleLoginSubmit = async () => {
    setError('');
    if (!loginMobile || !loginPassword) {
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
          mobile: loginMobile,
          password: loginPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // Set current user with token for API calls
      const userData = {
        ...data.user,
        password: loginPassword // Store for session
      };
      setCurrentUser(userData);
      localStorage.setItem('penumudies_user', JSON.stringify(userData));
      
      setLoginMobile('');
      setLoginPassword('');
      setShowLoginModal(false);
      setSuccess('Login successful!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    }
  };

  // Modal Signup Handler
  const handleSignupSubmit = () => {
    setError('');
    if (!signupMobile || !signupPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^\d{10}$/.test(signupMobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (users.find(u => u.mobile === signupMobile)) {
      setError('Mobile number already registered');
      return;
    }

    // Create user directly without OTP
    const newUser: User = {
      mobile: signupMobile,
      password: signupPassword,
      name: `User${signupMobile.slice(-4)}`,
      id: Date.now().toString()
    };
    setUsers([...users, newUser]);
    setSuccess('Account created successfully!');
    setShowSignupModal(false);
    setSignupMobile('');
    setSignupPassword('');
    setConfirmPassword('');
    
    // Auto login the user
    setTimeout(() => {
      setCurrentUser(newUser);
      setSuccess('Logged in successfully!');
      setTimeout(() => setSuccess(''), 2000);
    }, 1000);
  };

  // Modal Admin Login Handler - Database API
  const handleAdminLoginSubmit = async () => {
    setError('');
    if (!adminUsername || !adminPassword) {
      setError('Please fill in all fields');
      return;
    }

    setAdminLoading(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Admin login failed');
        setAdminLoading(false);
        return;
      }

      // Set admin logged in state
      setAdminLoggedIn(true);
      setAdminToken(data.admin.token);
      setCurrentUser(null); // Clear user if logged in
      setShowAdminLoginModal(false);
      setAdminUsername('');
      setAdminPassword('');
      setSuccess('Admin login successful!');
      setAdminLoading(false);
      setTimeout(() => {
        setCurrentPage('admin');
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError('Admin login failed. Please try again.');
      setAdminLoading(false);
      console.error('Admin login error:', err);
    }
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
        localStorage.setItem('penumudies_user', JSON.stringify(updatedUser));
        
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

  const handleSaveMobile = async () => {
    if (!editMobile.trim()) {
      setError('Mobile number cannot be empty');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (editMobile.trim().length < 10) {
      setError('Mobile number must be at least 10 digits');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (currentUser && editMobile.trim() === currentUser.mobile) {
      setIsEditingMobile(false);
      return;
    }

    setEditMobileLoading(true);

    try {
      const response = await fetch('/api/users/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile: currentUser?.mobile,
          newMobile: editMobile.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update mobile');
      }

      const updatedUser = { ...currentUser, mobile: editMobile.trim(), name: currentUser?.name || '' };
      setCurrentUser(updatedUser as User);
      setSuccess('Mobile number updated successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update mobile');
      console.error('Error updating mobile:', err);
    } finally {
      setIsEditingMobile(false);
      setEditMobileLoading(false);
    }
  };

  const handleCancelEditMobile = () => {
    if (currentUser) {
      setEditMobile(currentUser.mobile);
    }
    setIsEditingMobile(false);
  };

  // Load Products on Mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products/update');
        if (response.ok) {
          const data = await response.json();
          if (data.products && data.products.length > 0) {
            console.log('✓ Products loaded from API:', data.products.length, 'products');
            setProducts(data.products);
          }
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    };
    loadProducts();
  }, []);

  // Debug: Log products state changes
  useEffect(() => {
    console.log('📦 Products state updated:', products.length, 'products');
  }, [products]);

  // Load Orders when user/admin context changes
  useEffect(() => {
    const loadOrders = async () => {
      try {
        // Load admin orders only when admin is logged in
        if (adminLoggedIn) {
          const adminResponse = await fetch('/api/orders/manage');
          if (adminResponse.ok) {
            const adminData = await adminResponse.json();
            if (adminData.orders) {
              setAdminOrders(adminData.orders);
            }
          }
        }

        // Load user orders only for the current user
        if (currentUser?.mobile) {
          const userResponse = await fetch(`/api/orders/manage?userMobile=${currentUser.mobile}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.orders) {
              setOrders(userData.orders);
            }
          }
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      }
    };
    loadOrders();
  }, [adminLoggedIn, currentUser?.mobile]);

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
            if (currentPage === 'orders' && currentUser?.mobile) {
              setOrders(data.orders);
            }
            if (currentPage === 'admin' && adminLoggedIn) {
              setAdminOrders(data.orders);
            }
          }
        }
      } catch (err) {
        console.error('Failed to refresh orders:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentPage, currentUser ? currentUser.mobile : null, showTracking, isEditingAdminOrder, adminLoggedIn, showAddProductForm]);

  // Load Addresses on User Login
  useEffect(() => {
    const loadAddresses = async () => {
      if (!currentUser?.mobile) return;
      
      try {
        const response = await fetch(`/api/addresses?userMobile=${currentUser.mobile}`);
        if (response.ok) {
          const data = await response.json();
          if (data.addresses && Array.isArray(data.addresses)) {
            setAddresses(data.addresses);
          }
        }
      } catch (err) {
        console.error('Failed to load addresses:', err);
      }
    };
    
    loadAddresses();
  }, [currentUser?.mobile]);

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
    if (!currentUser) {
      setError('Please login to your account to add items to cart');
      setTimeout(() => setError(''), 3000);
      return;
    }

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
  // LoginPage removed - now using modal popup

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
        const userData = {
          ...data.user,
          password: password
        };
        setCurrentUser(userData);
        localStorage.setItem('penumudies_user', JSON.stringify(userData));

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

    const searchDatabase = products.length > 0 ? products : []
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

              <div className="flex-1 max-w-2xl mx-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search products..."
                    onInput={handleSearchInput}
                    autoComplete="off"
                    spellCheck="false"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-base"
                  />
                  {showSearchResults && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
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
                              setShowLoginModal(true);
                            }}
                            className="w-full bg-white text-gray-800 py-2 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition flex items-center gap-2 justify-center"
                          >
                            <Lock size={18} />
                            Login
                          </button>

                          <button
                            onClick={() => {
                              setShowAccountMenu(false);
                              setShowSignupModal(true);
                            }}
                            className="w-full bg-white text-gray-800 py-2 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition flex items-center gap-2 justify-center"
                          >
                            <User size={18} />
                            Sign Up
                          </button>

                          <button
                            onClick={() => {
                              setShowAccountMenu(false);
                              setShowAdminLoginModal(true);
                            }}
                            className="w-full bg-white text-gray-800 py-2 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition flex items-center gap-2 justify-center"
                          >
                            <Lock size={18} />
                            Admin Panel
                          </button>

                          <button
                            onClick={() => {
                              setShowAccountMenu(false);
                              setCurrentPage('home');
                              setSuccess('Welcome! You are browsing as a guest.');
                              setTimeout(() => setSuccess(''), 2000);
                            }}
                            className="w-full bg-white text-gray-800 py-2 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition flex items-center gap-2 justify-center"
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
          {/* Search Results Section */}
          {showSearchResults && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Search Results ({searchResults.length})
                </h2>
                <button
                  onClick={clearSearch}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <X size={18} />
                  Clear Search
                </button>
              </div>
              
              {searchResults.length === 0 ? (
                <div className="bg-white rounded-xl p-16 text-center border-2 border-dashed border-gray-200">
                  <Search size={64} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">Try searching with different keywords</p>
                  <button
                    onClick={clearSearch}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Browse All Products
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {searchResults.map(product => (
                    <div key={product.id} className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition">
                      <div className="relative p-4">
                        <div className="text-5xl text-center mb-2">{product.image}</div>
                        
                        <button
                          onClick={() => toggleWishlist(product)}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md"
                        >
                          <Heart size={16} className={isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
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
                              <Minus size={14} />
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
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            disabled={product.stock === 0}
                            className={`w-full py-2 rounded-lg font-semibold text-sm ${
                              product.stock === 0 ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {product.stock === 0 ? 'Out of Stock' : 'Add'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!showSearchResults && (
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
          )}
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

  // Profile & Addresses Page
  const ProfilePage = () => {
    const [newAddress, setNewAddress] = useState({ name: '', phone: '', address: '', pincode: '', city: '' });

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



    // If user is not logged in and navigates to profile, open account dropdown and return to home
    useEffect(() => {
      if (currentPage === 'profile' && !currentUser) {
        try {
          setShowAccountMenu(true);
          // Navigate back to home so the dropdown is visible on the main page
          setCurrentPage('home');
        } catch (e) {
          // safe noop in case setters are unavailable
        }
      }
    }, [currentPage, currentUser]);

    // If not logged in, do not render the profile page (dropdown will be shown)
    if (!currentUser) return null;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Show profile content when logged in */}
          <div>
            <button
              type="button"
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
                
                {isEditingName ? (
                  <div className="w-full space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-blue-500 rounded-lg focus:outline-none text-center text-gray-800 font-bold"
                      placeholder="Enter name"
                    />
                    <div className="flex gap-2 justify-center">
                      <button
                        type="button"
                        onClick={handleSaveName}
                        disabled={editNameLoading}
                        className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEditName}
                        disabled={editNameLoading}
                        className="px-4 py-1.5 bg-gray-400 text-white rounded-lg hover:bg-gray-500 text-sm font-medium disabled:opacity-50"
                      >
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
                
                <p className="text-gray-600 mt-4">{currentUser?.mobile}</p>
              </div>
            </div>

            <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Account Information</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Mobile Number</label>
                      <div className="flex items-center justify-between">
                        <div className="text-lg text-gray-800 font-semibold">{currentUser?.mobile}</div>
                        <button
                          onClick={() => {
                            if (currentUser) {
                              setEditMobile(currentUser.mobile);
                              setIsEditingMobile(true);
                            }
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit mobile"
                        >
                          <Edit2 size={16} className="text-gray-600 hover:text-blue-600" />
                        </button>
                      </div>
                      {isEditingMobile && (
                        <div className="mt-3 space-y-2">
                          <input
                            type="tel"
                            value={editMobile}
                            onChange={(e) => setEditMobile(e.target.value)}
                            className="w-full px-3 py-2 border-2 border-blue-500 rounded-lg focus:outline-none text-gray-800"
                            placeholder="Enter mobile number"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleSaveMobile}
                              disabled={editMobileLoading}
                              className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEditMobile}
                              disabled={editMobileLoading}
                              className="px-4 py-1.5 bg-gray-400 text-white rounded-lg hover:bg-gray-500 text-sm font-medium disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Account Status</label>
                      <div className="text-lg text-green-600 font-semibold">✅ Active</div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">📍 Saved Addresses</h2>
                  
                  {/* Display Saved Addresses */}
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {addresses.length === 0 ? (
                      <p className="text-gray-500 text-sm">No saved addresses yet</p>
                    ) : (
                      addresses.map((addr: any, index: number) => (
                        <div key={addr._id || addr.id || index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">{addr.title || addr.name}</div>
                              <div className="text-sm text-gray-600 mt-1">{addr.address}</div>
                              <div className="text-sm text-gray-600">{addr.city}, {addr.state || 'N/A'} - {addr.pincode}</div>
                              <div className="text-sm text-gray-600 mt-1">📞 {addr.phone}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                try {
                                  fetch(`/api/addresses?addressId=${addr._id || addr.id}`, {
                                    method: 'DELETE',
                                  }).then(() => {
                                    setAddresses(addresses.filter((a: any) => (a._id || a.id) !== (addr._id || addr.id)));
                                    setSuccess('Address deleted');
                                    setTimeout(() => setSuccess(''), 2000);
                                  });
                                } catch (err) {
                                  setError('Failed to delete address');
                                  setTimeout(() => setError(''), 3000);
                                }
                              }}
                              className="text-red-600 hover:text-red-800 text-sm font-medium ml-2"
                            >
                              ✕ Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Address Button */}
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(!showAddAddress)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium text-sm transition"
                  >
                    {showAddAddress ? '✕ Cancel' : '+ Add New Address'}
                  </button>

                  {/* Add Address Form */}
                  {showAddAddress && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200 space-y-3">
                      <h3 className="font-semibold text-gray-800 mb-3">Add New Address</h3>
                      <input
                        type="text"
                        placeholder="Address Title (e.g., Home, Office)"
                        value={newAddress.name}
                        onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-black"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-black"
                      />
                      <input
                        type="text"
                        placeholder="Full Address"
                        value={newAddress.address}
                        onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-black"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-black"
                      />
                      <input
                        type="text"
                        placeholder="Postal Code"
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-black"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!newAddress.name || !newAddress.phone || !newAddress.address || !newAddress.pincode || !newAddress.city) {
                            setError('Please fill all fields');
                            setTimeout(() => setError(''), 3000);
                            return;
                          }

                          try {
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
                                title: newAddress.name,
                              }),
                            });

                            if (!response.ok) {
                              const errorData = await response.json();
                              throw new Error(errorData.error || 'Failed to save address');
                            }

                            const result = await response.json();
                            
                            const newAddr = {
                              _id: result.address._id,
                              id: result.address._id,
                              name: newAddress.name,
                              phone: newAddress.phone,
                              address: newAddress.address,
                              pincode: newAddress.pincode,
                              city: newAddress.city,
                              title: newAddress.name,
                            };
                            
                            setAddresses([...addresses, newAddr]);
                            setNewAddress({ name: '', phone: '', address: '', pincode: '', city: '' });
                            setShowAddAddress(false);
                            setSuccess('Address saved successfully');
                            setTimeout(() => setSuccess(''), 2000);
                          } catch (err) {
                            console.error('Error saving address:', err);
                            setError(err instanceof Error ? err.message : 'Failed to save address');
                            setTimeout(() => setError(''), 3000);
                          }
                        }}
                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium"
                      >
                        Save Address
                      </button>
                    </div>
                  )}
                </div>


              </div>
            </div>
          </div>
            </div>
        </div>
      </div>
    );
  };

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
        
        // Refresh both user and admin orders AND products (to update stock)
        await fetchOrders();
        await fetchProducts();
        
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
          <button type="button" onClick={() => setCurrentPage('home')} className="flex items-center gap-2 text-blue-600 mb-6">
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
                    {addresses.map((addr, index) => (
                      <div
                        key={addr._id || addr.id || index}
                        onClick={() => setSelectedAddress(addr._id || addr.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                          selectedAddress === (addr._id || addr.id)
                            ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">
                            {selectedAddress === (addr._id || addr.id) ? '✓' : '📍'}
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
                      onClick={() => {
                        if (method === 'Card') {
                          setError('Card payment is currently unavailable');
                          setTimeout(() => setError(''), 3000);
                          return;
                        }
                        setPaymentMethod(method);
                      }}
                      className={`w-full p-4 border-2 rounded-lg text-left flex items-center justify-between ${
                        paymentMethod === method ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                      } ${method === 'Card' ? 'opacity-60 cursor-not-allowed' : ''}`}
                      disabled={method === 'Card'}
                    >
                      <span className="font-medium">{method}</span>
                      {method === 'Card' ? (
                        <span className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full">Coming Soon</span>
                      ) : method === 'UPI' && paymentMethod === method ? (
                        <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full">Powered by Razorpay</span>
                      ) : null}
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
              const updatedOrder = data.orders.find((o: any) => o.orderId === selectedOrder.orderId);
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
          <button type="button" onClick={() => setCurrentPage('home')} className="flex items-center gap-2 text-blue-600 mb-6 hover:text-blue-700">← Back</button>

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
                        <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
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
                      <span className="ml-1">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
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
      localStorage.setItem('penumudies_admin', JSON.stringify({
        token: data.token,
        username: adminUsername
      }));
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
    setCurrentPage('home');
    localStorage.removeItem('penumudies_admin');
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
    // Get values directly from refs
    const name = productNameRef.current?.value || '';
    const brand = productBrandRef.current?.value || '';
    const price = productPriceRef.current?.value || '';
    const oldPrice = productOldPriceRef.current?.value || '';
    const stock = productStockRef.current?.value || '';
    const category = productCategoryRef.current?.value || 'Dairy';
    const image = productImageRef.current?.value || '';
    const deliveryTime = productDeliveryTimeRef.current?.value || '30 mins';
    const description = productDescriptionRef.current?.value || '';
    const popular = productPopularRef.current?.checked || false;

    console.log('Adding product with:', { name, brand, price, oldPrice, stock, category, image });

    // Validate category
    if (category === 'Other') {
      setError('Please add a new category or select an existing one');
      return;
    }

    if (!name || !brand || !price || !oldPrice || !image) {
      setError('Please fill all required fields');
      return;
    }

    setAdminLoading(true);
    setError('');
    try {
      const response = await fetch('/api/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          brand,
          price: parseFloat(price),
          oldPrice: parseFloat(oldPrice),
          stock: parseInt(stock) || 0,
          category,
          image,
          popular,
          deliveryTime,
          description,
        }),
      });

      const data = await response.json();
      console.log('API Response:', { status: response.status, ok: response.ok, data });

      if (!response.ok) {
        console.error('API Error:', data);
        setError(data.error || 'Failed to add product');
        setAdminLoading(false);
        return;
      }

      console.log('Product added successfully:', data.product);
      // Add the new product to the products array
      setProducts([...products, { ...data.product }]);
      
      // Reset form inputs
      if (productNameRef.current) productNameRef.current.value = '';
      if (productBrandRef.current) productBrandRef.current.value = '';
      if (productPriceRef.current) productPriceRef.current.value = '';
      if (productOldPriceRef.current) productOldPriceRef.current.value = '';
      if (productStockRef.current) productStockRef.current.value = '';
      if (productImageRef.current) productImageRef.current.value = '';
      if (productDeliveryTimeRef.current) productDeliveryTimeRef.current.value = '30 mins';
      if (productDescriptionRef.current) productDescriptionRef.current.value = '';
      if (productPopularRef.current) productPopularRef.current.checked = false;
      if (productCategoryRef.current) productCategoryRef.current.value = 'Dairy';
      
      // Reset category input form
      setShowOtherCategoryInput(false);
      setNewCategoryInput('');
      
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

      // Update admin orders array
      const updatedOrders = adminOrders.map(o => o.orderId === selectedOrder.orderId ? data.order : o);
      setAdminOrders(updatedOrders);
      
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

      // Update admin orders array
      const updatedOrders = adminOrders.map(o => o.orderId === selectedOrder.orderId ? data.order : o);
      setAdminOrders(updatedOrders);
      
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
                  placeholder="Enter username: sampath"
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
                  placeholder="Enter password: siddu@123"
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
                  <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-800">Add New Product</h3>
                      <p className="text-sm text-gray-500 mt-1">Fill in the details below to add a new product.</p>
                    </div>

                    <div className="px-6 py-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                          <input
                            ref={productNameRef}
                            type="text"
                            placeholder="e.g., Fresh Milk"
                            autoComplete="off"
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-800 text-base"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                          <input
                            ref={productBrandRef}
                            type="text"
                            placeholder="e.g., Amul"
                            autoComplete="off"
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-800 text-base"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Price (₹) *</label>
                          <input
                            ref={productPriceRef}
                            type="number"
                            placeholder="0"
                            min="0"
                            step="0.01"
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-base"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (₹) *</label>
                          <input
                            ref={productOldPriceRef}
                            type="number"
                            placeholder="0"
                            min="0"
                            step="0.01"
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-base"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                          <input
                            ref={productStockRef}
                            type="number"
                            placeholder="0"
                            min="0"
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-base"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                          <select
                            ref={productCategoryRef}
                            defaultValue="Dairy"
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-base"
                          >
                            {categories.filter(cat => cat !== 'All').map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                            <option value="Other">Other (Add New)</option>
                          </select>
                        </div>

                        {showOtherCategoryInput && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Category Name</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Enter new category name"
                                value={newCategoryInput}
                                onChange={(e) => setNewCategoryInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddNewCategory()}
                                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-base"
                              />
                              <button
                                onClick={handleAddNewCategory}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium flex items-center gap-1"
                              >
                                <Plus size={18} />
                                Add
                              </button>
                              <button
                                onClick={() => {
                                  setShowOtherCategoryInput(false);
                                  setNewCategoryInput('');
                                  if (productCategoryRef.current) {
                                    productCategoryRef.current.value = 'Dairy';
                                  }
                                }}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Image / Emoji *</label>
                          <input
                            ref={productImageRef}
                            type="text"
                            placeholder="e.g., 🥛 or paste emoji"
                            maxLength={2}
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xl text-center text-gray-800"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time</label>
                          <input
                            ref={productDeliveryTimeRef}
                            type="text"
                            placeholder="e.g., 30 mins"
                            defaultValue="30 mins"
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-800 text-base"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            ref={productDescriptionRef}
                            placeholder="Product description..."
                            rows={3}
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-800 resize-none text-base"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            ref={productPopularRef}
                            type="checkbox"
                            id="popular"
                            className="h-4 w-4"
                          />
                          <label htmlFor="popular" className="text-sm text-gray-700">Mark as Popular</label>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 pb-6 flex gap-3">
                      <button
                        onClick={handleAddProduct}
                        disabled={adminLoading}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 font-medium flex items-center justify-center gap-2"
                      >
                        <Plus size={18} />
                        {adminLoading ? 'Adding...' : 'Add Product'}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddProductForm(false);
                          setShowOtherCategoryInput(false);
                          setNewCategoryInput('');
                        }}
                        className="flex-1 bg-white text-gray-700 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium"
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
                      {(products.length > 0 ? products : []).map(product => (
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
                          <th className="text-left py-3 px-2">Placed</th>
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
                              <td className="py-3 px-2 text-xs text-gray-600">{new Date(order.createdAt).toLocaleString()}</td>
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
                                {order.paymentMethod === 'UPI' ? '🔵 UPI' : order.paymentMethod === 'COD' ? '💵 Cash on Delivery' : '💳 Card'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-500">No orders found</td>
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

                      <div className="pb-4 border-b">
                        <div className="text-xs text-gray-600">Ordered At</div>
                        <div className="text-sm text-gray-800">{new Date(selectedOrder.createdAt).toLocaleString()}</div>
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
                        <div className="font-medium">{selectedOrder.paymentMethod === 'COD' ? 'Cash on Delivery' : selectedOrder.paymentMethod || 'COD'}</div>
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
      {currentPage === 'signup' && <SignUpPage />}
      {(currentPage === 'home' || showSignupModal || showAdminLoginModal || showLoginModal) && <HomePage />}
      {currentPage === 'profile' && <ProfilePage />}
      {currentPage === 'checkout' && <CheckoutPage />}
      {currentPage === 'orders' && <OrdersPage />}
      {currentPage === 'admin' && <AdminPanel />}

      {/* Login Modal */}
      {showLoginModal && (
        <>
          <div className="fixed inset-0 z-40"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8 relative pointer-events-auto">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-600 mb-6">Login to your account</p>

            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}

            <div className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  value={loginMobile}
                  onChange={(e) => setLoginMobile(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLoginSubmit()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 text-black"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLoginSubmit()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 text-black"
                />
              </div>

              <button
                onClick={handleLoginSubmit}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Log In
              </button>
            </div>

            <div className="mt-6 text-center space-y-3">
              <div>
                <span className="text-gray-600 text-sm">Don't have an account? </span>
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    setShowSignupModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Sign Up
                </button>
              </div>
            </div>
            </div>
          </div>
        </>
      )}

      {/* Sign Up Modal */}
      {showSignupModal && (
        <>
          <div className="fixed inset-0 z-40"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8 relative pointer-events-auto">
              <button
                onClick={() => setShowSignupModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>

              <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
              <p className="text-gray-600 mb-6">Join Penumudies today</p>

              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
              {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}

              <div className="space-y-4">
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input type="tel" placeholder="Mobile Number" value={signupMobile} onChange={(e) => setSignupMobile(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input type="password" placeholder="Password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button onClick={handleSignupSubmit} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Create Account</button>
              </div>

              <div className="mt-6 text-center">
                <span className="text-gray-600 text-sm">Already have an account? </span>
                <button 
                  onClick={() => {
                    setShowSignupModal(false);
                    setShowLoginModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Log In
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Admin Login Modal */}
      {showAdminLoginModal && (
        <>
          <div className="fixed inset-0 z-40"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8 relative pointer-events-auto">
              <button
                onClick={() => setShowAdminLoginModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>

              <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Login</h2>
              <p className="text-gray-600 mb-6">Admin Panel Access</p>

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
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminLoginSubmit()}
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
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminLoginSubmit()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <button 
                  onClick={handleAdminLoginSubmit} 
                  disabled={adminLoading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-green-400 disabled:cursor-not-allowed"
                >
                  {adminLoading ? 'Logging in...' : 'Admin Login'}
                </button>
              </div>

              <div className="mt-6 text-center">
                <button 
                  onClick={() => setShowAdminLoginModal(false)}
                  className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </>
      )}

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
                