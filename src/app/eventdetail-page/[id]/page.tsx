import Link from "next/link";
import { notFound } from "next/navigation";
import { Event } from "@/types/types"; // interface Event
import { mockEvents } from "@/data/mockData"; // data mock
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const event: Event | undefined = mockEvents.find((e) => e.id === params.id);

  if (!event) {
    notFound();
  }

  return (
    <div>
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Back Button */}
            <Link
              href="/home-page"
              className="inline-flex items-center text-sm text-blue-600 hover:underline mb-4"
            >
              ← Back to Homepage
            </Link>

            {/* Title & Description */}
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 lg:text-5xl">
                {event.title}
              </h1>
              <p className="mt-4 text-lg text-gray-600">{event.description}</p>
            </div>

            {/* Event Image */}
            <div className="relative w-full h-80 lg:h-[400px] rounded-lg overflow-hidden shadow-md">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="object-cover object-center w-full h-full"
              />
            </div>

            {/* About Section */}
            <section>
              <h2 className="mb-4 text-2xl font-bold">About the Event</h2>
              <p className="text-gray-700 leading-relaxed">
                {event.description}
              </p>
            </section>
          </div>

          {/* Sidebar Details */}
          <aside className="space-y-8 lg:sticky lg:top-20 lg:h-min">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold">Event Details</h2>
              <ul className="space-y-3 text-sm">
                <li>
                  <span className="font-semibold">📅 Date:</span> {event.date}
                </li>
                <li>
                  <span className="font-semibold">⏰ Time:</span> {event.time}
                </li>
                <li>
                  <span className="font-semibold">📍 Location:</span>{" "}
                  {event.location}
                </li>
                <li>
                  <span className="font-semibold">🏢 Venue:</span> {event.venue}
                </li>
                <li>
                  <span className="font-semibold">👤 Organizer:</span>{" "}
                  {event.organizer}
                </li>
                <li>
                  <span className="font-semibold">🎟️ Tickets Left:</span>{" "}
                  {event.availableTickets}
                </li>
              </ul>

              {/* CTA */}
              <div className="mt-6">
                <button
                  disabled={event.availableTickets <= 0}
                  className={`w-full rounded-lg px-5 py-3 text-sm font-semibold transition 
                  ${
                    event.availableTickets > 0
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  {event.availableTickets > 0
                    ? `Buy Ticket ($${event.price})`
                    : "Sold Out"}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
