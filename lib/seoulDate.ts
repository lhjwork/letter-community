const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/** v8 날짜 표기(Anton)용 서울 시간 조각. "10.09 · THU" = `${mm}.${dd} · ${wd}` */
export function seoulParts(iso: string) {
  const d = new Date(new Date(iso).toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  return {
    key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
    yyyy: String(d.getFullYear()),
    dd: String(d.getDate()).padStart(2, "0"),
    mm: String(d.getMonth() + 1).padStart(2, "0"),
    mon: MONTHS[d.getMonth()],
    wd: WEEKDAYS[d.getDay()],
  };
}
