var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var PASSAGE = 'PASSAGE';
var GLUE = 'GLUE';
var gCount = 0;
var gCountBalls = 0;

var GAMER_IMG = '<img src="img/gamer.png">';
var GAMER_PUR_IMG = '<img src="img/gamer-purple.png">';
var BALL_IMG = '<img src="img/ball.png">';
var GLUE_IMG = '<img src="img/glue.png">';

var gGamerPos;
var gBoard;
var gIntervalBall;
var gAudio = new Audio('right.mp3');
var gBoardHeight = 10;
var gBoardLength = 12;
var gIsStuck = false;
var isFinished =false;

function init() {

	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	renderBoard(gBoard);
	gIntervalBall = setInterval(function () { newBalls() }, 3000);
	gIntervalGlue = setInterval(function () { newGlue() }, 5000);


}


function buildBoard() {
	// Create the Matrix 10 * 12 
	var board = new Array(10);
	for (var i = 0; i < board.length; i++) {
		board[i] = new Array(12);
	}
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR everywhere and WALL at edges
			board[i][j] = { type: 'FLOOR', gameElement: null }
			if (i === 0 || j === 0 ||
				i === board.length - 1 || j === board[0].length - 1) {
				board[i][j].type = WALL;
				if (i === 5 || j === 5) {
					board[i][j].type = PASSAGE;
				}
			}
		}
	}
	// Place the gamer
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
	board[8][8].gameElement = BALL;
	gCountBalls++;
	// console.table(board);
	return board;
}

// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j }) // e.g. - cell-3-8

			if (currCell.type === FLOOR) cellClass += ' floor';
			else if (currCell.type === WALL) cellClass += ' wall';
			else if (currCell.type === PASSAGE) cellClass += ' passage';

			strHTML += '\t<td class="cell ' + cellClass + '"  onclick="moveTo(' + i + ',' + j + ')" >\n';

			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}
	// console.log('strHTML is:');
	// console.log(strHTML);
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
	if(isFinished) return;
	if (gIsStuck) return;
	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to ake sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	// if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {
	if (iAbsDiff + jAbsDiff === 1) {
		console.log('Moving to: ', i, j);

		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		renderCell(gGamerPos, '');

		if (targetCell.type === PASSAGE) {
			if (i === 5) j = gBoardLength - 1 - j;
			else if (j === 5) i = gBoardHeight - 1 - i;
		}

		if (targetCell.gameElement === BALL) {
			console.log('Collecting!');
			gAudio.play();
			gCount++;
			var elCountBalls = document.querySelector('.balls');
			elCountBalls.innerText = gCount;
			if(gCountBalls === gCount) stop();
		}

		
		if (targetCell.gameElement === GLUE) {
			gGamerPos.i = i;
			gGamerPos.j = j;
			gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
			stepGlue(gGamerPos);
			setTimeout(() => {
				renderCell(gGamerPos, GAMER_IMG);
			}, 3000);
		}

		else {
			gGamerPos.i = i;
			gGamerPos.j = j;
			gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
			renderCell(gGamerPos, GAMER_IMG);
		}
		// Move the gamer
		

	} else console.log('TOO FAR', iAbsDiff, jAbsDiff);

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {

	var i = gGamerPos.i;
	var j = gGamerPos.j;


	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			moveTo(i + 1, j);
			break;

	}

}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}





function newBalls() {
	var i = getRandomInt(1, gBoard.length - 1);
	var j = getRandomInt(1, gBoard[0].length - 1);
	while (gBoard[i][j].gameElement !== null ){
		var i = getRandomInt(1, gBoard.length - 1);
		var j = getRandomInt(1, gBoard[0].length - 1);
	}
	gBoard[i][j].gameElement = BALL;
	renderCell({ i: i, j: j }, BALL_IMG);
	gCountBalls++;
	console.log(gCountBalls)
}

function newGlue() {
	var i = getRandomInt(1, gBoard.length - 1);
	var j = getRandomInt(1, gBoard[0].length - 1);
	while (gBoard[i][j].gameElement !== null){
		var i = getRandomInt(1, gBoard.length - 1);
		var j = getRandomInt(1, gBoard[0].length - 1);
		
	}
	
	
	gBoard[i][j].gameElement = GLUE;
	renderCell({ i: i, j: j }, GLUE_IMG);
	setInterval(function () {
		renderCell({ i: i, j: j }, null);
	}, 3000);

}

// function checkIfEmpty(i, j) {
// 	if (gBoard[i][j].gameElement === BALL || gBoard[i][j].gameElement === GAMER || gBoard[i][j].gameElement === GLUE) {
// 		return newBalls();
// 	}
// }

function stepGlue(Pos){
	gIsStuck = true;
	renderCell(Pos, GAMER_PUR_IMG);
	setTimeout(() => {
		gIsStuck = false;
	}, 3000);

}




function restart() {
	isFinished = false;
	clearInterval(gIntervalBall);
	clearInterval(gIntervalGlue);
	gCount = 0;
	gCountBalls = 0;
	var elCountBalls = document.querySelector('.balls');
	elCountBalls.innerText = gCount;
	document.querySelector('.finish').innerText = '';
	init();
}

function stop(){
	isFinished = true;
	clearInterval(gIntervalBall);
	clearInterval(gIntervalGlue);
	document.querySelector('.finish').innerText = 'Well done!';
}


function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}