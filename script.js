// CLASS DEFINITIONS - PIECES : 
class Piece {
    constructor() {
        this._type;
        this._isActive = true;
        this._position;
        this._matrix;
        this._displayMatrix;
        this._speedMode = false;
    }

    get type() {
        return this._type;
    }

    get isActive() {
        return this._isActive;
    }

    set isActive(newValue) {
        this._isActive = newValue;
    }

    get position() {
        return this._position;
    }

    get matrix() {
        return this._matrix;
    }

    set matrix(newValue) {
        this._matrix = newValue;
    }

    get displayMatrix() {
        return this._displayMatrix;
    }

    set displayMatrix(newValue) {
        this._displayMatrix = newValue;
    }

    get speedMode() {
        return this._speedMode;
    }

    set speedMode(newValue) {
        this._speedMode = newValue;
    }

    generateDisplayMatrix() {
        /* The terrain size matrix is the first step of the piece display on screen */
            const terrainSizeMatrix = generateGameMatrix(TERRAIN_WIDTH, TERRAIN_HEIGHT);
        
            for (let matrixRow = TERRAIN_HEIGHT - 1; matrixRow >= 0; matrixRow--) {
                if (currentPiece.position[1] === matrixRow) {
                    for (let i = 0; i < currentPiece.matrix.length; i++) {
                        for (let j = 0; j < currentPiece.matrix.length; j++) {
                            terrainSizeMatrix[currentPiece.position[1] - i][currentPiece.position[0] + j] = currentPiece.matrix[i][j];
                        }                
                    }
                }
            }
            this.displayMatrix = terrainSizeMatrix;
    }
    
    // Definitions of the colliding rules :
    contactPoints(matrix) {
        // gives the coordinates of every hitPoint
        const matrixSlotIsPieceBlock = (matrix, col, row) => matrix[col][row] === this.type;

        const addBlockCoordinatesToContactPointsList = (col, row) => contactPointsList.push([this.position[0] + row, this.position[1] - col]);
        
        const contactPointsList = [];

        for (let col = 0; col < matrix.length; col++) {
            for (let row = 0; row < matrix.length; row++) {
                if (matrixSlotIsPieceBlock(matrix, col, row)) {
                    addBlockCoordinatesToContactPointsList(col, row);  
                }
            }
        }
        return contactPointsList;
    }

    moveAllowed(matrix, comparedMatrix, offsetX, offsetY ) {
        // For each contact point, I check the block on the left to see if i can move 
        const targetZone = [];
            this.contactPoints(matrix).forEach((contactPoint) => {
                targetZone.push(comparedMatrix[contactPoint[1] + offsetY][contactPoint[0] + offsetX]);
            })
        return targetZone.every((block) => block === 0);
    }

    // Methods for the piece rotation by manipulating the piece matrix :
    mirrorMatrix(matrix) {
        const result = new Array(matrix[0].length);
        for (let i = 0; i < matrix[0].length; i++) {
            result[i] = new Array(matrix.length - 1);
            for (let j = matrix.length - 1; j > -1; j--) {
                result[i][j] = matrix[j][i];
            }
        }
        return result;
    }

    reverseMatrixRows(matrix) {
        for (let i = 0; i < matrix.length; i++) {
            matrix.reverse();
        }
        return matrix;
    }

    rotateLeft() {
        const futureMatrix = this.reverseMatrixRows(this.mirrorMatrix(this.matrix));

        if (this.moveAllowed(futureMatrix, gameMatrix, 0, 0)) {
            this.matrix = futureMatrix;
        }
    }

    rotateRight() {
        const futureMatrix = this.mirrorMatrix(this.reverseMatrixRows(this.matrix));

        if (this.moveAllowed(futureMatrix, gameMatrix, 0, 0)) {
            this.matrix = futureMatrix;
        }
    }

    IPieceRotationAdjustment() { //TODO BOF
    //because of the non symetry of the I piece in its matrix, we need to adjust the rotation effect.   
       if(this.moveAllowed(this.matrix, gameMatrix, -2, 0)){
            this.position[0] -= 2;  
       }
         
    }

