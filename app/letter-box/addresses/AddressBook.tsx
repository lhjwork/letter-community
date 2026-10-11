"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import AddressCard from "@/components/address/AddressCard";
import AddressFormModal from "@/components/address/AddressFormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { createAddress, deleteAddress, getAddresses, setDefaultAddress, updateAddress } from "@/lib/address-api";
import type { Address, AddressInput } from "@/types/address";
import { WRAP } from "../parts";

/** 주소록 머리글·카드·추가/수정/삭제/기본 지정. 바뀌면 목록을 서버에서 다시 받는다 */
export default function AddressBook({ initial }: { initial: Address[] }) {
  const token = useSession().data?.backendToken;
  const [list, setList] = useState(initial);
  const [form, setForm] = useState<{ open: boolean; edit: Address | null }>({ open: false, edit: null });
  const [removing, setRemoving] = useState<Address | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const reload = async () => {
    if (token) setList((await getAddresses(token)).data ?? []);
  };

  const run = async (job: () => Promise<unknown>, failMsg: string) => {
    if (!token) return;
    setBusy(true);
    setError("");
    try {
      await job();
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : failMsg);
    } finally {
      setBusy(false);
    }
  };

  const save = async (data: AddressInput) => {
    if (!token) throw new Error("로그인이 필요해요.");
    if (form.edit) await updateAddress(token, form.edit._id, data);
    else await createAddress(token, data);
    setForm((f) => ({ ...f, open: false }));
    await reload();
  };

  const add = () => setForm({ open: true, edit: null });

  return (
    <>
      <section className={`${WRAP} flex flex-wrap items-end justify-between gap-4 pb-9 pt-5 mobile-down:pb-6 mobile-down:pt-3`}>
        <div className="flex flex-col gap-3 mobile-down:gap-2">
          <p className="m-0 font-pen text-[22px] text-ink-3 mobile-down:text-xl">실물 편지를 받을 분들</p>
          <h1 className="m-0 font-pen text-[52px] font-normal leading-[1.25] mobile-down:text-[40px] mobile-down:leading-[1.2]">주소록</h1>
          <p className="m-0 text-[15px] leading-[1.8] text-ink-2">실물 편지를 신청할 때 여기 저장한 주소를 불러올 수 있어요.</p>
        </div>
        <button type="button" onClick={add} className="btn btn-brick mobile-down:hidden">
          + 주소 추가
        </button>
      </section>

      <section className={`${WRAP} flex flex-col gap-5 pb-16 mobile-down:pb-12`}>
        {error && (
          <p role="alert" className="m-0 text-[15px] text-brick">
            {error}
          </p>
        )}
        {list.length === 0 ? (
          <p className="m-0 font-pen text-2xl text-ink-2">저장한 주소가 없어요.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-6 mobile-down:gap-5">
            {list.map((a, i) => (
              <AddressCard
                key={a._id}
                address={a}
                index={i}
                busy={busy}
                onEdit={(edit) => setForm({ open: true, edit })}
                onDelete={setRemoving}
                onSetDefault={(x) => run(() => setDefaultAddress(token!, x._id), "기본 배송지로 바꾸지 못했어요.")}
              />
            ))}
          </div>
        )}
        <button type="button" onClick={add} className="btn btn-brick hidden min-h-[52px] text-2xl mobile-down:inline-flex">
          + 주소 추가
        </button>
      </section>

      <AddressFormModal open={form.open} onOpenChange={(open) => setForm((f) => ({ ...f, open }))} onSubmit={save} editAddress={form.edit} />
      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(o) => !o && setRemoving(null)}
        title="이 주소를 지울까요"
        description={removing ? `${removing.recipientName} 님 주소가 주소록에서 지워져요.` : ""}
        confirmText="삭제"
        variant="destructive"
        onConfirm={() => removing && run(() => deleteAddress(token!, removing._id), "삭제하지 못했어요.")}
      />
    </>
  );
}
