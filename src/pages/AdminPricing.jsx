import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getPricing,
  savePricing,
} from "../utils/pricingStorage";

import "./AdminPricing.css";

function AdminPricing() {
  const navigate = useNavigate();

  const currentPricing = getPricing();

  const [baseFee, setBaseFee] =
    useState(
      currentPricing?.baseFee ?? 1000
    );

  const [pricePerKm, setPricePerKm] =
    useState(
      currentPricing?.pricePerKm ?? 200
    );

  const [message, setMessage] =
    useState("");

  const handleSave = (e) => {
    e.preventDefault();

    const base =
      Number(baseFee);

    const perKm =
      Number(pricePerKm);

    if (
      Number.isNaN(base) ||
      base < 0
    ) {
      setMessage(
        "Enter a valid base price."
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
      "Pricing saved successfully."
    );
  };

  return (
    <div className="pricing-page">

      <div className="pricing-card">

        <div className="pricing-header">

          <div>
            <p>
              ALEJO LOGISTICS
            </p>

            <h1>
              Pricing Settings
            </h1>

            <span>
              Set the delivery base price
              and price charged per kilometer.
            </span>
          </div>

          <button
            className="pricing-back"
            onClick={() =>
              navigate("/admin")
            }
          >
            ← Admin Dashboard
          </button>

        </div>

        {message && (
          <div className="pricing-message">
            {message}
          </div>
        )}

        <form
          onSubmit={handleSave}
          className="pricing-form"
        >

          <div className="pricing-field">

            <label>
              Base Price
            </label>

            <p>
              The starting price for every delivery.
            </p>

            <div className="pricing-input">

              <span>
                ₦
              </span>

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

          </div>

          <div className="pricing-field">

            <label>
              Price Per Kilometer
            </label>

            <p>
              Amount added for every kilometer travelled.
            </p>

            <div className="pricing-input">

              <span>
                ₦
              </span>

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

              <small>
                / km
              </small>

            </div>

          </div>

          <div className="pricing-example">

            <span>
              Example
            </span>

            <strong>
              ₦
              {Number(
                baseFee || 0
              ).toLocaleString()}
              {" + "}
              (
              {Number(
                pricePerKm || 0
              ).toLocaleString()}
              × distance)
            </strong>

          </div>

          <button
            type="submit"
            className="pricing-save"
          >
            Save Pricing
          </button>

        </form>

      </div>

    </div>
  );
}

export default AdminPricing;