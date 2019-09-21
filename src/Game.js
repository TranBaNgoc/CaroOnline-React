import React from 'react';
import './style.css';
// import  {DB_CONFIG}  from './firebase'
import firebase from 'firebase/app'
import 'firebase/database'
const MaxHeight = 20;
const MaxWidth = 20;

const userID = Math.random();

const DB_CONFIG = {
  apiKey: "AIzaSyDFKoGN9MKOR_Idc_skJlemhlbpoD-YNms",
  authDomain: "carodb-cb9ca.firebaseapp.com",
  databaseURL: "https://carodb-cb9ca.firebaseio.com",
  projectId: "carodb-cb9ca",
  storageBucket: "",
  messagingSenderId: "69254649593",
  appId: "1:69254649593:web:735917ebdbd1a7bde03428"
};


var value = -1;

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {

  constructor(props) {
    super(props);

    this.app = firebase.initializeApp(DB_CONFIG);
    this.database = this.app.database().ref().child('Room');
    this.clientsRef = this.app.database().ref('Room')

    this.state = {
      squares: Array(400).fill(null),
      isYouNext: true,
      isEnded: false,
    };
  }

  addNote(i) {
    this.database.push().set({ user: userID, position: i });
  }

  componentDidMount(){
    this.clientsRef.on('child_added', snapshot => {
      const client = snapshot.val();
      client.key = snapshot.key;
      console.log(client.position);

      const squares = this.state.squares.slice();
      if (client.user !== userID) {
        squares[client.position] = 'O';
        value = client.position;
        this.setState({
          squares: squares,
          isYouNext: true,
        });
      }

      

    });
  }

  renderSquare(i) {
    return (
      <Square
        value={this.state.squares[i]}
        onClick={() => this.handleClick(i)}
      />
    );
  }

  handleClick(i) {
    const squares = this.state.squares.slice();

    if (this.state.isEnded || squares[i] || !this.state.isYouNext) {
      return;
    }

    this.addNote(i);

    value = i;
    squares[i] = 'X';

    this.setState({
      squares: squares,
      isYouNext: false,
    });
  }

  handleClickReset() {

    this.clientsRef.remove();

    this.setState({
      squares: Array(400).fill(null),
      isYouNext: true,
      isEnded: false,
    });
  }

  render() {

    const winner = calculateWinner(this.state.squares);
    let status;
    if (winner) {
      this.state.isEnded = true;
      status = 'Người chiến thắng là: ' + winner;
    } else {
      status = 'Lượt tiếp theo là: ' + (this.state.isYouNext ? 'X' : 'O');
    }

    let board = [];
    for (let i = 0; i < 20; i++) {
      let rowBoard = [];
      for (let j = 0; j < 20; j++) {
        rowBoard.push(this.renderSquare(i * 20 + j))
      }
      board.push(<div className="board-row">
        {rowBoard}
      </div>)
    }

    const Style = {
      margin: '15px',
      background: '#4CAF50', /* Green */
      border: 'none',
      color: 'white',
      padding: '15px 30px',
    };

    return (
      <div>
        <div className="status">{status}
          <button style={Style} onClick={() => this.handleClickReset()}>Chơi lại</button>
        </div>
        {board}
      </div>

    );
  }
}

