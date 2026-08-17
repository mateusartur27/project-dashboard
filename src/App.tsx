import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./layout/Layout";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { ModuleDetailPage } from "./features/module-detail/ModuleDetailPage";
import { ImprovementsPage } from "./features/improvements/ImprovementsPage";
import { ImprovementDetailPage } from "./features/improvements/ImprovementDetailPage";
import { ConfigurationDetailPage } from "./features/configurations/ConfigurationDetailPage";
import { ChannelsPage } from "./features/channels/ChannelsPage";
import { ChannelDetailPage } from "./features/channels/ChannelDetailPage";
import { RulesPage } from "./features/rules/RulesPage";
import { RuleDetailPage } from "./features/rules/RuleDetailPage";
import { LoginPage } from "./features/auth/LoginPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<ImprovementsPage />} />
          <Route path="/improvements/:improvementId" element={<ImprovementDetailPage />} />
          <Route path="/modules" element={<DashboardPage />} />
          <Route path="/modules/:moduleId" element={<ModuleDetailPage />} />
          <Route path="/configurations/:configId" element={<ConfigurationDetailPage />} />
          <Route path="/channels" element={<ChannelsPage />} />
          <Route path="/channels/:channelId" element={<ChannelDetailPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/rules/:ruleId" element={<RuleDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
