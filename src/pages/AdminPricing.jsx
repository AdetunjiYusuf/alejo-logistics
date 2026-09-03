import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getPricing,
  savePricing,
  calculateDeliveryPrice,
} from "../utils/pricingStorage";

import Footer from "../components/Footer";

import "./AdminPricing.css";

function AdminPricing() {
  const navigate =
    useNavigate();

  const [baseFee, setBaseFee] =
    useState("");

  const [pricePerKm, setPricePerKm] =
    useState("");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    const authenticated =
      localStorage.getItem(
        "alejoAdminAuthenticated"
      );

    if (
      authenticated !== "true"
    ) {
      navigate("/login");
      return;
    }

    const pricing =
      getPricing();

    setBaseFee(
      pricing.baseFee
    );

    setPricePerKm(
      pricing.pricePerKm
    );
  }, [navigate]);

  const preview =
    calculateDeliveryPrice(
      10,
      {
        baseFee,
        pricePerKm,
      }
    );

  function save() {
    const base =
      Number(baseFee);

    const perKm =
      Number(pricePerKm);

    if (
      Number.isNaN(base) ||
      base < 0
    ) {
      setMessage(
        "Enter a valid base fee."
      );
      return;
    }

    if (
      Number.isNaN(perKm) ||
      perKm < 0
    ) {
      setMessage(
        "Enter a valid price per kilometer."
      );
      return;
    }

    savePricing({
      baseFee: base,
      pricePerKm: perKm,
    });

    setMessage(
      "Pricing updated successfully."
    );
  }

  function logout() {
    localStorage.removeItem(
      "alejoAdminAuthenticated"
    );

    navigate("/login");
  }

  return (
    <div className="pricing-page">

      <header className="pricing-header">

        <div>
          <span>
            ALEJO LOGISTICS
          </span>

          <h1>
            Pricing Settings
          </h1>

          <p>
            Control the delivery price
            used by every new booking.
          </p>
        </div>

        <div className="pricing-header-actions">

          <button
            onClick={() =>
              navigate(
                "/admin-dashboard"
              )
            }
          >
            ← Dashboard
          </button>

          <button
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>


      <main className="pricing-main">

        <section className="pricing-card">

          <div className="pricing-card-heading">

            <div className="pricing-icon">
              ₦
            </div>

            <div>
              <h2>
                Delivery Pricing
              </h2>

              <p>
                Set the two values used
                to calculate every delivery.
              </p>
            </div>

          </div>


          <div className="pricing-form">

            <label>
              Base Fee

              <span>
                Starting charge for every delivery
              </span>

              <div className="money-input">
                <b>₦</b>

                <input
                  type="number"
                  min="0"
                  value={baseFee}
                  onChange={(e) =>
                    setBaseFee(
                      e.target.value
                    )
                  }
                />
              </div>
            </label>


            <label>
              Price Per Kilometer

              <span>
                Added for every kilometer travelled
              </span>

              <div className="money-input">
                <b>₦</b>

                <input
                  type="number"
                  min="0"
                  value={pricePerKm}
                  onChange={(e) =>
                    setPricePerKm(
                      e.target.value
                    )
                  }
                />
              </div>
            </label>

          </div>


          <div className="pricing-equation">

            <span>
              PRICE CALCULATION
            </span>

            <strong>
              Base Fee + (Distance × Price Per KM)
            </strong>

            <p>
              Example for a 10 km delivery:
              ₦{Number(
                baseFee || 0
              ).toLocaleString()}
              {" + "}
              (10 × ₦{Number(
                pricePerKm || 0
              ).toLocaleString()})
              {" = "}
              <b>
                ₦{Number(
                  preview || 0
                ).toLocaleString()}
              </b>
            </p>

          </div>


          {message && (
            <div className="pricing-message">
              {message}
            </div>
          )}


          <button
            className="save-pricing"
            onClick={save}
          >
            Save Pricing
          </button>

        </section>

      </main>

      <Footer />

    </div>
  );
}

export default AdminPricing;