import { Link } from "react-router-dom";
import "./About.css";

function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div>
          <span>ABOUT ALEJO LOGISTICS</span>
          <h1>Moving What Matters, With Care.</h1>
          <p>
            Alejo Logistics provides fast, reliable and convenient
            delivery solutions for individuals and businesses.
          </p>
        </div>
      </section>

      <section className="about-content">
        <div className="about-story">
          <span>WHO WE ARE</span>
          <h2>Logistics Made Simple</h2>

          <p>
            Alejo Logistics is a modern logistics service built to make
            moving packages easier, faster and more reliable.
          </p>

          <p>
            From everyday deliveries to business logistics, our goal is
            to connect customers with dependable delivery services while
            making the entire process simple.
          </p>

          <p>
            We combine technology, professional drivers and convenient
            delivery services to give our customers a better experience.
          </p>
        </div>

        <div className="about-values">
          <div>
            <strong>01</strong>
            <h3>Reliability</h3>
            <p>
              We work to make every delivery dependable and convenient.
            </p>
          </div>

          <div>
            <strong>02</strong>
            <h3>Speed</h3>
            <p>
              We understand that your time matters, so we focus on
              efficient deliveries.
            </p>
          </div>

          <div>
            <strong>03</strong>
            <h3>Trust</h3>
            <p>
              We treat every package and every customer with care.
            </p>
          </div>

          <div>
            <strong>04</strong>
            <h3>Technology</h3>
            <p>
              We use technology to make booking and managing deliveries
              easier.
            </p>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <h2>Ready to move something?</h2>
        <p>Let Alejo Logistics handle the journey.</p>

        <Link to="/register">
          Get Started →
        </Link>
      </section>
    </div>
  );
}

export default About;