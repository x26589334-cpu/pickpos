# 픽포스(PickPOS) — 작업 지침

**작업 시작 전에 `작업노트.md` 를 반드시 읽을 것.** 브랜드·도메인·금액·시트 연동·OG 이미지 등
이 사이트의 모든 배경 정보와 미확인 항목이 거기 정리돼 있다.

## 사이트
- 정적 사이트(빌드 없음). `index.html` + `style.css` + `script.js` + `form.js`
- 배포: GitHub Pages (main / root) → https://hsupporter.com/ · 푸시 후 1~2분이면 반영
- 리포: https://github.com/x26589334-cpu/pickpos

## 주의사항
- **캐시 버전**: `style.css` / `script.js` / `og-image.png` 를 수정하면 `index.html` 안의
  `?v=` 값을 전부 올려야 방문자에게 반영된다. 안 올리면 "바뀐 게 없다"가 된다.
- **금액**: 단가는 `script.js` 맨 위 `PRICE` 객체와 `index.html` 표기 **두 군데**에 있다. 항상 같이 고칠 것.
- **전화번호**: `01068321994`, `010-6832-1994` — index.html·form.js 에 흩어져 있음.
- **색상**: `style.css` 맨 위 `:root` 변수.
- `og-image.png` 는 직접 고치지 말고 `og-image.source.html` 을 고쳐서 다시 렌더 (방법은 작업노트.md).

## 작업 흐름
```
git pull            # 시작 전
git add -A; git commit -m "내용"; git push    # 끝나면
```

## 사용자 안내
코딩 초보자다. 설명은 버튼 하나하나 짚어주듯 천천히, 한국어로.
