import { Link } from "react-router-dom";
import "./Services.css";

function Services() {
  const services = [
    {
      icon: "🏍️",
      title: "Express Delivery",
      text: "Fast and convenient delivery for packages that need to arrive quickly."
    },
    {
      icon: "📦",
      title: "Package Delivery",
      text: "Reliable transportation of parcels, documents and everyday items."
    },
    {
      icon: "🏢",
      title: "Business Delivery",
      text: "Delivery solutions designed to help businesses move goods efficiently."
    },
    {
      icon: "📍",
      title: "Local Delivery",
      text: "Convenient deliveries within your city and surrounding areas."
    },
    {
      icon: "🚚",
      title: "Scheduled Delivery",
      text: "Plan your delivery ahead of time and choose when your package should move."
    },
    {
      icon: "🛡️",
      title: "Safe Handling",
      text: "Your packages are handled carefully throughout the delivery process."
    }
  ];

  return (
    <div className="services-page">

      <section className="services-hero">
        <span>OUR SERVICES</span>

        <h1>
          Logistics That
          <strong> Move With You.</strong>
        </h1>

        <p>
          From small packages to business deliveries, Alejo Logistics
          provides simple and reliable solutions for getting things
          where they need to go.
        </p>
      </section>

      <section className="services-list">

        <div className="services-heading">
          <span>WHAT WE OFFER</span>
          <h2>Delivery Solutions For Everyone</h2>
          <p>
            Choose the service that fits your delivery needs.
          </p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <div className="service-box" key={index}>
              <div className="service-box-icon">
                {service.icon}
              </div>

              <h3>{service.title}</h3>

              <p>{service.text}</p>

              <Link to="/register">
                Get Started →
              </Link>
            </div>
          ))}
        </div>

      </section>

      <section className="services-cta">
        <div>
          <h2>Need a delivery?</h2>
          <p>
            Book your delivery with Alejo Logistics today.
          </p>
        </div>

        <Link to="/register">
          Book a Delivery →
        </Link>
      </section>

    </div>
  );
}

export default Services;