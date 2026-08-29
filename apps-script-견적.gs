/* =========================================================================
   픽포스(hsupporter.com) 견적 신청 → "웹 문의" 시트의 "견적" 탭 저장용 Apps Script
   -------------------------------------------------------------------------
   ▶ 붙여넣는 법 (기존 과외/국제학교 스크립트는 안 건드림 — 완전히 새 프로젝트)
   1) script.google.com 접속 → 왼쪽 위 [+ 새 프로젝트]
   2) 편집기의 기존 코드 전부 지우고, 아래 전체를 붙여넣기 → 저장(💾)
   3) [배포] → [새 배포] → 유형(톱니바퀴): 웹 앱
        - 설명: 픽포스 견적
        - 실행 계정: 나
        - 액세스 권한: 모든 사용자
      → [배포] → 권한 승인 팝업 뜨면 [고급]→[안전하지 않음(이동)]→[허용]
   4) 나오는 "웹 앱 URL"(.../exec) 복사해서 Claude에게 알려주기 → form.js 에 넣어줌
   ========================================================================= */

var SHEET_ID   = "1UUS6le8gJTsuvaSDi31ZzuQjA214YD32xJFVgYx9cno"; // 웹 문의 시트 (과외와 같은 파일)
var SHEET_NAME = "견적"; // 저장할 탭 (없으면 자동 생성)

function doPost(e) {
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    var p  = (e && e.parameter) ? e.parameter : {};
    var when = p._time || new Date().toLocaleString("ko-KR");
    var kind = p._form || "";

    var headers;
    if (sh.getLastRow() === 0) {
      headers = ["접수시각", "구분"];
      for (var k in p) { if (k.charAt(0) === "_" || k === "sheet") continue; headers.push(k); }
      sh.appendRow(headers);
    } else {
      headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
      for (var k2 in p) {
        if (k2.charAt(0) === "_" || k2 === "sheet") continue;
        if (headers.indexOf(k2) === -1) { headers.push(k2); sh.getRange(1, headers.length).setValue(k2); }
      }
    }

    var row = [];
    for (var i = 0; i < headers.length; i++) {
      var h = headers[i];
      row.push(h === "접수시각" ? when : h === "구분" ? kind : (p[h] != null ? p[h] : ""));
    }
    sh.appendRow(row);
    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput("error: " + err);
  }
}