class Game extends React.Component {
  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board />
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {

  if (value === -1) {
    return null;
  }

  var row = Math.floor(value / 20);
  var column = value % 20;

  var thisValue = squares[row * 20 + column];
  // Kiểm tra hàng dọc chứa điểm vừa đánh
  for (var index = row - 4; index <= row; index++) {

    // Nếu ô row + index (Ô đầu tiên của dãy 5) nằm ngoài bàn cờ
    if (index < 0) {
      continue;
    }

    // Trường hợp đủ 5 con trong bàn cờ
    var isWon = true;


    for (var i = index; i < index + 5; i++) {

      if (i > MaxHeight - 1) {
        isWon = false;
        break;
      }

      if (squares[i * MaxWidth + column] !== thisValue) {
        isWon = false;
        break;
      }
    }

    if (isWon === true && !isBlock2Ends(squares, "vertical", thisValue === 'X' ? 'O' : 'X')) {
      return thisValue;
    }
  }

  // // Kiểm tra hàng ngang chứa điểm vừa đánh
  for (index = column - 4; index <= column; index++) {

    // Nếu ô column + index (Ô đầu tiên của dãy 5) nằm ngoài bàn cờ
    if (index < 0) {
      continue;
    }

    // Trường hợp đủ 5 con trong bàn cờ
    isWon = true;
    for (i = index; i < index + 5; i++) {

      if (i > MaxWidth - 1) {
        isWon = false;
        break;
      }

      if (squares[row * MaxWidth + i] !== thisValue) {
        isWon = false;
        break;
      }
    }

    console.log('Ô vừa đánh là ' + thisValue);
    if (isWon === true && !isBlock2Ends(squares, "horizontal", thisValue === 'X' ? 'O' : 'X')) {
      return thisValue;
    }
  }

  // // Kiểm tra hàng chéo từ trái qua, trên xuống chứa điểm vừa đánh
  for (index = - 4; index <= 0; index++) {

    // Nếu ô column + index (Ô đầu tiên của dãy 5) nằm ngoài bàn cờ
    if (index + column < 0 || index + row < 0) {
      continue;
    }

    // Trường hợp đủ 5 con trong bàn cờ
    isWon = true;
    for (i = index; i < index + 5; i++) {

      if (i + column > MaxWidth - 1 || i + row > MaxHeight - 1) {
        isWon = false;
        break;
      }

      if (squares[(row + i) * MaxWidth + (column + i)] !== thisValue) {
        isWon = false;
        break;
      }
    }

    if (isWon === true && !isBlock2Ends(squares, "backslash", thisValue === 'X' ? 'O' : 'X')) {
      return thisValue;
    }

  }

  // // Kiểm tra hàng chéo từ trái qua, dưới lên chứa điểm vừa đánh
  for (index = - 4; index <= 0; index++) {

    // Nếu ô column + index (Ô đầu tiên của dãy 5) nằm ngoài bàn cờ
    if (index + column < 0 || row - index > MaxHeight - 1) {
      continue;
    }

    // Trường hợp đủ 5 con trong bàn cờ
    isWon = true;
    for (i = index; i < index + 5; i++) {

      if (i + column > MaxWidth - 1 || row - i < 0) {
        isWon = false;
        break;
      }

      if (squares[(row - i) * MaxWidth + (column + i)] !== thisValue) {
        isWon = false;
        break;
      }
    }

    if (isWon === true && !isBlock2Ends(squares, "slash", thisValue === 'X' ? 'O' : 'X')) {
      return thisValue;
    }

  }

  return null;
}

function isBlock2Ends(squares, type, competitor) {
  var row = Math.floor(value / 20);
  var column = value % 20;
  var hasCompetitor = false;

  switch (type) {

    // Chặn 2 đầu ngang
    case 'horizontal':
      for (var i = column - 1; i >= 0; i--) {
        if (squares[row * MaxWidth + i] === competitor) {
          hasCompetitor = true;
          break;
        }
      }

      if (hasCompetitor) {
        for (i = column + 1; i < MaxWidth; i++) {
          if (squares[row * MaxWidth + i] === competitor) {
            return true;
          }
        }
      } else {
        return false;
      }

      break;

    // Chặn 2 đầu dọc
    case "vertical":
      for (i = row - 1; i >= 0; i--) {
        if (squares[i * MaxWidth + column] === competitor) {
          hasCompetitor = true;
          break;
        }
      }

      if (hasCompetitor) {
        for (i = row + 1; i < MaxHeight; i++) {
          if (squares[i * MaxWidth + column] === competitor) {
            return true;
          }
        }
      } else {
        return false;
      }

      break;

    // Chặn 2 đầu chéo "/"
    case "slash":

      for (i = 1; row + i < MaxHeight - 1 && column - i >= 0; i++) {
        if (squares[(row + i) * MaxWidth + column - i] === competitor) {
          hasCompetitor = true;
          break;
        }
      }

      if (hasCompetitor) {
        for (i = 1; row - i >= 0 && column + i < MaxWidth; i++) {
          if (squares[(row - i) * MaxWidth + column + i] === competitor) {
            return true;
          }
        }
      } else {
        return false;
      }
      break;

    // Chặn 2 đầu chéo "\"
    case "backslash":
      for (i = 1; row - i >= 0 && column - i >= 0; i++) {
        if (squares[(row - i) * MaxWidth + column - i] === competitor) {
          hasCompetitor = true;
          break;
        }
      }

      if (hasCompetitor) {
        for (i = 1; row + i < MaxHeight && column + i < MaxWidth; i++) {
          if (squares[(row + i) * MaxWidth + column + i] === competitor) {
            return true;
          }
        }
      } else {
        return false;
      }
      break;
    default:
      break;
  }

  return false;
}

export default Game;
