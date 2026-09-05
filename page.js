/* =========================================================
   픽포스 — 서브페이지 공용 동작 (compare/ 등)
   상단바 스크롤 상태 · 햄버거 메뉴 · 연도 · 스크롤 등장 효과
   ※ 메인(index.html)은 script.js 를 쓰고 이 파일은 안 씀. 서브페이지만 로드.
   ========================================================= */
(function(){
  var top = document.getElementById("top");
  if(top){
    var onScroll = function(){ top.classList.toggle("is-scrolled", window.scrollY > 10); };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  var ham = document.getElementById("ham"), mnav = document.getElementById("mnav");
  if(ham && mnav){
    ham.addEventListener("click", function(){
      var open = mnav.classList.toggle("is-open");
      ham.classList.toggle("is-open", open);
      ham.setAttribute("aria-expanded", String(open));
    });
    mnav.addEventListener("click", function(e){
      if(e.target.tagName === "A"){ mnav.classList.remove("is-open"); ham.classList.remove("is-open"); }
    });
  }

  var year = document.getElementById("year");
  if(year) year.textContent = new Date().getFullYear();

  var els = document.querySelectorAll(".reveal");
  if("IntersectionObserver" in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: .12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function(el){ io.observe(el); });
  }else{
    els.forEach(function(el){ el.classList.add("in"); });
  }
})();
