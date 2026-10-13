(()=>{'use strict';
 const toggle=document.querySelector('.menu-toggle'), nav=document.querySelector('#primary-nav');
 const close=()=>{if(!toggle||!nav)return;nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');};
 toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle?.getAttribute('aria-expanded')==='true'){close();toggle.focus();}});
 nav?.addEventListener('click',e=>{if(e.target.closest('a'))close();});
 const toc=document.querySelector('.article-toc ul');if(toc){document.querySelectorAll('.article-body h2').forEach((h,i)=>{if(!h.id)h.id='section-'+(i+1);const li=document.createElement('li'),a=document.createElement('a');a.href='#'+h.id;a.textContent=h.textContent;li.append(a);toc.append(li);});if(!toc.children.length)toc.parentElement.hidden=true;}
 document.querySelectorAll('[data-ry-demo-form]').forEach(form=>{form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const result=form.querySelector('[role="status"]');result.textContent='Preview complete. Your brief is valid. Nothing has been sent or saved.';result.tabIndex=-1;result.focus();form.reset();});});
})();
