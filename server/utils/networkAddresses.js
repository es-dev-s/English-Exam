import os from 'os';

export function getLanAddresses() {
  const nets = os.networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      const isIPv4 = net.family === 'IPv4' || net.family === 4;
      if (isIPv4 && !net.internal) {
        addresses.push(net.address);
      }
    }
  }

  return addresses;
}

export function logServerUrls(port, { label = 'Server', pathPrefix = '' } = {}) {
  console.log(`${label} URLs:`);
  console.log(`  Local:   http://localhost:${port}${pathPrefix}`);
  for (const ip of getLanAddresses()) {
    console.log(`  Network: http://${ip}:${port}${pathPrefix}`);
  }
}
