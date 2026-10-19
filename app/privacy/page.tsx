import type { Metadata } from "next";

export const metadata: Metadata = { title: "개인정보처리방침" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FFF9F7]">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-20">
        <h1
          className="text-3xl sm:text-4xl text-center mb-2"
          style={{ fontFamily: "NanumJangMiCe" }}
        >
          개인정보 처리방침
        </h1>
        <p className="text-center text-[#999] text-sm mb-10">
          시행일: 2026년 10월 27일
        </p>

        <div className="space-y-10 text-[#333] text-sm sm:text-base leading-relaxed">
          <Intro>
            Letter(이하 &quot;서비스&quot;)를 개인으로 운영하는 운영자(이하
            &quot;운영자&quot;)는 개인정보 보호법 제30조에 따라
            정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고
            원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보
            처리방침을 수립·공개합니다.
          </Intro>

          <Section title="제 1 조 (개인정보의 처리 목적)">
            <p>
              운영자는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고
              있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
              이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에
              따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <div className="mt-3 space-y-3">
              <SubSection title="회원가입 및 관리">
                회원 가입의사 확인, 회원제 서비스 제공에 따른 본인
                식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지,
                각종 고지·통지 목적으로 개인정보를 처리합니다.
              </SubSection>
              <SubSection title="서비스 제공">
                편지 작성·열람·공유 서비스 제공, 콘텐츠 제공, 편지
                작성자 표시(닉네임, 프로필 이미지) 목적으로 개인정보를
                처리합니다.
              </SubSection>
              <SubSection title="실물 편지 발송">
                실물 편지를 신청한 경우 편지를 손글씨로 옮겨 적어 우편으로
                보내기 위해 받는 분의 이름·연락처·주소를 처리합니다.
              </SubSection>
              <SubSection title="알림과 문의 응대">
                새 편지 도착 알림 메일 발송, 문의 확인과 답변을 위해
                개인정보를 처리합니다.
              </SubSection>
              <SubSection title="방문 통계">
                어떤 화면이 많이 쓰이는지 파악해 서비스를 고치기 위해 방문
                기록을 통계로만 처리합니다. 통계로 개인을 알아보지 않습니다.
              </SubSection>
            </div>
          </Section>

          <Section title="제 2 조 (개인정보의 처리 및 보유 기간)">
            <p>
              운영자는 법령에 따른 개인정보 보유·이용기간 또는
              정보주체로부터 개인정보를 수집 시에 동의받은 개인정보
              보유·이용기간 내에서 개인정보를 처리·보유합니다.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#FFF0EC]">
                    <th className="border border-[#F0E0DC] px-3 py-2 text-left text-[#4C261E] font-semibold">항목</th>
                    <th className="border border-[#F0E0DC] px-3 py-2 text-left text-[#4C261E] font-semibold">보유 기간</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-[#F0E0DC] px-3 py-2 font-medium">회원 정보(닉네임, 이메일, 프로필 이미지, 실명)</td>
                    <td className="border border-[#F0E0DC] px-3 py-2">회원 탈퇴 시 즉시 삭제</td>
                  </tr>
                  <tr>
                    <td className="border border-[#F0E0DC] px-3 py-2 font-medium">주소록에 저장한 주소</td>
                    <td className="border border-[#F0E0DC] px-3 py-2">회원이 직접 지우거나 탈퇴할 때까지</td>
                  </tr>
                  <tr>
                    <td className="border border-[#F0E0DC] px-3 py-2 font-medium">실물 편지 신청 정보(받는 분 이름·연락처·주소)</td>
                    <td className="border border-[#F0E0DC] px-3 py-2">신청일부터 1년(재발송·분실 문의 대응). 발송 또는 거절이 끝난 신청은 이후 이름·연락처·주소를 파기</td>
                  </tr>
                  <tr>
                    <td className="border border-[#F0E0DC] px-3 py-2 font-medium">문의 내용</td>
                    <td className="border border-[#F0E0DC] px-3 py-2">답변을 마친 날부터 1년. 이후 파기</td>
                  </tr>
                  <tr>
                    <td className="border border-[#F0E0DC] px-3 py-2 font-medium">서버 접속 기록</td>
                    <td className="border border-[#F0E0DC] px-3 py-2">3개월. 이후 삭제</td>
                  </tr>
                  <tr>
                    <td className="border border-[#F0E0DC] px-3 py-2 font-medium">방문 통계(Google Analytics)</td>
                    <td className="border border-[#F0E0DC] px-3 py-2">수집일부터 최대 14개월. 이후 Google 이 자동 삭제</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[#555]">
              서비스는 개인이 무료로 운영하므로 상거래 기록 보존 의무가
              없습니다. 위 기간이 끝나면 지체 없이 파기합니다.
            </p>
          </Section>

          <Section title="제 3 조 (처리하는 개인정보의 항목)">
            <p>
              운영자는 다음의 개인정보를 수집·처리합니다. 회원가입은
              카카오·네이버 로그인으로만 하며, 비밀번호는 받지 않습니다.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#FFF0EC]">
                    <th className="border border-[#F0E0DC] px-3 py-2 text-left text-[#4C261E] font-semibold">구분</th>
                    <th className="border border-[#F0E0DC] px-3 py-2 text-left text-[#4C261E] font-semibold">수집 항목</th>
                    <th className="border border-[#F0E0DC] px-3 py-2 text-left text-[#4C261E] font-semibold">수집 방법</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-[#F0E0DC] px-3 py-2 font-medium">회원가입(필수)</td>
                    <td className="border border-[#F0E0DC] px-3 py-2">닉네임, 이메일 주소, 프로필 이미지, 이름(실명)</td>
                    <td className="border border-[#F0E0DC] px-3 py-2">카카오·네이버 로그인 시 제공받음. 실명은 실물 편지 발송에만 쓰며 화면에 공개하지 않음</td>
                  </tr>
                  <tr>
                    <td className="border border-[#F0E0DC] px-3 py-2 font-medium">실물 편지 신청·주소록(선택)</td>
                    <td className="border border-[#F0E0DC] px-3 py-2">받는 분 이름, 연락처, 우편번호, 주소, 상세 주소, 배송 메모</td>
                    <td className="border border-[#F0E0DC] px-3 py-2">이용자가 직접 입력</td>
                  </tr>
                  <tr>
                    <td className="border border-[#F0E0DC] px-3 py-2 font-medium">문의(선택)</td>
                    <td className="border border-[#F0E0DC] px-3 py-2">문의 분류, 제목, 내용</td>
                    <td className="border border-[#F0E0DC] px-3 py-2">이용자가 직접 입력</td>
                  </tr>
                  <tr>
                    <td className="border border-[#F0E0DC] px-3 py-2 font-medium">자동 수집</td>
                    <td className="border border-[#F0E0DC] px-3 py-2">서비스 이용 기록, 접속 로그, 접속 IP, 쿠키, 방문 통계(본 페이지, 기기·브라우저 종류, 대략적 지역)</td>
                    <td className="border border-[#F0E0DC] px-3 py-2">서비스 이용 시 자동 생성. 통계용 IP는 원래 값을 알 수 없게 암호화(해시)해 저장</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="제 3 조의2 (만 14세 미만 아동)">
            <p>
              서비스는 만 14세 미만 아동의 회원가입을 받지 않습니다. 만 14세
              미만 아동이 가입한 사실을 알게 되면 해당 계정과 개인정보를
              지체 없이 삭제합니다.
            </p>
          </Section>

          <Section title="제 4 조 (개인정보의 제3자 제공)">
            <p>
              운영자는 개인정보를 제1조(개인정보의 처리 목적)에서 명시한
              범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정
              등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만
              개인정보를 제3자에게 제공합니다.
            </p>
            <p className="mt-2 font-medium text-[#4C261E]">
              현재 운영자는 이용자의 개인정보를 제3자에게 제공하고 있지
              않습니다.
            </p>
          </Section>

          <Section title="제 4 조의2 (개인정보 처리의 위탁 및 국외 이전)">
            <p>
              운영자는 서비스 운영을 위해 다음과 같이 개인정보 처리 업무를
              맡기고 있습니다. 서비스 데이터는 대한민국(서울)에 있는
              서버와 데이터베이스에 저장합니다.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#FFF0EC]">
                    <th className="border border-[#F0E0DC] px-3 py-2 text-left text-[#4C261E] font-semibold">맡는 곳</th>
                    <th className="border border-[#F0E0DC] px-3 py-2 text-left text-[#4C261E] font-semibold">맡기는 일</th>
                    <th className="border border-[#F0E0DC] px-3 py-2 text-left text-[#4C261E] font-semibold">처리 위치</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-[#F0E0DC] px-3 py-2 font-medium">Amazon Web Services, Inc.</td>
                    <td className="border border-[#F0E0DC] px-3 py-2">서버 운영(서비스 화면·API 제공)</td>
                    <td className="border border-[#F0E0DC] px-3 py-2">대한민국(AWS 서울 리전)</td>
                  </tr>
                  <tr>
                    <td className="border border-[#F0E0DC] px-3 py-2 font-medium">MongoDB, Inc.</td>
                    <td className="border border-[#F0E0DC] px-3 py-2">데이터베이스 보관(MongoDB Atlas)</td>
                    <td className="border border-[#F0E0DC] px-3 py-2">대한민국(AWS 서울 리전)</td>
                  </tr>
                  <tr>
                    <td className="border border-[#F0E0DC] px-3 py-2 font-medium">Google LLC</td>
                    <td className="border border-[#F0E0DC] px-3 py-2">새 편지 알림 메일 발송(Gmail), 방문 통계(Google Analytics)</td>
                    <td className="border border-[#F0E0DC] px-3 py-2">미국 등 Google 의 데이터센터</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              Google LLC 로의 국외 이전은 다음과 같습니다(「개인정보 보호법」
              제28조의8).
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>이전받는 자: Google LLC (privacy-dpo@google.com 등 Google 개인정보 문의 창구)</li>
              <li>이전 국가: 미국 등 Google 이 운영하는 데이터센터 소재 국가</li>
              <li>이전 시기와 방법: 알림 메일을 보낼 때, 화면을 방문할 때 네트워크로 전송</li>
              <li>이전 항목: 알림 메일 — 받는 분 이메일 주소, 편지 제목. 방문 통계 — 제3조의 방문 통계 항목, 로그인한 경우 서비스 내부 회원 번호(이름을 알 수 없는 가명 번호)와 로그인 수단. 이름·이메일·주소는 보내지 않음</li>
              <li>이전 목적: 알림 메일 발송, 방문 통계</li>
              <li>보유 기간: 메일은 발송 후 Google 정책에 따름, 방문 통계는 최대 14개월</li>
              <li>거부 방법: 알림 메일은 문의하기로 알려 주시면 보내지 않습니다. 방문 통계는 제8조의 방법으로 거부할 수 있으며, 거부해도 서비스 이용에는 지장이 없습니다.</li>
            </ul>
          </Section>

          <Section title="제 5 조 (개인정보의 파기절차 및 파기방법)">
            <p>
              운영자는 개인정보 보유기간의 경과, 처리목적 달성 등
              개인정보가 불필요하게 되었을 때에는 지체 없이 해당
              개인정보를 파기합니다.
            </p>
            <p className="mt-2">
              정보주체로부터 동의받은 개인정보 보유기간이 경과하거나
              처리목적이 달성되었음에도 불구하고 다른 법령에 따라
              개인정보를 계속 보존하여야 하는 경우에는, 해당 개인정보를
              별도의 데이터베이스(DB)로 옮기거나 보관장소를 달리하여
              보존합니다.
            </p>
            <div className="mt-3 space-y-2">
              <p className="font-semibold text-[#4C261E]">파기절차</p>
              <p>
                운영자는 파기 사유가 발생한 개인정보를 선정하여
                파기합니다.
              </p>
              <p className="font-semibold text-[#4C261E]">파기방법</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  전자적 파일 형태의 정보는 기록을 재생할 수 없는
                  기술적 방법을 사용하여 삭제합니다.
                </li>
                <li>
                  종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을
                  통하여 파기합니다.
                </li>
              </ul>
            </div>
          </Section>

          <Section title="제 6 조 (정보주체와 법정대리인의 권리·의무 및 행사방법)">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                정보주체는 운영자에게 언제든지 개인정보
                열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수
                있습니다.
              </li>
              <li>
                제1항에 따른 권리 행사는 운영자에게 「개인정보 보호법」
                시행령 제41조 제1항에 따라 전자우편 등을 통하여 하실 수
                있으며, 운영자는 이에 대해 지체 없이 조치하겠습니다.
              </li>
              <li>
                제1항에 따른 권리 행사는 정보주체의 법정대리인이나
                위임을 받은 자 등 대리인을 통하여 하실 수 있습니다.
              </li>
              <li>
                개인정보 열람 및 처리정지 요구는 「개인정보 보호법」
                제35조 제4항, 제37조 제2항에 의하여 정보주체의 권리가
                제한될 수 있습니다.
              </li>
              <li>
                개인정보의 정정 및 삭제 요구는 다른 법령에서 그
                개인정보가 수집 대상으로 명시되어 있는 경우에는 그
                삭제를 요구할 수 없습니다.
              </li>
              <li>
                운영자는 정보주체의 권리에 따른 열람, 정정·삭제,
                처리정지 요구 시 요구를 한 자가 본인이거나 정당한
                대리인인지를 확인합니다.
              </li>
            </ol>
          </Section>

          <Section title="제 7 조 (개인정보의 안전성 확보 조치)">
            <p>
              운영자는 개인정보의 안전성 확보를 위해 다음과 같은 조치를
              취하고 있습니다.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <span className="font-medium text-[#4C261E]">
                  개인정보의 암호화
                </span>
                <br />
                이용자의 개인정보는 암호화되어 저장 및 관리되고 있으며,
                중요한 데이터는 전송 시 암호화하여 보호하고 있습니다.
              </li>
              <li>
                <span className="font-medium text-[#4C261E]">
                  접근 권한 관리
                </span>
                <br />
                개인정보를 처리하는 시스템에 대한 접근 권한의 부여·변경·말소를
                통하여 개인정보에 대한 접근통제를 위한 조치를 하고
                있습니다.
              </li>
              <li>
                <span className="font-medium text-[#4C261E]">
                  접속기록의 보관 및 위변조 방지
                </span>
                <br />
                개인정보처리시스템에 접속한 기록을 최소 1년 이상 보관·관리하고
                있으며, 접속기록이 위변조 및 도난·분실되지 않도록
                보안 기능을 사용하고 있습니다.
              </li>
              <li>
                <span className="font-medium text-[#4C261E]">
                  소셜 로그인을 통한 안전한 인증
                </span>
                <br />
                운영자는 자체적으로 비밀번호를 저장하지 않으며, 카카오·네이버의
                OAuth 인증을 통해 안전하게 회원 인증을 처리합니다.
              </li>
            </ul>
          </Section>

          <Section title="제 8 조 (자동으로 수집되는 개인정보 및 거부에 관한 사항)">
            <p>
              운영자는 이용자에게 서비스를 제공하기 위해 &apos;쿠키(cookie)&apos;를
              사용할 수 있습니다. 쿠키는 웹사이트를 운영하는 서버가
              이용자의 컴퓨터 브라우저에 보내는 소량의 정보이며, 이용자의
              컴퓨터 내 저장장치에 저장되기도 합니다.
            </p>
            <div className="mt-3 space-y-2">
              <p>
                <span className="font-medium text-[#4C261E]">
                  가. 쿠키의 사용 목적:
                </span>{" "}
                이용자의 로그인 상태 유지, 서비스 이용 형태 파악을 통한
                최적화된 서비스 제공을 위해 사용됩니다.
              </p>
              <p>
                <span className="font-medium text-[#4C261E]">
                  나. 쿠키의 설치·운영 및 거부:
                </span>{" "}
                웹브라우저 상단의 설정 &gt; 개인정보(쿠키) 메뉴의 옵션
                설정을 통해 쿠키 저장을 거부할 수 있습니다.
              </p>
              <p>
                <span className="font-medium text-[#4C261E]">
                  다.
                </span>{" "}
                쿠키 저장을 거부할 경우 로그인이 필요한 일부 서비스
                이용에 어려움이 발생할 수 있습니다.
              </p>
              <p>
                <span className="font-medium text-[#4C261E]">
                  라. 방문 통계(Google Analytics):
                </span>{" "}
                운영자는 Google 의 방문 통계 도구(Google Analytics)를 써서
                어떤 화면이 많이 쓰이는지 파악합니다. 이를 위해 Google 쿠키가
                저장됩니다. 로그인한 경우 서비스 내부 회원 번호(이름을 알 수
                없는 가명 번호)와 로그인 수단만 함께 보내며, 이름·이메일·주소는
                Google 에 보내지 않습니다. 거부하려면 브라우저 설정에서 쿠키를 차단하거나
                Google 이 제공하는 차단 확장 프로그램(
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="underline">
                  tools.google.com/dlpage/gaoptout
                </a>
                )을 설치하면 됩니다.
              </p>
            </div>
          </Section>

          <Section title="제 9 조 (개인정보 보호책임자)">
            <p>
              서비스는 개인이 운영하므로 운영자 본인이 개인정보 보호책임자로서
              개인정보 처리에 관한 업무를 총괄해서 책임지고, 정보주체의
              불만처리 및 피해구제 등을 직접 처리합니다.
            </p>
            <div className="mt-3 bg-white rounded-lg p-4 border border-[#F0E0DC]">
              <p className="font-semibold text-[#4C261E]">
                ▶ 개인정보 보호책임자
              </p>
              <p className="mt-2">이름: 레터 운영자</p>
              <p>이메일: jin.come.up.business@gmail.com</p>
            </div>
            <p className="mt-3 text-[#555]">
              정보주체는 서비스를 이용하면서 발생한 모든 개인정보 보호
              관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보
              보호책임자에게 문의하실 수 있습니다. 운영자는 정보주체의
              문의에 대해 지체 없이 답변 및 처리해드리겠습니다.
            </p>
          </Section>

          <Section title="제 10 조 (개인정보의 열람청구)">
            <p>
              정보주체는 「개인정보 보호법」 제35조에 따른 개인정보의
              열람 청구를 아래의 연락처를 통해 하실 수 있습니다. 운영자는
              정보주체의 개인정보 열람청구가 신속하게 처리되도록
              노력하겠습니다.
            </p>
            <div className="mt-3 bg-white rounded-lg p-4 border border-[#F0E0DC]">
              <p className="font-semibold text-[#4C261E]">
                ▶ 개인정보 열람청구 접수
              </p>
              <p className="mt-2">이메일: jin.come.up.business@gmail.com</p>
            </div>
          </Section>

          <Section title="제 11 조 (권익침해 구제방법)">
            <p>
              정보주체는 개인정보 침해로 인한 구제를 받기 위하여 아래의
              기관에 분쟁 해결이나 상담 등을 신청할 수 있습니다.
            </p>
            <div className="mt-3 space-y-3">
              <div className="bg-white rounded-lg p-4 border border-[#F0E0DC] space-y-2">
                <p className="font-medium text-[#4C261E]">
                  개인정보분쟁조정위원회
                </p>
                <p className="text-sm text-[#555]">
                  소관 업무: 개인정보 분쟁조정 신청, 집단분쟁조정
                </p>
                <p className="text-sm text-[#555]">
                  홈페이지: www.kopico.go.kr / 전화: (국번없이) 1833-6972
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-[#F0E0DC] space-y-2">
                <p className="font-medium text-[#4C261E]">
                  한국인터넷진흥원 개인정보침해신고센터
                </p>
                <p className="text-sm text-[#555]">
                  소관 업무: 개인정보 침해사실 신고, 상담 신청
                </p>
                <p className="text-sm text-[#555]">
                  홈페이지: privacy.kisa.or.kr / 전화: (국번없이) 118
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-[#F0E0DC] space-y-2">
                <p className="font-medium text-[#4C261E]">
                  대검찰청 사이버수사과
                </p>
                <p className="text-sm text-[#555]">
                  전화: (국번없이) 1301
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-[#F0E0DC] space-y-2">
                <p className="font-medium text-[#4C261E]">
                  경찰청 사이버수사국
                </p>
                <p className="text-sm text-[#555]">
                  홈페이지: ecrm.police.go.kr / 전화: (국번없이) 182
                </p>
              </div>
            </div>
          </Section>

          <Section title="제 12 조 (개인정보 처리방침의 변경)">
            <p>
              본 개인정보 처리방침이 변경되는 경우, 변경 사항을 서비스 내
              공지사항을 통해 고지합니다. 변경된 처리방침은 고지한
              날로부터 7일 후 효력이 발생합니다.
            </p>
          </Section>

          <div className="pt-8 border-t border-[#F0E0DC]">
            <p className="text-[#999] text-xs">
              본 개인정보 처리방침은 2026년 10월 27일부터 시행됩니다.
            </p>
            <ul className="mt-2 text-[#999] text-xs space-y-1">
              <li>2026년 8월 1일 제정</li>
              <li>2026년 10월 27일 개정: 개인 운영자 명시, 실물 편지·문의 수집 항목, 처리 위탁·국외 이전, 방문 통계 고지, 만 14세 미만 가입 제한 추가, 보유 기간 정리</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Intro({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg p-5 border border-[#F0E0DC] text-[#555]">
      {children}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base sm:text-lg font-bold text-[#4C261E] mb-3 pb-2 border-b border-[#F0E0DC]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pl-3 border-l-2 border-[#FF9883]">
      <p className="font-medium text-[#4C261E]">{title}</p>
      <p className="mt-1 text-[#555]">{children}</p>
    </div>
  );
}
