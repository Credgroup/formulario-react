import type { ReactNode } from "react";
import { cn } from "../lib/utils";
type ContainerProps = {
  children?: ReactNode;
  className?: string;
};
export default function Container({
  children,
  className,
}: Readonly<ContainerProps>) {
  return (
    <div className={cn("w-full max-w-[1200px]", className)}>{children}</div>
  );
}
