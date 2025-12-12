# Vercel 배포 디버깅 가이드

## 환경 변수가 제대로 적용되었는지 확인

### 1. Vercel 빌드 로그 확인

1. Vercel 대시보드 → **Deployments**
2. 최신 배포 클릭
3. **Building** 섹션 확장
4. 로그에서 다음 확인:
   ```
   ✓ Creating an optimized production build
   ✓ Compiled successfully
   ```

### 2. 환경 변수 적용 확인

배포 상세 페이지에서:

- **Environment Variables** 섹션 확인
- `NEXT_PUBLIC_BACKEND_URL`이 표시되는지 확인

### 3. 런타임에서 환경 변수 확인

브라우저 콘솔(F12)에서 다음 입력:

```javascript
console.log(process.env.NEXT_PUBLIC_BACKEND_URL);
```

**예상 결과:**

- ✅ `https://letter-my-backend.onrender.com` (성공)
- ❌ `undefined` (실패 - 재배포 필요)

## 문제 해결 체크리스트

### ✅ 환경 변수 설정

- [ ] Vercel에 `NEXT_PUBLIC_BACKEND_URL` 추가됨
- [ ] 값: `https://letter-my-backend.onrender.com` (끝에 `/` 없음)
- [ ] Environment: Production 체크됨

### ✅ 재배포

- [ ] 환경 변수 추가 후 재배포 실행
- [ ] 배포 상태가 "Ready"
- [ ] 배포 시간이 환경 변수 추가 시간보다 나중

### ✅ 브라우저 캐시

- [ ] 하드 리프레시 (Ctrl+Shift+R)
- [ ] 또는 시크릿 모드로 테스트
- [ ] 개발자 도구에서 "Disable cache" 체크

### ✅ 코드 확인

- [ ] `lib/api.ts`에 `NEXT_PUBLIC_BACKEND_URL` 사용 코드 있음
- [ ] 최신 코드가 Git에 푸시됨
- [ ] Vercel이 최신 커밋을 배포함

## 여전히 안 되면

### 방법 1: 환경 변수 재생성

1. Vercel에서 `NEXT_PUBLIC_BACKEND_URL` **삭제**
2. 다시 **추가**:
   ```
   Name: NEXT_PUBLIC_BACKEND_URL
   Value: https://letter-my-backend.onrender.com
   Environment: Production
   ```
3. **Save** → **Redeploy**

### 방법 2: 강제 재빌드

Vercel CLI 사용:

```bash
vercel --prod --force
```

또는 Vercel 대시보드에서:

- Deployments → 최신 배포 → Redeploy → **Use existing Build Cache 체크 해제**

### 방법 3: Git 커밋 후 재배포

코드 변경 없이 빈 커밋:

```bash
git commit --allow-empty -m "Force rebuild"
git push
```

## 최종 확인

### 성공 시 보이는 것:

1. **Network 탭**:

   - Request URL: `https://letter-my-backend.onrender.com/api/letters`
   - Status: 201 Created (또는 200 OK)

2. **Console 탭**:

   - 에러 없음
   - "편지가 성공적으로 등록되었습니다! 💌" 알림

3. **Application 탭**:
   - Session Storage에 사용자 정보 저장됨

### 실패 시 보이는 것:

1. **Network 탭**:

   - Request URL: `http://localhost:5001/api/letters`
   - Status: Failed (ERR_CONNECTION_REFUSED)

2. **Console 탭**:
   - CORS 에러 또는 Network 에러

## 긴급 임시 해결책

환경 변수가 계속 안 먹히면, 코드에 직접 하드코딩 (임시):

```typescript
// lib/api.ts
const BACKEND_URL = "https://letter-my-backend.onrender.com";
```

**주의**: 이 방법은 임시 테스트용입니다. 나중에 환경 변수로 다시 변경하세요!

## Vercel 지원 문의

위 방법들로도 안 되면:

1. Vercel 대시보드 → Help
2. 또는 https://vercel.com/support
3. 문제 설명: "Environment variable NEXT_PUBLIC_BACKEND_URL not working in production"
