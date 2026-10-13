(()=>{'use strict';
 const cfg=window.ryIntegrationConfig||{enabled:false}, key='ry_privacy_v1';
 let consent={marketing:false},loaded=false;try{consent=JSON.parse(localStorage.getItem(key))||consent;}catch{}
 const allow=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','gbraid','wbraid','fbclid'];
 function attribution(url=location.href){const qs=new URL(url,location.origin).searchParams,out={};allow.forEach(k=>{const v=qs.get(k);if(v&&/^[\w .~:/+\-]{1,200}$/.test(v))out[k]=v;});return out;}
 const arrival={params:attribution(),landing_path:location.pathname};
 // Only a transient in-memory candidate exists before permission. A same-origin
 // browser referrer can identify an immediately preceding campaign landing;
 // no query is added to links and no pre-consent storage/analytics is written.
 if(!Object.keys(arrival.params).length&&document.referrer){try{const ref=new URL(document.referrer);if(ref.origin===location.origin){const p=attribution(ref.href);if(Object.keys(p).length){arrival.params=p;arrival.landing_path=ref.pathname;}}}catch{}}
 let lastTouch={};
 function capturePermittedAttribution(){if(!cfg.enabled||!consent.marketing)return;try{if(!sessionStorage.getItem('ry_first_touch'))sessionStorage.setItem('ry_first_touch',JSON.stringify({...arrival.params,landing_path:arrival.landing_path}));const current=attribution();if(Object.keys(current).length)sessionStorage.setItem('ry_last_touch',JSON.stringify(current));else if(!sessionStorage.getItem('ry_last_touch')&&Object.keys(arrival.params).length)sessionStorage.setItem('ry_last_touch',JSON.stringify(arrival.params));const saved=JSON.parse(sessionStorage.getItem('ry_last_touch')||'{}');allow.forEach(k=>{if(saved[k]&&/^[\w .~:/+\-]{1,200}$/.test(saved[k]))lastTouch[k]=saved[k];});}catch{}}
 const loadTags=()=>{if(!cfg.enabled||!consent.marketing||loaded||!/^GTM-[A-Z0-9]+$/.test(cfg.gtm||''))return;loaded=true;window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(cfg.gtm);document.head.append(s);};
 const dialog=document.querySelector('#ry-consent');
 document.querySelectorAll('[data-ry-privacy]').forEach(b=>b.addEventListener('click',()=>{dialog.returnValue='cancel';dialog.querySelector('[name="marketing"]').checked=!!consent.marketing;dialog.showModal();}));
 dialog?.addEventListener('close',()=>{if(dialog.returnValue==='cancel')return;const was=consent.marketing;consent={marketing:dialog.returnValue==='save'&&dialog.querySelector('[name="marketing"]').checked};try{localStorage.setItem(key,JSON.stringify(consent));}catch{}if(!consent.marketing){lastTouch={};try{sessionStorage.removeItem('ry_first_touch');sessionStorage.removeItem('ry_last_touch');}catch{}}if(was&&!consent.marketing&&loaded){location.reload();return;}capturePermittedAttribution();loadTags();});capturePermittedAttribution();loadTags();
 document.addEventListener('click',e=>{const a=e.target.closest('[data-ry-event]');if(a&&cfg.enabled&&consent.marketing){window.dataLayer=window.dataLayer||[];const payload={event:'ry_interaction',interaction:a.dataset.ryEvent,path:location.pathname};if(a.dataset.ryEvent==='office_directions_click'&&['goa','mumbai','kolkata'].includes(a.dataset.ryOffice))payload.office=a.dataset.ryOffice;window.dataLayer.push(payload);}});
 const a=attribution();
 // One shared renderer promise, with no repeated vendor bootstrap injection.
 // The observed standard iframe protocol avoids the bootstrap's unbounded
 // full-parent-URL forwarding. Each component connects only on its own action.
 let filloutRendererPromise;
 function loadFilloutRenderer(){if(!filloutRendererPromise)filloutRendererPromise=Promise.resolve((embed,id,params,status,onFailure)=>{
   const embedId=String(crypto.getRandomValues(new Uint32Array(2)).join(''));
   const url=new URL('https://embed.fillout.com/t/'+encodeURIComponent(id));
   Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,String(v)));
   url.searchParams.set('fillout-embed-id',embedId);url.searchParams.set('fillout-embed-type','standard');url.searchParams.set('fillout-embed-dynamic-resize','true');url.searchParams.set('fillout-embed-parent-page',location.origin+location.pathname);
   const frame=document.createElement('iframe');frame.title='Report Yak '+params.placement+' enquiry form';frame.style.width='100%';frame.style.height='540px';frame.style.border='0';frame.src=url.href;frame.referrerPolicy='no-referrer';
   const resize=e=>{if(e.origin!==url.origin||e.source!==frame.contentWindow||!e.data||e.data.embedId!==embedId)return;if(e.data.type==='form_resized'&&typeof e.data.size==='number'&&Number.isFinite(e.data.size)&&e.data.size>=150&&e.data.size<=10000)frame.style.height=e.data.size+'px';if(e.data.type==='check_scroll_up'&&frame.getBoundingClientRect().top<0)frame.scrollIntoView({behavior:'auto'});};
   window.addEventListener('message',resize);frame.addEventListener('load',()=>{status.textContent='If the form does not appear, please call +91 98208 20374.';},{once:true});frame.addEventListener('error',()=>{window.removeEventListener('message',resize);onFailure();},{once:true});embed.append(frame);embed.dataset.filloutInitialized='true';return frame;
 });return filloutRendererPromise;}
 // Form loading is an explicit visitor action. Attribution is a bounded allowlist;
 // the current provider protocol/account must be validated before live enablement.
 document.querySelectorAll('[data-ry-load-form]').forEach(button=>button.addEventListener('click',()=>{
   if(!cfg.formsEnabled)return;const wrapper=button.closest('[data-ry-fillout]'),id=wrapper.dataset.ryFillout;if(!/^[A-Za-z0-9]{6,40}$/.test(id))return;
   const target=wrapper.querySelector('.ry-embed-target'),status=wrapper.querySelector('[data-ry-form-status]');button.disabled=true;status.textContent='Loading the secure enquiry form…';
   const embed=document.createElement('div');embed.dataset.filloutId=id;embed.dataset.filloutEmbedType='standard';embed.dataset.filloutDynamicResize='';embed.style.width='100%';embed.style.minHeight='540px';
   // Explicit parameters avoid forwarding arbitrary query strings or personal data.
   const params={...(consent.marketing?{...lastTouch,...a}:{}),landing_path:location.pathname,placement:wrapper.dataset.ryPlacement};
   if(consent.marketing){try{const first=JSON.parse(sessionStorage.getItem('ry_first_touch')||'{}');allow.forEach(k=>{if(first[k]&&/^[\w .~:/+\-]{1,200}$/.test(first[k]))params['first_'+k]=first[k];});if(typeof first.landing_path==='string'&&first.landing_path.startsWith('/')&&first.landing_path.length<500)params.first_landing_path=first.landing_path;}catch{}}
   Object.entries(params).forEach(([k,v])=>embed.setAttribute('data-'+k,String(v)));target.append(embed);
   const failure=()=>{status.textContent='The form could not load. Please try again or call +91 98208 20374.';button.disabled=false;button.hidden=false;target.replaceChildren();};loadFilloutRenderer().then(render=>{render(embed,id,params,status,failure);button.hidden=true;}).catch(failure);
 }));
 // Intentionally no submit/conversion event: only provider-confirmed successful
 // submissions may drive the existing fillout_form_submit contract after QA.
})();
