import { grade28 } from "@/lib/streak";

export function CalendarioPresenca({ diasTreinados, agora }: { diasTreinados: string[]; agora?: Date }) {
  const set = new Set(diasTreinados);
  const g = grade28(agora);
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-neutral-400">{["S", "T", "Q", "Q", "S", "S", "D"].map((l, i) => <span key={i}>{l}</span>)}</div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {g.map((d) => (
          <div key={d.data} title={d.data}
            className={`flex h-7 items-center justify-center rounded text-xs ${set.has(d.data) ? "bg-green-600 text-white" : d.futuro ? "bg-neutral-50 text-neutral-300" : "bg-neutral-100 text-neutral-500"} ${d.hoje ? "ring-2 ring-neutral-900" : ""}`}>
            {d.dia}
          </div>
        ))}
      </div>
    </div>
  );
}
