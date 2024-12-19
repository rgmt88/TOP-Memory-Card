import { useEffect, useState } from 'react';
import './App.css'

const API_KEY = '6oGd8Mk6XCVyBDBkVW2lo39NQjSHx93M';

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length -1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[rand]] = [arr[rand], arr[i]];
  }
  return arr;
};

function App() {

  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [selectedGifs, setSelectedGifs] = useState([]);
  const [shuffledGifs, setShuffledGifs] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [loading, setLoading] = useState(true);

  const resetGame = (gifArray) => {
    setScore(0);
    setSelectedGifs([]);
    setIsGameOver(false);
    // If we got a fresh gifArray from fetch, use that. Otherwise, just reshuffle. 
    setShuffledGifs(shuffleArray(gifArray || shuffledGifs));
  };

  useEffect(() => {
    const storedBest = localStorage.getItem('capybara_best_score');
    if (storedBest) {
      setBestScore(Number(storedBest));
    };

    // Fetch GIFs from GIPHY
    // We request 16 results directly
    const fetchGifs = async () => {
      try {
        const res = await fetch(
          `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=capybara&limit=16&rating=g`
        );
        const data = await res.json();

        // Map the fetched GIFs to objects that contain both url and title
        const gifs = data.data.map(item => {
          const originalTitle = item.title || 'Capybara GIF';
          const processedTitle = originalTitle.split(' GIF ')[0];
          return {
            url: item.images.original.url,
            title: processedTitle
          };
        });

        // Once fetched, we shuffles them and reset the game with there new GIFs
        setShuffledGifs(shuffleArray(gifs));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching GIFs:', error);
        setLoading(false);
      }
    };

    fetchGifs();
  }, []);

  const handleSelection = (gifUrl) => {
    if (selectedGifs.includes(gifUrl)) {
      // Game Over
      const newBest = Math.max(bestScore, score);
      setBestScore(newBest);
      localStorage.setItem('capybara_best_score', newBest);
      setIsGameOver(true);
      return;
    }

    setScore((prev) => prev + 1);
    setSelectedGifs((prev) => [...prev, gifUrl]);
    setShuffledGifs(shuffleArray(shuffledGifs));
  };

  const handleModalClick = () => {
    resetGame();
  };

  if (loading) {
    return (
      <div className="app-container">
        <header>
          <h1>Capybara Memory Game</h1>
        </header>
        <p>Loading Capybara GIFs...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header>
        <h1>Capybara Memory Game</h1>
        <p>Click a unique capybara each time. If you repeat, game over.</p>
      </header>
      <div className="score-container">
        <div>Score: {score}</div>
        <div>Best Score: {bestScore}</div>
      </div>
      <main className="grid">
        {shuffledGifs.map((gif, index) => (
          <div
            className="grid-item"
            key={index}
            onClick={() => handleSelection(gif.url)}
          >
            <div className="grid-item-image">
              <img src={gif.url} alt={gif.title} />
            </div>
            <div className="grid-item-title">{gif.title}</div>
          </div>
        ))}
      </main>
      <footer>
        <p>Created by rgmt88</p>
      </footer>

      {isGameOver && (
        <div className="modal-overlay" onClick={handleModalClick}>
          <div className="modal-content">
            <h2>Game Over!</h2>
            <p>You scored {score} point(s).</p>
            <p>Click anywhere to play again.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App
