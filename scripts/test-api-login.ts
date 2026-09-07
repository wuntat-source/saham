async function testUser(email: string, pass: string) {
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });
    const data = await res.json();
    console.log(`[LOGIN] ${email} -> HTTP ${res.status} | Success: ${data.success} | Name: ${data.user?.name}`);
  } catch (e: any) {
    console.error(`[LOGIN] ${email} -> Error:`, e.message);
  }
}

async function run() {
  await testUser('pidi', 'pidi123');
  await testUser('bampri', 'bampri123');
  await testUser('guru@edutradex.id', 'guru123');
  await testUser('siswa1@edutradex.id', 'siswa123');
}

run();

