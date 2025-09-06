/**
 * Footer Component - Site footer with links and information
 * TODO: Add newsletter subscription functionality
 * FIXME: Update social media links with actual URLs
 */

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primario-300 border-t border-primario-200/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center">
              <svg 
                width="82" 
                height="26" 
                fill="#71c4ef" 
                viewBox="0 0 102 32"
                className="hover:fill-acento-200 transition-colors duration-200"
              >
                <path d="M29.24 22.68c-.16-.39-.31-.8-.47-1.15l-.74-1.67-.03-.03c-2.2-4.8-4.55-9.68-7.04-14.48l-.1-.2c-.25-.47-.5-.99-.76-1.47-.32-.57-.63-1.18-1.14-1.76a5.3 5.3 0 00-8.2 0c-.47.58-.82 1.19-1.14 1.76-.25.52-.5 1-.76 1.47l-.1.2c-2.45 4.8-4.84 9.68-7.04 14.48l-.06.06c-.22.52-.48 1.06-.73 1.64-.16.35-.32.73-.48 1.15a6.8 6.8 0 007.2 9.23 8.38 8.38 0 003.18-1.1c1.3-.73 2.55-1.79 3.95-3.32 1.4 1.53 2.68 2.59 3.95 3.32A8.38 8.38 0 0022.75 32a6.79 6.79 0 006.75-5.83 5.94 5.94 0 00-.26-3.5zm-14.36 1.66c-1.72-2.2-2.84-4.22-3.22-5.95a5.2 5.2 0 01-.1-1.96c.07-.51.26-.96.52-1.34.6-.87 1.65-1.41 2.8-1.41a3.3 3.3 0 012.8 1.4c.26.4.45.84.51 1.35.1.58.06 1.25-.1 1.96-.38 1.7-1.5 3.74-3.21 5.95z"></path>
              </svg>
            </div>
            <p className="text-primario-200 text-sm">
              Discover extraordinary places to stay and unique experiences around the world. 
              Your journey to luxury begins here.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                <a
                  key={social}
                  href={`#${social}`}
                  className="text-primario-200 hover:text-acento-100 transition-colors duration-200"
                  aria-label={`Follow us on ${social}`}
                >
                  <div className="w-8 h-8 bg-primario-200/10 hover:bg-acento-100/20 rounded-full flex items-center justify-center transition-all duration-200">
                    <span className="text-xs font-semibold uppercase">
                      {social.charAt(0)}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-primario-100 font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-3">
              {[
                'Help Center',
                'Safety Information', 
                'Cancellation Options',
                'Report Issue',
                'Contact Us'
              ].map((item) => (
                <li key={item}>
                  <a 
                    href="#" 
                    className="text-primario-200 hover:text-acento-100 transition-colors duration-200 text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-primario-100 font-semibold text-lg mb-4">Community</h3>
            <ul className="space-y-3">
              {[
                'Airbnb.org: Disaster Relief',
                'Support Afghan Refugees',
                'Combating Discrimination',
                'Community Guidelines',
                'Host Resources'
              ].map((item) => (
                <li key={item}>
                  <a 
                    href="#" 
                    className="text-primario-200 hover:text-acento-100 transition-colors duration-200 text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h3 className="text-primario-100 font-semibold text-lg mb-4">Hosting</h3>
            <ul className="space-y-3">
              {[
                'Try Hosting',
                'AirCover for Hosts',
                'Host Resources',
                'Community Forum',
                'Hosting Responsibly'
              ].map((item) => (
                <li key={item}>
                  <a 
                    href="#" 
                    className="text-primario-200 hover:text-acento-100 transition-colors duration-200 text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-primario-200/20">
          <div className="text-center max-w-md mx-auto">
            <h3 className="text-primario-100 font-semibold text-lg mb-4">Stay Updated</h3>
            <p className="text-primario-200 text-sm mb-4">
              Get the latest luxury properties and exclusive offers delivered to your inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-card border border-primario-200/30 rounded-full text-primario-100 placeholder-primario-200/60 focus:outline-none focus:ring-2 focus:ring-acento-100/50 focus:border-acento-100 transition-all duration-200"
              />
              <button className="bg-acento-100 hover:bg-acento-200 text-texto-100 px-6 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primario-200/20">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-primario-200 text-sm">
              © {currentYear} Airbnb Luxury. All rights reserved.
            </div>
            
            <div className="flex flex-wrap justify-center sm:justify-end gap-6 text-sm">
              {[
                'Privacy Policy',
                'Terms of Service', 
                'Cookie Policy',
                'Accessibility'
              ].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-primario-200 hover:text-acento-100 transition-colors duration-200"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}