    // Moving pieces methods:
    moveDown() {
        /* Check if there is a blank line to remove on the bottom piece matrix. Because of the need to have square piece matrices for rotation purposes,
        if the last line of the piece matrix is empty, put it on top of matrix so the piece can touch the ground, it results as a down move */
        
        const emptyBottomLine = () => {
            return this.matrix.at(-1).every((value) => value === 0);
        }

        const verticalOffsetPieceMatrix = () => {
            this.matrix.unshift(this.matrix.pop());
        }

        const lowestYcontactPoint = () => {
            // we find the lowest Y value in the contact points list
            let lowestYPoint = [];
            for (let i = 0; i < this.contactPoints(this.matrix).length; i++) {
                lowestYPoint.push(this.contactPoints(this.matrix)[i][1]);
            }
            return Math.min(...lowestYPoint);
        }

        if (this.moveAllowed(this.matrix, gameMatrix, 0, -1)) {
            if (emptyBottomLine()) {
                verticalOffsetPieceMatrix();
                this.generateDisplayMatrix();
            } else {
                // regular move down options : 
                if (lowestYcontactPoint() > 0) {
                    this.position[1] -= 1;
                    this.generateDisplayMatrix();
                }
        
                if (lowestYcontactPoint() === 0) {
                    this.isActive = false;
                }
            }   
        } else {
            this.isActive = false;
        }
        
    }

    moveLeft() {
        const beforeLeftTerrainBorder = () => {
            // we find the min X value in the contact points list to get the closer to the left
            let smallerXPoint = [];
            for (let i = 0; i < this.contactPoints(this.matrix).length; i++) {
                smallerXPoint.push(this.contactPoints(this.matrix)[i][0]);
            }
            return Math.min(...smallerXPoint) > 0;
        }

        if (this.moveAllowed(this.matrix, gameMatrix, -1, 0) && beforeLeftTerrainBorder()) {
            this.position[0] -= 1;
        }   
    }

    moveRight() {
        const beforeRightTerrainBorder = () => {
            // we find the max X value in the contact points list to get the closest to the right
            let biggerXPoint = [];
            for (let i = 0; i < this.contactPoints(this.matrix).length; i++) {
                biggerXPoint.push(this.contactPoints(this.matrix)[i][0]);
            }
            return Math.max(...biggerXPoint) < (TERRAIN_WIDTH - 1);
        }
        
        if (this.moveAllowed(this.matrix, gameMatrix, 1, 0) && beforeRightTerrainBorder()) {
            this.position[0] += 1;
        }   
    }

    instantDownMove() { //todo
        
    }
}

class I extends Piece {
    constructor() {
        super()

        this._type = 'I';
        this._matrix = [
                        [0, this.type, 0, 0],
                        [0, this.type, 0, 0],
                        [0, this.type, 0, 0],
                        [0, this.type, 0, 0]
                        ];
        this._position = [3, 21];
    }
}

class J extends Piece {
    constructor() {
        super()

        this._type = 'J';
        this._matrix = [
                        [this.type, this.type, this.type],
                        [0,         0,         this.type],
                        [0,         0,         0        ]
                        ];
        this._position = [4, 21];
    }
}

class L extends Piece {
    constructor() {
        super()

        this._type = 'L';
        this._matrix = [
                        [this.type, this.type, this.type],
                        [this.type, 0,         0        ],
                        [0,         0,         0        ]
                        ];
        this._position = [4, 21];
    }
}

class T extends Piece {
    constructor() {
        super()

        this._type = 'T';
        this._matrix = [
                        [this.type, this.type, this.type],
                        [0,         this.type, 0        ],
                        [0,         0,         0        ]
                        ];
        this._position = [4, 21];
    }
}

class O extends Piece {
    constructor() {
        super()

        this._type = 'O';
        this._matrix = [
                        [this.type, this.type],
                        [this.type, this.type]
                        ];
        this._position = [4, 21];
    }
}

class Z extends Piece {
    constructor() {
        super()

        this._type = 'Z';
        this._matrix = [
            [this.type, this.type, 0        ],
            [0,         this.type, this.type],
            [0,         0,         0        ]
            ];
        this._position = [4, 21];
    }
}

class S extends Piece {
    constructor() {
        super()

        this._type = 'S';
        this._matrix = [
            [0,         this.type, this.type],
            [this.type, this.type, 0        ],
            [0,         0,         0        ]
            ];
        this._position = [4, 21];
    }
}

