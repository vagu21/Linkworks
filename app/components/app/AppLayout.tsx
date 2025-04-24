import { ReactNode } from "react";
import SidebarLayout from "../layouts/SidebarLayout";
import CommandPalette from "../ui/commandPalettes/CommandPalette";
import NewSidebarLayout from "../layouts/NewSidebarLayout";
import { useSearchParams } from "@remix-run/react";
import Dreamer from "../ui/icons/background/DreamerIcon";
import CenterBackground from "../ui/icons/background/CenterBackgroundIcon";
import TreeSwing from "../ui/icons/background/TreeSwingIcon";

interface Props {
  layout: "app" | "admin" | "docs";
  children: ReactNode;
  type?: "new" | "old";
}

export default function AppLayout({ layout, children, type = "new" }: Props) {
  const [searchParams] = useSearchParams();
  const sidebarParam = searchParams.get("sidebar");
  if (sidebarParam === "new") {
    type = "new";
  } else if (sidebarParam === "old") {
    type = "old";
  }
  return (
    <div className="relative">
      {/* Fixed top-right icon */}
      <div className="fixed top-4 right-0 z-[-1] pointer-events-none">
        <Dreamer />
      </div>

      {/* Center background icon */}
      <div className="fixed bottom-8 left-0 z-[-1] pointer-events-none">
          <CenterBackground/>
      </div>


      {/* Fixed bottom-left icon */}
      <div className="fixed bottom-0 left-0 z-[-1] pointer-events-none">
        <TreeSwing />
      </div>
      {/* style={{ backgroundImage: `url(${AppBg})`, backgroundSize: 'cover' }} */}
      {/* <img className="fixed inset-0 object-cover z-[-1] h-screen w-screen" src={AppBg} alt="app background" /> */}
      <CommandPalette key={layout} layout={layout}>
        {type === "new" ? <NewSidebarLayout layout={layout}>{children}</NewSidebarLayout> : <SidebarLayout layout={layout}>{children}</SidebarLayout>}
      </CommandPalette>
      {/* {layout === "app" ? (
        <AppCommandPalette isOpen={showCommandPalette} onClosed={() => setShowCommandPalette(false)} />
      ) : layout === "admin" ? (
        <AdminCommandPalette isOpen={showCommandPalette} onClosed={() => setShowCommandPalette(false)} />
      ) : layout === "docs" && commands ? (
        <CommandPalette isOpen={showCommandPalette} onClosed={() => setShowCommandPalette(false)} commands={commands} />
      ) : (
        <div></div>
      )} */}
    </div>
  );
}
