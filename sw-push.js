// ENEMIZADES — diagnóstico de push 20261014-1
// No fetch interception: normal site loading continues, without caching old HTML.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
// Diagnóstico local: registra apenas horário, etapa e erro, sem chaves ou mensagens.
const PUSH_DEBUG_CACHE='enemizades-push-diagnostics-v1';
const PUSH_DEBUG_URL=new URL('__push_debug__',self.registration.scope).href;
async function recordPushStage(stage,detail=''){
 try{const cache=await caches.open(PUSH_DEBUG_CACHE),saved=await cache.match(PUSH_DEBUG_URL);let rows=[];if(saved)try{rows=await saved.json()}catch{}if(!Array.isArray(rows))rows=[];
 rows.push({at:new Date().toISOString(),stage,detail:String(detail).slice(0,200)});
 await cache.put(PUSH_DEBUG_URL,new Response(JSON.stringify(rows.slice(-20)),{headers:{'Content-Type':'application/json'}}));
 }catch{}
}
self.addEventListener('push',event=>{
 event.waitUntil((async()=>{
 await recordPushStage('received');
 let payload={};try{payload=event.data?.json()||{}}catch{payload={body:event.data?.text()||''}}
 if(!payload||typeof payload!=='object')payload={};
 const title=payload.title||'ENEMIZADES',options={body:payload.body||'Você tem uma nova atualização.',icon:new URL('icon.png',self.registration.scope).href,badge:new URL('icon.png',self.registration.scope).href,tag:payload.tag||'enemizades',renotify:false,data:payload.data||{}};
 try{await self.registration.showNotification(title,options);await recordPushStage('shown');}
 catch(error){await recordPushStage('display_error',error.name+': '+error.message);
 try{await self.registration.showNotification(title,{body:options.body,tag:options.tag,data:options.data});await recordPushStage('shown_without_icons');}
 catch(fallback){await recordPushStage('display_failed',fallback.name+': '+fallback.message);}
 }
 })());
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
