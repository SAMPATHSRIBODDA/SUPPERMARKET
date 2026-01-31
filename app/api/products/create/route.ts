import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Product } from '@/lib/models/Product';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Creating product...');
    await dbConnect();
    console.log('✅ Connected to MongoDB');

    const body = await request.json();
    console.log('📥 Request body:', body);
    
    const { name, brand, price, oldPrice, stock, category, image, popular, deliveryTime, description } = body;

    // Validation
    if (!name || !brand || !price || !oldPrice || stock === undefined || !category || !image) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    if (price < 0 || oldPrice < 0 || stock < 0) {
      console.log('❌ Negative prices/stock');
      return NextResponse.json(
        { error: 'Price and stock cannot be negative' },
        { status: 400 }
      );
    }

    if (name.length < 2 || name.length > 100) {
      console.log('❌ Invalid name length');
      return NextResponse.json(
        { error: 'Product name must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    // Create new product
    console.log('🔨 Creating new product document...');
    const newProduct = new Product({
      name,
      brand,
      price,
      oldPrice,
      stock,
      category,
      image,
      popular: popular || false,
      deliveryTime: deliveryTime || '30 mins',
      description: description || '',
    });

    console.log('💾 Saving product to MongoDB...');
    await newProduct.save();
    console.log('✅ Product saved successfully:', newProduct._id);

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: {
        id: newProduct._id.toString(),
        ...newProduct.toObject(),
      },
    });
  } catch (error) {
    console.error('❌ Error creating product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
    console.error('Error details:', errorMessage);
    return NextResponse.json(
      { error: errorMessage || 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const products = await Product.find({}).sort({ createdAt: -1 });

    const formattedProducts = products.map(product => ({
      id: product._id.toString(),
      ...product.toObject(),
    }));

    return NextResponse.json({
      success: true,
      products: formattedProducts,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
