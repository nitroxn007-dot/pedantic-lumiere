import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

export default function ClientPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const docRef = doc(db, "orders", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setOrder({ id: docSnap.id, ...docSnap.data() });
    };
    fetchOrder();
  }, [id]);

  if (!order) return <div>Chargement...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Suivi de commande : {order.name}</h1>
      <p>Status : {order.status}</p>
      <p>Progression : {order.progressPct}%</p>

      <h3>Carte</h3>
      <MapContainer
        center={[order.coords.lat, order.coords.lng]}
        zoom={13}
        style={{ height: 300, width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[order.coords.lat, order.coords.lng]} />
      </MapContainer>

      <h3>Historique</h3>
      <ul>
        {order.history.map((h, i) => (
          <li key={i}>
            {h.time} - {h.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
