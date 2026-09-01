import { Link } from "react-router-dom";
import "./Home.css";
import riderImage from "../assets/hero-rider.jpg";

function Home() {
  return (
    <div className="home">

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">

          <div className="hero-text">
            <span className="eyebrow">
              WELCOME TO ALEJO LOGISTICS
            </span>

            <h1>
              We Deliver
              <span> Your World.</span>
            </h1>

            <p>
              Fast, reliable and secure delivery services
              you can trust, anytime, anywhere.
            </p>

            <div className="hero-buttons">
              {/* <Link to="/book-delivery" className="btn primary">
                Book a Delivery →
              </Link> */}

           
            </div>

            <div className="hero-features">
              <div>
                <strong>⚡</strong>
                <div>
                  <b>Fast Delivery</b>
                  <small>Quick & efficient</small>
                </div>
              </div>

              <div>
                <strong>🛡</strong>
                <div>
                  <b>Safe & Secure</b>
                  <small>Your packages are safe</small>
                </div>
              </div>

              <div>
                <strong>📍</strong>
                <div>
                  <b>Live Tracking</b>
                  <small>Track your delivery</small>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-image">
            <img src={riderImage} alt="Alejo Logistics delivery rider" />
          </div>

        </div>
      </section>


      {/* SERVICES */}
      <section className="services-section">

        <div className="section-heading">
          <span>OUR SERVICES</span>
          <h2>Everything You Need, Delivered.</h2>
          <p>
            Professional logistics solutions designed to make
            sending and receiving packages simple.
          </p>
        </div>

        <div className="service-cards">

          <div className="service-card">
            <div className="service-icon">🏍</div>
            <h3>Express Delivery</h3>
            <p>
              Get your packages delivered quickly and safely
              to their destination.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon">📦</div>
            <h3>Package Delivery</h3>
            <p>
              From documents to parcels, we handle your
              deliveries with care.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon">📍</div>
            <h3>Package Tracking</h3>
            <p>
              Know where your delivery is from pickup
              until it reaches its destination.
            </p>
          </div>

        </div>
      </section>


      {/* HOW IT WORKS */}
      <section className="how-section">

        <div className="section-heading">
          <span>HOW IT WORKS</span>
          <h2>Simple. Fast. Reliable.</h2>
        </div>

        <div className="steps">

          <div className="step">
            <div>01</div>
            <h3>Book</h3>
            <p>Tell us where your package needs to go.</p>
          </div>

          <div className="step">
            <div>02</div>
            <h3>Pickup</h3>
            <p>A driver accepts and picks up your package.</p>
          </div>

          <div className="step">
            <div>03</div>
            <h3>Track</h3>
            <p>Follow your delivery while it is in transit.</p>
          </div>

          <div className="step">
            <div>04</div>
            <h3>Delivered</h3>
            <p>Your package arrives safely at its destination.</p>
          </div>

        </div>
      </section>


      {/* CTA */}
      <section className="cta-section">
        <div>
          <h2>Ready to send something?</h2>
          <p>Let Alejo Logistics handle the journey.</p>
        </div>

        <Link to="/register" className="btn white">
          Get Started →
        </Link>
      </section>

    </div>
  );
}

export default Home;