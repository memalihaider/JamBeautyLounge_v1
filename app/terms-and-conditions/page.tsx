import Link from "next/link";
import { ArrowLeft, FileText, Shield, Scale, Users, CreditCard, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

export const metadata = {
  title: "Terms and Conditions | JAM Beauty Lounge",
  description: "Read our comprehensive terms and conditions for using JAM Beauty Lounge services, booking appointments, and purchasing products.",
};

export default function TermsAndConditionsPage() {
  const lastUpdated = "January 31, 2026";

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: FileText,
      content: [
        "By accessing and using JAM Beauty Lounge's services, website, mobile application, or any other platforms (collectively, the 'Services'), you accept and agree to be bound by the terms and provision of this agreement.",
        "If you do not agree to abide by the above, please do not use this service."
      ]
    },
    {
      id: "services",
      title: "Services Description",
      icon: Shield,
      content: [
        "JAM Beauty Lounge provides luxury beauty and wellness services including but not limited to spa treatments, beauty consultations, product sales, and appointment booking.",
        "All services are subject to availability and may require advance booking. We reserve the right to modify or cancel services at our discretion."
      ]
    },
    {
      id: "booking",
      title: "Booking and Cancellation Policy",
      icon: Scale,
      content: [
        "Appointments must be booked in advance through our website, mobile app, or by contacting our concierge team.",
        "Cancellations must be made at least 24 hours in advance for treatments under $200, and 48 hours in advance for treatments over $200.",
        "Late cancellations or no-shows may be subject to a fee up to the full service price.",
        "We reserve the right to cancel or reschedule appointments due to unforeseen circumstances."
      ]
    },
    {
      id: "payment",
      title: "Payment Terms",
      icon: CreditCard,
      content: [
        "All services and products must be paid for at the time of booking or purchase.",
        "We accept major credit cards, debit cards, and approved third-party payment processors.",
        "Prices are subject to change without notice. The price charged will be the price in effect at the time of booking.",
        "Refunds for services will be processed according to our cancellation policy."
      ]
    },
    {
      id: "user-conduct",
      title: "User Conduct and Responsibilities",
      icon: Users,
      content: [
        "You agree to use our Services only for lawful purposes and in accordance with these Terms.",
        "You are responsible for maintaining the confidentiality of your account information.",
        "You agree not to use our Services to transmit any harmful, offensive, or inappropriate content.",
        "You must provide accurate and complete information when booking services or creating an account."
      ]
    },
    {
      id: "health-safety",
      title: "Health and Safety",
      icon: Shield,
      content: [
        "You agree to disclose any medical conditions, allergies, or medications that may affect your treatment.",
        "JAM Beauty Lounge is not responsible for any adverse reactions to treatments or products.",
        "Pregnant clients must consult with their healthcare provider before receiving certain treatments.",
        "We maintain strict hygiene and safety standards in accordance with industry regulations."
      ]
    },
    {
      id: "privacy",
      title: "Privacy and Data Protection",
      icon: Shield,
      content: [
        "Your privacy is important to us. Please review our Privacy Policy for details on how we collect, use, and protect your personal information.",
        "By using our Services, you consent to the collection and use of information as outlined in our Privacy Policy.",
        "We implement appropriate security measures to protect your personal information."
      ]
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      icon: Scale,
      content: [
        "JAM Beauty Lounge shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our Services.",
        "Our total liability shall not exceed the amount paid for the specific service or product in question.",
        "We are not liable for any delays or failures in service due to circumstances beyond our reasonable control."
      ]
    },
    {
      id: "contact",
      title: "Contact Information",
      icon: Mail,
      content: [
        "If you have any questions about these Terms and Conditions, please contact us:",
        "Email: legal@jambeautylounge.com",
        "Phone: +1 (555) 123-4567",
        "Address: 123 Luxury Way, Manhattan, NY 10001"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 pt-32">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-secondary transition-colors mb-8">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>

          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <FileText className="w-4 h-4" />
              Legal Information
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tighter text-primary">
              Terms & Conditions
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Please read these terms and conditions carefully before using our services.
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-primary">Table of Contents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors group"
                  >
                    <section.icon className="w-5 h-5 text-primary group-hover:text-secondary transition-colors" />
                    <span className="text-gray-700 group-hover:text-primary transition-colors font-medium">
                      {section.title}
                    </span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-16">
          {sections.map((section, index) => (
            <div key={section.id} id={section.id} className="scroll-mt-20">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <section.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-primary font-medium mb-1">
                        Section {index + 1}
                      </div>
                      <CardTitle className="text-2xl font-serif text-primary">
                        {section.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    {section.content.map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-base">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="space-y-8">
            <h2 className="text-4xl font-serif font-bold">Questions About Our Terms?</h2>
            <p className="text-xl opacity-90 leading-relaxed max-w-2xl mx-auto">
              If you have any questions about these Terms and Conditions or need clarification
              on any aspect of our services, please don't hesitate to contact us.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold">Email Us</h3>
                <p className="opacity-90">legal@jambeautylounge.com</p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold">Legal Support</h3>
                <p className="opacity-90">Available 9 AM - 6 PM EST</p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold">Documentation</h3>
                <p className="opacity-90">Complete legal documents</p>
              </div>
            </div>
            <div className="pt-8">
              <Button asChild className="bg-white text-primary hover:bg-white/90 px-8 py-4 rounded-2xl font-medium">
                <Link href="/contact">Contact Our Legal Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-600">
            These Terms and Conditions were last updated on {lastUpdated}.
            We reserve the right to modify these terms at any time.
            Continued use of our services constitutes acceptance of any changes.
          </p>
        </div>
      </section>
      </main>
      <Footer />
    </div>
  );
}