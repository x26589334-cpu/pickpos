# 픽포스(PickPOS) — 작업 지침

**작업 시작 전에 `작업노트.md` 를 반드시 읽을 것.** 브랜드·도메인·금액·시트 연동·OG 이미지 등
이 사이트의 모든 배경 정보와 미확인 항목이 거기 정리돼 있다.

## 사이트
- 정적 사이트(빌드 없음). 메인 = `index.html` + `style.css` + `script.js` + `form.js`
- 서브페이지 = `compare/` (상권별 구입 vs 렌탈 비교글) + `page.js`(서브페이지 공용 JS)
- 배포: GitHub Pages (main / root) → https://hsupporter.com/ · 푸시 후 1~2분이면 반영
- 리포: https://github.com/x26589334-cpu/pickpos

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
- `PRICE` 를 고치면 `compare/` 글 안의 숫자도 전부 바뀐다. grep 해서 함께 갱신할 것.

## 매일 글쓰기 — "오늘 글 써줘"
`_content/글양식.md` 를 읽고 그대로 따른다. `_content/지역목록.md` 에서 안 쓴 상권을 위에서부터 하나 골라
`compare/{slug}.html` + `compare/og/{slug}.png` 를 만들고 목록·사이트맵·상태까지 갱신한 뒤 푸시한다.
**H포스와 겹치지 않게** 제목에 "설치"를 쓰지 않고, 행정구역 대신 상권·역 이름을 쓴다. 자세한 이유는 `작업노트.md`.

## 작업 흐름
```
git pull            # 시작 전
git add -A; git commit -m "내용"; git push    # 끝나면
```

## 사용자 안내
코딩 초보자다. 설명은 버튼 하나하나 짚어주듯 천천히, 한국어로.
