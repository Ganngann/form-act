import { TrainerSidebar } from '@/components/trainer-sidebar';

export default function TrainerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="container min-h-[calc(100vh-80px)] py-10 flex gap-8">
            <TrainerSidebar />
            <main className="flex-1 min-w-0">
                {children}
            </main>
        </div>
    );
}
