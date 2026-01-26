
import { PlaceHolderImages } from "@/lib/placeholder-images";

export const successStories = [
    {
        creator: "@nadrionthego",
        description: "Case Study: Find out how this travel creator boosted brand deal inquiries by 38% after enabling TikTok Shop and the US Creator Fund.",
        stats: [
            { value: "$5,200+", label: "in first month Creator Fund earnings" },
            { value: "38%", label: "increase in brand deal inquiries" },
            { value: "22%", label: "growth in affiliate income" },
        ],
        image: PlaceHolderImages.find(p => p.id === "success-1"),
    },
    {
        creator: "@dnaesoraya",
        description: "Case Study: Learn how this lifestyle influencer expanded her audience and secured major collaborations with US-based fashion brands.",
        stats: [
            { value: "3", label: "major brand collaborations secured" },
            { value: "$12,000", label: "in TikTok Shop sales first quarter" },
            { value: "100k+", label: "new followers from US audience" },
        ],
        image: PlaceHolderImages.find(p => p.id === "success-2"),
    },
    {
        creator: "@jenniferblinky",
        description: "Case Study: Discover how this gamer from a non-supported region turned her content into a sustainable business with paid partnerships.",
        stats: [
            { value: "50k+", label: "new channel subscribers" },
            { value: "60%", label: "increase in average stream viewership" },
            { value: "2x", label: "monthly revenue from US partnerships" },
        ],
        image: PlaceHolderImages.find(p => p.id === "success-3"),
    }
];
