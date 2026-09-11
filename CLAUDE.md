# 픽포스(PickPOS) — 작업 지침

**작업 시작 전에 `작업노트.md` 를 반드시 읽을 것.** 브랜드·도메인·금액·시트 연동·OG 이미지 등
이 사이트의 모든 배경 정보와 미확인 항목이 거기 정리돼 있다.

## 사이트
- 정적 사이트(빌드 없음). 메인 = `index.html` + `style.css` + `script.js` + `form.js`
- 서브페이지 = `compare/`(상권별 구입 vs 렌탈 비교글) · `region/`(지역별 설치 안내, H포스식 구성) + `page.js`(서브페이지 공용 JS)
- 배포: GitHub Pages (main / root) → https://hsupporter.com/ · 푸시 후 1~2분이면 반영
- 리포: https://github.com/x26589334-cpu/pickpos

## 메인 구조 (2026-09-10 H포스식으로 개편)
순서: 빵부스러기 → **#regions 지역 찾기**(시도 17·시군구 234, 검색·장비토글) → **#stats 전국 서비스 안내**
→ #finder 장비 진단 → #catalog → #process → #sets → #swap → #faq → #quote
- **비용 계산기 섹션(#calc)은 2026-09-10 삭제**했다(사용자 지시). 관련 HTML·JS·CSS 전부 제거.
  계산기로 가던 링크 968개는 `compare/`(구입 vs 렌탈 비교 가이드)로 돌렸다. `#calc` 를 다시 쓰지 말 것.
- **카탈로그 탭 바로가기**: `#catalog-pos` `#catalog-terminal` `#catalog-kiosk` `#catalog-tableorder` `#catalog-vending`
  상단 메뉴의 "포스기·카드단말기"와 "무인자판기"가 같은 `#catalog` 를 가리키던 것을 이걸로 갈랐다. 동작은 `script.js` 맨 아래.
- 지역 데이터는 **`region-data.js`** 의 `PICK_REGIONS`. 지역 전용 페이지가 있는 곳만 `PICK_REGION_PAGES` 에 적는다.
  적힌 곳은 그 페이지로 이동하고(칩에 "안내" 배지), 없는 곳은 **견적 폼의 지역칸·장비 체크박스를 채우고 #quote 로 보낸다.**
  → `region/` 에 새 지역 글을 쓰면 `PICK_REGION_PAGES` 에 한 줄 추가할 것.
- 지역 찾기 동작은 `script.js` 맨 아래 블록.

## 지역 페이지 234개 — 생성기로 만든다
- 만드는 법: `powershell -ExecutionPolicy Bypass -File _content지역페이지생성.ps1`
- 재료: `_content/지역데이터.tsv` (slug·시도·지역명·동목록·별칭). 동 3,066개가 들어 있어 페이지마다 내용이 다르다.
- **손으로 쓴 `seoul-gangnam.html` 은 생성기 SKIP 목록에 있다.** 다른 페이지를 손으로 고치면 다음 실행 때 덮어써지니, 고칠 일이 있으면 **생성기 템플릿을 고치고 전체를 다시 돌린다.**
- 요금을 바꾸면 생성기 안의 `` 배열도 같이 고치고 재생성할 것 (`script.js` 의 PRICE 와 같은 값).
- 재생성 후에는 `region-data.js`·`region/index.html`·`sitemap.xml` 도 함께 갱신한다.

### ⚠️ PowerShell 스크립트는 BOM 있는 UTF-8 로 저장
BOM 이 없으면 PowerShell 5.1 이 한글을 ANSI 로 읽어 **문법 오류로 실행이 실패**한다.
`_content/*.ps1` 을 고친 뒤에는 BOM 을 확인할 것 (첫 3바이트 239,187,191).

## 상단 메뉴는 전 페이지 동일 — 손으로 고치지 말 것
```
지역 찾기 · 포스기·카드단말기 · 무인자판기 · 비교 가이드 · 지역별 견적 · 설치 후기
```
- 바꿀 때는 **`_content/메뉴통일.ps1` 의 `$MENU` 를 고치고 스크립트를 돌린다.** 241개 페이지가 한 번에 맞춰진다.
  ```
  powershell -ExecutionPolicy Bypass -File _content메뉴통일.ps1
  ```
- 경로는 위치에 따라 자동으로 붙는다(루트는 그대로, 하위 폴더는 `../`, 자기 폴더는 `./`).
- **데스크톱(.nav)·모바일(#mnav)·푸터(.foot-nav) 셋 다** 바뀐다. 모바일 끝에 "견적 받기", 푸터 끝에 "견적 신청"이 붙는다.
- **지역 페이지 생성기(`지역페이지생성.ps1`)의 템플릿 메뉴도 같이 고쳐야 한다.** 안 그러면 재생성 때 옛 메뉴로 돌아간다.

## 주의사항
- **캐시 버전**: `style.css` / `script.js` / `og-image.png` 를 수정하면 `index.html` 안의
  `?v=` 값을 전부 올려야 방문자에게 반영된다. 안 올리면 "바뀐 게 없다"가 된다.
- **금액**: 단가는 `script.js` 맨 위 `PRICE` 객체와 `index.html` 표기 **두 군데**에 있다. 항상 같이 고칠 것.
- **전화번호**: `01068321994`, `010-6832-1994` — index.html·form.js 에 흩어져 있음.
- **색상**: `style.css` 맨 위 `:root` 변수.
- `og-image.png` 는 직접 고치지 말고 `og-image.source.html` 을 고쳐서 다시 렌더 (방법은 작업노트.md).
- **`.nojekyll` 을 만들지 말 것**: `_content/` 가 Jekyll 덕분에 게시 제외되고 있다. 만들면 작업용 파일이 공개된다.
- `compare/` 안의 페이지는 경로가 전부 `../` 다. 테스트용 임시 파일도 `compare/` 안에 만들어야 CSS 가 붙는다.
- 크롬 `--screenshot` 은 **절대경로** 필수 (상대경로면 액세스 거부).
- `PRICE` 를 고치면 `compare/` 글과 `region/` 페이지의 손익분기 표가 전부 바뀐다. grep 해서 함께 갱신할 것.

## 매일 글쓰기
**글을 올린 뒤에는 `powershell -NoProfile -ExecutionPolicy Bypass -File _contentRSS생성.ps1` 로 `rss.xml` 을 갱신해 함께 커밋한다** (후기·비교 글 최신 100건, 2026-09-11 신설. 네이버 서치어드바이저 등록 주소 `https://hsupporter.com/rss.xml`).

**"오늘 후기 써줘"** → `_content/후기양식.md` (설치 후기, 사진 1장씩 순번대로)
**"오늘 글 써줘"** → `_content/글양식.md` (비교 가이드 / 지역별 견적 번갈아)

### 후기 주의사항
- 사진의 실제 지역과 글의 지역은 **일부러 다르다**. 사진은 채워 넣는 용도다(사용자 결정).
- 그래서 figcaption 에 "{지역}에 설치한" 이라고 쓰지 말고, 글 하단에 이 문구를 반드시 넣는다:
  `※ 사진은 픽포스가 시공한 설치 사례이며, 글에 적힌 지역의 현장 사진은 아닙니다.`
- 사진은 발행 전 **직접 열어 확인**한다(얼굴·상호 노출 시 건너뛴다). 쓴 사진 번호는 `_content/후기지역목록.md` 하단 표에 기록해 중복을 막는다.

## 매일 글쓰기 — "오늘 글 써줘"
`_content/글양식.md` 를 읽고 그대로 따른다. `_content/지역목록.md` 에서 안 쓴 상권을 위에서부터 하나 골라
`compare/{slug}.html` + `compare/og/{slug}.png` 를 만들고 목록·사이트맵·상태까지 갱신한 뒤 푸시한다.
**H포스와 키워드가 겹쳐도 된다**(다른 도메인이라 각각 노출됨 — 2026-09-05 방침 변경). 동네·제품 키워드를 최대한 넣되,
**`region/` 은 H포스 구성을 그대로 따라간다**(2026-09-08 결정 — 소제목·메시지·키워드 동일).
단 **문장은 새로 쓴다**. 텍스트를 그대로 복사하면 중복 콘텐츠로 한쪽이 걸러질 수 있다.
`compare/`(비용 비교 글)는 기존 방식 유지. 자세한 건 `작업노트.md` 와 `_content/글양식.md`.

## 작업 흐름
```
git pull            # 시작 전
git add -A; git commit -m "내용"; git push    # 끝나면
```

## 사용자 안내
코딩 초보자다. 설명은 버튼 하나하나 짚어주듯 천천히, 한국어로.
