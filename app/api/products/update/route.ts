import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Product } from '@/lib/models/Product';

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({}).sort({ createdAt: -1 });

    const formattedProducts = products.map(product => ({
      id: product._id.toString(),
      ...product.toObject(),
    }));

    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { id, price, stock } = await request.json();

    if (!id || (price === undefined && stock === undefined)) {
      return NextResponse.json(
        { error: 'Product ID and at least price or stock is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;

    try {
      const product = await Product.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        product: {
          id: product._id.toString(),
          ...product.toObject(),
        },
      });
    } catch (mongoErr) {
      console.error('MongoDB error:', mongoErr);
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    try {
      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        product: {
          id: product._id.toString(),
          ...product.toObject(),
        },
      });
    } catch (mongoErr) {
      console.error('MongoDB error:', mongoErr);
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
