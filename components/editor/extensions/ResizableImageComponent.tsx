"use client";

import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { useCallback, useEffect, useState, useRef } from "react";

export default function ResizableImageComponent(props: NodeViewProps) {
  const { node, updateAttributes, selected } = props;

  // 초기 너비 설정 (기본값 100%)
  const [width, setWidth] = useState<string | number>(node.attrs.width || "100%");
  const [isResizing, setIsResizing] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const resizeStartRef = useRef<{ x: number; width: number } | null>(null);

  // 노드 속성이 외부에서 변경되면 상태 업데이트
  useEffect(() => {
    setWidth(node.attrs.width || "100%");
  }, [node.attrs.width]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizeStartRef.current) return;

    const dx = e.clientX - resizeStartRef.current.x;
    const newWidth = Math.max(100, resizeStartRef.current.width + dx); // 최소 너비 100px

    // 부모 컨테이너의 너비를 넘지 않도록 제한 (선택 사항)
    // const parentWidth = imageRef.current?.parentElement?.offsetWidth || 1000;
    // const constrainedWidth = Math.min(newWidth, parentWidth);

    setWidth(newWidth);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    resizeStartRef.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    // 리사이징이 끝나면 속성 업데이트
    if (imageRef.current) {
      updateAttributes({ width: imageRef.current.offsetWidth });
    }
  }, [handleMouseMove, updateAttributes]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation(); // 에디터의 다른 이벤트 방지

      if (!imageRef.current) return;

      setIsResizing(true);
      resizeStartRef.current = {
        x: e.clientX,
        width: imageRef.current.offsetWidth,
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [handleMouseMove, handleMouseUp]
  );

  // 컴포넌트 언마운트 시 이벤트 리스너 제거
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const textAlign = node.attrs.textAlign || "left";

  const containerStyle: React.CSSProperties = {
    position: "relative",
    display: "inline-block",
    maxWidth: "100%",
  };

  const wrapperStyle: React.CSSProperties = {
    display: "block",
    overflow: "hidden", // float clear fix if needed, but usually not for the item itself
    clear: "none",
  };

  if (textAlign === "left") {
    wrapperStyle.float = "left";
    wrapperStyle.marginRight = "1rem";
    wrapperStyle.marginBottom = "0.5rem";
  } else if (textAlign === "right") {
    wrapperStyle.float = "right";
    wrapperStyle.marginLeft = "1rem";
    wrapperStyle.marginBottom = "0.5rem";
  } else if (textAlign === "center") {
    wrapperStyle.float = "none";
    wrapperStyle.margin = "0 auto";
    wrapperStyle.display = "flex";
    wrapperStyle.justifyContent = "center";
    wrapperStyle.marginBottom = "0.5rem";
  }

  return (
    <NodeViewWrapper style={wrapperStyle} className="resizable-image-wrapper">
      <div style={containerStyle}>
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt={node.attrs.alt}
          style={{
            width: typeof width === "number" ? `${width}px` : width,
            maxWidth: "100%",
            height: "auto",
            display: "block",
          }}
          className={`transition-shadow duration-200 ${selected || isResizing ? "ring-2 ring-blue-500 rounded-sm" : ""}`}
        />
        {(selected || isResizing) && (
          <div
            className="absolute bottom-1 right-1 w-3 h-3 bg-blue-500 border border-white cursor-nwse-resize rounded-sm shadow-sm hover:scale-125 transition-transform"
            onMouseDown={handleMouseDown}
            style={{ zIndex: 50 }}
          />
        )}
      </div>
    </NodeViewWrapper>
  );
}
