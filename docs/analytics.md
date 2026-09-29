# Google Analytics 4 운영 가이드

프론트엔드에 GA4를 붙여 **방문 → 로그인 → 작성 → 공유 → 실물 편지 신청** 흐름을 수치로 볼 수 있게 한 구성입니다.

## 1. 구성 요약

| 파일 | 역할 |
|---|---|
| `lib/analytics/ga.ts` | GA 래퍼. 이벤트 카탈로그 타입(`AnalyticsEvents`), `track()`, `pageview()`, `setUser()` |
| `components/GoogleAnalytics.tsx` | gtag.js 로드, 라우트 전환 페이지뷰, 로그인 사용자 `user_id` 동기화, `login`/`logout` 이벤트 |
| `app/layout.tsx` | `<GoogleAnalytics />`를 `SessionProvider` 안에 렌더 |
| `Dockerfile` | `ARG NEXT_PUBLIC_GA_ID` (빌드 타임 주입) |

`NEXT_PUBLIC_GA_ID`가 비어 있으면 스크립트를 로드하지 않고 모든 `track()` 호출이 no-op이 됩니다. 로컬 개발에서는 비워두면 됩니다.

## 2. 최초 설정 (GA 콘솔)

1. https://analytics.google.com → 관리 → **속성 만들기** (속성 이름: Letter Community, 시간대: 한국, 통화: KRW)
2. **데이터 스트림 → 웹** 추가. URL은 운영 도메인. 생성되면 `G-XXXXXXXXXX` 형태의 **측정 ID**가 나옵니다.
3. 데이터 스트림 상세 → **향상된 측정**에서 다음을 켭니다.
   - 스크롤 (90% 스크롤 자동 수집)
   - 이탈 클릭 (외부 링크)
   - **"브라우저 기록 이벤트에 따른 페이지 변경"은 끕니다.** 앱에서 페이지뷰를 직접 보내므로 켜두면 중복 집계됩니다.
4. 관리 → **데이터 보관** → 이벤트 데이터 보관 기간을 **14개월**로 (기본 2개월은 너무 짧음).
5. 관리 → **Google 신호 데이터** 는 끄는 것을 권장 (개인정보 처리방침 부담 감소).

## 3. 환경변수 배포

| 환경 | 방법 |
|---|---|
| 로컬 | `.env.local`에 `NEXT_PUBLIC_GA_ID=` (비워둠). DebugView 테스트할 때만 값을 넣고 `pnpm dev` |
| Vercel | 프로젝트 Settings → Environment Variables → `NEXT_PUBLIC_GA_ID` (Production만) |
| Docker | `docker build --build-arg NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX .` — `NEXT_PUBLIC_*`는 빌드 시 번들에 인라인되므로 런타임 `-e`로는 적용되지 않습니다 |

## 4. 커스텀 측정기준 등록 (필수)

GA4는 이벤트 파라미터를 **등록해야** 보고서/탐색에서 필터·분류로 쓸 수 있습니다. 등록 전 데이터는 소급되지 않으니 배포 직후 바로 합니다.

관리 → **맞춤 정의 → 맞춤 측정기준 만들기** (범위: 이벤트)

| 측정기준 이름 | 이벤트 파라미터 | 쓰는 곳 |
|---|---|---|
| letter_type | `letter_type` | 편지 vs 사연 구분 |
| category | `category` | 사연 카테고리별 작성/필터 |
| method | `method` | 로그인 수단, 공유 수단 |
| from | `from` | 로그인 모달/글쓰기 CTA가 뜬 동선 |
| action | `action` | 좋아요 추가/취소 |
| is_reply | `is_reply` | 사연 답장 편지 여부 |
| is_public | `is_public` | 공개 여부 |
| anonymous | `anonymous` | 실물 신청 비로그인 여부 |
| letter_id | `letter_id` | 특정 글 단위 분석 (카디널리티 높음, 탐색에서만 사용) |

맞춤 측정항목 (범위: 이벤트, 단위: 표준)

| 측정항목 이름 | 파라미터 |
|---|---|
| content_length | `content_length` |
| correction_count | `correction_count` |
| selected_count | `selected_count` |
| message_index | `message_index` |

사용자 속성 (관리 → 맞춤 정의 → 사용자 속성)

| 이름 | 설명 |
|---|---|
| login_provider | kakao / naver / instagram / guest |
| is_logged_in | yes / no |

## 5. 이벤트 카탈로그

코드의 단일 진실은 `lib/analytics/ga.ts`의 `AnalyticsEvents`입니다. 이벤트를 추가할 때는 거기에 타입을 먼저 추가하고 `track()`을 호출하세요. 이 표는 GA에서 보고서를 만들 때 참고용입니다.

### 인증

| 이벤트 | 파라미터 | 발생 지점 |
|---|---|---|
| `login_dialog_open` | from (callbackUrl) | 로그인 모달이 열릴 때 |
| `login_start` | method | SNS 로그인 버튼 클릭 (OAuth 리다이렉트 직전) |
| `login` | method | 세션이 authenticated가 된 첫 순간 (세션당 1회) |
| `logout` | - | authenticated → unauthenticated 전환 |

