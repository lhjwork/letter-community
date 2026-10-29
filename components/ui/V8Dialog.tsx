"use client";

import { type ReactNode, useLayoutEffect, useRef } from "react";
import * as D from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";

export const V8Title = D.Title;
export const V8Close = D.Close;
export const V8Description = D.Description;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 위 모서리 스탬프 라벨 */
  stamp: string;
  /** 스탬프 글자색(text-ink · text-airblue) */
  stampTone?: string;
  /** 데스크톱 최대 폭(max-w-[480px] 등) */
  width?: string;
  /** 안에 V8Description 이 있으면 true (없으면 aria-describedby 를 떼어 Radix 경고를 막는다) */
  described?: boolean;
  children: ReactNode;
};

/**
 * v8 종이 모달 (v8-Modals-1·2): 위 8px 항공우편 띠, 스탬프 -16/24, ✕ 44 top/right 14, 패딩 40/36/32, gap 16.
 * 767 이하는 M-Sheet 바닥 시트: 손잡이 44×5, 스탬프·✕ 한 줄, 최대 높이 88%. 버튼 행은 globals.css `.dlg-actions`.
 */
export default function V8Dialog({ open, onOpenChange, stamp, stampTone = "text-ink", width = "max-w-[480px]", described = false, children }: Props) {
  // D.Trigger 를 쓰지 않아 Radix 가 닫을 때 돌려보낼 곳을 모른다 → 열기 직전 포커스(연 버튼)를 기억해 둔다
  const t = useTranslations("shared.dialog");
  const opener = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (open) {
      const a = document.activeElement as HTMLElement | null;
      opener.current = a && a !== document.body ? a : null;
    }
  }, [open]);

  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 mobile-down:bg-ink/45" />
        <D.Content
          {...(described ? {} : { "aria-describedby": undefined })}
          onCloseAutoFocus={(e) => {
            if (opener.current?.isConnected) {
              e.preventDefault();
              opener.current.focus();
            }
          }}
          className={`paper fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 bg-paper px-9 pb-8 pt-10 outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 ${width} mobile-down:inset-x-0 mobile-down:bottom-0 mobile-down:top-auto mobile-down:max-h-[88dvh] mobile-down:w-full mobile-down:max-w-none mobile-down:translate-x-0 mobile-down:translate-y-0 mobile-down:gap-3 mobile-down:overflow-y-auto mobile-down:rounded-t-[3px] mobile-down:border-x-0 mobile-down:border-b-0 mobile-down:px-4 mobile-down:pb-6 mobile-down:pt-3 mobile-down:shadow-[0_-16px_32px_rgba(43,43,43,0.2)] mobile-down:data-[state=open]:zoom-in-100 mobile-down:data-[state=open]:slide-in-from-bottom`}
        >
          <span className="hidden h-[5px] w-11 shrink-0 self-center rounded-[3px] bg-rule mobile-down:block" aria-hidden="true" />
          <div className="airmail absolute inset-x-0 top-0 h-2 mobile-down:hidden" aria-hidden="true" />
          <div className="contents mobile-down:flex mobile-down:items-center mobile-down:justify-between">
            <span className={`stampbox absolute -top-4 left-6 bg-paper mobile-down:static mobile-down:text-[22px] ${stampTone}`}>{stamp}</span>
            <D.Close aria-label={t("close")} className="absolute right-3.5 top-3.5 z-10 inline-flex h-11 w-11 items-center justify-center font-pen text-[26px] text-ink-3 mobile-down:static">
              ✕
            </D.Close>
          </div>
          {children}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
