
// import React, { useEffect, useState, useRef } from 'react';

// type Props = {
//     ratioX: number;
//     ratioY: number;
// };

// type Cell = {
//     count: number;
//     isMine: boolean;
//     isOpen: boolean;
//     isFlagged: boolean;
// };

// const Minesweeper: React.FC<Props> = ({ ratioX, ratioY }) => {
//     const totalCells = ratioX * ratioY;
//     const [board, setBoard] = useState<Cell[]>([]);
//     const [isMines, setIsMines] = useState<number[]>([]);
//     const [openedCells, setOpenedCells] = useState(0);
//     const [flags, setFlags] = useState<Set<number>>(new Set());
//     const [gameOver, setGameOver] = useState(false);
//     const mineCounterRef = useRef<HTMLDivElement>(null);

//     const calculateMines = (): number => {
//         const mineRatio = totalCells < 100 ? 0.12 : totalCells <= 300 ? 0.15 : 0.20;
//         let mineCount = Math.floor(totalCells * mineRatio);
//         mineCount = Math.max(1, mineCount);
//         mineCount = Math.min(mineCount, Math.floor(totalCells * 0.25));
//         return mineCount;
//     };

//     const getIndexAround = (index: number): number[] => {
//         const col = index % ratioX;
//         const row = Math.floor(index / ratioX);
//         const result: number[] = [];

//         for (let dy = -1; dy <= 1; dy++) {
//             for (let dx = -1; dx <= 1; dx++) {
//                 if (dx === 0 && dy === 0) continue;
//                 const newRow = row + dy;
//                 const newCol = col + dx;
//                 if (newRow >= 0 && newRow < ratioY && newCol >= 0 && newCol < ratioX) {
//                     result.push(newRow * ratioX + newCol);
//                 }
//             }
//         }

//         return result;
//     };

//     const setupMines = (): [Cell[], number[]] => {
//         const totalMines = calculateMines();
//         const cellMap: Cell[] = Array.from({ length: totalCells }, () => ({
//             count: 0,
//             isMine: false,
//             isOpen: false,
//             isFlagged: false,
//         }));

//         const mapForMark = Array.from({ length: totalCells }, (_, i) => i);
//         const mines: number[] = [];

//         for (let i = 0; i < totalMines; i++) {
//             const randomIndex = Math.floor(Math.random() * mapForMark.length);
//             const mineIndex = mapForMark[randomIndex];
//             mines.push(mineIndex);
//             mapForMark.splice(randomIndex, 1);
//             cellMap[mineIndex].isMine = true;
//         }

//         mines.forEach((mineIndex) => {
//             getIndexAround(mineIndex).forEach((nIdx) => {
//                 if (!cellMap[nIdx].isMine) {
//                     cellMap[nIdx].count += 1;
//                 }
//             });
//         });

//         return [cellMap, mines];
//     };

//     const openCell = (index: number) => {
//         if (gameOver || board[index].isOpen || board[index].isFlagged) return;

//         const newBoard = [...board];
//         let opened = 0;
//         const queue = [index];

//         while (queue.length > 0) {
//             const currIdx = queue.shift();
//             const cell = newBoard[currIdx!];

//             if (cell.isOpen || cell.isFlagged) continue;
//             cell.isOpen = true;
//             opened++;

//             if (cell.isMine) {
//                 cell.count = -1;
//                 revealAllMines(newBoard);
//                 setGameOver(true);
//                 setBoard(newBoard);
//                 requestAnimationFrame(() => alert('Game Over! You hit a mine.'));
//                 return;
//             }

//             if (cell.count === 0) {
//                 getIndexAround(currIdx!).forEach((nIdx) => {
//                     if (!newBoard[nIdx].isOpen && !newBoard[nIdx].isMine) {
//                         queue.push(nIdx);
//                     }
//                 });
//             }
//         }

//         const newOpened = openedCells + opened;
//         setOpenedCells(newOpened);
//         setBoard(newBoard);

