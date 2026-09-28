# Sudoku

A browser-based Sudoku game built with plain HTML, CSS and JavaScript. No frameworks or dependencies.

**Play it live:** https://vijayking048-ui.github.io/Suduko-Game/
## Features

- Random puzzle generation with exactly one solution each time
- Three difficulty levels: Easy, Medium and Hard
- Highlights the selected row, column and box, and matching numbers
- Marks numbers that break a Sudoku rule in red
- Hint button, timer and a win message
- Play with the mouse, number pad, or keyboard (digits, arrow keys, Backspace)
- Responsive layout that works on phones

## How it works

1. A full valid grid is created with a backtracking algorithm.
2. Numbers are removed one at a time. After each removal, a solver checks that the puzzle still has exactly one solution.
3. The board checks every move against row, column and box rules.

## Run locally

Download the files and open `index.html` in a browser.

## Tech

HTML5, CSS3 (grid layout), vanilla JavaScript (ES6)

## Ideas for future improvements

- Pencil-mark notes
- Undo button
- Saving best times
