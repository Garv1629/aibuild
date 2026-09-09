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
  console.log('Testing http://localhost:5173/ ...');
  const res1 = await get('http://localhost:5173/');
  console.log('Status /:', res1.status);
}

main().catch(console.error);
