(()=>{
'use strict';
const $=id=>document.getElementById(id), page=document.body.dataset.page;
const menu=$('menu-dialog'), menuButton=$('menu-open'), dock=$('mobile-dock'), footer=$('footer');
const dialogs=[...document.querySelectorAll('dialog')];
let activeDialog=null, returnFocus=null, oldOverflow='', dockQueued=false, toastTimer;
function focusable(dialog){return [...dialog.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')].filter(el=>el.getClientRects().length && !el.closest('[hidden]'));}
function scheduleDock(){if(!dockQueued){dockQueued=true;requestAnimationFrame(()=>{dockQueued=false;updateDock();});}}
function updateDock(){
 if(!dock)return;
 const header=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header'))||64;
 const hero=$('hero'), afterHero=page!=='home'||!hero||hero.getBoundingClientRect().bottom<=header+2;
 const atFooter=footer&&footer.getBoundingClientRect().top<innerHeight;
 dock.hidden=page==='consultation'||!afterHero||!!activeDialog||!!atFooter;
}
function openDialog(dialog,trigger){
 if(activeDialog===dialog)return;
 if(activeDialog){const prior=activeDialog;activeDialog=null;prior.close();}
 else oldOverflow=document.body.style.overflow;
 activeDialog=dialog;returnFocus=trigger||document.activeElement;
 document.body.style.overflow='hidden';
 if(dialog===menu)menuButton?.setAttribute('aria-expanded','true');
 dialog.showModal();
 const first=focusable(dialog)[0];if(first)first.focus({preventScroll:true});
 updateDock();
}
function closeDialog(dialog,restore=true){
 if(!dialog?.open)return;
 if(dialog===activeDialog){activeDialog=null;document.body.style.overflow=oldOverflow;}
 dialog.close();
 if(dialog===menu)menuButton?.setAttribute('aria-expanded','false');
 if(restore&&returnFocus?.isConnected&&returnFocus.getClientRects().length)returnFocus.focus({preventScroll:true});
 returnFocus=null;updateDock();
}
for(const dialog of dialogs){
 dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog(dialog);});
 dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const r=dialog.getBoundingClientRect();
  if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog(dialog);
 });
 dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const items=focusable(dialog),first=items[0],last=items.at(-1);
  if(!first){event.preventDefault();return;}
  if(event.shiftKey&&(document.activeElement===first||!dialog.contains(document.activeElement))){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&(document.activeElement===last||!dialog.contains(document.activeElement))){event.preventDefault();first.focus();}
 });
 dialog.addEventListener('close',()=>{
  if(dialog===menu)menuButton?.setAttribute('aria-expanded','false');
  if(activeDialog===dialog){activeDialog=null;document.body.style.overflow=oldOverflow;updateDock();}
 });
}
menuButton?.addEventListener('click',()=>openDialog(menu,menuButton));
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>closeDialog($(button.dataset.close))));
menu?.querySelectorAll('a[href]').forEach(link=>link.addEventListener('click',()=>closeDialog(menu,false)));
function toast(message){const el=$('toast');if(!el)return;clearTimeout(toastTimer);el.textContent=message;el.hidden=false;toastTimer=setTimeout(()=>{el.hidden=true;el.textContent='';},4000);}
document.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',()=>{
 const kind=button.dataset.contact;
 $('contact-title').textContent=kind==='phone'?'전화 상담 안내':kind==='kakao'?'카카오톡 상담 안내':'데모 안내';
 $('contact-description').textContent=kind==='phone'?'전화 연결을 체험하는 데모입니다. 실제 전화번호는 연결되지 않습니다.':kind==='kakao'?'카카오톡 상담을 체험하는 데모입니다. 실제 채널로 연결되지 않습니다.':'고객 화면을 확인하는 데모입니다. 실제 예약이나 문의는 접수되지 않습니다.';
 $('contact-extra').textContent='가상의 정보로 상담 예약 화면을 체험할 수 있습니다.';
 $('contact-booking-link').hidden=page==='consultation';
 $('contact-dialog').dataset.sheet=innerWidth<768?'true':'false';
 openDialog($('contact-dialog'),button);
}));
const lightbox=$('lightbox-image');
lightbox?.addEventListener('error',()=>{$('image-caption').textContent='사진을 불러오지 못했습니다. 창을 닫고 다시 시도해주세요.';});
document.querySelectorAll('[data-image]').forEach(button=>{
 const image=button.querySelector('img');
 function photoFailed(){button.dataset.failed='true';button.classList.add('photo-failed');const caption=button.parentElement.querySelector('figcaption');if(caption)caption.textContent=button.dataset.title+' · 사진을 불러오지 못했습니다. 페이지를 새로고침해주세요.';}
 image?.addEventListener('error',photoFailed);
 if(image?.complete&&!image.naturalWidth)photoFailed();
 button.addEventListener('click',()=>{
  if(button.dataset.failed){toast('사진을 불러오지 못했습니다. 페이지를 새로고침해주세요.');return;}
  $('image-title').textContent=button.dataset.title;
  $('image-caption').textContent='AI로 제작한 가상 주택 콘셉트입니다.';
  lightbox.alt=button.dataset.title+' — AI로 제작한 가상 주택';lightbox.src=button.dataset.image;
  openDialog($('image-dialog'),button);
 });
});
let lnbQueued=false;
function updateLnb(){
 const links=[...document.querySelectorAll('.lnb a[href^="#"]')];if(!links.length)return;
 const header=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header'))||64;
 const threshold=header+(innerWidth>=1024?120:64);
 let current=links[0];
 for(const link of links){const section=$(link.hash.slice(1));if(section&&section.getBoundingClientRect().top<=threshold)current=link;}
 if(scrollY+innerHeight>=document.documentElement.scrollHeight-2)current=links.at(-1);
 for(const link of links){if(link===current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}
}
function scheduleLnb(){if(!lnbQueued){lnbQueued=true;requestAnimationFrame(()=>{lnbQueued=false;updateLnb();});}}
addEventListener('scroll',()=>{scheduleDock();scheduleLnb();},{passive:true});
addEventListener('resize',()=>{scheduleDock();scheduleLnb();if(activeDialog===$('contact-dialog'))activeDialog.dataset.sheet=innerWidth<768?'true':'false';});
addEventListener('herochange',scheduleDock);
if('ResizeObserver'in window)new ResizeObserver(()=>{scheduleDock();scheduleLnb();}).observe(document.body);
updateDock();updateLnb();
const form=$('booking-form');if(!form)return;
const fields=$('booking-fields'), date=$('date'),time=$('time'),complete=$('booking-complete');
function koreaToday(){try{return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}catch{return localISO(new Date());}}
function localISO(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function parseDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;const [y,m,d]=value.split('-').map(Number),result=new Date(y,m-1,d);return localISO(result)===value?result:null;}
function setBounds(){const today=koreaToday(),end=parseDate(today);end.setDate(end.getDate()+30);date.min=today;date.max=localISO(end);}
function dateError(){const value=date.value,d=parseDate(value);if(!value)return '희망 날짜를 선택해주세요.';if(!d||value<date.min||value>date.max)return '오늘부터 30일 이내 날짜를 선택해주세요.';if(d.getDay()===0||d.getDay()===6)return '주말을 제외한 평일을 선택해주세요.';return '';}
function showError(id,message){const input=$(id),el=$(id+'-error');if(message){input.setAttribute('aria-invalid','true');el.textContent=message;}else{input.removeAttribute('aria-invalid');el.textContent='';}}
function clearErrors(){for(const id of ['name','phone','region','date','time','consent'])showError(id,'');$('form-alert').hidden=true;$('form-alert').textContent='';}
function resetTimes(){time.replaceChildren(new Option('날짜를 먼저 선택해주세요',''));time.disabled=true;}
function fillTimes(){resetTimes();if(dateError())return;time.replaceChildren(new Option('희망 시간을 선택해주세요',''));for(let hour=10;hour<=17;hour++)time.add(new Option(String(hour)+':00',String(hour)+':00'));time.disabled=false;}
function scrollAndFocus(target){target.focus({preventScroll:true});const margin=(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header'))||64)+24;window.scrollTo({top:Math.max(0,target.getBoundingClientRect().top+scrollY-margin),behavior:'instant'});}
function resetBooking(focus=false,notify=false){form.reset();setBounds();resetTimes();clearErrors();$('request-count').textContent='0 / 500';complete.hidden=true;$('complete-time').textContent='';form.hidden=false;fields.disabled=false;if(focus)scrollAndFocus($('name'));if(notify)toast('입력 내용을 초기화했습니다.');}
date.addEventListener('change',()=>{setBounds();fillTimes();showError('date',date.value?dateError():'');showError('time','');});
$('request').addEventListener('input',()=>{$('request-count').textContent=$('request').value.length+' / 500';});
for(const id of ['name','phone','region','time','consent'])$(id).addEventListener(id==='consent'||id==='time'?'change':'input',()=>showError(id,''));
function confirmBooking(){
 setBounds();clearErrors();const errors=[];
 if(!$('name').value.trim())errors.push(['name','이름을 입력해주세요.']);
 if(!/^010\d{8}$/.test($('phone').value.replace(/[\s-]/g,'')))errors.push(['phone','010으로 시작하는 연락처 11자리를 입력해주세요.']);
 if(!$('region').value.trim())errors.push(['region','예정 지역의 시·군·구를 입력해주세요.']);
 const problem=dateError();if(problem)errors.push(['date',problem]);
 if(!/^(1[0-7]):00$/.test(time.value)||time.disabled)errors.push(['time','날짜를 확인한 뒤 희망 시간을 선택해주세요.']);
 if(!$('consent').checked)errors.push(['consent','데모 안내 확인에 체크해주세요.']);
 if(errors.length){for(const [id,message]of errors)showError(id,message);$('form-alert').textContent='확인이 필요한 항목이 '+errors.length+'개 있습니다. 입력 내용을 확인해주세요.';$('form-alert').hidden=false;scrollAndFocus($(errors[0][0]));return;}
 const d=parseDate(date.value),weekday=['일','월','화','수','목','금','토'][d.getDay()];
 $('complete-time').textContent=d.getFullYear()+'년 '+(d.getMonth()+1)+'월 '+d.getDate()+'일 ('+weekday+') '+time.value+' · 희망 일시';
 form.hidden=true;complete.hidden=false;scrollAndFocus(complete.querySelector('h2'));
}
form.addEventListener('submit',event=>{event.preventDefault();confirmBooking();});
form.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.matches('input[type="text"],input[type="tel"],input:not([type])')){event.preventDefault();confirmBooking();}});
$('booking-submit').addEventListener('click',confirmBooking);
$('booking-reset').addEventListener('click',()=>resetBooking(true,true));
$('booking-again').addEventListener('click',()=>resetBooking(true));
addEventListener('pageshow',event=>{if(event.persisted)resetBooking();});
resetBooking();
})();


