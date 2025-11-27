export default function DesignGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            디자인 시스템 & 협업 가이드
          </h1>
          <p className="text-lg text-gray-600">
            디자이너와 프론트엔드 개발자를 위한 효율적인 협업 방법론
          </p>
        </header>

        <nav className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">목차</h2>
          <ul className="space-y-2 text-gray-700">
            <li>
              <a href="#breakpoints" className="hover:text-blue-600">
                1. 반응형 브레이크포인트
              </a>
            </li>
            <li>
              <a href="#workflow" className="hover:text-blue-600">
                2. 작업 프로세스
              </a>
            </li>
            <li>
              <a href="#handoff" className="hover:text-blue-600">
                3. 디자인 핸드오프
              </a>
            </li>
            <li>
              <a href="#tips" className="hover:text-blue-600">
                4. 협업 팁
              </a>
            </li>
          </ul>
        </nav>

        <BreakpointsSection />
        <WorkflowSection />
        <HandoffSection />
        <TipsSection />

        <footer className="mt-12 text-center text-gray-600 text-sm">
          <p>
            이 가이드는 팀의 효율적인 협업을 위해 작성되었습니다.
            <br />
            궁금한 점이 있다면 언제든 팀원에게 물어보세요! 🙌
          </p>
        </footer>
      </div>
    </div>
  );
}

function BreakpointsSection() {
  return (
    <section
      id="breakpoints"
      className="bg-white rounded-lg shadow-sm p-8 mb-8"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        1. 반응형 브레이크포인트
      </h2>

      <div className="overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                디바이스
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                범위
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tailwind
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                디자인 기준
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Mobile
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                0 - 639px
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                (기본값)
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                375px (iPhone)
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Tablet
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                768 - 1399px
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                md:
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                1024px (iPad Pro)
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Desktop
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                1400px+
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                xxl:
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">1920px</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <p className="text-sm text-blue-700">
          <strong>디자이너 TIP:</strong> 최소 Mobile(375px)과 Desktop(1920px) 두
          가지 버전은 필수로 제공해주세요.
        </p>
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section id="workflow" className="bg-white rounded-lg shadow-sm p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        2. 작업 프로세스
      </h2>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📋 Case 1: 모든 디자인이 준비된 경우 (이상적)
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>1️⃣ 디자이너: Figma 링크 + Mobile/Desktop 버전 제공</p>
            <p>2️⃣ 개발자: 디자인 분석 및 브레이크포인트별 스타일 정리</p>
            <p>3️⃣ 개발자: Mobile First로 구현</p>
          </div>
          <div className="bg-gray-900 text-gray-100 p-4 rounded mt-4 text-sm font-mono overflow-x-auto">
            <pre>{`<div className="
  px-4 text-base      /* Mobile */
  md:px-8 md:text-lg  /* Tablet */
  xxl:px-16 xxl:text-2xl /* Desktop */
">`}</pre>
          </div>
        </div>

        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            ⚠️ Case 2: PC 디자인만 먼저 나온 경우 (실무 빈번)
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>1️⃣ 디자이너: PC 디자인 전달</p>
            <p>2️⃣ 개발자: 합리적 추정 + TODO 주석으로 작업</p>
            <p>3️⃣ 디자이너: 모바일 디자인 전달 (일주일 후)</p>
            <p>4️⃣ 개발자: TODO 찾아서 실제 디자인으로 수정</p>
          </div>
          <div className="bg-gray-900 text-gray-100 p-4 rounded mt-4 text-sm font-mono overflow-x-auto">
            <pre>{`<div className="
  /* 🔴 TODO: 모바일 디자인 확인 필요 */
  px-4 text-base
  
  /* ✅ PC 디자인 확정 */
  xxl:px-16 xxl:text-2xl
">`}</pre>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
            <p className="text-sm text-yellow-700">
              <strong>추정 공식:</strong> PC 64px → Mobile 16px (1/4), 3열
              그리드 → 1열
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HandoffSection() {
  return (
    <section id="handoff" className="bg-white rounded-lg shadow-sm p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        3. 디자인 핸드오프 체크리스트
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            🎨 디자이너 체크리스트
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ Figma 링크 공유 (Dev Mode 활성화)</li>
            <li>✓ Mobile(375px) 버전 제공</li>
            <li>✓ Desktop(1920px) 버전 제공</li>
            <li>✓ 컴포넌트 명확히 네이밍</li>
            <li>✓ 스페이싱 8px 단위 사용</li>
            <li>✓ 인터랙션 상태 정의 (hover, active)</li>
          </ul>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            💻 개발자 체크리스트
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ 디자인 시안 꼼꼼히 확인</li>
            <li>✓ 브레이크포인트별 스타일 정리</li>
            <li>✓ Mobile First로 코드 작성</li>
            <li>✓ 불확실한 부분 TODO 주석</li>
            <li>✓ 실제 디바이스에서 테스트</li>
            <li>✓ 디자이너에게 QA 요청</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function TipsSection() {
  return (
    <section id="tips" className="bg-white rounded-lg shadow-sm p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        4. 효과적인 협업 팁
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            💬 커뮤니케이션
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded p-4">
              <h4 className="font-medium text-purple-900 mb-2">
                🎨 디자이너 → 개발자
              </h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• &quot;모바일 디자인은 내일 드릴게요&quot;</li>
                <li>• &quot;hover 시 색상이 변해요&quot;</li>
                <li>• &quot;여기 여백은 32px입니다&quot;</li>
              </ul>
            </div>
            <div className="bg-blue-50 rounded p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                💻 개발자 → 디자이너
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• &quot;모바일 디자인 언제쯤 나올까요?&quot;</li>
                <li>• &quot;hover 상태 디자인 있나요?&quot;</li>
                <li>• &quot;임시로 이렇게 구현했어요&quot;</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            📏 스페이싱 시스템 (8px 기반)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border rounded p-3 text-center">
              <div className="font-mono text-sm text-gray-600">p-2</div>
              <div className="text-lg font-semibold">8px</div>
            </div>
            <div className="border rounded p-3 text-center">
              <div className="font-mono text-sm text-gray-600">p-4</div>
              <div className="text-lg font-semibold">16px</div>
            </div>
            <div className="border rounded p-3 text-center">
              <div className="font-mono text-sm text-gray-600">p-8</div>
              <div className="text-lg font-semibold">32px</div>
            </div>
            <div className="border rounded p-3 text-center">
              <div className="font-mono text-sm text-gray-600">p-16</div>
              <div className="text-lg font-semibold">64px</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            🚀 빠른 참조
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border rounded p-4">
              <div className="font-semibold text-gray-800 mb-1">
                반응형 순서
              </div>
              <div className="text-sm text-gray-600">
                Mobile → Tablet → Desktop
              </div>
            </div>
            <div className="border rounded p-4">
              <div className="font-semibold text-gray-800 mb-1">
                필수 디자인
              </div>
              <div className="text-sm text-gray-600">Mobile + Desktop</div>
            </div>
            <div className="border rounded p-4">
              <div className="font-semibold text-gray-800 mb-1">추정 공식</div>
              <div className="text-sm text-gray-600">PC의 1/4 ~ 1/2</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
