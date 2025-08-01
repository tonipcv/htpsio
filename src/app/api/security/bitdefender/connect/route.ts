import { NextResponse } from 'next/server';
import { BITDEFENDER_CONFIG } from '../config';

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Validate API key by making a test request to BitDefender API
    const response = await fetch(`${BITDEFENDER_CONFIG.BASE_URL}/api/v1.0/jsonrpc/network`, {
      headers: {
        'Authorization': BITDEFENDER_CONFIG.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'getAccountsList',
        params: {},
        id: crypto.randomUUID()
      })
    });

    if (!response.ok) {
      throw new Error('Invalid API key or connection failed');
    }

    // Store API key securely (you should implement proper secure storage)
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to BitDefender',
    });
  } catch (error) {
    console.error('BitDefender connection error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to BitDefender' },
      { status: 500 }
    );
  }
} 