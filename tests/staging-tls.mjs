import {createServer} from 'node:https';import {request} from 'node:http';import {connect} from 'node:net';import {once} from 'node:events';import {generate} from 'selfsigned';
// Loopback-only fixture. The test browser accepts this ephemeral certificate.
export async function proxyPair(web,game){
 const pem=await generate([{name:'commonName',value:'localhost'}],{keySize:2048,algorithm:'sha256'}),servers=[];
 async function listen(port){const s=createServer({key:pem.private,cert:pem.cert},(req,res)=>{const upstream=request({host:'127.0.0.1',port,path:req.url,method:req.method,headers:{...req.headers,'x-forwarded-proto':'https'}},r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res)});upstream.on('error',()=>res.writeHead(502).end());req.pipe(upstream)});
 const sockets=new Set();s.on('connection',socket=>{sockets.add(socket);socket.on('close',()=>sockets.delete(socket))});
 s.on('upgrade',(req,socket,head)=>{const upstream=connect(port,'127.0.0.1',()=>{upstream.write(req.method+' '+req.url+' HTTP/1.1\r\n'+Object.entries(req.headers).map(([k,v])=>k+': '+v).join('\r\n')+'\r\n\r\n');if(head.length)upstream.write(head);socket.pipe(upstream).pipe(socket)});socket.on('close',()=>upstream.destroy());upstream.on('error',()=>socket.destroy());socket.on('error',()=>upstream.destroy())});
 s.listen(0,'127.0.0.1');await once(s,'listening');servers.push(()=>{for(const sock of sockets)sock.destroy();s.close()});return s.address().port}
 return {origin:'https://127.0.0.1:'+await listen(web),wss:'wss://127.0.0.1:'+await listen(game),close:()=>servers.forEach(close=>close())}}
