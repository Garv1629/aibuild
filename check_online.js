import https from 'https';

https.get('https://garv1629.github.io/aibuild/', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('DATA:', data);
  });
}).on('error', (err) => {
  console.error('ERROR:', err);
});
