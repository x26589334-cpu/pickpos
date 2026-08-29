/* =========================================================
   픽포스 — 페이지 동작 (진단 · 카탈로그 탭 · 비용 계산기 · 메뉴 등)
   ※ 단가는 아래 PRICE 하나만 고치면 계산기 / 진단 / 카탈로그 문구가 아니라
      "계산기"와 "진단 예상 월비용"에 반영됩니다. 카탈로그·세트의 표기 금액은
      index.html 에 직접 적혀 있으니 함께 바꿔 주세요.
   ========================================================= */

// 참고용 예시 단가 (원). rent = 월 렌탈료, buy = 구입가
const PRICE = {
  pos:        { name: "포스기",        rent: 21000, buy: 890000 },
  terminal:   { name: "카드단말기",    rent: 9900,  buy: 150000 },
  kiosk:      { name: "키오스크",      rent: 33000, buy: 1900000 },
  tableorder: { name: "테이블오더",    rent: 14000, buy: 250000 },
  vending:    { name: "무인자판기",    rent: 99000, buy: 2900000 }
};
const MONTHS = 36;
const won = n => n.toLocaleString("ko-KR") + "원";

/* ---------- 장비 진단 (업종 × 규모 → 추천 구성) ---------- */
// items: [장비키, 수량, 비고]
const RECO = {
  cafe: {
    s: { items: [["terminal",1,"블루투스형 추천"],["pos",1,"선택"]], note: "혼자 운영하는 소형 카페는 단말기만으로 시작해도 충분합니다. 메뉴가 많아지면 포스를 추가하세요." },
    m: { items: [["kiosk",1,"탁상형"],["pos",1,"키오스크 연동"],["terminal",1,"백업용"]], note: "피크 시간 주문 대기를 줄이려면 탁상형 키오스크가 가장 효과적입니다." },
    l: { items: [["kiosk",2,"스탠드형"],["pos",1,"주방 프린터 포함"],["terminal",1,""]], note: "다점포라면 매출을 한 계정에서 보는 포스 구성을 잡아 드립니다." }
  },
  food: {
    s: { items: [["pos",1,"주방 프린터 포함"],["terminal",1,"무선형"]], note: "테이블이 적어도 주방 출력이 있으면 실수가 줄어듭니다." },
    m: { items: [["tableorder",8,"테이블 8개 기준"],["pos",1,"테이블오더 연동"],["terminal",1,"무선형"]], note: "테이블오더는 테이블 수만큼 태블릿이 들어갑니다. 수량은 계산기에서 바꿔 보세요." },
    l: { items: [["tableorder",16,"테이블 16개 기준"],["pos",2,"홀·주방 분리"],["kiosk",1,"포장 주문용"]], note: "대형 식당은 포장 주문 키오스크를 따로 두면 홀 회전이 빨라집니다." }
  },
  unmanned: {
    s: { items: [["kiosk",1,"스탠드형"],["vending",1,"멀티형"]], note: "무인매장의 기본 구성입니다. 앱으로 매출·재고를 원격 확인합니다." },
    m: { items: [["kiosk",1,"스탠드형"],["vending",2,"냉동+멀티"],["pos",1,"관리용"]], note: "품목이 늘면 냉동·상온 자판기를 분리하는 편이 관리가 쉽습니다." },
    l: { items: [["kiosk",2,""],["vending",3,""],["pos",1,"통합 관리"]], note: "여러 지점을 한 계정으로 관리하는 구성을 제안해 드립니다." }
  },
  retail: {
    s: { items: [["pos",1,"바코드스캐너 포함"],["terminal",1,""]], note: "소매점은 재고 관리가 핵심이라 포스 구성을 권합니다." },
    m: { items: [["pos",1,"바코드스캐너 포함"],["terminal",2,"카운터 2곳"],["kiosk",1,"셀프계산대"]], note: "셀프계산대를 두면 피크 시간 계산 대기가 줄어듭니다." },
    l: { items: [["pos",2,""],["terminal",2,""],["kiosk",2,"셀프계산대"]], note: "" }
  },
  beauty: {
    s: { items: [["terminal",1,"블루투스형"]], note: "예약·고객관리는 스마트폰 앱으로, 결제는 초소형 단말기로 가볍게 시작하세요." },
    m: { items: [["pos",1,"예약·고객관리형"],["terminal",1,""]], note: "직원이 여럿이면 매출 분배를 위해 포스를 두는 편이 편합니다." },
    l: { items: [["pos",1,""],["terminal",2,""],["kiosk",1,"접수용"]], note: "" }
  },
  office: {
    s: { items: [["vending",1,"음료·스낵"]], note: "장소만 제공하고 운영은 맡기는 방식이면 비용 없이 시작할 수도 있습니다. 상담 시 안내드립니다." },
    m: { items: [["vending",2,"음료 + 스낵/냉동"],["terminal",1,"수납용"]], note: "" },
    l: { items: [["vending",3,"층별 배치"],["terminal",1,"수납용"]], note: "" }
  }
};

const state = { biz: "cafe", size: "s" };

function renderFinder(){
  const r = RECO[state.biz][state.size];
  const list = document.getElementById("frList");
  let monthly = 0, parts = [];
  list.innerHTML = r.items.map(([k,q,memo]) => {
    monthly += PRICE[k].rent * q;
    parts.push(PRICE[k].name + " " + q + "대");
    return `<li><b>${PRICE[k].name} × ${q}</b><span>${memo || ""}</span></li>`;
  }).join("");
  document.getElementById("frCost").textContent = won(monthly) + "~";
  document.getElementById("frNote").textContent = r.note || "설치비는 별도로 받지 않습니다.";
  // 견적 폼으로 넘길 문구
  const bizLabel = document.querySelector("#bizChips .is-on").textContent;
  const sizeLabel = document.querySelector("#sizeChips .is-on").textContent;
  document.getElementById("frCta").dataset.pick = `진단 결과: ${bizLabel} / ${sizeLabel} → ${parts.join(", ")}`;
  document.getElementById("frCta").dataset.biz = bizLabel;
}

