import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./features/home/Home.jsx";
import Board from "./features/board/Board.jsx";
import SelectGame from "./features/manage/SelectGame.jsx";
import CreateGame from "./features/manage/CreateGame.jsx";
import SelectDino from "./features/manage/SelectDino.jsx";
import Lobby from "./features/lobby/Lobby.jsx";

import './styles/App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/select-game" element={<SelectGame />} />
        <Route path="/create-game" element={<CreateGame />} />
        <Route path="/select-dino" element={<SelectDino />} />
        <Route path="/game-board" element={<Board />} />
        <Route path="/lobby" element={<Lobby />} />
      </Routes>
    </Router>
  );
}

export default App
