import { cn } from "@/lib/utils";
import { LuCheck } from "react-icons/lu";
type FormNavItemProps = {
  disable: boolean;
  checked: boolean;
  title: string;
  description: string;
};
export default function FormNavItem({
  checked,
  description,
  disable,
  title,
}: Readonly<FormNavItemProps>) {
  return (
    <div className={cn("space-y-1 py-2", disable && "opacity-30")}>
      {checked ? (
        <div
          className={cn(
            "flex justify-center items-center w-7 h-7 rounded-full bg-green-500"
          )}
        >
          <LuCheck className="text-xl stroke-4 text-white" />
        </div>
      ) : (
        <div
          className={cn(
            "flex justify-center items-center w-7 h-7 rounded-full border-4 border-zinc-300"
          )}
        ></div>
      )}

      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-base font-regular">{description}</p>
    </div>
  );
}
