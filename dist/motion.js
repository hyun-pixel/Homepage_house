(()=>{
'use strict';
const reduce=matchMedia('(prefers-reduced-motion:reduce)'),ease='cubic-bezier(.16,1,.3,1)';
const hero=document.getElementById('hero'),header=document.querySelector('.site-header');
function headerState(){if(hero&&header)document.body.classList.toggle('hero-view',hero.getBoundingClientRect().bottom>header.offsetHeight+96);}
headerState();let queued=false;
function scheduleHeader(){if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;headerState();});}}
addEventListener('scroll',scheduleHeader,{passive:true});addEventListener('resize',scheduleHeader,{passive:true});addEventListener('herochange',scheduleHeader);
const arrows=document.querySelectorAll('a.primary,button.primary');
for(const button of arrows){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('class','button-arrow');svg.setAttribute('fill','none');
 const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d','M3 12h17m-6-6 6 6-6 6');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','1.4');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');svg.append(path);button.append(svg);
}
function animate(el,frames,options={}){if(reduce.matches||!el.animate)return;el.getAnimations().forEach(a=>a.cancel());return el.animate(frames,{duration:600,easing:ease,...options});}
const items=new Map();
for(const el of document.querySelectorAll('.content h2,.page-intro h1,.detail-section h2,.space-heading h3'))items.set(el,'heading');
for(const el of document.querySelectorAll('.photo .image-button'))items.set(el,'photo');
for(const list of document.querySelectorAll('.promise-list,.process'))[...list.children].forEach((el,index)=>{items.set(el,'step');el.style.setProperty('--motion-delay',index*70+'ms');});
function reveal(el,kind){
 el.classList.add('is-revealed');
 if(kind==='photo')animate(el,[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:800});
 else if(kind==='step')animate(el,[{opacity:.2,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,delay:parseFloat(el.style.getPropertyValue('--motion-delay'))||0});
 else animate(el,[{opacity:.35,transform:'translateY(22px)',clipPath:'inset(0 0 24% 0)'},{opacity:1,transform:'translateY(0)',clipPath:'inset(0)'}],{duration:700});
}
let observer;
if('IntersectionObserver'in window){
 observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){reveal(entry.target,items.get(entry.target));observer.unobserve(entry.target);}},{threshold:.12});
 for(const el of items.keys())observer.observe(el);
}
for(const details of document.querySelectorAll('.faq'))details.addEventListener('toggle',()=>{if(details.open){const copy=details.querySelector('p');if(copy)animate(copy,[{opacity:0,transform:'translateY(-5px)'},{opacity:1,transform:'translateY(0)'}],{duration:260});}});
const stateObserver=new MutationObserver(records=>{
 for(const {target,attributeName} of records){
  if(attributeName==='open'&&target.open){
   const drawer=target.classList.contains('drawer'),sheet=target.dataset.sheet==='true';
   animate(target,[{opacity:drawer?1:0,transform:drawer?'translateX(100%)':sheet?'translateY(48px)':'translateY(18px) scale(.98)'},{opacity:1,transform:'translate(0) scale(1)'}],{duration:drawer?420:300});
   if(drawer)[...target.querySelectorAll('.drawer-links a')].forEach((el,i)=>animate(el,[{opacity:.2,transform:'translateX(20px)'},{opacity:1,transform:'translateX(0)'}],{duration:350,delay:80+i*35}));
  }
  if(attributeName==='hidden'&&!target.hidden&&target.id==='booking-complete')animate(target,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:300});
 }
});
for(const dialog of document.querySelectorAll('dialog'))stateObserver.observe(dialog,{attributes:true,attributeFilter:['open']});
const complete=document.getElementById('booking-complete');if(complete)stateObserver.observe(complete,{attributes:true,attributeFilter:['hidden']});
reduce.addEventListener('change',()=>{if(reduce.matches){for(const a of document.getAnimations())a.cancel();for(const el of items.keys())el.classList.add('is-revealed');}headerState();});
})();
