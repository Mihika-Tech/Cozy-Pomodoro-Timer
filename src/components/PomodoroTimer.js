import React, { useState, useEffect } from 'react';
import { Sun, Moon, Play, Pause, RotateCcw } from 'lucide-react';
import './PomodoroTimer.css';

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' or 'break'
  const [completedSessions, setCompletedSessions] = useState(0);
  const [plantStage, setPlantStage] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Timer logic
  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
        
        // Update plant growth every 30 seconds during work sessions
        if (mode === 'work' && timeLeft % 30 === 0) {
          setPlantStage(prev => {
            const maxStage = mode === 'work' ? 10 : prev;
            return prev < maxStage ? prev + 0.2 : prev;
          });
        }
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer completed
      if (mode === 'work') {
        // Work session completed
        setCompletedSessions(prev => prev + 1);
        setMode('break');
        setTimeLeft(5 * 60); // 5 minute break
        
        // Play sound notification
        playNotificationSound();
      } else {
        // Break completed
        setMode('work');
        setTimeLeft(25 * 60);
        
        // Play sound notification
        playNotificationSound();
      }
    }
    
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, mode]);
  
  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.5;
      audio.play();
    } catch (error) {
      console.log('Sound notification failed to play');
    }
  }
  
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };
  
  const resetAll = () => {
    setIsRunning(false);
    setMode('work');
    setTimeLeft(25 * 60);
    setCompletedSessions(0);
    setPlantStage(0);
  };
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get progress percentage for circular timer
  const progressPercent = mode === 'work' 
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;
  
  // SVG path for progress circle
  const getCirclePath = (percent) => {
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    return offset;
  };

  // Generate dynamic classes based on theme
  const containerClass = `pomodoro-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`;
  const timerCardClass = `timer-card ${isDarkMode ? 'dark-card' : 'light-card'}`;
  const headingClass = `heading ${isDarkMode ? 'dark-heading' : 'light-heading'}`;
  const themeButtonClass = `theme-button ${isDarkMode ? 'dark-theme-button' : 'light-theme-button'}`;
  const playButtonClass = `play-button ${isDarkMode ? 'dark-play-button' : 'light-play-button'}`;
  const resetButtonClass = `reset-button ${isDarkMode ? 'dark-reset-button' : 'light-reset-button'}`;
  const statsContainerClass = `stats-container ${isDarkMode ? 'dark-stats' : 'light-stats'}`;
  const resetAllButtonClass = `reset-all-button ${isDarkMode ? 'dark-reset-all' : 'light-reset-all'}`;
  
  return (
    <div className={containerClass}>
      <div className={timerCardClass}>
        <div className="header">
          <h1 className={headingClass}>Cozy Pomodoro</h1>
          <button 
            onClick={toggleTheme} 
            className={themeButtonClass}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        
        {/* Timer Display */}
        <div className="timer-display">
          <div className="timer-circle">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle 
                cx="100" 
                cy="100" 
                r="90" 
                fill="none" 
                stroke={isDarkMode ? "#4B5563" : "#F3C677"} 
                strokeWidth="12"
              />
              
              {/* Progress circle */}
              <circle 
                cx="100" 
                cy="100" 
                r="90" 
                fill="none" 
                stroke={mode === 'work' ? (isDarkMode ? "#D97706" : "#B45309") : (isDarkMode ? "#10B981" : "#047857")} 
                strokeWidth="12" 
                strokeDasharray={2 * Math.PI * 90} 
                strokeDashoffset={getCirclePath(progressPercent)} 
                transform="rotate(-90 100 100)" 
                strokeLinecap="round"
              />
              
              {/* Timer text */}
              <text 
                x="100" 
                y="105" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                fontSize="32" 
                fontWeight="bold" 
                fill={isDarkMode ? "#F3F4F6" : "#1F2937"}
              >
                {formatTime(timeLeft)}
              </text>
              
              {/* Mode text */}
              <text 
                x="100" 
                y="135" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                fontSize="14" 
                fill={isDarkMode ? "#9CA3AF" : "#4B5563"}
              >
                {mode === 'work' ? 'Focus Time' : 'Break Time'}
              </text>
            </svg>
          </div>
        </div>
        
        {/* Plant growth visualization */}
        <div className="plant-container">
          <div className="plant">
            {/* Pot */}
            <div className="pot-bottom"></div>
            <div className="pot-top"></div>
            
            {/* Plant stem */}
            <div 
              className="plant-stem"
              style={{ 
                height: `${Math.min(80, plantStage * 8)}px`,
                opacity: plantStage > 0 ? 1 : 0
              }}
            ></div>
            
            {/* Plant leaves - appear with growth */}
            {plantStage >= 2 && (
              <div className="leaf leaf-1">
                <div className="leaf-shape"></div>
              </div>
            )}
            
            {plantStage >= 4 && (
              <div className="leaf leaf-2">
                <div className="leaf-shape"></div>
              </div>
            )}
            
            {plantStage >= 6 && (
              <div className="leaf leaf-3">
                <div className="leaf-shape"></div>
              </div>
            )}
            
            {plantStage >= 8 && (
              <div className="leaf leaf-4">
                <div className="leaf-shape"></div>
              </div>
            )}
            
            {/* Flower appears when fully grown */}
            {plantStage >= 10 && (
              <div className="flower">
                <div className="flower-shape">
                  <div className="flower-center"></div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Controls */}
        <div className="controls">
          <button 
            onClick={toggleTimer} 
            className={playButtonClass}
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button 
            onClick={resetTimer} 
            className={resetButtonClass}
          >
            <RotateCcw size={24} />
          </button>
        </div>
        
        {/* Stats */}
        <div className={statsContainerClass}>
          <div className="stat">
            <p className="stat-label">Sessions Completed</p>
            <p className="stat-value">{completedSessions}</p>
          </div>
          
          <div className="stat">
            <p className="stat-label">Plant Growth</p>
            <p className="stat-value">{Math.floor(plantStage * 10)}%</p>
          </div>
          
          <button 
            onClick={resetAll} 
            className={resetAllButtonClass}
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;