`login_start` 대비 `login` 비율 = OAuth 완료율.

### 작성

| 이벤트 | 파라미터 | 발생 지점 |
|---|---|---|
| `letter_create` | letter_type=friend, is_reply, is_public, content_length | 편지 등록 성공 |
| `story_create` | letter_type=story, category, is_public, content_length | 사연 등록 성공 |
| `letter_update` | letter_type, letter_id | 편지/사연 수정 성공 |
| `letter_delete` | letter_type, letter_id | 삭제 성공 |
| `draft_save` | letter_type, is_new | 임시저장 성공 |
| `proofread_shown` | correction_count | 등록 직전 맞춤법 교정 모달이 뜸 |
| `proofread_confirm` | correction_count, selected_count | 교정 모달에서 등록 확정 |

### 소비

| 이벤트 | 파라미터 | 발생 지점 |
|---|---|---|
| `letter_view` | letter_type, letter_id, is_author | 상세 페이지 진입 |
| `envelope_open` | letter_id | 봉투 애니메이션 열기 (편지만) |
| `like` | letter_id, letter_type, action | 좋아요 API 성공 |
| `share` | method (kakao / copy_link), content_type, item_id | 작성 직후 공유 모달, 상세 페이지 링크 복사 |
| `story_filter` | search, category, sort | 사연 목록 필터/검색 변경 |

### 실물 편지

| 이벤트 | 파라미터 | 발생 지점 |
|---|---|---|
| `physical_request` | letter_id, anonymous, is_duplicate | 신청 API 성공 (로그인/익명 폼 모두) |

### AI / CTA

| 이벤트 | 파라미터 | 발생 지점 |
|---|---|---|
| `ai_chat_open` | - | 감정 챗봇 열기 |
| `ai_chat_message` | message_index | 챗봇에 메시지 전송 |
| `daily_prompt_write_click` | logged_in | 오늘의 글감 → 글쓰기 클릭 |
| `write_cta_click` | from, logged_in | 글쓰기 CTA 클릭 (상세 페이지, 헤더) |

자동 수집: `page_view` (라우트 전환 포함), `session_start`, `first_visit`, `scroll`, `click`(이탈).

## 6. 검증

1. `.env.local`에 측정 ID를 넣고 `pnpm dev`. 개발 모드에서는 `debug_mode: true`가 붙어 **관리 → DebugView**에 실시간으로 뜹니다.
2. 브라우저 DevTools → Network → `collect?v=2` 요청에서 `en=` 파라미터로 이벤트명을 확인할 수 있습니다.
3. 운영 배포 후에는 **보고서 → 실시간**에서 확인. 표준 보고서 반영은 24~48시간 걸립니다.

## 7. 처음 만들어 둘 보고서 (탐색 → 유입경로 탐색 분석)

| 퍼널 | 단계 |
|---|---|
| 편지 작성 | `page_view`(/write) → `letter_create` → `share` |
| 사연 작성 | `page_view`(/story-update) → `story_create` |
| 로그인 전환 | `login_dialog_open` → `login_start` → `login` |
| 실물 편지 | `letter_view` → `envelope_open` → `physical_request` |
| 챗봇 → 작성 | `ai_chat_open` → `ai_chat_message` → `letter_create` |

주요 지표

- DAU/WAU, 신규 vs 재방문 (기본 제공)
- 작성 전환율 = `letter_create` + `story_create` 사용자 / 활성 사용자
- 로그인 전환율 = `login` / `login_dialog_open`
- 카테고리별 사연 작성 수 (`story_create` × category)
- 공유 수단 비율 (`share` × method)

## 8. 개인정보

- `user_id`에는 백엔드 내부 ID만 넣습니다. 이메일, 이름, 전화번호는 GA로 보내지 않습니다 (GA 약관 위반).
- 편지 본문, 검색어(`story_filter.search`)는 사용자가 입력한 자유 텍스트입니다. 검색어에 개인정보가 들어갈 수 있으니 민감하다고 판단되면 `useStoriesFilter.ts`에서 `search`를 빈 문자열로 고정하세요.
- 개인정보처리방침(`app/privacy/page.tsx`) 쿠키 항목에 "Google Analytics를 이용한 서비스 이용 통계 분석" 문구를 추가하는 것을 권장합니다. 법무 판단이 필요해 코드에서는 수정하지 않았습니다.

## 9. 이벤트 추가하는 법

```ts
// 1. lib/analytics/ga.ts 의 AnalyticsEvents 에 추가
recipient_add: { source: "modal" | "page" };

// 2. 호출
import { track } from "@/lib/analytics/ga";
track("recipient_add", { source: "modal" });

// 3. 새 파라미터면 4번 절차대로 GA에 맞춤 측정기준 등록
```

파라미터 이름은 GA 예약어(`page_title`, `session_id` 등)와 겹치지 않게 snake_case로, 값은 문자열/숫자/불리언만.
