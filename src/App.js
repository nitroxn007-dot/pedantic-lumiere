import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";

// Petit utilitaire pour générer un id
const uid = () => Math.random().toString(36).slice(2, 9);

// Statuts possibles et pourcentage associé
const STATUS = [
  { key: "preparation", label: "En préparation", pct: 10 },
  { key: "left_warehouse", label: "A quitté le dépôt", pct: 35 },
  { key: "in_transit", label: "En transit", pct: 65 },
  { key: "delivered", label: "Livré", pct: 100 },
];

const deleteOrder = (orderId) => {
  if (window.confirm("Voulez-vous vraiment supprimer cette commande ?")) {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    // Si l'ordre supprimé était sélectionné, on sélectionne le premier disponible
    if (selectedOrderId === orderId && orders.length > 1) {
      setSelectedOrderId(orders[0].id);
    } else if (orders.length <= 1) {
      setSelectedOrderId(null);
    }
  }
};

<button
  style={{
    background: "#0080ff",
    color: "#0080ff",
    border: "none",
  }}
  onClick={() => deleteOrder(order.id)}
>
  Supprimer la commande
</button>;

// Commande de démonstration
const demoOrders = [
  {
    id: "61716",
    name: "Yassine Ziadi",
    address: "Canada, Saint Hubert, 7431 boulevard cousineau",
    tracking: "GV25CAAU039922084",
    status: "in_transit",
    progressPct: 65,
    photos: [],
    history: [
      { time: "2025-10-15 09:00", text: "Commande reçue" },
      { time: "2025-10-16 12:00", text: "Préparée" },
      { time: "2025-10-16 17:02", text: "Expédiée" },
    ],
  },
];

export default function App() {
  const [orders, setOrders] = useState(() => {
    const raw = localStorage.getItem("suivi_orders_v2");
    if (raw) return JSON.parse(raw);
    localStorage.setItem("suivi_orders_v2", JSON.stringify(demoOrders));
    return demoOrders;
  });

  useEffect(() => {
    localStorage.setItem("suivi_orders_v2", JSON.stringify(orders));
  }, [orders]);

  return (
    <Router>
      <Routes>
        <Route
          path="/admin"
          element={<AdminPage orders={orders} setOrders={setOrders} />}
        />
        <Route
          path="/client/:orderId"
          element={<ClientPage orders={orders} />}
        />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

function Home() {
  return (
    <div
      style={{
        padding: 40,
        textAlign: "center",
        fontFamily: "'Inter', sans-serif",
        background: "#f7f9fc",
        minHeight: "100vh",
      }}
    >
      <h1>Prototype Suivi d'expédition</h1>
      <p>
        <Link to="/admin">Accéder à l' </Link>
      </p>
    </div>
  );
}

function AdminPage({ orders, setOrders }) {
  const [form, setForm] = useState({ name: "", address: "", tracking: "" });
  const navigate = useNavigate();

  const createOrder = () => {
    if (!form.name || !form.address || !form.tracking) return;
    const newOrder = {
      id: uid(),
      name: form.name,
      address: form.address,
      tracking: form.tracking,
      status: "preparation",
      progressPct: 10,
      photos: [],
      history: [{ time: new Date().toLocaleString(), text: "Commande créée" }],
    };
    setOrders([newOrder, ...orders]);
    setForm({ name: "", address: "", tracking: "" });
    alert(`Lien client : /client/${newOrder.id}`);
  };

  const updateStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: newStatus,
              progressPct: STATUS.find((s) => s.key === newStatus).pct,
              history: [
                ...o.history,
                {
                  time: new Date().toLocaleString(),
                  text: STATUS.find((s) => s.key === newStatus).label,
                },
              ],
            }
          : o
      )
    );
  };

  const addPhoto = (orderId, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, photos: [...o.photos, e.target.result] }
            : o
        )
      );
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      style={{
        padding: 40,
        textAlign: "center",
        fontFamily: "'Inter', sans-serif",
        background: "#f7f9fc",
        minHeight: "100vh",
      }}
    >
      <h1>Admin • Gestion des commandes</h1>

      <h3>Créer une commande</h3>
      <input
        placeholder="Nom"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        style={styles.input}
      />
      <input
        placeholder="Adresse"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
        style={styles.input}
      />
      <input
        placeholder="Numéro de tracking"
        value={form.tracking}
        onChange={(e) => setForm({ ...form, tracking: e.target.value })}
        style={styles.input}
      />
      <button style={styles.primaryBtn} onClick={createOrder}>
        Créer la commande
      </button>

      <h3 style={{ marginTop: 20 }}>Commandes existantes</h3>
      {orders.map((o) => (
        <div
          key={o.id}
          style={{
            border: "1px solid #ddd",
            padding: 10,
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <strong>{o.name}</strong> #{o.id} • {o.tracking}
          <div>
            <label>Modifier statut:</label>
            <select
              value={o.status}
              onChange={(e) => updateStatus(o.id, e.target.value)}
              style={styles.input}
            >
              {STATUS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Ajouter photo:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => addPhoto(o.id, e.target.files[0])}
            />
          </div>
          <div>
            <strong>Lien client:</strong>{" "}
            <Link to={`/client/${o.id}`}>/client/{o.id}</Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function ClientPage({ orders }) {
  const { orderId } = useParams();
  const order = orders.find((o) => o.id === orderId);

  if (!order) return <div style={{ padding: 20 }}>Commande introuvable</div>;

  return (
    <div
      style={{
        padding: 40,
        fontFamily: "'Inter', sans-serif",
        background: "#f7f9fc",
        minHeight: "100vh",
      }}
    >
      <h1>Suivi de commande</h1>
      <h2>
        {order.name} #{order.id}
      </h2>
      <div>Adresse: {order.address}</div>
      <div>Tracking: {order.tracking}</div>
      <div style={{ marginTop: 12 }}>
        <ProgressGauge
          pct={order.progressPct}
          label={STATUS.find((s) => s.key === order.status).label}
        />
      </div>
      <div style={{ marginTop: 12 }}>
        <h3>Photos</h3>
        {order.photos.length === 0 && <div>Aucune photo</div>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {order.photos.map((p, i) => (
            <img
              key={i}
              src={p}
              alt={`photo-${i}`}
              style={{
                width: 90,
                height: 90,
                objectFit: "cover",
                borderRadius: 8,
                border: "1px solid #ddd",
              }}
            />
          ))}
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <h3>Historique</h3>
        {order.history
          .slice()
          .reverse()
          .map((h, i) => (
            <div key={i}>
              <div>{h.text}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{h.time}</div>
            </div>
          ))}
      </div>
    </div>
  );
}

function ProgressGauge({ pct, label }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          border: "10px solid #2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontWeight: 700 }}>{pct}%</div>
      </div>
      <div>
        <div style={{ fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 12, color: "#666" }}>Progression estimée</div>
      </div>
    </div>
  );
}

const styles = {
  input: {
    width: "100%",
    padding: "8px 10px",
    marginTop: 6,
    border: "1px solid #ddd",
    borderRadius: 8,
  },
  primaryBtn: {
    marginTop: 8,
    padding: "8px 12px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
};