function wireChips(id, key){
  const box = document.getElementById(id);
  box.addEventListener("click", e => {
    const btn = e.target.closest(".chip"); if(!btn) return;
    box.querySelectorAll(".chip").forEach(c => c.classList.remove("is-on"));
    btn.classList.add("is-on");
    state[key] = btn.dataset[key === "biz" ? "biz" : "size"];
    renderFinder();
  });
}
wireChips("bizChips", "biz");
wireChips("sizeChips", "size");
renderFinder();

/* ---------- 카탈로그 탭 ---------- */
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => { t.classList.remove("is-on"); t.setAttribute("aria-selected","false"); });
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("is-on"));
    tab.classList.add("is-on"); tab.setAttribute("aria-selected","true");
    document.querySelector(`.panel[data-panel="${tab.dataset.tab}"]`).classList.add("is-on");
  });
});

/* ---------- 구입 vs 렌탈 계산기 ---------- */
function calc(){
  let rInit = 0, rMonth = 0, bInit = 0, bMonth = 0, any = false, picks = [];
  document.querySelectorAll("#calcItems .ci").forEach(ci => {
    const k = ci.dataset.key, q = Math.max(0, parseInt(ci.querySelector("input").value, 10) || 0);
    if(!q) return;
    any = true; picks.push(PRICE[k].name + " " + q + "대");
    rMonth += PRICE[k].rent * q;
    bInit  += PRICE[k].buy * q;
  });
  const rTotal = rInit + rMonth * MONTHS;
  const bTotal = bInit + bMonth * MONTHS;
  document.getElementById("rInit").textContent = won(rInit);
  document.getElementById("rMonth").textContent = won(rMonth);
  document.getElementById("rTotal").textContent = won(rTotal);
  document.getElementById("bInit").textContent = won(bInit);
  document.getElementById("bMonth").textContent = won(bMonth);
  document.getElementById("bTotal").textContent = won(bTotal);

  const v = document.getElementById("crVerdict");
  if(!any){ v.textContent = "장비를 선택해 주세요."; }
  else if(rTotal < bTotal){
    v.innerHTML = `36개월 기준 <b>렌탈</b>이 <b>${won(bTotal - rTotal)}</b> 저렴합니다. 초기 부담도 0원이라 시작하기 쉽습니다.`;
  } else if(bTotal < rTotal){
    const be = Math.ceil(bInit / rMonth); // 손익분기 개월
    v.innerHTML = `36개월 기준 <b>구입</b>이 <b>${won(rTotal - bTotal)}</b> 저렴합니다. 약 <b>${be}개월</b>째부터 구입 쪽이 유리해집니다.`;
  } else {
    v.textContent = "두 방식의 36개월 총비용이 같습니다. 초기 부담을 줄이려면 렌탈을 권합니다.";
  }
  document.getElementById("calcCta").dataset.pick = "계산기 수량: " + picks.join(", ") + (any ? ` (렌탈 월 ${won(rMonth)} / 구입 ${won(bInit)})` : "");
}
document.getElementById("calcItems").addEventListener("click", e => {
  const b = e.target.closest(".q-btn"); if(!b) return;
  const inp = b.parentElement.querySelector("input");
  const max = parseInt(inp.max, 10) || 50;
  inp.value = Math.min(max, Math.max(0, (parseInt(inp.value,10) || 0) + parseInt(b.dataset.d, 10)));
  calc();
});
document.getElementById("calcItems").addEventListener("input", calc);
calc();

/* ---------- "견적 받기" 링크 → 폼에 선택 내용 미리 채우기 ---------- */
document.addEventListener("click", e => {
  const a = e.target.closest("a[data-pick]"); if(!a) return;
  const memo = document.getElementById("q_memo");
  const text = a.dataset.pick;
  if(memo && !memo.value.includes(text)){
    memo.value = (memo.value ? memo.value + "\n" : "") + text;
  }
  // 장비 체크박스 자동 선택
  document.querySelectorAll("#q_items input").forEach(cb => { if(text.includes(cb.value)) cb.checked = true; });
  if(text.includes("자판기")) document.querySelector('#q_items input[value="무인자판기"]').checked = true;
  if(text.includes("단말기")) document.querySelector('#q_items input[value="카드단말기"]').checked = true;
  if(text.includes("포스")) document.querySelector('#q_items input[value="포스기"]').checked = true;
  // 진단에서 넘어오면 업종도 선택
  if(a.dataset.biz){
    const sel = document.getElementById("q_biz");
    [...sel.options].forEach(o => { if(a.dataset.biz.startsWith(o.value.split("·")[0])) sel.value = o.value; });
  }
});

/* ---------- 모바일 메뉴 ---------- */
const ham = document.getElementById("ham"), mnav = document.getElementById("mnav");
ham.addEventListener("click", () => {
  const open = mnav.classList.toggle("is-open");
  ham.classList.toggle("is-open", open);
  ham.setAttribute("aria-expanded", String(open));
});
mnav.addEventListener("click", e => { if(e.target.tagName === "A"){ mnav.classList.remove("is-open"); ham.classList.remove("is-open"); } });

/* ---------- 연도 ---------- */
document.getElementById("year").textContent = new Date().getFullYear();
