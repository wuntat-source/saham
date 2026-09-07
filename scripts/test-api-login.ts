async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'pidi', password: 'pidi123' }),
    });
    console.log('HTTP Status:', res.status);
    const data = await res.json();
    console.log('HTTP Response Body:', JSON.stringify(data, null, 2));
  } catch (e: any) {
    console.error('Fetch error:', e.message);
  }
}

test();
