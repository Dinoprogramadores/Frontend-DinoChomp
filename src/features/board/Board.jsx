// src/components/Board.jsx
import React, { Component } from "react";
import { connectSocket, sendMove, stopGame, disconnectSocket } from "../services/Socket";

export default class Board extends Component {
    constructor(props) {
        super(props);
        this.state = { players: [], gameStarted: false };
    }

    componentDidMount() {
        const { gameId } = this.props;

        connectSocket(
            gameId,
            (players) => this.setState({ players }),
            () => this.setState({ gameStarted: true })
        );
    }

    componentWillUnmount() {
        disconnectSocket();
    }

    handleMove = (dir) => {
        sendMove(this.props.gameId, this.props.playerId, dir);
    };

    handleStopGame = () => {
        stopGame(this.props.gameId);
    };

    render() {
        const { players, gameStarted } = this.state;

        if (!gameStarted) return <div>Esperando a que el juego comience...</div>;

        return (
            <div>
                <h2>Board del juego {this.props.gameId}</h2>

                <div>
                    <button onClick={() => this.handleMove("UP")}>UP</button>
                    <button onClick={() => this.handleMove("DOWN")}>DOWN</button>
                    <button onClick={() => this.handleMove("LEFT")}>LEFT</button>
                    <button onClick={() => this.handleMove("RIGHT")}>RIGHT</button>
                </div>

                <button onClick={this.handleStopGame}>Stop Game</button>

                <h3>Jugadores:</h3>
                <ul>
                    {players.map((p) => (
                        <li key={p.id}>
                            {p.name} - HP: {p.health} - {p.isAlive ? "Vivo" : "Muerto"}
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}
