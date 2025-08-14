# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TimeFlow is a single-file web application (`modern-timer-stopwatch.html`) that provides three time-tracking modes:
- Timer (countdown)
- Stopwatch (count up)
- Pomodoro (work/break intervals)

## Architecture

The application is built as a standalone HTML file with:
- Inline CSS for styling (glassmorphic design with animated particles)
- Vanilla JavaScript for functionality
- No external dependencies or build process
- LocalStorage for persisting Pomodoro settings

## Development Commands

Since this is a single HTML file, there are no build, test, or lint commands. To develop:
- Open `modern-timer-stopwatch.html` directly in a web browser
- Make changes and refresh the browser to see updates

## Key Components

### Modes
- **Timer Mode**: Countdown timer with hour/minute/second inputs
- **Stopwatch Mode**: Count-up timer with lap functionality
- **Pomodoro Mode**: Work/break interval timer with customizable durations

### Core Functions
- `switchMode()`: Handles mode transitions
- `start()`, `pause()`, `reset()`: Control timer state
- `handlePomodoroComplete()`: Manages Pomodoro phase transitions
- `createParticles()`: Creates animated background effects

### Keyboard Shortcuts
- Space: Start/Pause
- R: Reset
- L: Lap (stopwatch mode only)