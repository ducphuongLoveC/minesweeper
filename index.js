import Minesweeper from "./script.js";

const board = document.getElementById('board');
const mineCounter = document.getElementById('mine-counter');
const actionContainer = document.getElementById('action');

const difficultyLevels = {
    'beginner': {
        x: 9,
        y: 9,
        mines: 10
    },
    'intermediate': {
        x: 16,
        y: 16,
        mines: 40
    },
    'expert': {
        x: 30,
        y: 16,
        mines: 99
    },
    'level 4': {
        x: 50,
        y: 25,
        mines: 99
    }
    
};

function handleChooseLevel(level) {
    if (!difficultyLevels[level]) return;
    
    const { x, y } = difficultyLevels[level];
    console.log(x, y);
    
    const minesweeper = new Minesweeper(x, y, board, mineCounter);
    minesweeper.start();
}

function createActionButtons() {
    Object.keys(difficultyLevels).forEach((level) => {
        const btn = document.createElement('button');
        btn.style.margin = '0 5px';
        btn.textContent = level.charAt(0).toUpperCase() + level.slice(1);
        btn.addEventListener('click', () => handleChooseLevel(level));
        actionContainer.appendChild(btn);
    });
}

// Chờ DOM load xong mới thực thi
document.addEventListener('DOMContentLoaded', () => {
    createActionButtons();
    // Có thể chọn mức độ mặc định ở đây nếu muốn
    handleChooseLevel('beginner');
});