"use client";

import { useEffect, useCallback, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

/**
 * 다음(카카오) 주소 검색 결과 타입
 */
export interface PostcodeResult {
  zipCode: string;
  address: string;
  roadAddress: string;
  jibunAddress: string;
  bname: string;
  buildingName: string;
}

interface PostcodeSearchProps {
  onComplete: (data: PostcodeResult) => void;
  className?: string;
  buttonText?: string;
}

const DAUM_POSTCODE_SCRIPT_URL = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

// 전역 스크립트 로드 상태 관리
type ScriptStatus = "idle" | "loading" | "ready" | "error";
let globalStatus: ScriptStatus = "idle";
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ScriptStatus {
  return globalStatus;
}

function getServerSnapshot(): ScriptStatus {
  return "idle";
}

function loadScript() {
  if (typeof window === "undefined") return;

  // 이미 로드된 경우
  if (window.daum?.Postcode) {
    globalStatus = "ready";
    notifyListeners();
    return;
  }

  // 이미 로딩 중이거나 완료된 경우
  if (globalStatus === "loading" || globalStatus === "ready") return;

  globalStatus = "loading";
  notifyListeners();

  const existingScript = document.querySelector(`script[src="${DAUM_POSTCODE_SCRIPT_URL}"]`);

  if (existingScript) {
    existingScript.addEventListener("load", () => {
      globalStatus = "ready";
      notifyListeners();
    });
    existingScript.addEventListener("error", () => {
      globalStatus = "error";
      notifyListeners();
    });
    return;
  }

  const script = document.createElement("script");
  script.src = DAUM_POSTCODE_SCRIPT_URL;
  script.async = true;
  script.onload = () => {
    globalStatus = "ready";
    notifyListeners();
  };
  script.onerror = () => {
    globalStatus = "error";
    notifyListeners();
  };
  document.head.appendChild(script);
}

export default function PostcodeSearch({ onComplete, className, buttonText = "우편번호 검색" }: PostcodeSearchProps) {
  const status = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    loadScript();
  }, []);

  const handleClick = useCallback(() => {
    if (typeof window === "undefined" || !window.daum?.Postcode) {
      console.error("다음 주소 API가 로드되지 않았습니다.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        onComplete({
          zipCode: data.zonecode,
          address: data.roadAddress || data.jibunAddress,
          roadAddress: data.roadAddress,
          jibunAddress: data.jibunAddress,
          bname: data.bname,
          buildingName: data.buildingName,
        });
      },
    }).open();
  }, [onComplete]);

  const isDisabled = status !== "ready";
  const displayText = status === "loading" ? "로딩 중..." : status === "error" ? "로드 실패" : buttonText;

  return (
    <Button type="button" variant="outline" onClick={handleClick} disabled={isDisabled} className={className}>
      {displayText}
    </Button>
  );
}
