import Image from "next/image";

export function LoginModalIllustration({ className = "", ...props }) {
  return (
    <Image
      src="/images/modals/login/login-modal-img.svg"
      alt="Login Modal Illustration"
      width={290}
      height={217}
      className={className}
      priority
      {...props}
    />
  );
}

export function LetterLogo({ className = "", ...props }) {
  return (
    <Image
      src="/icons/letter-logo.svg"
      alt="Letter Logo"
      width={88}
      height={60}
      className={className}
      priority
      {...props}
    />
  );
}

export function KakaoLogo({ className = "", ...props }) {
  return (
    <Image
      src="/icons/kakao-logo.svg"
      alt="Kakao Logo"
      width={36}
      height={36}
      className={className}
      {...props}
    />
  );
}

export function NaverLogo({ className = "", ...props }) {
  return (
    <Image
      src="/icons/naver-logo.svg"
      alt="Naver Logo"
      width={36}
      height={36}
      className={className}
      {...props}
    />
  );
}
