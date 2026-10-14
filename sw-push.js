// No fetch interception: normal site loading continues, without caching old HTML.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
 let payload={};try{payload=event.data?.json()||{}}catch{payload={body:event.data?.text()||''}}
 event.waitUntil(self.registration.showNotification(payload.title||'ENEMIZADES',{
 body:payload.body||'Você tem uma nova atualização.',icon:new URL('icon.png',self.registration.scope).href,
 badge:new URL('icon.png',self.registration.scope).href,tag:payload.tag||'enemizades',renotify:false,
 data:payload.data||{}
 }));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();const allowed=['rankingTab','sessionsTab','sinapseTab','chatTab'];
 const tab=allowed.includes(event.notification.data?.tab)?event.notification.data.tab:'rankingTab';
 const url=new URL('./',self.registration.scope);url.searchParams.set('pushTab',tab);
 const room=Number(event.notification.data?.roomId);if(room>=1&&room<=5)url.searchParams.set('pushRoom',String(room));
 event.waitUntil((async()=>{const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
 for(const client of windows){const current=new URL(client.url);if(current.origin===url.origin&&current.pathname.startsWith(new URL(self.registration.scope).pathname)){await client.focus();client.postMessage({type:'ENEMIZADES_PUSH_OPEN',tab,roomId:room});return}}
 await self.clients.openWindow(url.href);
 })());
});