//         if (newOpened === totalCells - isMines.length) {
//             setGameOver(true);
//             requestAnimationFrame(() => alert('You Win!'));
//         }
//     };


//     const revealAllMines = (boardCopy: Cell[]) => {
//         const updated = [...boardCopy];
//         isMines.forEach((idx) => {
//             updated[idx].isOpen = true;
//         });
//         setBoard(updated);
//     };

//     const toggleFlag = (index: number) => {
//         if (gameOver) return;

//         const newFlags = new Set(flags);
//         const newBoard = [...board];

//         if (!newBoard[index].isOpen) {
//             newBoard[index].isFlagged = !newBoard[index].isFlagged;
//             if (newBoard[index].isFlagged) newFlags.add(index);
//             else newFlags.delete(index);

//             setFlags(newFlags);
//             setBoard(newBoard);
//         }
//     };

//     const updateMineCounter = () => {
//         if (mineCounterRef.current) {
//             const remaining = calculateMines() - flags.size;
//             mineCounterRef.current.innerText = `Mines: ${remaining}`;
//         }
//     };

//     useEffect(() => {
//         const [newBoard, mines] = setupMines();
//         setBoard(newBoard);
//         setIsMines(mines);
//     }, []);

//     useEffect(() => {
//         updateMineCounter();
//     }, [flags]);

//     return (
//         <div className="flex flex-col items-center gap-6 p-6 bg-gray-100 rounded-xl">
//             {/* Mine counter - modernized */}
//             <div
//                 ref={mineCounterRef}
//                 className="px-4 py-2 bg-gray-800 text-white text-xl font-mono font-bold rounded-lg shadow-lg"
//             >
//                 {/* Counter value */}
//             </div>

//             {/* Game board - modern flat design with subtle depth */}
//             <div
//                 className="grid bg-gray-300 p-1 rounded-lg shadow-inner"
//                 style={{
//                     gridTemplateColumns: `repeat(${ratioX}, minmax(2.5rem, 1fr))`,
//                     gridTemplateRows: `repeat(${ratioY}, minmax(2.5rem, 1fr))`,
//                     gap: "1px" // subtle grid lines
//                 }}
//             >
//                 {board.map((cell, i) => (
//                     <button
//                         key={i}
//                         onClick={() => openCell(i)}
//                         onContextMenu={(e) => {
//                             e.preventDefault();
//                             toggleFlag(i);
//                         }}
//                         className={`
//                             w-full h-full flex items-center justify-center
//                             text-lg font-bold select-none
//                             transition-all duration-75 ease-out
//                             focus:outline-none
//                             ${
//                                 cell.isOpen 
//                                     ? 'bg-gray-100' 
//                                     : `bg-gray-400 hover:bg-gray-350 
//                                        active:transform active:scale-95
//                                        shadow-[inset_0_-2px_0_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.2)]`
//                             }
//                             ${cell.isFlagged && !cell.isOpen ? 'text-red-500' : ''}
//                             relative overflow-hidden
//                         `}
//                     >
//                         {/* Cell content */}
//                         {cell.isOpen ? (
//                             cell.isMine ? (
//                                 <span className="text-2xl">💥</span> // modern explosion
//                             ) : cell.count > 0 ? (
//                                 <span className={`
//                                     ${cell.count === 1 && 'text-blue-600'}
//                                     ${cell.count === 2 && 'text-green-600'}
//                                     ${cell.count === 3 && 'text-red-600'}
//                                     ${cell.count >= 4 && 'text-purple-600'}
//                                 `}>
//                                     {cell.count}
//                                 </span>
//                             ) : null
//                         ) : cell.isFlagged ? (
//                             <span className="text-xl">🚩</span>
//                         ) : null}

//                         {/* Modern subtle highlight effect */}
//                         {!cell.isOpen && (
//                             <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"/>
//                         )}
//                     </button>
//                 ))}
//             </div>
//         </div>
//     );

// };

// export default Minesweeper;










