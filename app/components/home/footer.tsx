
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white text-sm font-bold">
                ZT
              </div>
              <span className="text-xl font-bold text-gray-900">ZZP Trust</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Het elegantste dashboard voor ZZP'ers. Beheer je facturen, klanten, 
              afspraken en documenten met de intuïtieve tool die speciaal is ontworpen voor Nederlandse freelancers.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#features" className="text-sm text-muted-foreground hover:text-gray-900 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-gray-900 transition-colors">
                  Hoe het werkt
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-gray-900 transition-colors">
                  Inloggen
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Bedrijf</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:contact@zzptrust.nl" className="text-sm text-muted-foreground hover:text-gray-900 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-gray-900 transition-colors">
                  Over ons
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-gray-900 transition-colors">
                  Help Center
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} ZZP Trust. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </footer>
  );
}
