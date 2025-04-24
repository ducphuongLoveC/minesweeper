import React, { useEffect, useState, useRef } from 'react';

type Props = {
    ratioX: number;
    ratioY: number;
};

type Cell = {
    count: number;
    isMine: boolean;
    isOpen: boolean;
    isFlagged: boolean;
};

const Minesweeper: React.FC<Props> = ({ ratioX, ratioY }) => {
    const totalCells = ratioX * ratioY;
    const [board, setBoard] = useState<Cell[]>([]);
    const [isMines, setIsMines] = useState<number[]>([]);
    const [openedCells, setOpenedCells] = useState(0);
    const [flags, setFlags] = useState<Set<number>>(new Set());
    const [gameOver, setGameOver] = useState(false);
    const mineCounterRef = useRef<HTMLDivElement>(null);

    const calculateMines = (): number => {
        const mineRatio = totalCells < 100 ? 0.12 : totalCells <= 300 ? 0.15 : 0.20;
        let mineCount = Math.floor(totalCells * mineRatio);
        mineCount = Math.max(1, mineCount);
        mineCount = Math.min(mineCount, Math.floor(totalCells * 0.25));
        return mineCount;
    };

    const getIndexAround = (index: number): number[] => {
        const col = index % ratioX;
        const row = Math.floor(index / ratioX);
        const result: number[] = [];

        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const newRow = row + dy;
                const newCol = col + dx;
                if (newRow >= 0 && newRow < ratioY && newCol >= 0 && newCol < ratioX) {
                    result.push(newRow * ratioX + newCol);
                }
            }
        }

        return result;
    };

    const setupMines = (): [Cell[], number[]] => {
        const totalMines = calculateMines();
        const cellMap: Cell[] = Array.from({ length: totalCells }, () => ({
            count: 0,
            isMine: false,
            isOpen: false,
            isFlagged: false,
        }));

        const mapForMark = Array.from({ length: totalCells }, (_, i) => i);
        const mines: number[] = [];

        for (let i = 0; i < totalMines; i++) {
            const randomIndex = Math.floor(Math.random() * mapForMark.length);
            const mineIndex = mapForMark[randomIndex];
            mines.push(mineIndex);
            mapForMark.splice(randomIndex, 1);
            cellMap[mineIndex].isMine = true;
        }

        mines.forEach((mineIndex) => {
            getIndexAround(mineIndex).forEach((nIdx) => {
                if (!cellMap[nIdx].isMine) {
                    cellMap[nIdx].count += 1;
                }
            });
        });

        return [cellMap, mines];
    };

    // const openCell = (index: number, boardCopy: Cell[] = [...board]) => {
    //     if (gameOver || boardCopy[index].isOpen || boardCopy[index].isFlagged) return;

    //     const newBoard = [...boardCopy];
    //     const cell = newBoard[index];

    //     if (cell.isOpen) return;

    //     cell.isOpen = true;
    //     let opened = 1;

    //     if (cell.isMine) {
    //         cell.count = -1;
    //         revealAllMines(newBoard);
    //         setGameOver(true);
    //         alert('Game Over! You hit a mine.');
    //         return;
    //     }

    //     if (cell.count === 0) {
    //         getIndexAround(index).forEach((nIdx) => {
    //             if (!newBoard[nIdx].isOpen && !newBoard[nIdx].isMine) {
    //                 const result = openCell(nIdx, newBoard);
    //                 opened += result || 0;
    //             }
    //         });
    //     }

    //     const newOpened = openedCells + opened;
    //     setOpenedCells(newOpened);
    //     setBoard(newBoard);

    //     if (newOpened === totalCells - isMines.length) {
    //         setGameOver(true);
    //         alert('You Win!');
    //     }

    //     return opened;
    // };



    const openCell = (index: number) => {
        if (gameOver || board[index].isOpen || board[index].isFlagged) return;
    
        const newBoard = [...board];
        let opened = 0;
        const queue = [index];
    
        while (queue.length > 0) {
            const currIdx = queue.shift();
            const cell = newBoard[currIdx!];
    
            if (cell.isOpen || cell.isFlagged) continue;
            cell.isOpen = true;
            opened++;
    
            if (cell.isMine) {
                cell.count = -1;
                revealAllMines(newBoard);
                setGameOver(true);
                setBoard(newBoard);
                requestAnimationFrame(() => alert('Game Over! You hit a mine.'));
                return;
            }
    
            if (cell.count === 0) {
                getIndexAround(currIdx!).forEach((nIdx) => {
                    if (!newBoard[nIdx].isOpen && !newBoard[nIdx].isMine) {
                        queue.push(nIdx);
                    }
                });
            }
        }
    
        const newOpened = openedCells + opened;
        setOpenedCells(newOpened);
        setBoard(newBoard);
    
        if (newOpened === totalCells - isMines.length) {
            setGameOver(true);
            requestAnimationFrame(() => alert('You Win!'));
        }
    };
    

    const revealAllMines = (boardCopy: Cell[]) => {
        const updated = [...boardCopy];
        isMines.forEach((idx) => {
            updated[idx].isOpen = true;
        });
        setBoard(updated);
    };

    const toggleFlag = (index: number) => {
        if (gameOver) return;

        const newFlags = new Set(flags);
        const newBoard = [...board];

        if (!newBoard[index].isOpen) {
            newBoard[index].isFlagged = !newBoard[index].isFlagged;
            if (newBoard[index].isFlagged) newFlags.add(index);
            else newFlags.delete(index);

            setFlags(newFlags);
            setBoard(newBoard);
        }
    };

    const updateMineCounter = () => {
        if (mineCounterRef.current) {
            const remaining = calculateMines() - flags.size;
            mineCounterRef.current.innerText = `Mines: ${remaining}`;
        }
    };

    useEffect(() => {
        const [newBoard, mines] = setupMines();
        setBoard(newBoard);
        setIsMines(mines);
    }, []);

    useEffect(() => {
        updateMineCounter();
    }, [flags]);

    return (
        <div>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${ratioX}, 30px)`,
                    gridTemplateRows: `repeat(${ratioY}, 30px)`,
                    gap: 0,
                    lineHeight: 0,
                }}
            >
                {board.map((cell, i) => (
                    <div
                        className='block-btn'
                        key={i}
                        onClick={() => openCell(i)}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            toggleFlag(i);
                        }}
                        style={{
                            width: 30,
                            height: 30,
                            border: '1px solid #888',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: cell.isOpen ? '#ddd' : '#bbb',
                            cursor: 'pointer',
                            fontSize: 16,
                            userSelect: 'none',
                        }}
                    >
                        {cell.isOpen
                            ? cell.isMine
                                ? '💣'
                                : cell.count > 0
                                    ? cell.count
                                    : ''
                            : cell.isFlagged
                                ? '🚩'
                                : ''}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Minesweeper;
