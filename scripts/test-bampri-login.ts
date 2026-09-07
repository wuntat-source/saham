async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bampri', password: 'bampri123' }),
    });
    console.log('HTTP Status for bampri:', res.status);
    const data = await res.json();
    console.log('User logged in:', data.user?.name, data.user?.email, 'Balance:', data.user?.wallet?.cash_balance);
  } catch (e: any) {
    console.error('Fetch error:', e.message);
  }
}

test();
