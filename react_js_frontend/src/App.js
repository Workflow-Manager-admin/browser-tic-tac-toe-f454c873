import React, { useState, useEffect } from 'react';
import './App.css';

// --- Constants and helpers ---
const BOARD_SIZE = 3;
const PLAYERS = ['X', 'O'];

function calculateWinner(squares) {
  // Check for all win conditions (rows, columns, diagonals)
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],            // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8],            // cols
    [0, 4, 8], [2, 4, 6],                       // diags
  ];
  for (let [a, b, c] of lines) {
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return squares[a];
    }
  }
  return null;
}

// --- Components ---

// PUBLIC_INTERFACE
function Square({ value, onClick, isActive }) {
  /** Minimalistic board cell */
  return (
    <button
      className={`ttt-square${isActive ? ' active' : ''}`}
      onClick={onClick}
      aria-label={value ? `Square, marked ${value}` : 'Empty square'}
      disabled={!!value}
      tabIndex="0"
    >
      {value}
    </button>
  );
}

// PUBLIC_INTERFACE
function TicTacToeBoard({ squares, onSquareClick, gameOver }) {
  /** 3x3 Game Board Layout */
  return (
    <div className="ttt-board" role="grid">
      {squares.map((val, idx) => (
        <Square
          key={idx}
          value={val}
          onClick={() => !gameOver && onSquareClick(idx)}
          isActive={!val}
        />
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function MoveHistory({ history, jumpTo, current }) {
  /** Move History Display */
  return (
    <div className="ttt-history">
      <ul>
        {history.map((step, move) => (
          <li key={move}>
            <button
              className={`ttt-move-btn${move === current ? ' current' : ''}`}
              onClick={() => jumpTo(move)}
              aria-label={move === 0 ? "Go to game start" : `Go to move #${move}`}
            >
              {move === 0 ? "Restart position" : `Move #${move}`}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// PUBLIC_INTERFACE
function GameStatus({ winner, isDraw, next, historyLength }) {
  /** Status: Turn, Win, or Draw */
  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (isDraw) {
    status = "It's a draw!";
  } else {
    status = `Turn: ${PLAYERS[next]}${historyLength === 0 ? ' (first move)' : ''}`;
  }
  return <div className="ttt-status">{status}</div>;
}

// --- Main App ---
// PUBLIC_INTERFACE
function App() {
  /**
   * Minimalistic Tic Tac Toe React App.
   * Features: Interactive board, local two-player, game state display, restart, history.
   */

  // State setup
  const [theme, setTheme] = useState('light');
  const [history, setHistory] = useState([Array(BOARD_SIZE * BOARD_SIZE).fill(null)]);
  const [stepNumber, setStepNumber] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Current game state
  const squares = history[stepNumber];
  const winner = calculateWinner(squares);
  const isDraw = !winner && squares.every(val => val);

  // PUBLIC_INTERFACE
  function handleSquareClick(idx) {
    if (squares[idx] || winner) return; // Don't override
    const nextSquares = squares.slice();
    nextSquares[idx] = xIsNext ? 'X' : 'O';
    setHistory(history.slice(0, stepNumber + 1).concat([nextSquares]));
    setStepNumber(stepNumber + 1);
    setXIsNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function jumpTo(move) {
    setStepNumber(move);
    setXIsNext(move % 2 === 0);
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    setHistory([Array(BOARD_SIZE * BOARD_SIZE).fill(null)]);
    setStepNumber(0);
    setXIsNext(true);
  }

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="App">
      <header className="App-header" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <h1 className="ttt-title">Tic Tac Toe</h1>
        <GameStatus
          winner={winner}
          isDraw={isDraw}
          next={xIsNext ? 0 : 1}
          historyLength={stepNumber}
        />
        <TicTacToeBoard
          squares={squares}
          onSquareClick={handleSquareClick}
          gameOver={!!winner || isDraw}
        />
        <div className="ttt-controls">
          <button className="ttt-restart-btn" onClick={handleRestart}>
            Restart Game
          </button>
        </div>
        <MoveHistory
          history={history}
          jumpTo={jumpTo}
          current={stepNumber}
        />
      </header>
    </div>
  );
}

export default App;