// FUNCTIONS DEFINITIONS : 
const generateGameMatrix = (width, height) => {
    //generates the grid
    const gameMatrix = [];

    const generateOneLine = () => {
        const oneLine = [];
        for (let j = 0; j < width; j++ ) {
            oneLine.push(0);
        }
        return oneLine;
    }
    
    for (let i = 0; i < height; i++ ) {    
        gameMatrix.push(generateOneLine());
    }
    return gameMatrix ;
}

const addPieceToBackgroundGrid = () => {
    /* adds the piece to the background gameMatrix if contact with ground or other piece.
      1- By checking if the block contains a piece information
      2- By adding it to the background game matrix
    */
    const blockIsAPieceBlock = (rowNumber, blockNumber) => {
        return currentPiece.displayMatrix[rowNumber][blockNumber] === currentPiece.type;
    }
    const addBlockToBackground = (rowNumber, blockNumber) => {
        gameMatrix[rowNumber][blockNumber] = currentPiece.displayMatrix[rowNumber][blockNumber];
    }
    for (let rowNumber = TERRAIN_HEIGHT - 1; rowNumber >= 0; rowNumber--) {
        for (let blockNumber = 0; blockNumber < TERRAIN_WIDTH; blockNumber++) {
            if (blockIsAPieceBlock(rowNumber, blockNumber)) {
                addBlockToBackground(rowNumber, blockNumber);
            }
        }
    }
}

const updateTerrain = () => {
    const terrain = document.getElementById("terrain");
    /* To update the display I combine the current moving piece terrain-sized matrix
     to the gameMatrix that contains all the previews block informations */
    currentPiece.generateDisplayMatrix();
    const currentMatrix = currentPiece.displayMatrix;

    for (let rowNumber = TERRAIN_HEIGHT - 1; rowNumber >= 0; rowNumber--) {
        for (let blockNumber = 0; blockNumber < TERRAIN_WIDTH; blockNumber++) {
            if (currentMatrix[rowNumber][blockNumber] === 0) {
                currentMatrix[rowNumber][blockNumber] = gameMatrix[rowNumber][blockNumber];
            }
        }   
    }
 
    const generateLine = (rowNumber) => {
        let lineContent = '';
    
        for (let blockNumber = 0; blockNumber < TERRAIN_WIDTH; blockNumber++) {
            const displayBlockClass = () => {
                
                if (currentMatrix[rowNumber][blockNumber] === 0) {
                    return "empty";
                }
                return `gameBlock ${currentMatrix[rowNumber][blockNumber]}`;
            }
           lineContent += `<td class='block ${displayBlockClass()}'></td>`;
        }
        return lineContent;  
    }

    terrain.innerHTML = '';
    for (let rowNumber = TERRAIN_HEIGHT - 1; rowNumber >= 0; rowNumber--) {
        terrain.innerHTML += `<tr id='${'row' + rowNumber}'>${generateLine(rowNumber)}</tr>`;
    }
    return terrain.innerHTML 
}

const randomPieceSelection = () => {
    const pieceList = [I, J, L, T, O, Z, S];
    return new pieceList[Math.floor(Math.random() * pieceList.length)];
}

const loadPieceSet = () => {
    currentPiece = nextPiece;
    
    if (currentPiece === undefined) {
        currentPiece = randomPieceSelection();
        
    }
    
    nextPiece = randomPieceSelection();
    leftBar_nextPieceDisplay(nextPiece);
}

const manageCompletedLines = (matrix) => {
    /* Deletes the full row and offsets the whole game matrix one down by pushing a new empty row on top*/
    const fullLine = (row) => {
        return matrix[row].every((block) => block !== 0);
    }

    const deleteRow = (row) => {
        const offsetOneRowDown = (matrix) => {
            const emptyRow = () => {
                let emptyRow = [];
                for (let blockNumber = 0; blockNumber < TERRAIN_WIDTH; blockNumber++) {
                    emptyRow.push(0);
                }
                return emptyRow
            }
            matrix.push(emptyRow())
        }
        matrix.splice(row, 1)
        offsetOneRowDown(matrix)
        updateTerrain();
    }

    for (let row = 0; row < matrix.length; row++) {

        if (fullLine(row)) {
            deleteRow(row);
            addPoints(50);
            numOfLines += 1;
            leftBar_lineUpdate();
            changeSpeed(3);
        }
    }
}

