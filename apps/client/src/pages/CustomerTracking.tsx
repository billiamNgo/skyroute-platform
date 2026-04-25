import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./Dashboard.css";
import "./CustomerTracking.css"

type TrackingResponse = { 
    orderID: number;
    status: string;
    droneID?: number;
};

export default function CustomerTracking() { 
    const { orderId } = useParams();

    const [trackingNumber, setTrackingNumber] = useState("");
    const [ result, setResult] = useState<TrackingResponse | null>(null);
    const [ error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);
    
    const formatStatus = (status: string) => { 
        switch (status) { 
            case "PENDING":
                return "Order Received";
            case "IN_TRANSIT":
                return "Out for Delivery";
            case "DELIVERED":
                return "Delivered";
            default:
                return status;
        }
    };

    const fetchTracking = async (id: string) => { 
        setLoading(true);
        setError("");
        setResult(null);

        try { 
            const res = await fetch(
                `http://localhost:8080/orders/track/${id}`
            );

            const data = await res.json();

            if (!res.ok) { 
                throw new Error(data.message || "Tracking number not found.");
            }

            setResult(data);
        } catch (err: any) { 
            setError(err.message || "Unknown error");
        } finally { 
            setLoading(false);
        }
    };

    useEffect(() => { 
        if (orderId) { 
            setTrackingNumber(orderId);
            fetchTracking(orderId);
        }
    }, [orderId]);

    const handleSubmit = async (e: React.FormEvent) => { 
        e.preventDefault();

        if (!trackingNumber.trim()) { 
            setError("Please enter a tracking number");
            return;
        }

        await fetchTracking(trackingNumber);
    };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container tracking-container">

        <h1 className="dashboard-title">Track Your Delivery</h1>

        <p className="dashboard-subtitle">
          Enter your tracking number to check your delivery status
        </p>

        <form onSubmit={handleSubmit} className="tracking-form">
          <input
            type="text"
            placeholder="Tracking number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="tracking-input"
          />

          <button
            type="submit"
            className="dashboard-danger-button"
          >
            Track
          </button>
        </form>

        {loading && (
          <div className="tracking-loading">
            Checking status...
          </div>
        )}

        {error && (
          <div className="tracking-error">
            {error}
          </div>
        )}

        {result && (
          <div className="tracking-result-card">
            <h2>Status: {formatStatus(result.status)}</h2>

            <p>
              <strong>Order ID:</strong> {result.orderID}
            </p>

            {result.droneID && (
              <p>
                <strong>Drone Assigned:</strong> #{result.droneID}
              </p>
            )}
          </div>
        )}

        <div className="auth-link-row" style={{ marginTop: "30px" }}>
          Want to go back? <Link to="/">Back to Home</Link>
        </div>

      </div>
    </div>
  );
}