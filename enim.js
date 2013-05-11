/*
  ===============================
  ==          mine.js          ==
  ==  Minesweeper by Icyblade  ==
  ==     DFS +  Flood Fill     ==
  ===============================
*/

/* 数组及其定义 */
var board = [];
var empty = 0;
var mine = 1;
var viewed = 2;
var flagged = 3;
var flaggedMine = 4;

/* 8个方向 */
var deltaX = [-1, -1, -1,  0,  0,  1,  1,  1 ];
var deltaY = [-1,  0,  1, -1,  1, -1,  0,  1 ];

/* 图片 */
var path = './resources/';
var emptyPic = path+'empty.png';
var minePic = path+'mine.png';
var viewedPic = path+'viewed.png';
var flagPic = path+'flaged.png';
var hintPic = path+'viewed.png';
var curPic = path+'current.png';

/* 棋盘规模及雷数 */
var column = 30;
var row = 16;
var size = 30;
var mineNum = 10;
var statusBarHeight = 20;

var started = false;                       // 记录是否已经开始游戏
var rest = column * row - mineNum;
var flaggedNum = 0;

function getBlock(x, y) {                  // 防溢出
    if (x < 0 || x >= row || y < 0 || y >= column)
        return -1;
    return board[x][y];
}

function getIndex(x, y) {                  // 获取 board 数组中对应的标号，继续防溢出
    if (x < 0 || x >= row || y < 0 || y >= column)
        return -1;
    return x * column + y;
}

var clickedSeq = [];
var curDisplayed = 0;

function displayNext() {
    curDisplayed++;
    if (curDisplayed >= clickedSeq.length) return;
    clicked(clickedSeq[curDisplayed]);
    repeater.itemAt(clickedSeq[curDisplayed]).value = curPic;
    timerClrCur.start();
}

function clearCur() {
    var x = Math.floor(clickedSeq[curDisplayed] / column);
    var y = clickedSeq[curDisplayed] % column;
    if (board[x][y] == mine) {
        repeater.itemAt(clickedSeq[curDisplayed]).value = minePic;
    } else if (board[x][y] == empty){
        repeater.itemAt(clickedSeq[curDisplayed]).value = emptyPic;
    } else if (board[x][y] == flagged || board[x][y] == flaggedMine) {
        repeater.itemAt(clickedSeq[curDisplayed]).value = flagPic;
    } else {
        repeater.itemAt(clickedSeq[curDisplayed]).value = viewedPic;
    }
}

function init(index) {                     // 初始化，index 带入 init 防止第一次就-踩到雷-
    flaggedNum = 0;
    status.text = "剩余雷数: "+(mineNum - flaggedNum);

    /* 把 board 和界面图片全部初始化为 empty */
    for (var i = 0; i < row; i++) {
        board[i] = [];
        for (var j = 0; j < column; j++) {
            board[i][j] = empty;
            repeater.itemAt(getIndex(i, j)).value = emptyPic;
        }
    }

    /* 随机生成雷记录进 board */
    for (var i = 0; i < mineNum; i++) {
        var x, y;
        do {
            x = Math.floor(Math.random() * row);
            y = Math.floor(Math.random() * column);
        } while ((board[x][y] == mine) || (getIndex(x, y) == index))

        board[x][y] = mine;
        //repeater.itemAt(getIndex(x, y)).value = minePic;
    }
}

function clicked(index) {                  // 点击事件
    if (!started) {
        init(index);
        started = true;
    }

    if (index == -1) return;

    /* 获取 index 对应的横纵坐标 */
    var x = Math.floor(index / column);
    var y = index % column;

    if (x < 0 || x > row || y < 0 || y > column)
        return;

    if (board[x][y] == mine) {
        console.log("BOMB!");

        /* 爆了后显示出所有的雷 */
        for (var i = 0; i < row; i++) {
            for (var j = 0; j < column; j++) {
                if (board[i][j] == mine)
                    repeater.itemAt(getIndex(i, j)).value = minePic;
            }
        }

        repeater.acceptMouse = false;       // 禁止鼠标操作
        return;
    }

    if (board[x][y] != empty) return;       // <=> board[x][y] == flagged || flaggedMine || viewed

    board[x][y] = viewed;
    rest--;

    if (rest == 0) {
        console.log("Win!");
        repeater.acceptMouse = false;
    }

    var cnt = 0;                            // 记录当前 block 点出来的数字
    for (var d = 0; d < 8; d++) {
        var value = getBlock(x + deltaX[d], y + deltaY[d]);
        if (value == mine || value == flaggedMine)
            cnt++;
    }

    if (cnt != 0) {
        repeater.itemAt(getIndex(x, y)).value = path+cnt+".png";
    } else {
        repeater.itemAt(getIndex(x, y)).value = viewedPic;
        for (var d = 0; d < 8; d++) {
            clickedSeq.push(getIndex(x + deltaX[d], y + deltaY[d]));
        }
    }
}

function flag(index) {                  // 插旗事件
    var x = Math.floor(index / column);
    var y = index % column;
    if (board[x][y] == empty) {
        board[x][y] = flagged;
        repeater.itemAt(index).value = flagPic;
        flaggedNum++;
        status.text = "剩余雷数: "+Math.abs(mineNum - flaggedNum);
    } else if (board[x][y] == mine) {
        board[x][y] = flaggedMine;
        repeater.itemAt(index).value = flagPic;
        flaggedNum++;
        status.text = "剩余雷数: "+Math.abs(mineNum - flaggedNum);
    } else if (board[x][y] == flagged) {
        board[x][y] = empty;
        repeater.itemAt(index).value = emptyPic;
        flaggedNum--;
        status.text = "剩余雷数: "+Math.abs(mineNum - flaggedNum);
    } else if (board[x][y] == flaggedMine) {
        board[x][y] = mine;
        repeater.itemAt(index).value = emptyPic;
        flaggedNum--;
        status.text = "剩余雷数: "+Math.abs(mineNum - flaggedNum);
    }
}

var hintArr = [];

function hint(index) {                  // 双击点一片事件
    var x = Math.floor(index / column);
    var y = index % column;

    if (board[x][y] != viewed) return;

    var flagCnt = 0, mineCnt = 0;       // 记录当前 block 周围8个格子X7的数目和雷的数目
    for (var d = 0; d < 8; d++) {
        var value = getBlock(x + deltaX[d], y + deltaY[d]);
        if (value == flagged || value == flaggedMine)
            flagCnt++;
        if (value == mine || value == flaggedMine)
            mineCnt++;
    }

    if (mineCnt == flagCnt)  {
        for (var d = 0; d < 8; d++)
            clicked(getIndex(x + deltaX[d], y + deltaY[d]));
    } else {                            // 如果雷数和X7数不等，进入 hint
        for (var d = 0; d < 8; d++) {
            var index = getIndex(x + deltaX[d], y + deltaY[d]);
            var value = getBlock(x + deltaX[d], y + deltaY[d]);
            if (value == empty || value == mine) {
                repeater.itemAt(index).value = hintPic;
                hintArr.push(index);
            }
        }
        repeater.acceptMouse = false;       // 禁止鼠标操作
        timer.start();
    }
}

function clearHint() {                  // 删掉双击后出来的东西
    for (var i = 0; i < hintArr.length; i++)
        repeater.itemAt(hintArr[i]).value = emptyPic;
    hintArr.length = 0;
    repeater.acceptMouse = true;       // 启用鼠标操作
}
