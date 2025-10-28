import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./features/home/Home.jsx";

import './styles/App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
      </Routes>
    </Router>
  );
}

export default App
