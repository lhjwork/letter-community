# 네이버 OAuth Vercel 배포 빠른 해결 체크리스트

## ✅ 1단계: Vercel 도메인 확인 (1분)

1. Vercel 대시보드 접속
2. 프로젝트 클릭
3. 상단에 표시된 도메인 복사 (예: `letter-community.vercel.app`)

**내 Vercel 도메인:** `_______________________`

---

## ✅ 2단계: 네이버 개발자 센터 설정 (3분)

### 2-1. 접속

- URL: https://developers.naver.com/apps/#/list
- 로그인 후 애플리케이션 선택

### 2-2. API 설정 탭

- [ ] **서비스 URL**에 Vercel 도메인 추가

  ```
  https://[내-도메인].vercel.app
  ```

- [ ] **Callback URL**에 다음 추가 (정확히 입력!)

  ```
  https://[내-도메인].vercel.app/api/auth/callback/naver
  ```

- [ ] 저장 버튼 클릭

### 2-3. 제공 정보 확인

- [ ] 회원이름 ✓
- [ ] 이메일 주소 ✓
- [ ] 프로필 사진 ✓

---

## ✅ 3단계: Vercel 환경 변수 설정 (3분)

### 3-1. Vercel 설정 페이지

- 프로젝트 → **Settings** → **Environment Variables**

### 3-2. 필수 환경 변수 확인/추가

| 변수명                    | 값                                                 | 확인 |
| ------------------------- | -------------------------------------------------- | ---- |
| `NEXTAUTH_URL`            | `https://[내-도메인].vercel.app`                   | [ ]  |
| `AUTH_SECRET`             | `letter-community-jin-with-openssl-rand-base64-32` | [ ]  |
| `NAVER_CLIENT_ID`         | `ieTN3X_Q2OA28067ZHHW`                             | [ ]  |
| `NAVER_CLIENT_SECRET`     | `TdAbFUrSEA`                                       | [ ]  |
| `BACKEND_URL`             | (백엔드 실제 URL)                                  | [ ]  |
| `NEXT_PUBLIC_BACKEND_URL` | (백엔드 실제 URL)                                  | [ ]  |

### 3-3. 환경 적용 범위

- [ ] Production ✓
- [ ] Preview ✓ (선택사항)
- [ ] Development (선택사항)

---

## ✅ 4단계: 재배포 (1분)

### 4-1. 재배포 실행

- Vercel 대시보드 → **Deployments** 탭
- 최신 배포 클릭
- **⋯ (점 3개)** → **Redeploy** 클릭
- "Redeploy" 버튼 다시 클릭하여 확인

### 4-2. 배포 완료 대기

- [ ] 배포 상태가 "Ready" 될 때까지 대기 (1-2분)

---

## ✅ 5단계: 테스트 (1분)

### 5-1. 사이트 접속

- `https://[내-도메인].vercel.app` 접속

### 5-2. 네이버 로그인 테스트

- [ ] 로그인 버튼 클릭
- [ ] 네이버 로그인 선택
- [ ] 네이버 로그인 페이지로 정상 이동
- [ ] 로그인 후 사이트로 정상 리디렉션

---

## 🔍 문제 발생 시 디버깅

### 여전히 "letter에 로그인할 수 없습니다" 에러가 나온다면:

#### 확인 1: Callback URL 정확성

네이버 개발자 센터의 Callback URL이 **정확히** 다음과 같은지 확인:

```
https://[내-도메인].vercel.app/api/auth/callback/naver
```

**주의사항:**

- ❌ `http://` (X) → ✅ `https://` (O)
- ❌ 끝에 `/` 있음 (X) → ✅ `/` 없음 (O)
- ❌ `callback` 오타 → ✅ `callback` 정확히

#### 확인 2: NEXTAUTH_URL 정확성

Vercel 환경 변수의 `NEXTAUTH_URL`이 **정확히** 다음과 같은지 확인:

```
https://[내-도메인].vercel.app
```

**주의사항:**

- ❌ 끝에 `/` 있음 (X) → ✅ `/` 없음 (O)
- ❌ `http://` (X) → ✅ `https://` (O)

#### 확인 3: 재배포 완료

- [ ] 환경 변수 변경 후 **반드시** 재배포 했는지 확인
- [ ] 배포 상태가 "Ready"인지 확인

#### 확인 4: 브라우저 캐시

- [ ] 시크릿/프라이빗 모드로 테스트
- [ ] 또는 브라우저 캐시 삭제 후 재시도

---

## 📞 추가 도움이 필요하면

### Vercel 로그 확인

1. Vercel 대시보드 → Deployments
2. 최신 배포 클릭
3. **Functions** 탭 → `/api/auth/[...nextauth]` 클릭
4. 에러 로그 확인

### 네이버 개발자 센터 문의

- 네이버 개발자 센터 → 고객센터
- 또는 https://developers.naver.com/support

---

## ✨ 성공 확인

다음이 모두 작동하면 성공입니다:

- [ ] Vercel 사이트 정상 접속
- [ ] 네이버 로그인 버튼 클릭 시 네이버 로그인 페이지로 이동
- [ ] 네이버 로그인 후 사이트로 정상 리디렉션
- [ ] 로그인 상태 유지

**예상 소요 시간: 5-10분**
