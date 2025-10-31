import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/api/payment/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Payment API error:', error);
    return NextResponse.json(
      { orderId: `order_mock_${Date.now()}`, amount: 0, currency: 'INR', mock: true },
      { status: 200 }
    );
  }
}
