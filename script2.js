


class Minesweeper {
    constructor(ratioX, ratioY, board, mineCounter, isInteractive) {
        this.ratioX = ratioX;
        this.ratioY = ratioY;
        this.board = board;
        this.mineCounter = mineCounter;
        this.isMines = [];
        this.openedCells = 0;
        this.gameOver = false;
        this.flags = new Set();
        this.isInteractive = isInteractive;
    }


    getTotalCells() {
        return this.ratioX * this.ratioY;
    }

    DrawBoard() {
        const totalCells = this.getTotalCells();
        let html = `<div style="display: grid; grid-template-columns: repeat(${this.ratioX}, 30px); grid-template-rows: repeat(${this.ratioY}, 30px); gap: 0; line-height: 0;">`;
        for (let i = 0; i < totalCells; i++) {
            html += `<div class="block-btn closed" id="data-${i}" data-count="0"></div>`;
        }
        html += '</div>';
        this.board.innerHTML = html;

        for (let i = 0; i < totalCells; i++) {
            const cell = document.getElementById(`data-${i}`);
            cell.addEventListener('click', () => this.openCell(i));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.toggleFlag(i);
            });
        }
        this.updateMineCounter();
    }

    totalMines() {
        const totalCells = this.getTotalCells();
        let mineRatio = totalCells < 100 ? 0.12 : totalCells <= 300 ? 0.15 : 0.20;
        let mineCount = Math.floor(totalCells * mineRatio);
        mineCount = Math.max(1, mineCount);
        mineCount = Math.min(mineCount, Math.floor(totalCells * 0.25));
        return mineCount;
    }

    getIndexAround(currentIndex) {
        const col = currentIndex % this.ratioX; // Tính cột dựa trên ratioX
        const row = Math.floor(currentIndex / this.ratioX); // Tính hàng dựa trên ratioX
        const result = [];

        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const newRow = row + dy;
                const newCol = col + dx;
                if (newRow >= 0 && newRow < this.ratioY && newCol >= 0 && newCol < this.ratioX) {
                    const neighborIndex = newRow * this.ratioX + newCol;
                    result.push(neighborIndex);
                }
            }
        }
        return result;
    }

    setupMines() {
        const totalMines = this.totalMines();
        const mapForMark = Array(this.getTotalCells()).fill(0).map((_, index) => index);

        for (let i = 0; i < totalMines; i++) {
            const randomIndex = Math.floor(Math.random() * mapForMark.length);
            const mineIndex = mapForMark[randomIndex];
            this.isMines.push(mineIndex);
            mapForMark.splice(randomIndex, 1);
        }
        this.updateMineCounter();
    }

    markMines() {
        this.isMines.forEach((mineIndex) => {
            const aroundIndices = this.getIndexAround(mineIndex);
            aroundIndices.forEach((index) => {
                if (!this.isMines.includes(index)) {
                    const currentElement = document.getElementById(`data-${index}`);
                    currentElement.dataset.count = Number(currentElement.dataset.count) + 1;
                }
            });
        });
    }

    openCell(index) {
        if (!this.isInteractive || this.gameOver || this.flags.has(index)) return;

        const cell = document.getElementById(`data-${index}`);
        if (!cell.classList.contains('closed')) return;

        cell.classList.remove('closed');
        cell.classList.add('opend');
        this.openedCells++;

        if (this.isMines.includes(index)) {
            cell.innerHTML = '<div>💣</div>';
            socket.emit('game-over', {
                roomId: currentRoom,
                winner: playerRole === 'playerA' ? 'playerB' : 'playerA'
            });
            this.endGame(false);
            return;
        }

        const count = Number(cell.dataset.count);
        cell.innerHTML = count > 0 ? count : '';

        // Notify opponent about this move
        if (this.isInteractive) {
            socket.emit('cell-opened', {
                roomId: currentRoom,
                playerRole: playerRole,
                index: index,
                count: count,
                isMine: false
            });
        }

        if (count === 0) {
            const neighbors = this.getIndexAround(index);
            neighbors.forEach((neighborIndex) => {
                this.openCell(neighborIndex);
            });
        }

        if (this.openedCells === this.getTotalCells() - this.isMines.length) {
            socket.emit('game-over', {
                roomId: currentRoom,
                winner: playerRole
            });
            this.endGame(true);
        }
    }
    openCellRemote(index, count, isMine) {
        if (this.gameOver) return;

        const cell = document.getElementById(`data-${index}`);
        if (!cell.classList.contains('closed')) return;

        cell.classList.remove('closed');
        cell.classList.add('opend');
        
        if (isMine) {
            cell.innerHTML = '<div>💣</div>';
        } else {
            cell.innerHTML = count > 0 ? count : '';
        }
    }

    toggleFlag(index) {
        if (!this.isInteractive || this.gameOver) return;

        const cell = document.getElementById(`data-${index}`);
        if (!cell.classList.contains('closed')) return;

        if (this.flags.has(index)) {
            this.flags.delete(index);
            cell.innerHTML = '';
        } else {
            this.flags.add(index);
            cell.innerHTML = '<div>🚩</div>';
        }

        this.updateMineCounter();

        // Notify opponent about flag change
        if (this.isInteractive) {
            socket.emit('flag-toggled', {
                roomId: currentRoom,
                playerRole: playerRole,
                index: index,
                hasFlag: this.flags.has(index)
            });
        }
    }

    toggleFlagRemote(index, hasFlag) {
        if (this.gameOver) return;

        const cell = document.getElementById(`data-${index}`);
        if (!cell.classList.contains('closed')) return;

        cell.innerHTML = hasFlag ? '<div>🚩</div>' : '';
    }

    updateMineCounter() {
        if (this.mineCounter) {
            const remainingMines = this.totalMines() - this.flags.size;
            this.mineCounter.innerText = `Mines: ${remainingMines}`;
        }
    }

    endGame(won) {
        this.gameOver = true;
        if (won) {
            alert('You Win!');
        } else {
            this.isMines.forEach((mineIndex) => {
                const cell = document.getElementById(`data-${mineIndex}`);
                cell.innerHTML = '<div>💣</div>';
                cell.classList.remove('closed');
                cell.classList.add('opend');
            });
            alert('Game Over! You hit a mine.');
        }
    }

    start() {
        this.DrawBoard();
        this.setupMines();
        this.markMines();
    }
}

export default Minesweeper;
