import "./Contact.css";

function Contact() {
  return (
    <div className="contact-page">

      {/* HEADER */}
      <section className="contact-header">
        <div>
          <span>CONTACT ALEJO LOGISTICS</span>

          <h1>We're Here To Help.</h1>

          <p>
            Have a question about a delivery, need support,
            or want to learn more about our services?
            Get in touch with the Alejo Logistics team.
          </p>
        </div>
      </section>

      {/* CONTACT INFORMATION */}
      <section className="contact-main">

        <div className="contact-info">

          <span>GET IN TOUCH</span>

          <h2>
            Let's talk about
            your delivery.
          </h2>

          <p>
            Whether you are sending a package, running a business,
            or simply want to learn more about Alejo Logistics,
            we're always happy to hear from you.
          </p>

          <div className="contact-details">

            <div className="contact-detail">
              <div className="contact-icon">📞</div>

              <div>
                <small>PHONE</small>
                <strong>+234 707 752 4524</strong>
              </div>
            </div>

            <div className="contact-detail">
              <div className="contact-icon">✉️</div>

              <div>
                <small>EMAIL</small>
                <strong>Alejooafrica@gmail.com</strong>
              </div>
            </div>

            <div className="contact-detail">
              <div className="contact-icon">📍</div>

              <div>
                <small>LOCATION</small>
                <strong>Nigeria</strong>
              </div>
            </div>

          </div>

        </div>

        {/* SOCIAL MEDIA */}
        <div className="social-section">

          <span>FOLLOW ALEJO LOGISTICS</span>

          <h2>Stay Connected.</h2>

          <p>
            Follow us on social media for updates, delivery news,
            promotions and more.
          </p>

          <div className="social-links">

            {/* <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="social-icon">◎</div>

              <div>
                <small>INSTAGRAM</small>
                <strong>@alejologistics</strong>
              </div>

              <span className="social-arrow">→</span>
            </a> */}
            <div className="contact-method">
  <div className="contact-icon">
    ☎
  </div>

  <div>
    {/* <span>WHATSAPP</span> */}

    <strong>
      Chat with Alejo Logistics
    </strong>

    <a
      href="https://wa.me/2347077524524"
      target="_blank"
      rel="noreferrer"
      className="whatsapp-button"
    >
      WhatsApp us
    </a>
  </div>
</div>

{/* 
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="social-icon">♪</div>

              <div>
                <small>TIKTOK</small>
                <strong>@alejologistics</strong>
              </div>

              <span className="social-arrow">→</span>
            </a> */}

{/* 
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="social-icon">f</div>

              <div>
                <small>FACEBOOK</small>
                <strong>Alejo Logistics</strong>
              </div>

              <span className="social-arrow">→</span>
            </a> */}

          </div>

        </div>

      </section>


      {/* BRAND STRIP */}
      <section className="contact-strip">

        <div>
          <span>ALEJO LOGISTICS</span>
          <h2>Moving what matters.</h2>
        </div>

        <p>
          Fast. Reliable. Convenient.
        </p>

      </section>

    </div>
  );
}

export default Contact;