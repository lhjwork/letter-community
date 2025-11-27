export default function Test() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* 제목 */}
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
          반응형 디자인 학습: rem vs px
        </h1>

        {/* 1. 브레이크포인트 설명 */}
        <section className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-blue-600">
            📱 브레이크포인트 기준
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded">
              <p className="font-semibold">Tailwind 기본 브레이크포인트:</p>
              <ul className="mt-2 space-y-1 ml-4">
                <li>• <code className="bg-gray-200 px-2 py-1 rounded">sm:</code> 640px 이상 (작은 태블릿)</li>
                <li>• <code className="bg-gray-200 px-2 py-1 rounded">md:</code> 768px 이상 (태블릿)</li>
                <li>• <code className="bg-gray-200 px-2 py-1 rounded">lg:</code> 1024px 이상 (작은 데스크톱)</li>
                <li>• <code className="bg-gray-200 px-2 py-1 rounded">xl:</code> 1280px 이상 (데스크톱)</li>
                <li>• <code className="bg-gray-200 px-2 py-1 rounded">2xl:</code> 1536px 이상 (큰 데스크톱)</li>
              </ul>
            </div>
            
            {/* 현재 화면 크기 표시 */}
            <div className="p-4 bg-green-50 rounded">
              <p className="font-semibold mb-2">현재 화면:</p>
              <div className="flex gap-2 flex-wrap">
                <span className="sm:hidden px-3 py-1 bg-red-500 text-white rounded">📱 Mobile (&lt; 640px)</span>
                <span className="hidden sm:inline md:hidden px-3 py-1 bg-yellow-500 text-white rounded">📱 Small Tablet (640px+)</span>
                <span className="hidden md:inline lg:hidden px-3 py-1 bg-blue-500 text-white rounded">📱 Tablet (768px+)</span>
                <span className="hidden lg:inline xl:hidden px-3 py-1 bg-purple-500 text-white rounded">💻 Desktop (1024px+)</span>
                <span className="hidden xl:inline 2xl:hidden px-3 py-1 bg-indigo-500 text-white rounded">🖥️ Large Desktop (1280px+)</span>
                <span className="hidden 2xl:inline px-3 py-1 bg-pink-500 text-white rounded">🖥️ XL Desktop (1536px+)</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. px vs rem 비교 */}
        <section className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-purple-600">
            📏 px vs rem 차이
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* px 예제 */}
            <div className="border-2 border-red-300 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-3 text-red-600">px (픽셀) - 절대 단위</h3>
              <div className="space-y-3">
                <div style={{ fontSize: '16px' }} className="p-3 bg-red-50 rounded">
                  16px 텍스트 (고정)
                </div>
                <div style={{ fontSize: '20px' }} className="p-3 bg-red-50 rounded">
                  20px 텍스트 (고정)
                </div>
                <div style={{ fontSize: '24px' }} className="p-3 bg-red-50 rounded">
                  24px 텍스트 (고정)
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                ⚠️ 브라우저 폰트 설정을 변경해도 크기가 변하지 않습니다.
              </p>
            </div>

            {/* rem 예제 */}
            <div className="border-2 border-green-300 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-3 text-green-600">rem - 상대 단위</h3>
              <div className="space-y-3">
                <div style={{ fontSize: '1rem' }} className="p-3 bg-green-50 rounded">
                  1rem 텍스트 (16px 기본)
                </div>
                <div style={{ fontSize: '1.25rem' }} className="p-3 bg-green-50 rounded">
                  1.25rem 텍스트 (20px 기본)
                </div>
                <div style={{ fontSize: '1.5rem' }} className="p-3 bg-green-50 rounded">
                  1.5rem 텍스트 (24px 기본)
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                ✅ 브라우저 폰트 설정에 따라 크기가 자동으로 조정됩니다.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="font-semibold mb-2">💡 계산 방법:</p>
            <ul className="space-y-1 ml-4 text-sm">
              <li>• 1rem = 16px (브라우저 기본값)</li>
              <li>• 1.5rem = 24px (16 × 1.5)</li>
              <li>• 2rem = 32px (16 × 2)</li>
              <li>• 사용자가 폰트를 125%로 설정하면: 1rem = 20px</li>
            </ul>
          </div>
        </section>

        {/* 3. 반응형 예제 */}
        <section className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-indigo-600">
            📐 반응형 크기 조절 예제
          </h2>

          {/* 박스 크기 변화 */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">1. 박스 크기 (px 사용)</h3>
              <div className="w-full sm:w-[400px] md:w-[600px] lg:w-[800px] h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                <span className="text-sm sm:text-base md:text-lg lg:text-xl">
                  Mobile: 100% | Tablet: 400px | Desktop: 600px | Large: 800px
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">2. 텍스트 크기 (Tailwind 클래스)</h3>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl p-4 bg-gradient-to-r from-pink-100 to-yellow-100 rounded-lg">
                화면 크기에 따라 텍스트가 커집니다
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">3. 그리드 레이아웃</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <div
                    key={num}
                    className="h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                  >
                    {num}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Mobile: 1열 | Small: 2열 | Tablet: 3열 | Desktop: 4열
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">4. 패딩/마진 (rem 사용)</h3>
              <div className="space-y-4">
                <div style={{ padding: '1rem' }} className="bg-orange-100 rounded">
                  <div className="bg-orange-300 p-2 rounded">1rem 패딩 (16px)</div>
                </div>
                <div style={{ padding: '2rem' }} className="bg-orange-100 rounded">
                  <div className="bg-orange-300 p-2 rounded">2rem 패딩 (32px)</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. 실전 코드 예제 */}
        <section className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-green-600">
            💻 코드 예제
          </h2>
          
          <div className="space-y-4">
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
{`// Tailwind 반응형 클래스 사용법
<div className="
  text-base      // 기본: 16px
  sm:text-lg     // 640px+: 18px
  md:text-xl     // 768px+: 20px
  lg:text-2xl    // 1024px+: 24px
  xl:text-3xl    // 1280px+: 30px
">
  반응형 텍스트
</div>

// px 직접 지정
<div className="
  w-full         // 기본: 100%
  sm:w-[400px]   // 640px+: 400px
  md:w-[600px]   // 768px+: 600px
  lg:w-[800px]   // 1024px+: 800px
">
  반응형 박스
</div>

// rem 사용 (inline style)
<div style={{ 
  fontSize: '1rem',      // 16px (기본)
  padding: '1.5rem'      // 24px (기본)
}}>
  rem 단위 사용
</div>`}
              </pre>
            </div>
          </div>
        </section>

        {/* 5. 작은 모바일 대응 전략 */}
        <section className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-orange-600">
            📱 작은 모바일 기기 대응 (iPhone SE, Mini 등)
          </h2>
          
          <div className="space-y-6">
            {/* 문제 상황 */}
            <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
              <p className="font-semibold text-red-800 mb-2">❌ 문제 상황:</p>
              <div className="text-sm space-y-2">
                <p>• iPhone SE (375px), iPhone 12 Mini (360px) 등 작은 화면</p>
                <p>• 고정 width 값 사용 시 화면이 깨짐</p>
                <p>• sm: (640px)만으로는 작은 모바일 대응 불가</p>
              </div>
            </div>

            {/* 해결 방법 1: 커스텀 브레이크포인트 */}
            <div>
              <h3 className="font-semibold mb-3 text-lg">해결 방법 1: 커스텀 브레이크포인트 추가</h3>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                <pre className="text-xs">
{`// tailwind.config.js 또는 globals.css에 추가
@theme {
  --breakpoint-xs: 375px;  /* 작은 모바일 */
  --breakpoint-sm: 640px;  /* 큰 모바일/작은 태블릿 */
  --breakpoint-md: 768px;  /* 태블릿 */
  --breakpoint-lg: 1024px; /* 데스크톱 */
}

// 사용 예시
<div className="
  text-sm xs:text-base sm:text-lg md:text-xl
  p-2 xs:p-3 sm:p-4 md:p-6
">
  작은 모바일부터 대응
</div>`}
                </pre>
              </div>
            </div>

            {/* 해결 방법 2: 상대 단위 사용 */}
            <div>
              <h3 className="font-semibold mb-3 text-lg">해결 방법 2: 상대 단위 (%, vw, rem) 사용 ⭐ 추천</h3>
              
              {/* 나쁜 예 */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-red-600 mb-2">❌ 나쁜 예 (고정 px):</p>
                <div className="bg-red-50 p-3 rounded border-2 border-red-300">
                  <div className="w-[350px] h-20 bg-red-400 rounded flex items-center justify-center text-white text-sm">
                    350px 고정 - 작은 화면에서 잘림!
                  </div>
                </div>
                <code className="text-xs bg-gray-100 p-2 block mt-2 rounded">
                  {`<div className="w-[350px]">...</div>`}
                </code>
              </div>

              {/* 좋은 예 */}
              <div>
                <p className="text-sm font-semibold text-green-600 mb-2">✅ 좋은 예 (상대 단위):</p>
                <div className="bg-green-50 p-3 rounded border-2 border-green-300">
                  <div className="w-full max-w-[350px] h-20 bg-green-400 rounded flex items-center justify-center text-white text-sm">
                    100% width, max 350px - 유연함!
                  </div>
                </div>
                <code className="text-xs bg-gray-100 p-2 block mt-2 rounded">
                  {`<div className="w-full max-w-[350px]">...</div>`}
                </code>
              </div>
            </div>

            {/* 해결 방법 3: min-width 활용 */}
            <div>
              <h3 className="font-semibold mb-3 text-lg">해결 방법 3: min-width와 clamp() 활용</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm font-semibold mb-2">min-width 사용:</p>
                  <div className="w-full min-w-[280px] max-w-[600px] h-16 bg-blue-400 rounded flex items-center justify-center text-white text-sm">
                    최소 280px, 최대 600px
                  </div>
                  <code className="text-xs bg-gray-100 p-2 block mt-2 rounded">
                    {`<div className="w-full min-w-[280px] max-w-[600px]">...</div>`}
                  </code>
                </div>

                <div className="bg-purple-50 p-4 rounded">
                  <p className="text-sm font-semibold mb-2">clamp() 사용 (CSS):</p>
                  <div style={{ width: 'clamp(280px, 90vw, 600px)' }} className="h-16 bg-purple-400 rounded flex items-center justify-center text-white text-sm">
                    clamp(최소, 선호, 최대)
                  </div>
                  <code className="text-xs bg-gray-100 p-2 block mt-2 rounded">
                    {`style={{ width: 'clamp(280px, 90vw, 600px)' }}`}
                  </code>
                </div>
              </div>
            </div>

            {/* 실전 예제 */}
            <div>
              <h3 className="font-semibold mb-3 text-lg">실전 예제: 작은 모바일 대응 카드</h3>
              <div className="grid grid-cols-1 gap-4">
                {/* 나쁜 예 */}
                <div className="p-4 bg-red-50 rounded">
                  <p className="text-sm font-semibold text-red-600 mb-2">❌ 고정 크기 (깨짐):</p>
                  <div className="overflow-x-auto">
                    <div className="w-[400px] p-4 bg-white rounded-lg shadow">
                      <h4 className="text-lg font-bold mb-2">제목</h4>
                      <p className="text-sm">400px 고정 - iPhone SE에서 잘립니다</p>
                    </div>
                  </div>
                </div>

                {/* 좋은 예 */}
                <div className="p-4 bg-green-50 rounded">
                  <p className="text-sm font-semibold text-green-600 mb-2">✅ 유연한 크기 (반응형):</p>
                  <div className="w-full max-w-md p-4 bg-white rounded-lg shadow">
                    <h4 className="text-base sm:text-lg font-bold mb-2">제목</h4>
                    <p className="text-xs sm:text-sm">100% width, max-w-md - 모든 화면에 대응</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 모바일 기기 크기 참고 */}
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="font-semibold mb-2">📱 주요 모바일 기기 크기 참고:</p>
              <ul className="space-y-1 text-sm ml-4">
                <li>• iPhone SE: 375px × 667px</li>
                <li>• iPhone 12 Mini: 375px × 812px</li>
                <li>• iPhone 12/13/14: 390px × 844px</li>
                <li>• iPhone 14 Pro Max: 430px × 932px</li>
                <li>• Samsung Galaxy S21: 360px × 800px</li>
                <li>• Samsung Galaxy S21 Ultra: 384px × 854px</li>
              </ul>
              <p className="mt-3 text-sm text-yellow-800">
                💡 <strong>안전한 최소 너비: 320px</strong> (가장 작은 기기 대응)
              </p>
            </div>
          </div>
        </section>

        {/* 6. 권장사항 */}
        <section className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-red-600">
            ✅ 최종 권장사항
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="font-semibold text-green-800">✅ rem 사용 권장:</p>
              <ul className="mt-2 ml-4 space-y-1 text-sm">
                <li>• 폰트 크기 (접근성 향상)</li>
                <li>• 패딩, 마진 (일관된 간격)</li>
                <li>• 컴포넌트 내부 간격</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="font-semibold text-blue-800">✅ px 사용 권장:</p>
              <ul className="mt-2 ml-4 space-y-1 text-sm">
                <li>• 테두리 두께 (1px, 2px)</li>
                <li>• 아이콘 크기 (정확한 크기 필요)</li>
                <li>• 그림자 오프셋</li>
                <li>• 미디어 쿼리 브레이크포인트</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <p className="font-semibold text-purple-800">✅ 작은 모바일 대응:</p>
              <ul className="mt-2 ml-4 space-y-1 text-sm">
                <li>• <strong>절대 고정 width 사용 금지</strong></li>
                <li>• w-full + max-w-[] 조합 사용</li>
                <li>• min-w-[320px] 로 최소 너비 보장</li>
                <li>• padding은 px-4 (1rem) 이상 권장</li>
                <li>• 텍스트는 text-sm 이상 (가독성)</li>
              </ul>
            </div>

            <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
              <p className="font-semibold text-indigo-800">✅ 반응형 설계 체크리스트:</p>
              <ul className="mt-2 ml-4 space-y-1 text-sm">
                <li>✓ 모든 컨테이너에 w-full 기본 적용</li>
                <li>✓ 필요시 max-w-[] 로 최대 너비 제한</li>
                <li>✓ 고정 px 대신 상대 단위 (%, rem, vw) 사용</li>
                <li>✓ 브레이크포인트마다 테스트 (320px, 375px, 768px, 1024px)</li>
                <li>✓ 가로 스크롤 발생 여부 확인</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 7. 실전 코드 템플릿 */}
        <section className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-cyan-600">
            🎯 실전 코드 템플릿
          </h2>
          
          <div className="space-y-4">
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
              <pre className="text-xs">
{`// ✅ 올바른 반응형 컨테이너 패턴
<div className="
  w-full              // 기본: 부모의 100%
  max-w-7xl           // 최대: 1280px
  mx-auto             // 중앙 정렬
  px-4 sm:px-6 md:px-8  // 좌우 여백 (반응형)
">
  <div className="
    w-full            // 기본: 100%
    sm:w-auto         // 640px+: 자동
    md:max-w-2xl      // 768px+: 최대 672px
    lg:max-w-4xl      // 1024px+: 최대 896px
  ">
    컨텐츠
  </div>
</div>

// ✅ 카드 그리드 (작은 모바일 대응)
<div className="
  grid
  grid-cols-1         // 기본: 1열 (320px+)
  sm:grid-cols-2      // 640px+: 2열
  md:grid-cols-3      // 768px+: 3열
  lg:grid-cols-4      // 1024px+: 4열
  gap-4 sm:gap-6      // 간격 (반응형)
  p-4 sm:p-6 md:p-8   // 패딩 (반응형)
">
  {items.map(item => (
    <div className="
      w-full            // 항상 100%
      min-w-0           // 축소 가능
      p-4               // 내부 패딩
    ">
      {item}
    </div>
  ))}
</div>

// ✅ 텍스트 크기 (가독성 보장)
<h1 className="
  text-2xl sm:text-3xl md:text-4xl lg:text-5xl
  font-bold
">
  제목
</h1>

<p className="
  text-sm sm:text-base md:text-lg
  leading-relaxed
">
  본문 텍스트
</p>

// ❌ 피해야 할 패턴
<div className="w-[400px]">        // 고정 크기
<div className="min-w-[500px]">    // 너무 큰 최소값
<div style={{width: '450px'}}>     // 고정 inline style`}
              </pre>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
