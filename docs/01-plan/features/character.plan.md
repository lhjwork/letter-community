# character Planning Document

> **Summary**: 글을 쓰고 읽는 순간 감정에 반응하는 캐릭터. 어드민이 캐릭터(스프라이트·메타)를 등록·제어하면 커뮤니티에 즉시 반영된다.
>
> **Project**: letter-projects (letter-community · letter-admin · letter-my-backend)
> **Version**: community 0.1.0 / backend 1.0.0 / admin 0.0.1
> **Author**: hanjinlee
> **Date**: 2026-09-24
> **Status**: Draft
> **Branch**: `character` (3개 저장소 동일). MVP 커밋 `4a482db` (community)

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 편지 작성·읽기가 텍스트만 있어 정서적 동반자가 없다. 캐릭터를 코드에 하드코딩(`toto`)해 두면 작가 콜라보·교체·판매 때마다 배포가 필요하다. |
| **Solution** | 캐릭터를 **데이터**(DB 문서 + 스프라이트 파일)로 만들고 어드민에서 CRUD·활성화. 커뮤니티는 `/api/characters/active`를 읽어 렌더. 감정 판별(사전 기반)과 재생(애니메이션 WebP)은 MVP 그대로. |
| **Function/UX Effect** | 슬픈 문장에 울고 기쁜 문장에 춤추는 캐릭터가 편지지 위에 산다. 운영자는 코드 없이 캐릭터 추가·교체·끄기. 작가 에셋은 폴더 하나 = 캐릭터 하나. |
| **Core Value** | "공감하는 편지 서비스"의 시각적 정체성 + 웹툰 작가 콜라보·캐릭터 판매로 이어지는 수익 장치의 기반. |

---

## 1. Overview

### 1.1 Purpose
- 글 감정에 반응하는 캐릭터를 **운영 가능한 콘텐츠**로 만든다.
- 어드민 → 백엔드 → 커뮤니티로 흐르는 단일 파이프라인을 세운다. 이후 캐릭터 판매·데스크톱 펫은 이 위에 얹는다.

### 1.2 Background
- MVP(오늘): `lib/emotion/lexicon.ts`(사전 기반 감정) + `components/character/EmotionCharacter.tsx`(WebP 재생) + `public/characters/toto/`(낙서 데모). `/write`, `/story-update`에 연결됨.
- 참고한 것: 인스타 GIF 스티커·카카오 이모티콘(= PNG 시퀀스 → 애니메이션 WebP), WebSwing.app(Swift+SpriteKit, 48px 스프라이트 11장 + 창 윗변을 발판으로 쓰는 물리).
- 제약: Anthropic 크레딧 소진 → AI 라우트 전부 503. 감정 판별은 사전 기반으로 간다. 백엔드에 **파일 업로드가 없다**(광고는 URL 입력).
- 기존 패턴: 광고(Advertisement) = 어드민 CRUD + `displayControl` + 공개 `GET /api/ads/displayable` → 커뮤니티 표시. 캐릭터도 동일 구조로.

### 1.3 Related Documents
- MVP 코드: `letter-community/components/character/`, `lib/emotion/`, `scripts/frames-to-webp.sh`
- 광고 패턴: `letter-my-backend/src/models/Advertisement.ts`, `routes/adRoutes.ts`, `letter-admin/src/pages/Ads.tsx`

---

## 2. Scope

### 2.1 In Scope (Phase 1 — 이번 PDCA)
- [ ] 백엔드 `Character` 모델 + 어드민 CRUD API + 공개 조회 API
- [ ] 백엔드 스프라이트 업로드(감정별 WebP) + 정적 서빙
- [ ] 어드민 캐릭터 페이지(목록·등록·수정·활성/비활성·기본 캐릭터 지정)
- [ ] 커뮤니티: 하드코딩 `toto` 제거 → 서버의 활성 캐릭터 사용, 에셋 URL을 백엔드에서 로드
- [ ] 스프라이트 스펙 문서(작가 발주용) — 이 문서 §7

