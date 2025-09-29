const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-2 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-bold mb-2">EventFlow</h3>
            <p className="text-gray-400 text-sm max-w-md">
              Discover and create amazing events with EventFlow. Connect with
              people, explore new experiences, and make memories.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-1 text-sm">
              <li>
                <a
                  href="/about"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/home"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Browse Events
                </a>
              </li>
              <li>
                <a
                  href="/createevent"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Create Event
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-base font-semibold mb-2">Contact Us</h4>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>support@eventflow.com</li>
              <li>+1 (555) 123-4567</li>
              <li>123 Event St, City, State</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-4 pt-4 text-center text-gray-400 text-xs">
          <p>&copy; 2024 EventFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
