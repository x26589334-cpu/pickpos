/* ===========================================================
   견적 신청 폼 → 구글 시트 연결 (픽포스)
   -----------------------------------------------------------
   다른 사이트(kids-online, gwaoe-page)와 같은 방식입니다.
   1) 구글 시트 새로 만들기 → 확장 프로그램 → Apps Script
   2) gwaoe-page/apps-script-과외.gs 내용을 붙여넣고 SHEET_NAME 을 "견적" 으로 변경
   3) 배포 → 새 배포 → 웹 앱 (액세스: 모든 사용자) → 웹앱 URL 복사
   4) 아래 SHEET_ENDPOINT 의 PASTE_ 부분을 그 URL로 교체
   연결 전에는 "데모 모드"로 동작해서 접수 완료 문구만 뜨고 어디에도 저장되지 않습니다.
   =========================================================== */

const SHEET_ENDPOINT = "PASTE_APPS_SCRIPT_WEBAPP_URL_HERE";

function _val(id){ const el = document.getElementById(id); return el ? String(el.value).trim() : ""; }

function _sendToSheet(payload){
  if(!SHEET_ENDPOINT || SHEET_ENDPOINT.indexOf("PASTE_") === 0){
    console.warn("[픽포스] 시트 미연결 — 데모 모드. 접수 내용:", payload);
    return Promise.resolve();
  }
  return fetch(SHEET_ENDPOINT, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: new URLSearchParams(payload).toString()
  });
}

(function(){
  const form = document.getElementById("quoteForm");
  if(!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const focusErr = (id, msg) => { alert(msg); const el = document.getElementById(id); if(el) el.focus(); };
    if(!_val("q_name"))  return focusErr("q_name",  "이름 또는 상호를 입력해 주세요.");
    const phone = _val("q_phone").replace(/[^0-9]/g, "");
    if(phone.length < 10) return focusErr("q_phone", "연락처를 정확히 입력해 주세요.");
    if(!_val("q_biz"))   return focusErr("q_biz",   "업종을 선택해 주세요.");
    const items = [...document.querySelectorAll("#q_items input:checked")].map(cb => cb.value);
    if(!items.length){ alert("필요한 장비를 하나 이상 선택해 주세요."); return; }
    if(!document.getElementById("q_agree").checked){ alert("연락처 수집·이용에 동의해 주세요."); return; }

    const payload = {
      sheet: "견적",
      _form: "픽포스-견적신청",
      _page: location.pathname,
      _time: new Date().toLocaleString("ko-KR"),
      이름상호: _val("q_name"),
      연락처: _val("q_phone"),
      업종: _val("q_biz"),
      지역: _val("q_area"),
      장비: items.join(", "),
      도입방식: _val("q_mode"),
      희망시기: _val("q_when"),
      남길말: _val("q_memo")
    };

    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.disabled = true; btn.textContent = "접수 중…";
    try { await _sendToSheet(payload); } catch(_) { /* no-cors: 응답을 읽을 수 없어도 정상 */ }
    document.getElementById("quoteOk").hidden = false;
    btn.textContent = "접수 완료 ✓";
    // 문자로도 바로 보낼 수 있게 링크 제공
    const sms = document.querySelector(".qd-sms");
    if(sms){
      const body = `픽포스 견적 문의 / ${payload.이름상호} / ${payload.업종} / ${payload.장비} / ${payload.도입방식}`;
      sms.href = "sms:01068321994?body=" + encodeURIComponent(body);
    }
    void orig;
  });
})();