### 2.2 Out of Scope (후속 Phase)
- Phase 2: 사용자별 캐릭터 선택(마이페이지), 읽기 모드 반응(`detectTimeline` + IntersectionObserver), 편지지 위를 걸어다니는 엔진(WebSwing식 발판 물리)
- Phase 3: 캐릭터 판매(결제·소유권), 작가 정산, LLM 감정 보정(크레딧 복구 후) 및 공감 대화(persona)
- Phase 4: 데스크톱 펫(Tauri, 엔진 재사용)
- 네이버 웹툰 IP 계약 — 기술 범위 아님. 구조는 IP 무관하게 만든다.

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | `Character` 모델: `slug`(고유, URL-safe), `name`, `artist{name, url}`, `status: draft\|active`, `isDefault`, `fps`, `sprites{idle, joy, sad, love, angry, surprise}` (각 URL, idle 필수), `lines{감정별 말풍선}` (선택, 없으면 코드 기본값), `createdBy` | High | Pending |
| FR-02 | 어드민 API: `GET/POST /api/characters`, `GET/PUT/DELETE /api/characters/:id`, `PUT /:id/status`, `PUT /:id/default` — `adminAuthenticate` + 새 권한 `CHARACTERS_READ/WRITE` | High | Pending |
| FR-03 | 업로드 API: `POST /api/characters/:id/sprites/:emotion` (multipart, `image/webp`만, ≤2MB) → 저장 후 `sprites[emotion]` 갱신. `DELETE` 로 제거 | High | Pending |
| FR-04 | 정적 서빙: `/uploads/characters/<slug>/<emotion>.webp` (express.static, 캐시 헤더 1년 + 파일명에 해시 or 쿼리 버전) | High | Pending |
| FR-05 | 공개 API: `GET /api/characters/active` → 활성 캐릭터 목록 + `default` 표시. 인증 불필요, 60초 캐시 | High | Pending |
| FR-06 | 어드민 UI: 목록(상태·기본·미리보기), 등록/수정 폼(메타 + 감정별 업로드 슬롯 6개, 업로드 즉시 애니메이션 미리보기), 활성 토글, 기본 지정, 삭제(활성이면 불가) | High | Pending |
| FR-07 | 커뮤니티: `EmotionCharacter`가 `characterId` 대신 서버 manifest(`{sprites, lines, fps}`)를 받는다. 활성 캐릭터 없음 → 렌더 안 함(이모지 폴백 제거). 감정 파일 없음 → idle | High | Pending |
| FR-08 | 커뮤니티 데이터 로드: 서버 컴포넌트/`lib/services/characterService.ts`에서 1회 fetch → 에디터 페이지에 prop. 실패 시 캐릭터 미표시, 페이지는 정상 | High | Pending |
| FR-09 | `public/characters/toto` 데모 → 어드민으로 업로드한 시드 데이터로 대체, 정적 폴더 삭제 | Medium | Pending |
| FR-10 | 어드민 미리보기에서 6감정 강제 재생 버튼(작가 검수용) | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 캐릭터 manifest 로드가 에디터 첫 렌더를 막지 않음(비동기, LCP 영향 0). 스프라이트 1개 ≤ 200KB 권장, 2MB 하드 리밋 | Lighthouse LCP 전후 비교, 업로드 검증 |
| Security | 업로드: 어드민 권한, MIME+매직바이트 검사(`RIFF....WEBP`), 확장자 고정 `.webp`, 파일명은 서버가 생성(slug/emotion), 경로 조작 불가 | 코드 리뷰 + 잘못된 파일 업로드 테스트 |
| Privacy | 감정 판별은 클라이언트 사전 기반. 편지 본문은 이 기능으로 서버에 전송되지 않는다 | 네트워크 탭 확인 |
| Accessibility | 캐릭터 `aria-hidden`, `prefers-reduced-motion`이면 idle 정지 프레임만 | 수동 확인 |
| Ops | 캐릭터 추가·교체·끄기에 배포 불필요 | 어드민에서 실행 후 커뮤니티 60초 내 반영 |

---

