
import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';

export function WhatsAppWidget() {
  return (
    <Link
      href="https://wa.me/15551234567" // Replace with your number
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      aria-label="Contact us on WhatsApp"
    >
      <FaWhatsapp className="h-8 w-8" />
    </Link>
  );
}
