export default function StartLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div id="get-started" className="py-16 md:py-24 bg-background">
            <div className="container flex items-center justify-center">
                {children}
            </div>
        </div>
    );
}