## 4. Success Criteria

### 4.1 Definition of Done
- [ ] 어드민에서 캐릭터 신규 등록 → WebP 6개 업로드 → 활성 → 기본 지정까지 코드 수정 없이 완료
- [ ] 커뮤니티 `/write`, `/story-update`에서 그 캐릭터가 감정에 반응
- [ ] 어드민에서 비활성화 → 60초 내 커뮤니티에서 사라짐
- [ ] `public/characters/` 정적 데모 제거, 하드코딩 slug 없음
- [ ] `lexicon.test.ts` 통과, 백엔드 업로드 검증 테스트 1개, 3개 저장소 tsc/lint/build 통과

### 4.2 Quality Criteria
- [ ] 새 의존성: 백엔드 `multer` 1개만. 프론트 0개
- [ ] 광고 모듈 컨벤션(model/controller/service/route, admin api/types/pages) 그대로 따름

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 로컬 디스크 업로드는 서버 1대(Lightsail) 전제. 컨테이너 재배포 시 파일 유실 | High | Medium | `uploads/`를 docker volume으로 마운트. 다중 서버 되면 S3로 교체 — 저장 계층을 `storageService.save(buffer, key)` 한 함수로 격리해 교체 지점 1곳 |
| 감정 오판(반어법, "웃으며 슬픈 얘기")으로 사용자 기분 상함 | Medium | High | 임계값 유지(키워드 1개 반응, hedge 시 2개), 오판 시 idle로 복귀 2.6초. LLM 보정은 Phase 3 |
| 작가 에셋이 스펙(크기·fps·loop)과 다르게 옴 | Medium | High | §7 발주 스펙 + 어드민 미리보기(FR-10)로 업로드 즉시 검수 |
| 캐릭터가 글쓰기를 방해("떠다니는 그래픽 금지" 취향, letter-stamp plan §3.6) | Medium | Medium | 편지지 우하단 고정, 반응 시에만 움직임, 사용자 끄기 옵션(Phase 2). 걸어다니는 엔진은 옵트인 |
| IP 콜라보 계약 지연 | Low | High | 자체 캐릭터로 먼저 운영. 구조는 IP 무관 |

---

## 6. Architecture Considerations

### 6.1 Project Level
**Dynamic** (기존 프로젝트 레벨 유지. 커스텀 Express 백엔드 — bkend.ai 미사용)

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| 캐릭터 정의 위치 | 코드 상수 / 정적 폴더 / **DB + 파일** | DB + 파일 | 어드민 제어·판매·콜라보 전부 데이터 변경으로 끝나야 함 |
| 애니메이션 포맷 | 애니 WebP / Lottie / Rive / 스프라이트시트+canvas | **애니 WebP** | 작가 도구(Procreate·Clip Studio) 산출물 그대로. `<img>` 하나, 라이브러리 0. 걷기 엔진(Phase 2)에서 스프라이트시트 병행 검토 |
| 변환 책임 | 서버(sharp) / **로컬 스크립트** | 로컬 `frames-to-webp.sh` | 서버 변환은 sharp 의존 + CPU. 어드민은 완성 WebP만 업로드. 업로드 빈도가 낮아 충분 |
| 파일 저장 | **로컬 디스크 + express.static** / S3 | 로컬 디스크 | 서버 1대, 파일 수십 개. S3는 저장 함수 1곳 교체로 이관 |
| 업로드 라이브러리 | **multer**(memoryStorage) / busboy | multer | 표준. 메모리로 받아 매직바이트 검사 후 디스크 기록 |
| 커뮤니티 로드 | 클라 fetch / **서버 fetch → prop** | 서버 fetch | 깜빡임 없음, 광고 `adService` 패턴과 동일 |
| 감정 판별 | 사전 / LLM / 자체 모델 | 사전(현행) | AI 비활성. LLM은 Phase 3에서 결과 덮어쓰기 |
| 캐시 무효화 | 파일명 해시 / **URL `?v=updatedAt`** | 쿼리 버전 | 같은 slug/emotion 덮어쓰기 가능, 구현 1줄 |

