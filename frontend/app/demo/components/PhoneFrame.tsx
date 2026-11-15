import type { ReactNode } from "react";
import { formatClock } from "../sim/format";
import { useSim } from "../sim/context";
import { ViewportFrame } from "./ViewportFrame";

export interface PhoneTab {
  id: string;
  label: string;
  badge?: number;
}

interface Props {
  title: string;
  /** Text on the right side of the status bar. */
  statusRight?: ReactNode;
  tabs?: PhoneTab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  children: ReactNode;
}

/** A phone-shaped device. Its screen is a real phone-width viewport (see ViewportFrame). */
export function PhoneFrame({ title, statusRight, tabs, activeTab, onTabChange, children }: Props) {
  const { state } = useSim();
  return (
    <div className="phone" role="group" aria-label={title}>
      <div className="phone-bezel">
        <div className="phone-status" aria-hidden="true">
          <span>{formatClock(state.clock)}</span>
          <span className="phone-notch" />
          <span>{statusRight}</span>
        </div>

        <ViewportFrame title={title} className="phone-screen">
          {children}
        </ViewportFrame>

        {tabs && tabs.length > 0 && (
          <nav className="phone-tabs" role="tablist" aria-label={`${title} sections`}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={activeTab === tab.id ? "phone-tab selected" : "phone-tab"}
                onClick={() => onTabChange?.(tab.id)}
              >
                {tab.label}
                {tab.badge ? <span className="phone-tab-badge">{tab.badge}</span> : null}
              </button>
            ))}
          </nav>
        )}
        <span className="phone-home" aria-hidden="true" />
      </div>
    </div>
  );
}
