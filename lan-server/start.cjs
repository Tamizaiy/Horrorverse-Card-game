const fs=require('node:fs'),path=require('node:path'),readline=require('node:readline/promises');
const {startServer}=require('./server.cjs');
(async()=>{const file=path.join(__dirname,'config.json');let config={port:3000,origin:''};try{config={...config,...JSON.parse(fs.readFileSync(file,'utf8'))};}catch{}
 if(process.env.HV_NETLIFY_ORIGIN)config.origin=process.env.HV_NETLIFY_ORIGIN;
 if(process.stdin.isTTY){const rl=readline.createInterface({input:process.stdin,output:process.stdout});const input=(await rl.question('URL do seu site Netlify (Enter mantém '+(config.origin||'somente LAN local')+'): ')).trim();rl.close();if(input){const url=new URL(input);if(url.protocol!=='https:')throw Error('Informe a URL HTTPS do site.');config.origin=url.origin;}fs.writeFileSync(file,JSON.stringify(config,null,2));}
 const server=startServer(config);server.on('error',e=>{console.error('Não foi possível iniciar: '+e.message+'\nConfira se a porta já está em uso.');process.exitCode=1;});
})().catch(e=>{console.error(e.message);process.exitCode=1;});
