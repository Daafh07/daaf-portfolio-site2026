import type { Service } from "@/data/services";

// What shows under the dock when a blob is picked: a name chip in the blob's colour, the point in
// one line, a few words, and what I build. The same card as the steps below it.
export function ServicePanel({ service }: { service: Service }) {
  return (
    <div className="mx-auto flex w-full max-w-[529px] flex-col gap-[18px] rounded-[23px] bg-fg px-6 pt-[19px] pb-6">
      <span className="w-fit rounded-full px-3 py-1 text-[13px] font-bold text-bg" style={{ backgroundColor: service.color }}>
        {service.name}
      </span>
      <p className="text-[15px] leading-[23px] font-bold text-bg">{service.lead}</p>
      <p className="text-[14px] leading-[22px] font-medium text-[#3c3c3c]">{service.body}</p>
      <div className="h-px w-full bg-[#e0e0e0]" />
      <div className="flex flex-col gap-[10px]">
        <p className="text-[13px] font-bold text-bg">What I build</p>
        <ul className="flex flex-col gap-2 text-[14px] leading-5 font-medium text-[#3c3c3c]">
          {service.builds.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