const endGameDetection = (piece) => { // IN PROGRESS
    const contactPointTouchingTop = () => {
        return piece.contactPoints(piece.matrix).some((block) => block[1] + 1 >= 21);
    }

    if (contactPointTouchingTop()) {
        gameStatus = 'gameOver';
    }
}

const changeSpeed = (num) => {
    // Function that changes the timer, triggered in manageCompleteLines
    if (numOfLines % num === 0) {
        speedCoef += 0.15;
    }  
}

const gameLoop = () => {
    
    if (!currentPiece.isActive) {
        manageAccelMode()
        currentPiece.speedMode = false;
        addPieceToBackgroundGrid();
        endGameDetection(currentPiece);
        addPoints(10);
        loadPieceSet();
    }

    if(currentPiece.speedMode){
        addPoints(0.2);
    }
    
    currentPiece.moveDown();
    
    manageCompletedLines(gameMatrix);
    terrain.innerHTML = updateTerrain();

    const game = setTimeout(gameLoop, speed)
        if (gameStatus === 'gameOver') {
            clearTimeout(game);
        }
}

// LEFT SIDE - INFORMATION PANEL : 
const leftBar_nextPieceDisplay = (piece) => {
    const nextPiecePreview = document.getElementById("nextPiecePreview");
    const generateLine = (rowNumber) => {
        let lineContent = '';
    
        for (let blockNumber = 0; blockNumber < piece.matrix.length; blockNumber++) {
            const displayBlockClass = () => {
                if (piece.matrix[rowNumber][blockNumber] === 0) {
                    return "";
                }
                return "previewPiece";
            }
           lineContent += `<td class='miniblock ${displayBlockClass()}'></td>`;
        }
        return lineContent;  
    }
    nextPiecePreview.innerHTML = '';

    for (let rowNumber = 0; rowNumber < piece.matrix.length; rowNumber++) {
        nextPiecePreview.innerHTML += `<tr id='${'row' + rowNumber}'>${generateLine(rowNumber)}</tr>`;
    }
    return nextPiecePreview.innerHTML;    
}

const leftBar_lineUpdate = () => {
    const scoreContent = document.getElementById("lines");
    scoreContent.innerHTML = numOfLines;
}

const leftBar_scoreUpdate = () => {
    const scoreContent = document.getElementById("score");
    scoreContent.innerHTML = Math.floor(score);
}

const addPoints = (num) => {
    score += num * speedCoef;
    leftBar_scoreUpdate();
}

const manageAccelMode = () => {
   
    if (currentPiece.speedMode) {
    speed = initSpeed / speedCoef;
   } 
}

// INIT GAME
TERRAIN_WIDTH = 10;
TERRAIN_HEIGHT = 22;
const gameMatrix = generateGameMatrix(TERRAIN_WIDTH, TERRAIN_HEIGHT);
let gameStatus = 'on';
const initSpeed = 600;
let speed = initSpeed;
let score = 0;
let numOfLines = 0;
let speedCoef = 1;
let nextPiece;
let currentPiece;
loadPieceSet();
updateTerrain();
leftBar_scoreUpdate();
leftBar_lineUpdate();

//CONTROLS
window.addEventListener('keydown', (e) => { 
    updateTerrain();
    switch(e.key){
        case 'ArrowLeft' :
            currentPiece.moveLeft();
            break;
        case 'ArrowRight' :
            currentPiece.moveRight(); 
            break;
        case 'ArrowDown' :
            currentPiece.speedMode = true;
            
            if(currentPiece.speedMode){
                speed /= 4;
            }
            
            break;
        case 'Enter' :
            const game = setTimeout(() => {

                if (gameStatus === 'gameOver') {
                    clearTimeout(game);
                }

                gameLoop()
            }, speed)
            break;
        case 'q' : 
            currentPiece.rotateLeft();
            break
        case 'd' : 
            currentPiece.rotateRight();
            break
        case 's' : 
            currentPiece.instantDownMove();
            addPoints(25);
            break
    }
})