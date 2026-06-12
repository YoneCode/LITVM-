import { MetricsRow } from "@/components/dashboard/MetricsRow";
import { ActionsPanel } from "@/components/dashboard/ActionsPanel";
import { PositionsTable } from "@/components/dashboard/PositionsTable";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { GovernancePanel } from "@/components/dashboard/GovernancePanel";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";

export default function DashboardOverview() {
  return (
    <div className="mx-auto flex max-w-[1320px] flex-col gap-6">
      {/* Core metrics — public, real on-chain reads */}
      <section id="overview" className="scroll-mt-20">
        <MetricsRow />
      </section>

      {/* Actions (transact) + your live position */}
      <section id="position" className="grid scroll-mt-20 gap-6 xl:grid-cols-2">
        <ActionsPanel />
        <PositionsTable />
      </section>

      {/* Activity feed + governance */}
      <section className="grid gap-6 xl:grid-cols-2">
        <div id="activity" className="scroll-mt-20">
          <ActivityFeed />
        </div>
        <div id="governance" className="scroll-mt-20">
          <GovernancePanel />
        </div>
      </section>

      {/* Health & risk */}
      <section id="health" className="scroll-mt-20">
        <InsightsPanel />
      </section>
    </div>
  );
}
