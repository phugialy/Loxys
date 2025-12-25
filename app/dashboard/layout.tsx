import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { UserMenu } from '@/components/dashboard/user-menu';
import { Breadcrumbs } from '@/components/dashboard/breadcrumbs';
import { MobileNav } from '@/components/dashboard/mobile-nav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card">
        <div className="flex items-center gap-2 px-6 py-6 border-b">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">L</span>
          </div>
          <h2 className="text-xl font-semibold">Loxys</h2>
        </div>
        
        <div className="flex-1 px-4 py-6">
          <SidebarNav />
        </div>

        <div className="p-4 border-t">
          <UserMenu email={user.email || ''} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">L</span>
            </div>
            <h2 className="text-xl font-semibold">Loxys</h2>
          </div>
          <div className="flex items-center gap-2">
            <MobileNav />
            <UserMenu email={user.email || ''} />
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8">
            <Breadcrumbs />
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
