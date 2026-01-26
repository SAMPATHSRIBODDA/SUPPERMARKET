# Products Visibility Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PENUMUDIES APP                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      USER INTERFACE                              │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │  Homepage                                                │   │   │
│  │  │  • Product Grid (displays filtered products)            │   │   │
│  │  │  • Search Box (filters products)                        │   │   │
│  │  │  • Category Buttons (filters by category)               │   │   │
│  │  │  • Shopping Cart (shows selected products)              │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  │                          ▲                                      │   │
│  │                          │                                      │   │
│  │                    Uses State: products[]                       │   │
│  │                    (loaded from DB)                             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                               ▲                                          │
│                               │                                          │
│                         ┌─────┴──────┐                                   │
│                         │  useEffect │                                   │
│                         │  on Mount  │                                   │
│                         └─────┬──────┘                                   │
│                               │                                          │
│                         fetch('/api/products/update')                    │
│                               │                                          │
└───────────────────────────────┼──────────────────────────────────────────┘
                                │
                    ┌───────────┴────────────┐
                    │                        │
                    ▼                        ▼
          ┌──────────────────┐     ┌──────────────────┐
          │  ADMIN PANEL     │     │  API ROUTES      │
          │                  │     │                  │
          │  • Add Product   │     │  GET /products   │
          │    → POST        │────→│  • Fetch from DB │
          │                  │     │  • Return [id]   │
          │  • Edit Product  │     │                  │
          │    → PUT         │────→│  POST /create    │
          │                  │     │  • Save to DB    │
          │  • Delete Prod   │────→│  • Return [id]   │
          │    → DELETE      │     │                  │
          │                  │     │  PUT /update     │
          └──────────────────┘     │  • Update DB     │
                                   │  • Return [id]   │
                                   │                  │
                                   │  DELETE /update  │
                                   │  • Remove from DB│
                                   │  • Return [id]   │
                                   └────────┬─────────┘
                                            │
                                            ▼
                                   ┌──────────────────┐
                                   │  MONGODB DATABASE│
                                   │                  │
                                   │  products        │
                                   │  • _id (ObjectId)│
                                   │  • name          │
                                   │  • price         │
                                   │  • stock         │
                                   │  • category      │
                                   │  • ... etc       │
                                   └──────────────────┘
```

## Data Flow: Admin Adds Product

```
Admin Panel UI
    │
    ├─ Enters: Name="Banana", Price=60, Image="🍌"
    │
    └─→ Click "Add Product"
         │
         └─→ handleAddProduct() function
              │
              └─→ POST /api/products/create
                   │
                   ├─ Body: {name, price, image, ...}
                   │
                   └─→ Backend Route Handler
                        │
                        ├─ Connect to MongoDB
                        ├─ Create product document
                        └─ Save to MongoDB
                            │
                            └─→ Document saved with _id: "507f1f..."
                                 │
                                 └─→ Transform response:
                                      {
                                        id: "507f1f...",     ← Converted from _id
                                        name: "Banana",
                                        price: 60,
                                        ...
                                      }
                                      │
                                      └─→ Return JSON response
                                           │
                                           └─→ Frontend receives response
                                                │
                                                ├─ Success message shown
                                                ├─ Add to products state
                                                │  setProducts([...products, newProduct])
                                                └─ UI updates immediately
                                                     │
                                                     └─→ Product table shows "Banana"
                                                          │
                                                          └─→ Homepage also fetches updated list
                                                               │
                                                               └─→ "Banana" appears in product grid
