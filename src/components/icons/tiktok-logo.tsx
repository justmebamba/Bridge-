export function TikTokLogo({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 86 98"
            className={className}
            aria-hidden="true"
            fill="none"
        >
            <path
                className="fill-tiktok-cyan"
                d="M53.33 0H41.14v71.42a12.18 12.18 0 1 1-12.18-12.17"
            />
            <path
                className="fill-tiktok-pink"
                d="M65.51 12.17V0H53.33v71.42a12.18 12.18 0 1 1-12.18-12.17"
            />
            <path
                className="fill-white"
                d="M53.33 12.17V0H41.15v59.25a12.18 12.18 0 1 1-12.18-12.18"
            />
        </svg>
    )
}
