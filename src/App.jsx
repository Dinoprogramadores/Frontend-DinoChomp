import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./features/home/Home.jsx";
import Board from "./features/board/Board.jsx";

import './styles/App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/board" element={<Board />} />

      </Routes>
    </Router>
  );
}

export default App
