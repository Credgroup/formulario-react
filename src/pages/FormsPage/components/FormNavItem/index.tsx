import { cn } from "@/lib/utils";
import { LuCheck } from "react-icons/lu";
type FormNavItemProps = {
  disable?: boolean;
  checked?: boolean;
  title?: string;
  description?: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
};
export default function FormNavItem({
  checked,
  description,
  disable,
  title,
  active,
  onClick,
  className,
}: Readonly<FormNavItemProps>) {
  const handleClick = () => {
    onClick?.();
  };
  return (
    <div
      className={cn(
        "space-y-1 py-2 transition-all select-none",
        className,
        disable && "opacity-30"
      )}
      onClick={() => handleClick()}
    >
      {active && (
        <div
          className={cn(
            "flex justify-center items-center w-7 h-7 rounded-full border-4 border-blue-600"
          )}
        ></div>
      )}
      {!active && !checked && (
        <div
          className={cn(
            "flex justify-center items-center w-7 h-7 rounded-full border-4 border-zinc-300"
          )}
        ></div>
      )}
      {checked && !active && (
        <div
          className={cn(
            "flex justify-center items-center w-7 h-7 rounded-full bg-green-500"
          )}
        >
          <LuCheck className="text-xl stroke-4 text-white" />
        </div>
      )}

      <h1 className="text-2xl font-bold">{title ? title : "--"}</h1>
      <p className="text-base font-regular">
        {description ? description : "--"}
      </p>
    </div>
  );
}
