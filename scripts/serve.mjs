import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const portIndex=process.argv.indexOf('--port');
const port=Number(portIndex>=0?process.argv[portIndex+1]:4187);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.json':'application/json','.mp4':'video/mp4','.vtt':'text/vtt'};
const server=http.createServer((request,response)=>{
  let pathname;
  try{pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);}catch{response.writeHead(400);response.end('Bad request');return;}
  const requested=path.resolve(root,'.'+pathname);
  if(requested!==root&&!requested.startsWith(root+path.sep)){response.writeHead(403);response.end('Forbidden');return;}
  let target=requested;
  try{if(fs.statSync(target).isDirectory())target=path.join(target,'index.html');}catch{response.writeHead(404);response.end('Not found');return;}
  fs.stat(target,(error,stat)=>{
    if(error||!stat.isFile()){response.writeHead(404);response.end('Not found');return;}
    const type=mime[path.extname(target).toLowerCase()]||'application/octet-stream';
    response.writeHead(200,{'Content-Type':type,'Content-Length':stat.size,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    if(request.method==='HEAD'){response.end();return;}
    fs.createReadStream(target).pipe(response);
  });
});
server.listen(port,'127.0.0.1',()=>process.stdout.write(`Local: http://127.0.0.1:${port}\n`));
process.on('SIGINT',()=>server.close(()=>process.exit(0)));
