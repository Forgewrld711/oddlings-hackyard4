import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const files=new Set(['index.html','style.css','app.mjs','engine.mjs','arcade.mjs','arcade-engine.mjs','arcade.css','oddling-cover-v2.png']);
const types={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',mjs:'text/javascript; charset=utf-8',png:'image/png'};
const root=new URL('./dist/',import.meta.url);
const port=Number(process.env.PORT??43125);
http.createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 const pathname=new URL(req.url,'http://localhost').pathname;
 const name=pathname==='/'?'index.html':pathname.slice(1);
 if(!files.has(name)){res.writeHead(404);res.end('Not found');return;}
 try{const data=await readFile(new URL(name,root));res.writeHead(200,{'Content-Type':types[name.split('.').at(-1)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);}
 catch{res.writeHead(500);res.end('Could not load asset');}
}).listen(port,'127.0.0.1',()=>console.log(`Oddlings: http://127.0.0.1:${port}/ (serving ${fileURLToPath(root)})`));
