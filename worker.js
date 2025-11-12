// worker.js - Cloudflare Worker para autenticación segura
export default {
  async fetch(request) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    
    if (url.pathname === '/auth/google' && request.method === 'POST') {
      return handleGoogleAuth(request, corsHeaders);
    }
    
    if (url.pathname === '/auth/logout' && request.method === 'POST') {
      return handleLogout(request, corsHeaders);
    }

    return new Response('Not Found', { 
      status: 404,
      headers: corsHeaders
    });
  }
}

async function handleGoogleAuth(request, corsHeaders) {
  try {
    // Aquí iría la lógica de Firebase
    // Las credenciales están SEGURAS en el Worker
    
    const mockUser = {
      uid: 'user123',
      email: 'usuario@ejemplo.com',
      displayName: 'Usuario Demo',
      emailVerified: true
    };

    return new Response(JSON.stringify({
      success: true,
      user: mockUser
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

async function handleLogout(request, corsHeaders) {
  return new Response(JSON.stringify({
    success: true,
    message: 'Logged out'
  }), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}