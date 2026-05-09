# Java Lecture

Java 수업용 강의 자료. 빌드 도구 없는 정적 HTML/CSS 사이트로, Vercel에 배포된다.

## 폴더 구조

```
Java_Lecture/
├── index.html              ← 카테고리 카드 그리드 (목차)
├── CLAUDE.md               ← 강의 작성 컨벤션 (필독)
├── vercel.json             ← cleanUrls + 캐시 헤더
├── images/                 ← 이미지 자산
└── network/
    └── socket_lecture.html ← Chapter 17 · 소켓 통신
```

향후 `thread/`, `collection/`, `io/` 등 카테고리 폴더가 추가된다. 신규 강의 추가 절차는 `CLAUDE.md`의 **§7 새 강의 추가 체크리스트** 참고.

## 로컬 실행

빌드 단계 없음. 다음 중 하나로 띄운다:

```bash
# Node 환경
npx serve .

# Python 환경
python -m http.server 8000
```

브라우저에서 `http://localhost:3000` (serve 기본) 또는 `http://localhost:8000` 접속.

## 배포

- **운영 URL:** https://java-lecture.vercel.app
- **GitHub:** https://github.com/kitae104/java-lecture
- **클린 URL:** `/network/socket_lecture.html` ↔ `/network/socket_lecture` 양쪽 모두 동작

`main` 브랜치에 푸시하면 Vercel이 자동으로 production 배포한다 (GitHub App 연동, 푸시 후 보통 1분 이내). 그 외 브랜치 푸시는 preview URL이 자동 생성된다.

```bash
git add .
git commit -m "..."
git push origin main      # → 자동 배포
```

수동 배포(폴백, 거의 쓸 일 없음):
```bash
vercel --prod --scope aqua0405-2866s-projects
```

## 강의 작성

새 강의를 만들 때는 반드시 [`CLAUDE.md`](./CLAUDE.md)의 디자인 토큰·섹션 패턴·재사용 클래스명을 그대로 따른다. 라이트 테마(순백 + 진한 네이비) 외 색상 도입은 금지.
