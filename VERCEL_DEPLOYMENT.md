# Vercel 배포 가이드

## 1. Vercel 환경 변수 설정

Vercel 대시보드 → 프로젝트 → Settings → Environment Variables에서 다음 변수들을 추가하세요:

### 필수 환경 변수

```bash
# Auth.js Secret (openssl rand -base64 32로 생성)
AUTH_SECRET=your-generated-secret-key

# Next.js URL (Vercel 도메인으로 변경)
NEXTAUTH_URL=https://your-project.vercel.app

# 네이버 OAuth
NAVER_CLIENT_ID=ieTN3X_Q2OA28067ZHHW
NAVER_CLIENT_SECRET=TdAbFUrSEA

# 카카오 OAuth (실제 값으로 교체)
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret

# 인스타그램 OAuth (실제 값으로 교체)
INSTAGRAM_CLIENT_ID=1163605409316642
INSTAGRAM_CLIENT_SECRET=cbf4ed5325bd52f84cde0663ce21890d

# Backend API URL (실제 백엔드 URL로 교체)
BACKEND_URL=https://your-backend-api.com
NEXT_PUBLIC_BACKEND_URL=https://your-backend-api.com
```

## 2. 네이버 개발자 센터 설정

### 2.1 네이버 개발자 센터 접속

https://developers.naver.com/apps/#/list

### 2.2 애플리케이션 선택 후 API 설정

#### Callback URL 추가

```
로컬 개발: http://localhost:3000/api/auth/callback/naver
Vercel 배포: https://your-project.vercel.app/api/auth/callback/naver
```

#### 서비스 URL

```
https://your-project.vercel.app
```

#### 제공 정보 선택

- [x] 회원이름
- [x] 이메일 주소
- [x] 프로필 사진

## 3. 카카오 개발자 센터 설정

### 3.1 카카오 개발자 센터 접속

https://developers.kakao.com/console/app

### 3.2 앱 설정 → 플랫폼

#### Web 플랫폼 추가

```
사이트 도메인: https://your-project.vercel.app
```

### 3.3 제품 설정 → 카카오 로그인

#### Redirect URI 설정

```
로컬: http://localhost:3000/api/auth/callback/kakao
Vercel: https://your-project.vercel.app/api/auth/callback/kakao
```

#### 동의 항목 설정

- 닉네임: 필수
- 프로필 사진: 선택
- 카카오계정(이메일): 필수

## 4. 인스타그램 개발자 센터 설정

### 4.1 Meta for Developers 접속

https://developers.facebook.com/apps/

### 4.2 앱 설정 → 기본 설정

#### 앱 도메인

```
your-project.vercel.app
```

### 4.3 Instagram 기본 표시 → 설정

#### 유효한 OAuth 리디렉션 URI

```
로컬: http://localhost:3000/api/auth/callback/instagram
Vercel: https://your-project.vercel.app/api/auth/callback/instagram
```

## 5. Vercel 배포 체크리스트

- [ ] 모든 환경 변수가 Vercel에 설정되었는지 확인
- [ ] `NEXTAUTH_URL`이 Vercel 도메인으로 설정되었는지 확인
- [ ] 네이버 개발자 센터에 Vercel Callback URL 추가
- [ ] 카카오 개발자 센터에 Vercel Redirect URI 추가
- [ ] 인스타그램 개발자 센터에 Vercel 리디렉션 URI 추가
- [ ] 백엔드 API URL이 실제 배포된 백엔드 주소로 설정되었는지 확인
- [ ] Vercel에서 재배포 (환경 변수 변경 후 필수)

## 6. 배포 후 테스트

### 6.1 OAuth 로그인 테스트

1. https://your-project.vercel.app 접속
2. 로그인 버튼 클릭
3. 네이버/카카오/인스타그램 로그인 시도
4. 정상적으로 리디렉션되는지 확인

### 6.2 에러 확인

Vercel 대시보드 → 프로젝트 → Deployments → 최신 배포 → Functions 탭에서 로그 확인

## 7. 일반적인 문제 해결

### 문제 1: "letter에 로그인할 수 없습니다"

**원인**: 네이버 개발자 센터에 Callback URL이 등록되지 않음
**해결**: 네이버 개발자 센터에서 `https://your-project.vercel.app/api/auth/callback/naver` 추가

### 문제 2: "redirect_uri_mismatch"

**원인**: OAuth 제공자에 등록된 Redirect URI와 실제 요청 URI가 다름
**해결**: 각 OAuth 제공자 개발자 센터에서 정확한 Callback URL 확인 및 추가

### 문제 3: "Invalid client credentials"

**원인**: 환경 변수의 Client ID 또는 Secret이 잘못됨
**해결**: Vercel 환경 변수와 OAuth 제공자의 키 값이 일치하는지 확인

### 문제 4: 로컬에서는 되는데 Vercel에서 안 됨

**원인**: `NEXTAUTH_URL` 환경 변수가 localhost로 설정됨
**해결**: Vercel 환경 변수에서 `NEXTAUTH_URL=https://your-project.vercel.app`로 설정

### 문제 5: 환경 변수 변경 후에도 적용 안 됨

**원인**: Vercel은 환경 변수 변경 시 자동 재배포되지 않음
**해결**: Vercel 대시보드에서 수동으로 재배포 (Deployments → Redeploy)

## 8. 보안 권장 사항

1. **AUTH_SECRET**: 절대 GitHub에 커밋하지 마세요
2. **Client Secret**: .env.local 파일을 .gitignore에 추가
3. **Production 환경**: 별도의 OAuth 앱 생성 권장
4. **HTTPS**: Vercel은 자동으로 HTTPS 제공 (HTTP는 OAuth에서 거부됨)

## 9. 유용한 명령어

### AUTH_SECRET 생성

```bash
openssl rand -base64 32
```

### 환경 변수 확인 (로컬)

```bash
cat .env.local
```

### Vercel CLI로 환경 변수 설정

```bash
vercel env add AUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add NAVER_CLIENT_ID
vercel env add NAVER_CLIENT_SECRET
```

## 10. 참고 링크

- [NextAuth.js 공식 문서](https://next-auth.js.org/deployment)
- [Vercel 환경 변수 가이드](https://vercel.com/docs/environment-variables)
- [네이버 로그인 API](https://developers.naver.com/docs/login/api/)
- [카카오 로그인 API](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
