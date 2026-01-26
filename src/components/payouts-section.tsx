
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "./ui/badge";

const payouts = [
  {
    method: "Crypto (USDT)",
    processingTime: "Instant",
    minPayout: "$50",
    regions: "Worldwide"
  },
  {
    method: "Wise / Payoneer",
    processingTime: "1-2 Days",
    minPayout: "$100",
    regions: "Supported countries"
  },
  {
    method: "Local Bank Wire",
    processingTime: "3-5 Days",
    minPayout: "$250",
    regions: "Select countries"
  },
];

export function PayoutsSection() {
  return (
    <section className="bg-muted/40 py-20 sm:py-32">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Global Payouts, Localized for You
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We make it easy to get paid, no matter where you are. We support payouts to creators in the Bahamas, Jamaica, Trinidad, South Africa, Ukraine, and many more.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-xl border bg-card shadow-lg">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Processing Time</TableHead>
                        <TableHead className="text-right">Min. Payout</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payouts.map((payout) => (
                    <TableRow key={payout.method} className="hover:bg-muted/40">
                        <TableCell className="font-medium">{payout.method}</TableCell>
                        <TableCell>{payout.processingTime}</TableCell>
                        <TableCell className="text-right font-mono">{payout.minPayout}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">Don't see your preferred method? <a href="#contact" className="underline">Contact us</a> for more options.</p>
      </div>
    </section>
  );
}
