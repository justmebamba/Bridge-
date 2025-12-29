
'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function StartLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        // Simple check to prevent flicker, can be enhanced
        setChecked(true);
    }, []);


    if (!checked) {
        return (
            <div className="container flex items-center justify-center py-16 md:py-24">
                <div className="flex flex-col items-center justify-center text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <h1 className="text-xl font-semibold">Loading...</h1>
                    <p className="text-muted-foreground">Please wait...</p>
                </div>
            </div>
        );
    }

    return (
        <div id="get-started" className="py-16 md:py-24 bg-background">
            <div className="container flex items-center justify-center">
                {children}
            </div>
        </div>
    );
}
