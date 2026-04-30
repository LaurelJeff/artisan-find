import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./features/Home";
import Bookings from "./features/Bookings";
import Messages from "./features/Messages"

export default function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/bookings" element={<Bookings/>} />
          <Route path="/messages" element={<Messages />} />
        </Routes>
      </main>
    </Router>
  );
}