```

## Data Flow: User Visits Homepage

```
User Opens http://localhost:3000
    │
    └─→ App Component Loads
         │
         └─→ useEffect (componentDidMount)
              │
              └─→ Calls fetchProducts()
                   │
                   └─→ fetch('/api/products/update')
                        │
                        └─→ GET Request to Backend
                             │
                             ├─ Connect to MongoDB
                             ├─ Query db.products.find()
                             └─ Get array of documents with _id
                                 │
                                 └─→ Transform each document:
                                      documents.map(doc => ({
                                        id: doc._id.toString(),
                                        ...doc.toObject()
                                      }))
                                      │
                                      └─→ Return JSON: {products: []}
                                           │
                                           └─→ Frontend receives response
                                                │
                                                ├─ setProducts(response.products)
                                                └─ State updated with all products
                                                     │
                                                     └─→ React re-renders HomePage
                                                          │
                                                          └─→ searchDatabase uses products state
                                                               │
                                                               └─→ filteredProducts.map(product =>
                                                                    Shows each product in grid
                                                                    Uses key={product.id}
                                                                    (no console errors!)
                                                                   )
                                                                    │
                                                                    └─→ User sees products:
                                                                         • Amul Milk
                                                                         • Banana
                                                                         • Bread
                                                                         • etc.
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│                  APP STATE (page.tsx)                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  const [products, setProducts] = useState<Product[]>([])│
│         ▲                                                │
│         │                                                │
│  ┌──────┴──────────────────────────────────────────┐   │
│  │                                                 │    │
│  │  • Initially: [] (empty)                       │    │
│  │                                                 │    │
│  │  • On App Load:                                │    │
│  │    setProducts(fetchedProducts)                │    │
│  │    → Shows database products                   │    │
│  │                                                 │    │
│  │  • When Admin Adds Product:                    │    │
│  │    setProducts([...products, newProduct])      │    │
│  │    → Product appears in table & homepage       │    │
│  │                                                 │    │
│  │  • When Admin Edits Product:                   │    │
│  │    setProducts(products.map(p =>               │    │
│  │      p.id === editId ? updatedProduct : p      │    │
│  │    ))                                           │    │
│  │    → Updated price shows everywhere            │    │
│  │                                                 │    │
│  │  • When Admin Deletes Product:                 │    │
│  │    setProducts(products.filter(                │    │
│  │      p => p.id !== deletedId                   │    │
│  │    ))                                           │    │
│  │    → Product removed from everywhere           │    │
│  │                                                 │    │
│  └──────────────────────────────────────────────────┘   │
│                     │                                    │
│                     │ Used By:                           │
│                     │                                    │
│  ┌──────────────┬───┴────────┬─────────────────────┐   │
│  │              │            │                     │    │
│  ▼              ▼            ▼                     ▼    │
│ HomePage    AdminPanel   Search     Filter&Sort   │    │
│ Grid        Table        Results    Products      │    │
│                                                   │    │
└───────────────────────────────────────────────────┘    │
```

## Component Hierarchy

```
PenumudiesApp (main component)
│
├─ State: products[], currentUser, cart, etc.
│
├─ useEffect: Load products on mount
│          └─→ fetch('/api/products/update')
│              └─→ setProducts(data)
│
├─ HomePage()
│  └─ Uses: products state
│     ├─ Display: Product grid
│     ├─ Filter: By category
│     ├─ Search: Filters products
│     └─ Actions: Add to cart/wishlist
│
├─ AdminPanel()
│  ├─ Products Tab
│  │  ├─ Display: Product table from products state
│  │  ├─ Add Product
│  │  │  └─ handleAddProduct()
│  │  │     └─ POST /api/products/create
│  │  │        └─ setProducts([...products, newProduct])
│  │  ├─ Edit Product
│  │  │  └─ handleUpdateProduct()
│  │  │     └─ POST /api/products/update
│  │  │        └─ setProducts(products.map(...))
│  │  └─ Delete Product
│  │     └─ handleDeleteProduct()
│  │        └─ DELETE /api/products/update
│  │           └─ setProducts(products.filter(...))
│  │
│  ├─ Orders Tab
│  │  └─ Display: Orders with tracking
│  │
│  └─ Tracker Tab
│     └─ Update: Order status, location, partner
│
└─ SearchPage()
   └─ Uses: products state
      └─ Display: Search results
```

## Database Schema

```
MongoDB: penumudies_db
         │
         └─ Collection: products
            │
            ├─ Document 1:
            │  {
            │    "_id": ObjectId("507f1f77bcf86cd799439011"),
            │    "name": "Amul Fresh Milk",
            │    "brand": "Amul",
            │    "price": 62,
            │    "oldPrice": 65,
            │    "stock": 150,
            │    "category": "Dairy",
            │    "image": "🥛",
            │    "popular": true,
            │    "deliveryTime": "8 mins",
            │    "createdAt": ISODate("2026-01-26T10:30:00Z"),
            │    "updatedAt": ISODate("2026-01-26T10:30:00Z")
            │  }
            │
            ├─ Document 2:
            │  {
            │    "_id": ObjectId("507f1f77bcf86cd799439012"),
            │    "name": "Organic Banana",
            │    "brand": "Local",
            │    ...
            │  }
            │
            └─ Document N:
               {...}
```

## API Response Format

```
Request:  GET /api/products/update
Response: {
  "products": [
    {
      "id": "507f1f77bcf86cd799439011",        ← Converted from _id
      "_id": "507f1f77bcf86cd799439011",       ← Original MongoDB ID
      "name": "Amul Fresh Milk",
      "brand": "Amul",
      "price": 62,
      "oldPrice": 65,
      "stock": 150,
      "category": "Dairy",
      "image": "🥛",
      "popular": true,
      "deliveryTime": "8 mins"
    },
    ...more products...
  ]
}

Frontend uses: product.id for React key ✅
```

## Key Improvements

```
BEFORE:
├─ Products weren't loaded on app start
├─ Different endpoints used different databases
├─ Product objects had _id but not id
├─ React console error: "missing key prop"
└─ Admin changes not visible to users

AFTER:
├─ Products auto-load on app start ✅
├─ All endpoints use MongoDB ✅
├─ All products have id field ✅
├─ No console errors ✅
└─ Admin changes sync to users instantly ✅
```

## Component Interaction Example

```
Scenario: Admin adds "Organic Mango" product

Step 1: Admin clicks "Add Product"
   ↓
   AdminPanel.handleAddProduct()
   ↓
   fetch('/api/products/create', {
     method: 'POST',
     body: JSON.stringify({
       name: 'Organic Mango',
       price: 80,
       image: '🥭',
       ...
     })
   })

Step 2: Backend creates in MongoDB
   ↓
   api/products/create/route.ts
   ↓
   Product.create({name, price, image, ...})
   ↓
   MongoDB saves: {
     _id: ObjectId("507f..."),
     name: "Organic Mango",
     price: 80,
     ...
   }

Step 3: API transforms and returns
   ↓
   {
     id: "507f...",
     name: "Organic Mango",
     price: 80,
     ...
   }

Step 4: Frontend updates state
   ↓
   setProducts([...products, newProduct])
   ↓
   React re-renders AdminPanel
   ↓
   "Organic Mango" appears in product table

Step 5: User sees product
   ↓
   User goes to homepage
   ↓
   useEffect loads products again
   ↓
   "Organic Mango" appears in product grid
   ↓
   User can add to cart, search for it, filter by category
```

This architecture ensures:
- ✅ Products persist in database
- ✅ Changes sync across all interfaces
- ✅ No data loss on page refresh
- ✅ Clean state management
- ✅ No console errors
