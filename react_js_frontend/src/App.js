import React, { useState, useEffect } from 'react';
import './App.css';

// --- Constants and helpers ---
const BOARD_SIZE = 3;
const PLAYERS = ['X', 'O'];
const MODES = {
  LOCAL: 'Local 2-Player',
  AI: 'Single Player vs AI'
};

/**
 * Returns the index of the next AI move.
 * This AI plays randomly among available spots.
 * @param {Array} squares - Current board.
 * @param {string} aiMark - 'X' or 'O'
 * @return {number|null}
 */
function getRandomAIMove(squares) {
  const emptyIdxs = squares.map((sq, idx) => (sq ? null : idx)).filter(idx => idx !== null);
  if (emptyIdxs.length === 0) return null;
  const randIdx = Math.floor(Math.random() * emptyIdxs.length);
  return emptyIdxs[randIdx];
}

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

/**
 * Status: Turn, Win, or Draw (supports AI/human display)
 * winner: string ("X", "O", "AI", "You", etc.)
 * next: string or number (e.g., "AI", "You", 0, 1)
 */
function GameStatus({ winner, isDraw, next, historyLength }) {
  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (isDraw) {
    status = "It's a draw!";
  } else {
    if (typeof next === 'string') {
      status = `Turn: ${next}${historyLength === 0 ? ' (first move)' : ''}`;
    } else {
      status = `Turn: ${PLAYERS[next]}${historyLength === 0 ? ' (first move)' : ''}`;
    }
  }
  return <div className="ttt-status">{status}</div>;
}

/**
 * Minimalistic Tic Tac Toe React App with AI & game mode support.
 * Features: Interactive board, local two-player, single-player vs AI, game state display, restart, history.
 */

// PUBLIC_INTERFACE
function GameModeSelector({ mode, setMode, disabled }) {
  /** Mode switcher for human vs AI or local multiplayer */
  return (
    <div className="ttt-controls" style={{ marginBottom: 0 }}>
      <label htmlFor="game-mode-select" style={{ marginRight: 8, fontWeight: 500 }}>
        Game Mode:
      </label>
      <select
        id="game-mode-select"
        value={mode}
        onChange={e => setMode(e.target.value)}
        disabled={disabled}
        style={{
          fontSize: '1.02em',
          padding: '0.24em 1em',
          borderRadius: 5,
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          border: '1.5px solid var(--border-color)'
        }}
        aria-label="Select Game Mode"
      >
        <option value={MODES.LOCAL}>{MODES.LOCAL}</option>
        <option value={MODES.AI}>{MODES.AI}</option>
      </select>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  // State setup
  const [theme, setTheme] = useState('light');
  const [gameMode, setGameMode] = useState(MODES.LOCAL);
  const [history, setHistory] = useState([Array(BOARD_SIZE * BOARD_SIZE).fill(null)]);
  const [stepNumber, setStepNumber] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);
  // Used to avoid double-triggering AI with old state
  const [aiThinking, setAIThinking] = useState(false);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Current game state
  const squares = history[stepNumber];
  const winner = calculateWinner(squares);
  const isDraw = !winner && squares.every(val => val);

  // Who is the AI in AI mode? Always "O" (second player) for simplicity.
  const aiEnabled = gameMode === MODES.AI;
  const aiMark = 'O';
  const humanMark = 'X';

  // --- Move Handlers ---

  // PUBLIC_INTERFACE
  function handleSquareClick(idx) {
    if (squares[idx] || winner || (aiEnabled && !xIsNext)) return; // Don't override or click during AI turn

    const nextSquares = squares.slice();
    nextSquares[idx] = xIsNext ? 'X' : 'O';
    setHistory(history.slice(0, stepNumber + 1).concat([nextSquares]));
    setStepNumber(stepNumber + 1);
    setXIsNext(!xIsNext);
    setAIThinking(false);
  }

  // PUBLIC_INTERFACE
  function jumpTo(move) {
    setStepNumber(move);
    setXIsNext(move % 2 === 0);
    setAIThinking(false);
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    setHistory([Array(BOARD_SIZE * BOARD_SIZE).fill(null)]);
    setStepNumber(0);
    setXIsNext(true);
    setAIThinking(false);
  }

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // When mode changes, restart game
  useEffect(() => {
    handleRestart();
    // eslint-disable-next-line
  }, [gameMode]);

  // --- AI Effect: if it's AI's move, perform AI turn ---
  useEffect(() => {
    if (!aiEnabled || winner || isDraw) return;
    // AI is always 'O', and goes second
    if (!xIsNext) {
      setAIThinking(true);
      // Simulate a brief thinking delay: 500ms for realism
      const t = setTimeout(() => {
        const aiMove = getRandomAIMove(squares);
        if (aiMove !== null && !squares[aiMove] && !winner) {
          // Place AI move
          const nextSquares = squares.slice();
          nextSquares[aiMove] = aiMark;
          setHistory(history.slice(0, stepNumber + 1).concat([nextSquares]));
          setStepNumber(stepNumber + 1);
          setXIsNext(true);
          setAIThinking(false);
        }
      }, 450);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line
  }, [aiEnabled, xIsNext, squares, winner, stepNumber, isDraw]);


  // --- Adjusted Status Display for AI ---
  function getStatusProps() {
    if (winner) {
      if (aiEnabled && winner === aiMark) return { winner: 'AI' };
      if (aiEnabled && winner === humanMark) return { winner: 'You' };
      return { winner };
    }
    if (isDraw) return { isDraw };
    if (aiEnabled) {
      const next = xIsNext ? 'You' : 'AI';
      return { winner: null, isDraw: null, next, historyLength: stepNumber };
    }
    return { winner: null, isDraw: null, next: xIsNext ? 0 : 1, historyLength: stepNumber };
  }

  const statusProps = getStatusProps();

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
        <GameModeSelector mode={gameMode} setMode={setGameMode} disabled={stepNumber !== 0} />
        <div style={{ fontSize: '1.08rem', margin: '.35em 0', color: 'var(--text-secondary)', minHeight: 22 }}>
          Mode: {gameMode}
        </div>
        <GameStatus
          {...statusProps}
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
