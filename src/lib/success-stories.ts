
import { PlaceHolderImages } from "@/lib/placeholder-images";

export const successStories = [
    {
        creator: "@nadrionthego",
        description: "Find out how he was able to boost brand deals with our US-based number.",
        stats: [
            { value: "38%", label: "increase in brand deal inquiries" },
            { value: "22%", label: "growth in affiliate income" },
            { value: "15%", label: "higher audience retention" },
        ],
        image: PlaceHolderImages.find(p => p.id === "success-1"),
    },
    {
        creator: "@dnaesoraya",
        description: "Learn how she expanded her audience and secured major collaborations.",
        stats: [
            { value: "3", label: "major brand collaborations secured" },
            { value: "25%", label: "uplift in merch sales" },
            { value: "100k+", label: "new followers across platforms" },
        ],
        image: PlaceHolderImages.find(p => p.id === "success-2"),
    },
    {
        creator: "@jenniferblinky",
        description: "Discover how she turned her content into a sustainable business.",
        stats: [
            { value: "50k+", label: "new channel subscribers" },
            { value: "60%", label: "increase in average stream viewership" },
            { value: "2x", label: "monthly revenue from partnerships" },
        ],
        image: PlaceHolderImages.find(p => p.id === "success-3"),
    }
];
