
'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoAlertProps {
    title: string;
    message: string;
    duration?: number;
}

export function InfoAlert({ title, message, duration = 2500 }: InfoAlertProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const showTimer = setTimeout(() => {
            setIsVisible(true);
        }, 300);

        const fadeTimer = setTimeout(() => {
            setIsFadingOut(true);
        }, duration);

        const hideTimer = setTimeout(() => {
            setIsVisible(false);
        }, duration + 500);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(fadeTimer);
            clearTimeout(hideTimer);
        };
    }, [duration]);

    const handleClose = () => {
        setIsFadingOut(true);
        setTimeout(() => setIsVisible(false), 500);
    }

    if (!isVisible) return null;

    return (
        <div className={cn("relative mt-4 transition-opacity duration-500", isFadingOut ? "opacity-0" : "opacity-100")}>
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>{title}</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
                <button onClick={handleClose} className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted">
                    <X className="h-4 w-4" />
                </button>
            </Alert>
        </div>
    );
}
