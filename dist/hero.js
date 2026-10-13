
(()=>{
const hero=document.getElementById('hero'),stage=document.getElementById('hero-stage'),fit=document.getElementById('visual-fit'),stack=document.getElementById('image-stack'),images=[...stack.querySelectorAll('img')],buttons=[...document.querySelectorAll('[data-stage]')],fill=document.getElementById('progress-fill'),title=document.getElementById('hero-title'),label=document.getElementById('stage-label'),description=document.getElementById('hero-description'),motion=matchMedia('(prefers-reduced-motion:reduce)');
const copies=[
['당신의 삶에서, 집을 시작합니다.','설계 · 생활에서 시작','생활방식에서 시작하는 맞춤 주택.'],
['생각을 공간으로, 계획을 집으로.','입체 주택 · 계획을 구체화','공간의 관계와 재료를 계획합니다.'],
['가족의 일상이 머무는 집.','완성 주택 · 일상을 담다','정원과 이어지는 따뜻한 일상.']
];let queued=false,lastStage=-1,failed=false,videoReady=false,videoFailed=false,imagesFailed=false,desiredTime=0;
const video=document.getElementById('hero-video');
const clamp=n=>Math.min(1,Math.max(0,n));
const smooth=n=>{n=clamp(n);return n*n*(3-2*n)};
function metrics(){const header=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header'));return {start:hero.getBoundingClientRect().top+scrollY,span:Math.max(1,hero.offsetHeight-stage.offsetHeight),header}}
function fitImage(){stack.style.removeProperty('--image-width')}
function reveal(image,value){const t=smooth(value);image.style.opacity=t===0?'0':'1';const edge=t*110-5;const mask=t===1?'none':'linear-gradient(90deg, #000 0%, #000 '+Math.max(0,edge-5)+'%, transparent '+Math.min(100,Math.max(0,edge+5))+'%, transparent 100%)';image.style.maskImage=mask;image.style.webkitMaskImage=mask;}
function setStage(index){if(index===lastStage)return;lastStage=index;const rawTitle=copies[index][0];title.textContent=index===2?rawTitle.replace('일상이 ','일상이\n'):rawTitle.replace(', ',',\n');if(!motion.matches&&title.animate){title.getAnimations().forEach(a=>a.cancel());title.animate([{opacity:.35,transform:'translateY(18px)',clipPath:'inset(0 0 14% 0)'},{opacity:1,transform:'translateY(0)',clipPath:'inset(0)'}],{duration:650,easing:'cubic-bezier(.16,1,.3,1)'});}label.textContent=copies[index][1];description.textContent=copies[index][2];buttons.forEach((b,i)=>{if(i===index)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});images.forEach((img,i)=>img.setAttribute('aria-hidden',String(i!==index)));}
function update(){queued=false;window.dispatchEvent(new Event('herochange'));if(failed)return;if(motion.matches){setStage(2);hero.dataset.progress='1';return}const m=metrics(),p=clamp((scrollY-m.start)/m.span);reveal(images[1],(p-.10)/.35);reveal(images[2],(p-.54)/.36);fill.style.transform='scaleX('+p+')';setStage(p<.28?0:p<.70?1:2);hero.dataset.progress=p.toFixed(4);desiredTime=p*Math.max(0,(Number.isFinite(video.duration)?video.duration:8)-.04);seekVideo();}
function schedule(){if(!queued){queued=true;requestAnimationFrame(update)}}
buttons.forEach(b=>b.addEventListener('click',()=>{const m=metrics();window.scrollTo({top:m.start+m.span*[0,.5,1][Number(b.dataset.stage)],behavior:motion.matches?'auto':'smooth'})}));
window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',()=>{lastStage=-1;fitImage();schedule()},{passive:true});new ResizeObserver(fitImage).observe(fit);motion.addEventListener('change',()=>{lastStage=-1;configureVideo();fitImage();schedule()});
function staticFallback(){failed=true;stack.classList.remove('video-ready');document.body.classList.add('asset-fallback');const available=[...images].reverse().find(img=>img.naturalWidth>0);setStage(2);images.forEach(img=>{img.classList.toggle('fallback-image',img===available);img.setAttribute('aria-hidden',String(img!==available))});const msg=document.getElementById('asset-message');msg.hidden=false;msg.textContent=available?'준비된 주택 이미지와 단계 설명을 정적으로 보여드립니다.':'주택 이미지를 불러오지 못했습니다. 파일을 함께 보관한 뒤 새로고침해주세요.';fitImage();window.dispatchEvent(new Event('herochange'));}
function seekVideo(){if(!videoReady||videoFailed||motion.matches||failed||video.seeking)return;if(Math.abs(video.currentTime-desiredTime)>1/60){try{video.currentTime=desiredTime}catch{useImages()}}}
function useImages(){videoReady=false;videoFailed=true;video.pause();stack.classList.remove('video-ready');hero.dataset.videoStatus='fallback';const msg=document.getElementById('asset-message');msg.hidden=false;msg.textContent='영상을 불러오지 못해 세 단계 이미지로 보여드립니다.';if(imagesFailed)staticFallback();schedule();}
function configureVideo(){video.pause();videoReady=false;stack.classList.remove('video-ready');if(motion.matches){video.removeAttribute('src');video.load();hero.dataset.videoStatus='reduced-motion';if(imagesFailed)staticFallback();return;}videoFailed=false;hero.dataset.videoStatus='loading';video.preload='auto';video.src=video.dataset.src;video.load();}
video.addEventListener('loadeddata',()=>{if(motion.matches||failed)return;videoReady=true;videoFailed=false;hero.dataset.videoStatus='ready';update();seekVideo();if(!video.seeking)stack.classList.add('video-ready');schedule();});
video.addEventListener('seeked',()=>{if(!videoReady||videoFailed||motion.matches||failed)return;stack.classList.add('video-ready');seekVideo();});
video.addEventListener('error',()=>{if(!motion.matches)useImages()});
Promise.allSettled(images.map(img=>img.decode())).then(results=>{imagesFailed=!results.every(r=>r.status==='fulfilled');if(imagesFailed&&(motion.matches||videoFailed))staticFallback();});
configureVideo();
fitImage();update();
})();