import React, { useEffect, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';

type Props = {
    ratioX: number;
    ratioY: number;
    gameMode: 'solo' | 'pvp';
    socket: Socket | null;
    room?: string;
    playerId?: string; // ID of the board's owner
    isOwnBoard: boolean;
    playerName?: string;
};

type Cell = {
    count: number;
    isMine: boolean;
    isOpen: boolean;
    isFlagged: boolean;
    openedBy?: string;
};

const difficultyLevels = {
    beginner: { x: 9, y: 9, mines: 10 },
    intermediate: { x: 16, y: 16, mines: 40 },
    expert: { x: 30, y: 16, mines: 99 },
};

const Minesweeper = ({ ratioX, ratioY, gameMode, socket, room, playerId, isOwnBoard, playerName }: Props) => {
    const totalCells = ratioX * ratioY;
    const [board, setBoard] = useState<Cell[]>([]);
    const [minePositions, setMinePositions] = useState<number[]>([]);
    // const [openedCells, setOpenedCells] = useState(0);
    const [flags, setFlags] = useState<Set<number>>(new Set<number>());
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);
    const mineCounterRef = useRef<HTMLDivElement>(null);

    const openedCells = useRef(0);

    const [dataEnd, setDataEnd] = useState();

    // Tính số mìn dựa trên kích thước bảng
    const calculateMines = (): number => {
        if (gameMode === 'pvp') {
            const difficulty = room ? (room as any).difficulty || 'beginner' : 'beginner';
            return difficultyLevels[difficulty].mines;
        }
        const mineRatio = totalCells < 100 ? 0.12 : totalCells <= 300 ? 0.15 : 0.20;
        let mineCount = Math.floor(totalCells * mineRatio);
        mineCount = Math.max(1, mineCount);
        mineCount = Math.min(mineCount, Math.floor(totalCells * 0.25));
        return mineCount;
    };

    // Lấy các ô xung quanh một ô
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

    // Thiết lập mìn và bảng cờ
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

    // Mở ô
    const openCell = (index: number, isOpponentMove = false) => {
        console.log(minePositions);

        if (!isOwnBoard || gameOver || board[index].isOpen || board[index].isFlagged) return;

        const newBoard = [...board];
        let opened = 0;
        const queue = [index];

        while (queue.length > 0) {

            const currIdx = queue.shift();
            const cell = newBoard[currIdx!];

            if (cell.isOpen || cell.isFlagged) continue;
            cell.isOpen = true;
            cell.openedBy = isOpponentMove ? 'opponent' : playerId;
            cell.count = calculateCellCount(currIdx!); // Tính lại count

            opened++;

            if (cell.isMine) {
                cell.count = -1;
                revealAllMines(newBoard);
                setGameOver(true);
                setBoard(newBoard);

                if (gameMode === 'pvp' && socket) {
                    console.log(room);

                    socket.emit('gameOver', { roomId: room, type: 'lost', playerId: isOpponentMove ? playerId : null, playerName });
                }
                return;
            }


            console.log(openedCells);


            // if( totalCells )

            if (cell.count === 0) {
                getIndexAround(currIdx!).forEach((nIdx) => {
                    if (!newBoard[nIdx].isOpen && !newBoard[nIdx].isFlagged) {
                        queue.push(nIdx);
                    }
                });
            }

        }

        openedCells.current += opened;

        setBoard(newBoard);
        if (gameMode === 'pvp' && socket && !isOpponentMove) {
            // Gửi thông tin đầy đủ khi mở ô
            socket.emit('openCell', {
                roomId: room,
                index,
                count: newBoard[index].count,
                isMine: newBoard[index].isMine
            });
        }
        console.log(openedCells.current);
        
        return opened;

    };

    // Hiển thị tất cả mìn khi thua
    const revealAllMines = (boardCopy: Cell[]) => {
        const updated = [...boardCopy];
        minePositions.forEach((idx) => {
            updated[idx].isOpen = true;
        });
        setBoard(updated);
    };

    // Cắm/ gỡ cờ
    const toggleFlag = (index: number, isOpponentMove = false) => {
        if (!isOwnBoard || gameOver || board[index].isOpen) return;

        const newFlags = new Set(flags);
        const newBoard = [...board];

        if (!newBoard[index].isOpen) {
            newBoard[index].isFlagged = !newBoard[index].isFlagged;
            if (newBoard[index].isFlagged) newFlags.add(index);
            else newFlags.delete(index);

            setFlags(newFlags);
            setBoard(newBoard);
        }

        if (gameMode === 'pvp' && socket && !isOpponentMove) {
            socket.emit('toggleFlag', { roomId: room, index });
        }
    };

    // Cập nhật số mìn còn lại
    const updateMineCounter = () => {
        if (mineCounterRef.current) {
            const remaining = calculateMines() - flags.size;
            mineCounterRef.current.innerText = `Mines: ${remaining}`;
        }
    };


    const calculateCellCount = (index: number): number => {
        let count = 0;
        getIndexAround(index).forEach((nIdx) => {
            if (minePositions.includes(nIdx)) count++;
        });
        return count;
    };

    // Đồng bộ trạng thái từ server
    useEffect(() => {
        if (gameMode !== 'pvp' || !socket || !room || !playerId) {
            if (isOwnBoard || gameMode === 'solo') {
                const [newBoard, mines] = setupMines();
                setBoard(newBoard);
                setMinePositions(mines);
            } else {
                const emptyBoard: Cell[] = Array.from({ length: totalCells }, () => ({
                    count: 0,
                    isMine: false,
                    isOpen: false,
                    isFlagged: false,
                }));
                setBoard(emptyBoard);
                setMinePositions([]);
            }
            // setOpenedCells(0);
            setFlags(new Set());
            setGameOver(false);
            setWinner(null);
            return;
        }

        // Listen for initial board state from server
        socket.on('initBoard', ({ ownBoard, opponentBoard }) => {
            if (isOwnBoard) {
                setBoard(ownBoard);
                setMinePositions(ownBoard.reduce((mines, cell, i) => {
                    if (cell.isMine) mines.push(i);
                    return mines;
                }, []));
            } else {
                setBoard(opponentBoard);
                setMinePositions([]);
            }
            // setOpenedCells(0);
            setFlags(new Set());
            setGameOver(false);
            setWinner(null);
        });

        socket.on('cellOpened', ({ playerId: emitterId, cells }) => {
            if (emitterId === playerId) {
                setBoard(prevBoard => {
                    const newBoard = [...prevBoard];
                    cells.forEach(({ index, count, isMine }) => {
                        if (!newBoard[index].isOpen && !newBoard[index].isFlagged) {
                            newBoard[index].isOpen = true;
                            newBoard[index].count = count;
                            newBoard[index].isMine = isMine;
                            newBoard[index].openedBy = isOwnBoard ? playerId : 'opponent';
                        }
                    });
                    return newBoard;
                });
            }
        });

        socket.on('flagToggled', ({ playerId: emitterId, index }) => {
            if (emitterId === playerId) {
                setBoard(prevBoard => {
                    const newBoard = [...prevBoard];
                    setFlags(prevFlags => {
                        const newFlags = new Set(prevFlags);
                        if (!newBoard[index].isOpen) {
                            newBoard[index].isFlagged = !newBoard[index].isFlagged;
                            if (newBoard[index].isFlagged) {
                                newFlags.add(index);
                            } else {
                                newFlags.delete(index);
                            }
                        }
                        return newFlags;
                    });
                    return newBoard;
                });
            }
        });

        socket.on('endGame', (data) => {
            setDataEnd(data)
        })

        return () => {
            socket.off('initBoard');
        };
    }, [socket, room, gameMode, isOwnBoard, playerId, ratioX, ratioY]);

    // Khởi tạo bảng cờ
    useEffect(() => {
        if (isOwnBoard || gameMode === 'solo') {
            const [newBoard, mines] = setupMines();
            setBoard(newBoard);
            setMinePositions(mines);
            // setOpenedCells(0);
            setFlags(new Set());
            setGameOver(false);
            setWinner(null);
        } else {
            // Bảng của đối thủ: khởi tạo bảng trống
            const emptyBoard: Cell[] = Array.from({ length: totalCells }, () => ({
                count: 0, // Note: Counts are unknown for opponent's board
                isMine: false,
                isOpen: false,
                isFlagged: false,
            }));
            setBoard(emptyBoard);
            setMinePositions([]);
            // setOpenedCells(0);
            setFlags(new Set());
            setGameOver(false);
            setWinner(null);
        }
    }, [ratioX, ratioY, gameMode, isOwnBoard]);




    // Cập nhật số mìn còn lại
    useEffect(() => {
        updateMineCounter();
    }, [flags]);

    useEffect(() => {
        if (gameMode === 'pvp' && socket && room && playerId) {
            socket.emit('requestBoardState', { roomId: room });
        }
    }, [socket, room, playerId, gameMode]);

    return (
        <div className={`flex flex-col items-center gap-6 p-6 rounded-xl ${isOwnBoard ? 'bg-gray-100' : 'bg-gray-200'}`}>
            <h3 className="text-lg font-semibold text-gray-800">{playerName || 'Player'}</h3>

            <div className="flex justify-between w-full max-w-md">
                <div
                    ref={mineCounterRef}
                    className="px-4 py-2 bg-gray-800 text-white text-xl font-mono font-bold rounded-lg shadow-lg"
                >
                    Mines: {calculateMines()}
                </div>

                {gameMode === 'pvp' && (
                    <div className="px-4 py-2 bg-blue-600 text-white text-xl font-mono font-bold rounded-lg shadow-lg">
                        {gameOver ? `${winner} Win!` : 'Đang chơi...'}
                    </div>
                )}
            </div>

            <div
                className="grid bg-gray-300 p-1 rounded-lg shadow-inner"
                style={{
                    gridTemplateColumns: `repeat(${ratioX}, minmax(2.5rem, 1fr))`,
                    gridTemplateRows: `repeat(${ratioY}, minmax(2.5rem, 1fr))`,
                    gap: '1px',
                }}
            >
                {board.map((cell, i) => (
                    <button
                        key={i}
                        onClick={() => isOwnBoard && openCell(i)}
                        onContextMenu={(e) => {
                            if (isOwnBoard) {
                                e.preventDefault();
                                toggleFlag(i);
                            }
                        }}
                        className={`
              w-full h-full flex items-center justify-center
              text-lg font-bold select-none
              transition-all duration-75 ease-out
              focus:outline-none
              ${cell.isOpen
                                ? cell.openedBy === 'opponent'
                                    ? 'bg-blue-100'
                                    : 'bg-gray-100'
                                : `bg-gray-400 hover:bg-gray-350 
                   ${isOwnBoard ? 'active:transform active:scale-95' : 'cursor-default'}
                   shadow-[inset_0_-2px_0_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.2)]
                   ${!isOwnBoard ? 'opacity-80' : ''}`}
              ${cell.isFlagged && !cell.isOpen ? 'text-red-500' : ''}
              relative overflow-hidden
            `}
                        disabled={!isOwnBoard}
                    >
                        {cell.isOpen ? (
                            cell.isMine ? (
                                <span className="text-2xl">💥</span>
                            ) : cell.count > 0 ? (
                                <span
                                    className={`
                    ${cell.count === 1 && 'text-blue-600'}
                    ${cell.count === 2 && 'text-green-600'}
                    ${cell.count === 3 && 'text-red-600'}
                    ${cell.count >= 4 && 'text-purple-600'}
                  `}
                                >
                                    {cell.count}
                                </span>
                            ) : null
                        ) : cell.isFlagged ? (
                            <span className="text-xl">🚩</span>
                        ) : null}

                        {!cell.isOpen && (
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Minesweeper;