import { Sidebar } from "@/components/sidebar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
export default async function GuildLayout({ children, params }: { children: React.ReactNode; params: { id: string } }){
  const s = await getSession();
  if(!s) redirect("/api/auth/discord");
  return <div className="flex min-h-screen">
    <Sidebar guildId={params.id} />
    <div className="flex-1 min-w-0 bg-background">
      <div className="border-b px-6 py-3 flex items-center justify-between bg-card/50 sticky top-0 z-10 backdrop-blur">
        <span className="font-semibold">Guild: {params.id}</span>
        <a href="/servers" className="text-sm text-primary hover:underline">Change server</a>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>;
}
