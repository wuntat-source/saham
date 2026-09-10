async function testEndpoints() {
  const routes = [
    '/api/market/quotes',
    '/api/market/regime',
    '/api/sectors',
    '/api/radar',
    '/api/screener/top',
  ];

  for (const r of routes) {
    try {
      const res = await fetch(`http://localhost:3000${r}`);
      console.log(`[ROUTE] ${r} -> HTTP ${res.status}`);
    } catch (e: any) {
      console.error(`[ROUTE] ${r} -> Error: ${e.message}`);
    }
  }
}

testEndpoints();
