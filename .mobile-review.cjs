const fs = require('node:fs');
(async () => {
  const pages = await (await fetch('http://127.0.0.1:9335/json')).json();
  const socket = new WebSocket(pages[0].webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, {once:true}));
  let id = 0;
  const waiting = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) { waiting.get(message.id)?.(message); waiting.delete(message.id); }
  });
  const send = (method, params={}) => new Promise((resolve,reject) => {
    const key = ++id;
    waiting.set(key, message => message.error ? reject(message.error) : resolve(message.result));
    socket.send(JSON.stringify({id:key,method,params}));
  });
  await send('Page.enable');
  await send('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  for (const width of [360,740]) {
    await send('Emulation.setDeviceMetricsOverride', {width,height:800,deviceScaleFactor:1,mobile:true});
    for (const route of ['/', '/about','/projects','/projects/yumna-portfolio','/contact','/3d']) {
      await send('Page.navigate',{url:'http://127.0.0.1:5173'+route});
      await new Promise(resolve=>setTimeout(resolve,1800));
      const result = await send('Runtime.evaluate',{expression:`JSON.stringify({width:innerWidth,scroll:document.documentElement.scrollWidth,overflows:[...document.querySelectorAll('h1,h2,h3,p,a,button,input,textarea,article')].filter(e=>{const r=e.getBoundingClientRect(); return r.width && (r.right>innerWidth+2 || r.left < -2)}).slice(0,8).map(e=>({tag:e.tagName,text:e.textContent.slice(0,35)}))})`,returnByValue:true});
      console.log(width,route,result.result.value);
    }
  }
  await send('Browser.close');
  socket.close();
})().catch(error=>{console.error(error);process.exit(1)});
