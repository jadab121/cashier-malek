"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";

const INITIAL_ITEMS = [
  { name: "Espresso", price: "", image: "" },
  { name: "Cappuccino", price: "", image: "" },
  { name: "Nescaffe", price: "", image: "" },
  { name: "Tea", price: "", image: "" },
  { name: "Soft Drinks", price: "", image: "" },
  { name: "Meza", price: "", image: "" },
  { name: "Ice Tea", price: "", image: "" },
  { name: "Water", price: "", image: "" },
  { name: "Biliardo 3", price: "", image: "" },
  { name: "Biliardo 5", price: "", image: "" },
  { name: "Lahmi", price: "", image: "" },
  { name: "Kafta", price: "", image: "" },
  { name: "Tawook", price: "", image: "" },
];

export default function CashierSystem() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [total, setTotal] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);

  useEffect(() => {
    const storedItems = localStorage.getItem("cashierItems");
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cashierItems", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const totalValue = items.reduce((acc, item) => acc + parseFloat(item.price || 0), 0);
    setTotal(totalValue);
  }, [items]);

  const handlePriceChange = (index, value) => {
    const updated = [...items];
    updated[index].price = value;
    setItems(updated);
  };

  const handleImageChange = (index, url) => {
    const updated = [...items];
    updated[index].image = url;
    setItems(updated);
  };

  const submitSale = async () => {
    if (total <= 0) return alert("Total must be greater than 0");

    await addDoc(collection(db, "sales"), {
      amount: total,
      timestamp: Timestamp.now(),
    });

    alert("Sale submitted!");
    setItems(INITIAL_ITEMS);
  };

  const loadRevenue = async () => {
    const snapshot = await getDocs(collection(db, "sales"));
    const now = new Date();

    let todayTotal = 0;
    let monthTotal = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const ts = data.timestamp.toDate();

      if (ts.getDate() === now.getDate() &&
          ts.getMonth() === now.getMonth() &&
          ts.getFullYear() === now.getFullYear()) {
        todayTotal += data.amount;
      }

      if (ts.getMonth() === now.getMonth() &&
          ts.getFullYear() === now.getFullYear()) {
        monthTotal += data.amount;
      }
    });

    setTodayRevenue(todayTotal);
    setMonthRevenue(monthTotal);
  };

  useEffect(() => {
    loadRevenue();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">Cashier System</h1>

      <div className="bg-gray-100 p-4 rounded-xl shadow-md text-center space-y-2">
        <div className="text-lg font-medium">📅 Today's Revenue: ${todayRevenue.toFixed(2)}</div>
        <div className="text-lg font-medium">📆 This Month: ${monthRevenue.toFixed(2)}</div>
        <Button variant="outline" onClick={loadRevenue}>Refresh</Button>
      </div>

      {items.map((item, index) => (
        <Card key={index} className="p-4">
          <CardContent className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
            <div className="space-y-1">
              <Label className="font-medium">{item.name}</Label>
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={100}
                  height={100}
                  className="rounded-xl"
                />
              )}
            </div>
            <Input
              type="number"
              placeholder="Enter price"
              value={item.price}
              onChange={(e) => handlePriceChange(index, e.target.value)}
              className="w-full"
            />
            <Input
              type="text"
              placeholder="Image URL"
              value={item.image}
              onChange={(e) => handleImageChange(index, e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>
      ))}

      <div className="space-y-2">
        <div className="text-xl font-semibold text-center">Total: ${total.toFixed(2)}</div>
        <Button className="w-full" onClick={submitSale}>Submit Sale</Button>
      </div>
    </div>
  );
}
