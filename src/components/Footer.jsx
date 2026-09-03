import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="alejo-footer">
      <div className="alejo-footer-inner">

        <div className="footer-brand">
          <div className="footer-logo">A</div>

          <div>
            <h3>ALEJO</h3>
            <span>LOGISTICS</span>
          </div>

          <p>
            Reliable delivery. Simple tracking.
            Better service.
          </p>
        </div>

        <div className="footer-column">
          <h4>Quick Links</h4>

          <Link to="/">Home</Link>

          <Link to="/customer-dashboard">
            Dashboard
          </Link>

          <Link to="/book-delivery">
            Book Delivery
          </Link>

          <Link to="/contact">
            Contact
          </Link>
        </div>

        <div className="footer-column">
          <h4>Support</h4>

          <a
            href="https://wa.me/2347077524524"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>

          <a href="mailto:Alejooafrica@gmail.com">
            Email Support
          </a>

          <span>0707 752 4524</span>
        </div>

        <div className="footer-column">
          <h4>Business</h4>

          <span>ALEJO LOGISTICS</span>
          <span>Nigeria</span>

          <span>
            Fast &amp; reliable deliveries
          </span>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Alejo Logistics.
          All rights reserved.
        </span>

        <span>
          Built for simple, reliable delivery.
        </span>
      </div>
    </footer>
  );
}

export default Footer;