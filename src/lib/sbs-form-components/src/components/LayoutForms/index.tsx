import { cn } from "../../utils";
import type { ReactNode, FC } from "react";

/* =====================
 * Props
 * ===================== */

export type LayoutFormsProps = {
  children?: ReactNode;
  orientation?: "horizontal" | "vertical";
  className?: string;
};

export type LayoutFormsSidebarProps = {
  children?: ReactNode;
  className?: string;
  stickyMenu?: boolean;
  orientation?: "vertical" | "horizontal";
};

export type LayoutFormsContentProps = {
  children?: ReactNode;
  className?: string;
  orientation?: "vertical" | "horizontal";
};

export type LayoutFormsFooterProps = {
  children?: ReactNode;
  className?: string;
};

/* =====================
 * Compound type
 * ===================== */

type LayoutFormsCompound = FC<LayoutFormsProps> & {
  Sidebar: FC<LayoutFormsSidebarProps>;
  Content: FC<LayoutFormsContentProps>;
  Footer: FC<LayoutFormsFooterProps>;
};

/* =====================
 * Root
 * ===================== */

const LayoutFormsRoot: LayoutFormsCompound = ({
  orientation = "horizontal",
  className,
  children
}) => {
  return (
    <div className={cn("w-full h-full", className)}>
      <div
        className={cn(
          "w-full h-full flex",
          orientation === "horizontal"
            ? "flex-row flex-wrap"
            : "flex-col"
        )}
      >
        {children}
      </div>
    </div>
  );
};

/* =====================
 * Subcomponents
 * ===================== */

const LayoutFormsSidebar: FC<LayoutFormsSidebarProps> = ({
  children,
  className,
  stickyMenu = true,
  orientation = "vertical"
}) => {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn(
        "w-full space-y-4 p-2",
        stickyMenu && "sticky top-0",
        isVertical && "sm:max-w-1/3",
        className
      )}
    >
      {children}
    </div>
  );
};

const LayoutFormsContent: FC<LayoutFormsContentProps> = ({
  children,
  className,
  orientation = "horizontal"
}) => {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn(
        "w-full p-2",
        isVertical && "max-w-2/3",
        className
      )}
    >
      {children}
    </div>
  );
};

const LayoutFormsFooter: FC<LayoutFormsFooterProps> = ({
  children,
  className
}) => {
  return (
    <div
      className={cn(
        "w-full mt-10 flex items-center justify-between",
        className
      )}
    >
      {children}
    </div>
  );
};

/* =====================
 * Attach
 * ===================== */

LayoutFormsRoot.Sidebar = LayoutFormsSidebar;
LayoutFormsRoot.Content = LayoutFormsContent;
LayoutFormsRoot.Footer = LayoutFormsFooter;

/* =====================
 * Export público
 * ===================== */

export const LayoutForms = LayoutFormsRoot;
