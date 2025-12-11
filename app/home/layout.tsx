import Footer from "@/components/shareds/Footer";
import Header from "@/components/shareds/Header";
import { ReactNode } from "react";

type Props = { children: ReactNode };

export default function HomeLayout({ children }: Props) {
  return (
    <div className="flex justify-center w-full px-4 sm:px-6 lg:px-8">
      <div className="w-full sm:w-[90%] md:w-[85%] lg:w-[75%] xl:w-[70%] max-w-[1400px]">
        <Header />
        {children}
        <Footer />
      </div>
    </div>
  );
}
