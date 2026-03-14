import { Link } from "react-router-dom";
import { Home, Phone, Mail, MapPin } from "lucide-react";

const SiteFooter = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16 px-4">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Home className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="font-heading font-bold text-xl">Luxury Finishing</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-4">
              متخصصون في تشطيب وتصميم الوحدات السكنية الفاخرة بتصاميم عصرية وجودة أوروبية.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-6">روابط سريعة</h3>
            <ul className="space-y-3">
              {[
                { label: "عن الشركة", href: "/about" },
                { label: "خدماتنا", href: "/services" },
                { label: "مشاريعنا", href: "/projects" },
                { label: "المدونة", href: "/blog" },
                { label: "سياسة الخصوصية", href: "/privacy" },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-lg mb-6">خدماتنا الرئيسية</h3>
            <ul className="space-y-3">
              {["التعديلات والتأسيس", "التشطيبات", "الديكور", "النجارة", "التسليم النهائي"].map((s) => (
                <li key={s}>
                  <span className="text-sm text-primary-foreground/70">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-6">معلومات الاتصال</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                <span className="text-sm text-primary-foreground/70">الحي التجاري - مدينة الرياض</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                <a href="tel:+201004006620" className="text-sm text-primary-foreground/70 hover:text-accent font-mono">
                  +201004006620
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                <a href="mailto:brand.identity@alazab.com" className="text-sm text-primary-foreground/70 hover:text-accent font-mono">
                  brand.identity@alazab.com
                </a>
              </li>
            </ul>
            {/* Map */}
            <div className="mt-6 rounded-lg overflow-hidden" style={{ filter: "grayscale(1) invert(1) opacity(0.8)" }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2708.771324907652!2d31.278762925568998!3d29.987812974952135!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1458396627ebf27d%3A0x15bc48a54f2e9a92!2z2KfZhNi52LLYqCDZhNmE2YXZgtin2YjZhNin2Kog2YjYp9mE2KrZiNix2YrYr9in2Ko!5e1!3m2!1sar!2seg!4v1773443057660!5m2!1sar!2seg"
                width="100%"
                height="150"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="موقعنا"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} Luxury Finishing. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