### 6.3 데이터 흐름

```
[작가] PNG 시퀀스
   └─ scripts/frames-to-webp.sh ─→ joy.webp …
[어드민] 캐릭터 등록 ─→ POST /api/characters
         감정별 업로드 ─→ POST /api/characters/:id/sprites/joy  ─→ uploads/characters/<slug>/joy.webp
         활성/기본 지정 ─→ PUT /:id/status, /:id/default
[커뮤니티] 서버 컴포넌트 ─→ GET /api/characters/active (60s 캐시)
         └─ <EmotionCharacter manifest={…}> ─→ <img src="BACKEND/uploads/characters/<slug>/sad.webp?v=…">
         └─ detectEmotion(editor.getText()) (클라, 서버 전송 없음)
```

### 6.4 폴더 구조 (추가분)
```
letter-my-backend/src/
  models/Character.ts
  controllers/characterController.ts
  services/characterService.ts        # CRUD + 스프라이트 저장(storage 함수 격리)
  routes/characterRoutes.ts
  middleware/upload.ts                 # multer memoryStorage + webp 검사
uploads/characters/<slug>/<emotion>.webp   # docker volume

letter-admin/src/
  api/characters.ts  types/characters.ts
  pages/Characters.tsx  CharacterDetail.tsx  CharacterNew.tsx
  components/characters/SpriteSlot.tsx   # 업로드 + 미리보기

letter-community/
  lib/services/characterService.ts     # getActiveCharacters()
  types/character.ts                   # CharacterManifest
  components/character/EmotionCharacter.tsx  # manifest prop으로 변경
  lib/emotion/                          # 변경 없음
```

### 6.5 Convention
- 백엔드: 광고 모듈의 model → service → controller → route 계층, `ApiResponse` 포맷, `PERMISSIONS`에 `CHARACTERS_*` 추가
- 어드민: `api/*.ts` + `types/*.ts` + `pages/*.tsx(.scss)`, react-query, ky
- 커뮤니티: `lib/services/*Service.ts`, 컴포넌트 `"use client"` 최소화

---

## 7. 스프라이트 스펙 (작가 발주용 — 어드민 업로드 검증 기준과 동일)

| 항목 | 값 |
|---|---|
| 캔버스 | 정사각형, 240×240 이상(권장 360), 투명 배경 |
| 감정 | `idle`(필수) · `joy` · `sad` · `love` · `angry` · `surprise` |
| 프레임 | 감정당 12~24장, **12fps** |
| 길이 | `idle` 무한 루프(첫/끝 프레임 연결). 나머지 1~2.5초 안에 동작 완결(2.6초 후 idle 복귀) |
| 납품 | PNG 시퀀스(우리가 WebP 변환) 또는 애니 WebP |
| 용량 | 감정당 ≤ 200KB 권장, 2MB 하드 리밋 |
| 참고 | 인스타 GIF 스티커·카카오 이모티콘 규격. 데모: `public/characters/toto/` |

---

## 8. Phase 로드맵

| Phase | 내용 | 선행 |
|---|---|---|
| **1 (이번)** | 어드민 CRUD·업로드 → 커뮤니티 반영 | MVP ✅ |
| 2 | 사용자 캐릭터 선택, 읽기 모드 반응, 걷기 엔진(`lib/character/engine.ts`: 상태머신+중력+`data-ledge` 발판) | Phase 1 |
| 3 | 판매(결제·소유), 작가 정산, LLM 감정 보정·공감 대화 | Phase 2, AI 크레딧 |
| 4 | 데스크톱 펫(Tauri, 엔진·스프라이트 재사용, OS 창 발판) | Phase 2 엔진 |

---

## 9. Next Steps
1. `/pdca design character` — API 스키마·어드민 폼 필드·업로드 검증 로직·커뮤니티 타입 확정
2. 작가 섭외 병행 (§7 스펙 전달)
3. 구현 순서: 백엔드 모델·API → 어드민 페이지 → 커뮤니티 교체 → 정적 데모 제거
