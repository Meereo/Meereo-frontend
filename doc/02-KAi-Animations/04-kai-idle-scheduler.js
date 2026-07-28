/* ═══════════════════════════════════════════════════════════════════════════
   MEEREO — PLANIFICATEUR DE MICRO-GESTES KAi · 28 juillet 2026
   Conforme à la spécification §5 et §8 : gestes tirés au sort, jamais combinés,
   jamais sur un rythme fixe. Intervalle 2,6–6,8 s, pondération 40 / 35 / 25.
   ⚠️ §12 : ces valeurs sont « testées mais non validées comme définitives ».
   ═══════════════════════════════════════════════════════════════════════════ */

(function(){
    const GESTS=[{cls:'gest-nod',w:40},{cls:'gest-glance',w:35},{cls:'gest-blink',w:25}];
    function pick(){
      let r=Math.random()*100,acc=0;
      for(const g of GESTS){acc+=g.w;if(r<=acc)return g.cls;}
      return GESTS[0].cls;
    }
    function tick(){
      document.querySelectorAll('.kai-avatar-wrap').forEach(wrap=>{
        const k=wrap.querySelector('.kai-k');
        const cls=pick();
        const target=cls==='gest-nod'?wrap:k;
        if(!target)return;
        target.classList.add(cls);
        target.addEventListener('animationend',()=>target.classList.remove(cls),{once:true});
      });
      setTimeout(tick,2600+Math.random()*4200);
    }
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      setTimeout(tick,2600+Math.random()*4200);
    }
  })();
