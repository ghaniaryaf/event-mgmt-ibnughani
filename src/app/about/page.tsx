import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-white dark:bg-gray-900 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-base font-semibold text-purple-600">Our Story</p>
              <h2 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                About Eventflow
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                EventFlow is a leading event management platform dedicated to simplifying the process 
                of planning and executing events of all sizes. Our mission is to empower event organizers 
                with the tools and resources they need to create memorable experiences for their attendees.
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-gray-50 dark:bg-gray-800/50 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Mission Section */}
            <div className="space-y-5">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our mission is to revolutionize the event management landscape by providing an intuitive, 
                comprehensive, and scalable platform. We strive to make event planning accessible to everyone, 
                from small businesses to large enterprises, ensuring that every event is a success.
              </p>
            </div>

            {/* Values Section */}
            <div className="space-y-5">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Our Values</h3>
              <p className="text-gray-600 dark:text-gray-300">
                At EventFlow, we are guided by a set of core values that shape our work and interactions:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Innovation:</span>{' '}
                  We continuously seek new and improved ways to enhance our platform and services.
                </li>
                <li>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Customer Focus:</span>{' '}
                  We prioritize the needs of our users, ensuring their satisfaction and success.
                </li>
                <li>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Integrity:</span>{' '}
                  We operate with transparency and honesty in all our dealings.
                </li>
                <li>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Collaboration:</span>{' '}
                  We foster a collaborative environment, both internally and with our clients, to achieve shared goals.
                </li>
                <li>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Excellence:</span>{' '}
                  We are committed to delivering high-quality solutions and exceptional service.
                </li>
              </ul>
            </div>

            {/* Team Section */}
            <div className="space-y-5">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Our Team</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our team is composed of experienced professionals passionate about event management and technology. 
                We bring together diverse skills and expertise to create a platform that meets the evolving needs 
                of the event industry.
              </p>
            </div>

            {/* Contact Section */}
            <div className="space-y-5">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Us</h3>
              <p className="text-gray-600 dark:text-gray-300">
                If you have any questions or would like to learn more about EventFlow, please don&apos;t hesitate 
                to contact us. We&apos;re here to help you plan your next great event.
              </p>
              <div className="pt-4">
                <Link 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                >
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}