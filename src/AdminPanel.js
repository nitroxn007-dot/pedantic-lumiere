import React, { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { db, ts } from "./firebase";

const STATUS = [
  { key: "preparation", label: "En préparation" },
  { key: "pickup", label: "Prise en charge" },
  { key: "in_transit", label: "En transit" },
  { key: "delivered", label: "Livré" },
];

export default function AdminPanel() {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [newOrder, setNewOrder] = useState({
    name: "",
    email: "",
    address: "",
    lat: 45.5,
    lng: -73.5,
  });

  // 🔹 Lire les commandes
  useEffect(() => {
    const q = collection(db, "orders");
    const unsub = onSnapshot(q, (snapshot) => {
      const arr = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(arr);
      if (!selectedOrderId && arr[0]) setSelectedOrderId(arr[0].id);
    });
    return () => unsub();
  }, []);

  // 🔹 Créer commande
  const createOrder = async () => {
    const docRef = await addDoc(collection(db, "orders"), {
      ...newOrder,
      status: "preparation",
      progressPct: 10,
      coords: { lat: newOrder.lat, lng: newOrder.lng },
      photos: [],
      history: [{ time: new Date().toISOString(), text: "Commande créée" }],
      public: true,
    });
    alert(
      `Commande créée ! Lien client: ${window.location.origin}/suivi/${docRef.id}`
    );
    setNewOrder({ name: "", email: "", address: "", lat: 45.5, lng: -73.5 });
  };

  // 🔹 Modifier statut/progress
  const updateStatus = async (orderId, newStatus, pct = null) => {
    const ref = doc(db, "orders", orderId);
    const updates = {
      status: newStatus,
      history: arrayUnion({ time: new Date().toISOString(), text: newStatus }),
    };
    if (pct !== null) updates.progressPct = pct;
    await updateDoc(ref, updates);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Panel</h1>

      <h2>Créer commande</h2>
      <input
        placeholder="Nom"
        value={newOrder.name}
        onChange={(e) => setNewOrder({ ...newOrder, name: e.target.value })}
      />
      <input
        placeholder="Email"
        value={newOrder.email}
        onChange={(e) => setNewOrder({ ...newOrder, email: e.target.value })}
      />
      <input
        placeholder="Adresse"
        value={newOrder.address}
        onChange={(e) => setNewOrder({ ...newOrder, address: e.target.value })}
      />
      <input
        type="number"
        placeholder="Lat"
        value={newOrder.lat}
        onChange={(e) =>
          setNewOrder({ ...newOrder, lat: parseFloat(e.target.value) })
        }
      />
      <input
        type="number"
        placeholder="Lng"
        value={newOrder.lng}
        onChange={(e) =>
          setNewOrder({ ...newOrder, lng: parseFloat(e.target.value) })
        }
      />
      <button onClick={createOrder}>Créer commande</button>

      <h2>Commandes existantes</h2>
      <ul>
        {orders.map((o) => (
          <li key={o.id}>
            <button onClick={() => setSelectedOrderId(o.id)}>
              {o.name} ({o.status})
            </button>
          </li>
        ))}
      </ul>

      {selectedOrderId && (
        <div style={{ marginTop: 20 }}>
          <h3>Modifier commande</h3>
          {orders
            .filter((o) => o.id === selectedOrderId)
            .map((order) => (
              <div key={order.id}>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                >
                  {STATUS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={order.progressPct}
                  onChange={(e) =>
                    updateStatus(
                      order.id,
                      order.status,
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
