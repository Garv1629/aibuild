import http from 'http';

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Testing http://localhost:3000/ ...');
  const res1 = await get('http://localhost:3000/');
  console.log('Status /:', res1.status);
  
  console.log('Testing http://localhost:3000/src/main.tsx ...');
  const res2 = await get('http://localhost:3000/src/main.tsx');
  console.log('Status /src/main.tsx:', res2.status);
  if (res2.status !== 200) {
    console.log('Body:', res2.body.slice(0, 500));
  }
}

main().catch(console.error);
