import React, { useState, useEffect } from 'react';

const SPAWN_INTERVALS = {
  bird: 1000,        // Spawn birds every 1 second
  parachute: 2000,   // Spawn parachutes every 2 seconds
  star: 1500,        // Spawn stars every 1.5 seconds
  cloud: 2500        // Spawn clouds every 2.5 seconds
};

// Number of entities to spawn each interval
const SPAWN_COUNTS = {
  bird: 2,          // Spawn 2 birds each interval
  parachute: 1,     // Spawn 1 parachute each interval
  star: 3,          // Spawn 3 stars each interval
  cloud: 2          // Spawn 2 clouds each interval
};

// Maximum number of entities (optional)
const MAX_ENTITIES = {
  bird: 20,
  parachute: 10,
  star: 30,
  cloud: 15
};

const Game = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [fuel, setFuel] = useState(10);
  const [time, setTime] = useState(0);
  const [starsCollected, setStarsCollected] = useState(0);
  const [aircraftPosition, setAircraftPosition] = useState({ x: 500, y: 350 });
  const [birds, setBirds] = useState([]);
  const [parachutes, setParachutes] = useState([]);
  const [stars, setStars] = useState([]);
  const [clouds, setClouds] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [ranking, setRanking] = useState([]);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New state for explosion
  const [explosion, setExplosion] = useState({ visible: false, x: 0, y: 0 });

  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setPaused(false);
    setGameOver(false);
    setFuel(10);  // Reset fuel when the game starts
    setTime(0);
    setStarsCollected(0);
    setAircraftPosition({ x: 500, y: 350 });
    setBirds([]);
    setParachutes([]);
    setStars([]);
    setClouds([]);
    setScoreSubmitted(false);
    setRanking([]);
    setPlayerName("");
    setExplosion({ visible: false, x: 0, y: 0 });
  };

  // Toggle pause
  const togglePause = () => {
    setPaused(prev => !prev);
  };

  // Move aircraft based on direction
  const moveAircraft = (direction) => {
    setAircraftPosition(prevPos => {
      const newPos = { ...prevPos };
      switch (direction) {
        case 'up':
          newPos.y = newPos.y > 0 ? newPos.y - 20 : newPos.y;
          break;
        case 'down':
          newPos.y = newPos.y < 718 ? newPos.y + 20 : newPos.y; // Adjusted for aircraft height
          break;
        case 'left':
          newPos.x = newPos.x > 0 ? newPos.x - 20 : newPos.x;
          break;
        case 'right':
          newPos.x = newPos.x < 974 ? newPos.x + 20 : newPos.x; // Adjusted for aircraft width
          break;
        default:
          break;
      }
      return newPos;
    });
  };

  // Handle key presses for movement and pause
  const handleKeyPress = (event) => {
    if (paused || !gameStarted || gameOver) return;
    switch (event.key) {
      case 'ArrowUp':
        moveAircraft('up');
        break;
      case 'ArrowDown':
        moveAircraft('down');
        break;
      case 'ArrowLeft':
        moveAircraft('left');
        break;
      case 'ArrowRight':
        moveAircraft('right');
        break;
      case ' ':
        togglePause();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameStarted, paused, gameOver]);

  // Main Game Loop: Fuel and Time
  useEffect(() => {
    if (gameStarted && !paused && !gameOver) {
      const fuelInterval = setInterval(() => {
        setFuel(prevFuel => {
          if (prevFuel <= 1) {
            endGame();
            return 0;
          }
          return prevFuel - 1;
        });
      }, 1000);

      const timeInterval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);

      return () => {
        clearInterval(fuelInterval);
        clearInterval(timeInterval);
      };
    }
  }, [gameStarted, paused, gameOver]);

  // Spawn Birds
  useEffect(() => {
    if (gameStarted && !paused && !gameOver) {
      spawnBird(); // Initial spawn
      const birdInterval = setInterval(spawnBird, SPAWN_INTERVALS.bird);
      return () => clearInterval(birdInterval);
    }
  }, [gameStarted, paused, gameOver]);

  // Spawn Parachutes
  useEffect(() => {
    if (gameStarted && !paused && !gameOver) {
      spawnParachute(); // Initial spawn
      const parachuteInterval = setInterval(spawnParachute, SPAWN_INTERVALS.parachute);
      return () => clearInterval(parachuteInterval);
    }
  }, [gameStarted, paused, gameOver]);

  // Spawn Stars
  useEffect(() => {
    if (gameStarted && !paused && !gameOver) {
      spawnStar(); // Initial spawn
      const starInterval = setInterval(spawnStar, SPAWN_INTERVALS.star);
      return () => clearInterval(starInterval);
    }
  }, [gameStarted, paused, gameOver]);

  // Spawn Clouds
  useEffect(() => {
    if (gameStarted && !paused && !gameOver) {
      spawnCloud(); // Initial spawn
      const cloudInterval = setInterval(spawnCloud, SPAWN_INTERVALS.cloud);
      return () => clearInterval(cloudInterval);
    }
  }, [gameStarted, paused, gameOver]);

  // Move Entities
  useEffect(() => {
    const movementInterval = setInterval(() => {
      if (paused || !gameStarted || gameOver) return;

      // Move Clouds and remove if out of bounds
      setClouds(prevClouds => prevClouds
        .map(cloud => ({ ...cloud, x: cloud.x - 2 })) // Move clouds left
        .filter(cloud => cloud.x + cloud.width > 0) // Adjusted condition
      );

      // Move Birds and remove if out of bounds
      setBirds(prevBirds => prevBirds
        .map(bird => ({ ...bird, x: bird.x - 4 })) // Move birds left
        .filter(bird => bird.x + bird.width > 0) // Adjusted condition
      );

      // Move Parachutes and remove if out of bounds
      setParachutes(prevParachutes => prevParachutes
        .map(p => ({ ...p, y: p.y + 2 })) // Move parachutes down
        .filter(p => p.y < 768) // Remove parachutes that have left the screen
      );

      // Move Stars and remove if out of bounds
      setStars(prevStars => prevStars
        .map(star => ({ ...star, y: star.y + 2 })) // Move stars down
        .filter(star => star.y < 768) // Remove stars that have left the screen
      );
    }, 100);

    return () => clearInterval(movementInterval);
  }, [paused, gameStarted, gameOver]);

  // Collision Detection
  useEffect(() => {
    // Check collision with Birds
    birds.forEach(bird => {
      if (checkCollision(aircraftPosition, bird)) {
        triggerExplosion(aircraftPosition);
        // Remove the bird after collision
        setBirds(prevBirds => prevBirds.filter(item => item.id !== bird.id));
      }
    });

    // Check collision with Parachutes
    parachutes.forEach(p => {
      if (checkCollision(aircraftPosition, p)) {
        setFuel(prevFuel => prevFuel + 10);
        setParachutes(prevParachutes => prevParachutes.filter(item => item.id !== p.id));
      }
    });

    // Check collision with Stars
    stars.forEach(star => {
      if (checkCollision(aircraftPosition, star)) {
        setStarsCollected(prevStars => prevStars + 1);
        setStars(prevStarsList => prevStarsList.filter(item => item.id !== star.id));
      }
    });
  }, [aircraftPosition, birds, parachutes, stars]);

  // Collision Detection Helper Function
  const checkCollision = (aircraft, entity) => {
    const aircraftRect = { x: aircraft.x, y: aircraft.y, width: 50, height: 50 };

    const entityWidth = entity.width || 50; // Default width
    const entityHeight = entity.height || 50; // Default height

    const entityRect = { x: entity.x, y: entity.y, width: entityWidth, height: entityHeight };

    return (
      entityRect.x < aircraftRect.x + aircraftRect.width &&
      entityRect.x + entityRect.width > aircraftRect.x &&
      entityRect.y < aircraftRect.y + aircraftRect.height &&
      entityRect.y + entityRect.height > aircraftRect.y
    );
  };

  // Trigger Explosion Function
  const triggerExplosion = (position) => {
    setExplosion({ visible: true, x: position.x, y: position.y });
    // Pause the game
    setPaused(true);
    // Play explosion sound here if you have one

    // After a short delay, end the game
    setTimeout(() => {
      setExplosion({ visible: false, x: 0, y: 0 });
      endGame();
    }, 1000); // Explosion lasts for 1 second
  };

  // End Game Function
  const endGame = () => {
    setGameOver(true);
    setGameStarted(false);
    setPaused(false);
  };

  // Spawn Functions
  const spawnBird = () => {
    if (!paused && gameStarted && !gameOver) {
      const newBirds = Array.from({ length: SPAWN_COUNTS.bird }, () => ({
        x: 1024, // Starting at the right edge
        y: Math.random() * (768 - 30), // Adjusted to prevent spawning outside game area
        width: 50, // Entity width
        height: 30, // Approximate height based on icon size
        id: Date.now() + Math.random()
      }));
      setBirds(prevBirds => {
        const combined = [...prevBirds, ...newBirds];
        return combined.length > MAX_ENTITIES.bird
          ? combined.slice(combined.length - MAX_ENTITIES.bird)
          : combined;
      });
    }
  };

  const spawnParachute = () => {
    if (!paused && gameStarted && !gameOver) {
      const newParachutes = Array.from({ length: SPAWN_COUNTS.parachute }, () => ({
        x: Math.random() * (1024 - 30), // Adjusted to prevent spawning outside game area
        y: 0,
        width: 30,
        height: 30,
        id: Date.now() + Math.random()
      }));
      setParachutes(prevParachutes => {
        const combined = [...prevParachutes, ...newParachutes];
        return combined.length > MAX_ENTITIES.parachute
          ? combined.slice(combined.length - MAX_ENTITIES.parachute)
          : combined;
      });
    }
  };

  const spawnStar = () => {
    if (!paused && gameStarted && !gameOver) {
      const newStars = Array.from({ length: SPAWN_COUNTS.star }, () => ({
        x: Math.random() * (1024 - 30), // Adjusted to prevent spawning outside game area
        y: 0,
        width: 30,
        height: 30,
        id: Date.now() + Math.random()
      }));
      setStars(prevStars => {
        const combined = [...prevStars, ...newStars];
        return combined.length > MAX_ENTITIES.star
          ? combined.slice(combined.length - MAX_ENTITIES.star)
          : combined;
      });
    }
  };

  const spawnCloud = () => {
    if (!paused && gameStarted && !gameOver) {
      const newClouds = Array.from({ length: SPAWN_COUNTS.cloud }, () => ({
        x: 1024, // Starting at the right edge
        y: Math.random() * (500 - 30), // Adjusted to prevent spawning outside game area
        width: 50,
        height: 30,
        id: Date.now() + Math.random()
      }));
      setClouds(prevClouds => {
        const combined = [...prevClouds, ...newClouds];
        return combined.length > MAX_ENTITIES.cloud
          ? combined.slice(combined.length - MAX_ENTITIES.cloud)
          : combined;
      });
    }
  };

  // Sort Ranking Data Function
  const sortRankingData = (data) => {
    const dataCopy = [...data];

    dataCopy.sort((a, b) => {
      const starsA = parseInt(a.stars, 10);
      const starsB = parseInt(b.stars, 10);

      if (starsB !== starsA) {
        return starsB - starsA; // descending order
      }

      const timeA = parseInt(a.time, 10);
      const timeB = parseInt(b.time, 10);

      if (timeB !== timeA) {
        return timeB - timeA; // descending order
      }

      return 0;
    });

    // Assign positions, handling ties
    let displayPosition = 1;
    for (let i = 0; i < dataCopy.length; i++) {
      if (i > 0) {
        const prev = dataCopy[i - 1];
        const curr = dataCopy[i];

        if (
          parseInt(curr.stars, 10) === parseInt(prev.stars, 10) &&
          parseInt(curr.time, 10) === parseInt(prev.time, 10)
        ) {
          curr.position = prev.position;
        } else {
          curr.position = displayPosition;
        }
      } else {
        dataCopy[i].position = displayPosition;
      }

      displayPosition++;
    }

    return dataCopy;
  };

  // Submit Score Function
  const submitScore = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new URLSearchParams();
    formData.append('name', playerName);
    formData.append('time', time);
    formData.append('stars', starsCollected);

    fetch('http://xxxxxxxxx/register.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })
      .then(response => response.json())
      .then(data => {
        const sortedData = sortRankingData(data);
        setRanking(sortedData);
        setScoreSubmitted(true);
        setIsSubmitting(false);
      })
      .catch(error => {
        console.error('Error submitting score:', error);
        alert('An error occurred while submitting your score. Please try again.');
        setIsSubmitting(false);
      });
  };

  return (
    <div className="game-container">
      {!gameStarted && !gameOver && (
        <button onClick={startGame} className="start-button">Start Game</button>
      )}

      {gameStarted && !gameOver && (
        <div className="game-area">
          <div className="hud">
            <div>Time: {time}s</div>
            <div>Fuel: {fuel}</div>
            <div>Stars: {starsCollected}</div>
            <button onClick={togglePause}>{paused ? "Resume" : "Pause"}</button>
          </div>
          <div className="aircraft" style={{
            left: aircraftPosition.x + 'px',
            top: aircraftPosition.y + 'px',
            animation: 'fly 1.5s ease-in-out infinite' // Animation to simulate flying
          }}>✈️</div>

          {/* Render Clouds */}
          {clouds.map(cloud => (
            <div key={cloud.id} className="cloud" style={{ left: cloud.x + 'px', top: cloud.y + 'px' }}>☁️</div>
          ))}

          {/* Render Birds */}
          {birds.map(bird => (
            <div key={bird.id} className="bird" style={{ left: bird.x + 'px', top: bird.y + 'px' }}>🦅</div>
          ))}

          {/* Render Parachutes */}
          {parachutes.map(p => (
            <div key={p.id} className="parachute" style={{ left: p.x + 'px', top: p.y + 'px' }}>🎁</div>
          ))}

          {/* Render Stars */}
          {stars.map(star => (
            <div key={star.id} className="star" style={{ left: star.x + 'px', top: star.y + 'px' }}>⭐</div>
          ))}

          {/* Render Explosion */}
          {explosion.visible && (
            <div className="explosion" style={{ left: explosion.x + 'px', top: explosion.y + 'px' }}>
              💥
            </div>
          )}
        </div>
      )}

      {gameOver && !scoreSubmitted && (
        <div className="game-over-screen">
          <h1>Game Over</h1>
          <p>Your Time: {time}s</p>
          <p>Stars Collected: {starsCollected}</p>
          <form onSubmit={submitScore}>
            <label>
              Enter Your Name:
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
              />
            </label>
            <button type="submit" disabled={!playerName || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Continue"}
            </button>
          </form>
        </div>
      )}

      {gameOver && scoreSubmitted && (
        <div className="ranking-screen">
          <h1>Leaderboard</h1>
          <table className="ranking-table">
            <thead>
              <tr>
                <th>Position</th>
                <th>Name</th>
                <th>Stars Collected</th>
                <th>Time (s)</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((player) => (
                <tr key={player.id}>
                  <td>{player.position}</td>
                  <td>{player.name}</td>
                  <td>{player.stars}</td>
                  <td>{player.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={startGame} className="start-button">Start Game</button>
        </div>
      )}
    </div>
  );
};

export default Game;
