"use client";

import { useRouter } from "next/navigation";
import AnonymousPhysicalStatusTracker from "@/components/letter/AnonymousPhysicalStatusTracker";

interface AnonymousPhysicalStatusTrackerPageProps {
  letterId: string;
  requestId: string;
}

export default function AnonymousPhysicalStatusTrackerPage({ letterId, requestId }: AnonymousPhysicalStatusTrackerPageProps) {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return <AnonymousPhysicalStatusTracker letterId={letterId} requestId={requestId} onClose={handleClose} />;
}
