import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getDeliveries,
  getDeliveryById,
} from "../utils/deliveryStorage";
import "./TrackDelivery.css";

function TrackDelivery() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const selectedId = searchParams.get("id");

  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] =
    useState(null);

  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem("alejoUser") || "null"
    );

    if (!user) {
      navigate("/login");
      return;
    }

    const load = () => {
      const allDeliveries = getDeliveries();

      setDeliveries(allDeliveries);

      if (selectedId) {
        setSelectedDelivery(
          getDeliveryById(selectedId)
        );
      }
    };

    load();

    const interval = setInterval(load, 1000);

    return () => clearInterval(interval);
  }, [navigate, selectedId]);

  const showDelivery = (delivery) => {
    setSelectedDelivery(delivery);

    navigate(
      `/track-delivery?id=${delivery.id}`,
      { replace: true }
    );
  };

  const getStep = (status) => {
    if (status === "Pending") return 1;
    if (status === "Accepted") return 2;
    if (status === "In Transit") return 3;
    if (status === "Delivered") return 4;

    return 1;
  };

  return (
    <div className="tracking-page">

      {/* HEADER */}

      <div className="tracking-header">

        <p className="tracking-label">
          ALEJO LOGISTICS
        </p>

        <h1>Track Your Delivery</h1>

        <p>
          Follow the progress of your package
          from pickup to destination.
        </p>

      </div>


      {deliveries.length === 0 ? (

        <div className="tracking-empty">

          <div className="tracking-empty-icon">
            📦
          </div>

          <h2>
            No deliveries have been booked yet
          </h2>

          <p>
            Once you book a delivery, you will be
            able to track it here.
          </p>

          <button
            onClick={() =>
              navigate("/book-delivery")
            }
          >
            Book a Delivery
          </button>

        </div>

      ) : (

        <div className="tracking-layout">

          {/* DELIVERY LIST */}

          <section className="tracking-list-card">

            <div className="tracking-card-title">
              <p className="tracking-label">
                YOUR DELIVERIES
              </p>

              <h2>Delivery History</h2>
            </div>

            {deliveries.map((delivery) => (

              <button
                className={`tracking-list-item ${
                  selectedDelivery?.id === delivery.id
                    ? "selected"
                    : ""
                }`}
                key={delivery.id}
                onClick={() =>
                  showDelivery(delivery)
                }
              >

                <div className="tracking-list-icon">
                  📦
                </div>

                <div className="tracking-list-info">

                  <strong>
                    {delivery.id}
                  </strong>

                  <span>
                    {delivery.pickup}
                    {" → "}
                    {delivery.destination}
                  </span>

                </div>

                <span
                  className={`tracking-status ${
                    delivery.status
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                  }`}
                >
                  {delivery.status}
                </span>

              </button>

            ))}

          </section>


          {/* SELECTED DELIVERY */}

          <section className="tracking-details-card">

            {!selectedDelivery ? (

              <div className="tracking-select-message">

                <div>
                  📍
                </div>

                <h2>
                  Select a delivery
                </h2>

                <p>
                  Choose a delivery from the list
                  to view its tracking information.
                </p>

              </div>

            ) : (

              <>
                <div className="tracking-details-header">

                  <div>

                    <p className="tracking-label">
                      DELIVERY
                    </p>

                    <h2>
                      {selectedDelivery.id}
                    </h2>

                  </div>

                  <span
                    className={`tracking-status large ${
                      selectedDelivery.status
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                    }`}
                  >
                    {selectedDelivery.status}
                  </span>

                </div>


                {/* ROUTE */}

                <div className="tracking-route">

                  <div className="route-point">

                    <span className="route-dot" />

                    <div>
                      <small>
                        PICKUP
                      </small>

                      <strong>
                        {selectedDelivery.pickup}
                      </strong>
                    </div>

                  </div>


                  <div className="route-line" />


                  <div className="route-point">

                    <span className="route-dot destination-dot" />

                    <div>
                      <small>
                        DESTINATION
                      </small>

                      <strong>
                        {selectedDelivery.destination}
                      </strong>
                    </div>

                  </div>

                </div>


                {/* PROGRESS */}

                <div className="tracking-progress">

                  <div className="progress-line">
                    <div
                      className="progress-filled"
                      style={{
                        width: `${
                          ((getStep(
                            selectedDelivery.status
                          ) - 1) /
                            3) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  <div className="progress-steps">

                    <div className="progress-step">
                      <span>1</span>
                      <small>Booked</small>
                    </div>

                    <div className="progress-step">
                      <span>2</span>
                      <small>Accepted</small>
                    </div>

                    <div className="progress-step">
                      <span>3</span>
                      <small>In Transit</small>
                    </div>

                    <div className="progress-step">
                      <span>4</span>
                      <small>Delivered</small>
                    </div>

                  </div>

                </div>


                {/* PACKAGE */}

                <div className="tracking-info-grid">

                  <div>
                    <small>
                      RECIPIENT
                    </small>

                    <strong>
                      {selectedDelivery.recipient}
                    </strong>
                  </div>

                  <div>
                    <small>
                      PHONE
                    </small>

                    <strong>
                      {selectedDelivery.phone}
                    </strong>
                  </div>

                  <div>
                    <small>
                      PACKAGE
                    </small>

                    <strong>
                      {selectedDelivery.packageType}
                    </strong>
                  </div>

                  <div>
                    <small>
                      BOOKED
                    </small>

                    <strong>
                      {selectedDelivery.date}
                    </strong>
                  </div>

                </div>

              </>

            )}

          </section>

        </div>

      )}

    </div>
  );
}

export default TrackDelivery;