class Ghost {
  constructor(
    x,
    y,
    width,
    height,
    speed,
    imageX,
    imageY,
    imageWidth,
    imageHeight,
    range
  ) {
    // Inicializa as propriedades do fantasma com os valores fornecidos
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.direction = DIRECTION_RIGHT; // Direção inicial do fantasma
    this.imageX = imageX;
    this.imageY = imageY;
    this.imageHeight = imageHeight;
    this.imageWidth = imageWidth;
    this.range = range; // Alcance de visão do fantasma
    this.randomTargetIndex = parseInt(Math.random() * 4); // Índice de alvo aleatório
    this.target = randomTargetsForGhosts[this.randomTargetIndex]; // Define o alvo inicial do fantasma
    this.path = []; // Inicializa o caminho do fantasma como um array vazio
    this.pathDebug = [];
    // Configura um temporizador para alterar aleatoriamente a direção do fantasma
    setInterval(() => {
      this.changeRandomDirection();
    }, 10000);
  }

  updatePathToPacman(pacman) {
    let start = {
      x: Math.floor(this.x / oneBlockSize),
      y: Math.floor(this.y / oneBlockSize),
    };
    let end = {
      x: Math.floor(pacman.x / oneBlockSize),
      y: Math.floor(pacman.y / oneBlockSize),
    };
    this.path = this.findPath(map, start, end);
  }

  // Função para encontrar o caminho utilizando BFS para armazenar o array de caminhos
  findPath(map, start, end) {
    let queue = [];
    let visited = new Set();
    let parent = {};
    let directions = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];

    queue.push(start);
    visited.add(`${start.x},${start.y}`);
    parent[`${start.x},${start.y}`] = null;

    while (queue.length > 0) {
      let current = queue.shift();

      if (current.x === end.x && current.y === end.y) {
        let path = [];
        while (current) {
          path.push(current);
          current = parent[`${current.x},${current.y}`];
        }
        //TODO: Comente isso para remover o console.log
        console.log(
          "Path BFS Ghost: ", path
        );
        return path.reverse();
      }

      for (let direction of directions) {
        let neighbor = {
          x: current.x + direction.x,
          y: current.y + direction.y,
        };
        if (
          neighbor.x >= 0 &&
          neighbor.x < map[0].length &&
          neighbor.y >= 0 &&
          neighbor.y < map.length &&
          map[neighbor.y][neighbor.x] !== 1 &&
          !visited.has(`${neighbor.x},${neighbor.y}`)
        ) {
          queue.push(neighbor);
          visited.add(`${neighbor.x},${neighbor.y}`);
          parent[`${neighbor.x},${neighbor.y}`] = current;
        }
      }
    }

    return [];
  }

  // Aqui inicia-se a implementação do algoritmo de BFS
  // Verifica se o Pacman está dentro do alcance de visão do fantasma
  isInRange() {
    let xDistance = Math.abs(pacman.getMapX() - this.getMapX());
    let yDistance = Math.abs(pacman.getMapY() - this.getMapY());
    if (
      Math.sqrt(xDistance * xDistance + yDistance * yDistance) <= this.range
    ) {
      return true;
    }
    return false;
  }

  // Altera aleatoriamente a direção do fantasma
  changeRandomDirection() {
    let addition = 1;
    this.randomTargetIndex += addition;
    this.randomTargetIndex = this.randomTargetIndex % 4;
  }

  // Processa o movimento do fantasma
  moveProcess() {
    // Verifica se o Pacman está dentro do alcance
    if (this.isInRange()) {
      this.target = pacman; // Define o Pacman como alvo
    } else {
      this.target = randomTargetsForGhosts[this.randomTargetIndex]; // Define um alvo aleatório
    }
    // Calcula e ajusta a direção do movimento
    this.changeDirectionIfPossible();
    // Move o fantasma para frente
    this.moveForwards();
    // Verifica colisões e move o fantasma para trás se necessário
    if (this.checkCollisions()) {
      this.moveBackwards();
      // Se houver colisão, mude a direção aleatoriamente para tentar evitar ficar preso
      this.changeRandomDirection();
      return;
    }
  }

  // Move o fantasma para trás
  moveBackwards() {
    switch (this.direction) {
      case 4: // Direita
        this.x -= this.speed;
        break;
      case 3: // Cima
        this.y += this.speed;
        break;
      case 2: // Esquerda
        this.x += this.speed;
        break;
      case 1: // Baixo
        this.y -= this.speed;
        break;
    }
  }

  // Move o fantasma para frente
  moveForwards() {
    switch (this.direction) {
      case 4: // Direita
        this.x += this.speed;
        break;
      case 3: // Cima
        this.y -= this.speed;
        break;
      case 2: // Esquerda
        this.x -= this.speed;
        break;
      case 1: // Baixo
        this.y += this.speed;
        break;
    }
  }

  // Verifica se há colisões com as paredes
  checkCollisions() {
    let isCollided = false;
    if (
      map[parseInt(this.y / oneBlockSize)][parseInt(this.x / oneBlockSize)] ==
        1 ||
      map[parseInt(this.y / oneBlockSize + 0.9999)][
        parseInt(this.x / oneBlockSize)
      ] == 1 ||
      map[parseInt(this.y / oneBlockSize)][
        parseInt(this.x / oneBlockSize + 0.9999)
      ] == 1 ||
      map[parseInt(this.y / oneBlockSize + 0.9999)][
        parseInt(this.x / oneBlockSize + 0.9999)
      ] == 1
    )
      isCollided = true;
    return isCollided;
  }

  // Altera a direção de movimento se possível
  changeDirectionIfPossible() {
    let tempDirection = this.direction;
    // Calcula a nova direção de acordo com o alvo
    this.direction = this.calculateNewDirection(
      map,
      parseInt(this.target.x / oneBlockSize),
      parseInt(this.target.y / oneBlockSize)
    );

    this.findPath(
      map,
      parseInt(this.target.x / oneBlockSize),
      parseInt(this.target.y / oneBlockSize)
    );
    if (typeof this.direction == "undefined") {
      this.direction = tempDirection;
      return;
    }
    // Verifica se é necessário ajustar a direção para evitar colisões
    if (
      this.getMapY() != this.getMapYRightSide() &&
      (this.direction == DIRECTION_LEFT || this.direction == DIRECTION_RIGHT)
    ) {
      this.direction = DIRECTION_UP;
    }
    if (
      this.getMapX() != this.getMapXRightSide() &&
      this.direction == DIRECTION_UP
    ) {
      this.direction = DIRECTION_LEFT;
    }
    // Move o fantasma para frente e verifica colisões
    this.moveForwards();
    if (this.checkCollisions()) {
      this.moveBackwards();
      this.direction = tempDirection;
    } else {
      this.moveBackwards();
    }
  }

  // Calcula a nova direção de movimento usando busca em largura
  calculateNewDirection(map, destX, destY) {
    let mp = map.map((row) => row.slice());

    let queue = [
      {
        x: this.getMapX(),
        y: this.getMapY(),
        rightX: this.getMapXRightSide(),
        rightY: this.getMapYRightSide(),
        moves: [],
      },
    ];
    while (queue.length > 0) {
      let poped = queue.shift();
      if (poped.x == destX && poped.y == destY) {
        //TODO: Comente isso para remover o console.log
        console.log(
          "Path BFS Direção: ",
          (this.pathDebug = poped.moves.slice())
        );
        return poped.moves[0];
      } else {
        mp[poped.y][poped.x] = 1;
        let neighborList = this.addNeighbors(poped, mp);
        for (let i = 0; i < neighborList.length; i++) {
          queue.push(neighborList[i]);
        }
      }
    }

    return 1; // direção
  }

  // Adiciona vizinhos à fila de busca
  addNeighbors(poped, mp) {
    let queue = [];
    let numOfRows = mp.length;
    let numOfColumns = mp[0].length;

    if (
      poped.x - 1 >= 0 &&
      poped.x - 1 < numOfRows &&
      mp[poped.y][poped.x - 1] != 1
    ) {
      let tempMoves = poped.moves.slice();
      tempMoves.push(DIRECTION_LEFT);
      queue.push({ x: poped.x - 1, y: poped.y, moves: tempMoves });
    }
    if (
      poped.x + 1 >= 0 &&
      poped.x + 1 < numOfRows &&
      mp[poped.y][poped.x + 1] != 1
    ) {
      let tempMoves = poped.moves.slice();
      tempMoves.push(DIRECTION_RIGHT);
      queue.push({ x: poped.x + 1, y: poped.y, moves: tempMoves });
    }
    if (
      poped.y - 1 >= 0 &&
      poped.y - 1 < numOfColumns &&
      mp[poped.y - 1][poped.x] != 1
    ) {
      let tempMoves = poped.moves.slice();
      tempMoves.push(DIRECTION_UP);
      queue.push({ x: poped.x, y: poped.y - 1, moves: tempMoves });
    }
    if (
      poped.y + 1 >= 0 &&
      poped.y + 1 < numOfColumns &&
      mp[poped.y + 1][poped.x] != 1
    ) {
      let tempMoves = poped.moves.slice();
      tempMoves.push(DIRECTION_BOTTOM);
      queue.push({ x: poped.x, y: poped.y + 1, moves: tempMoves });
    }
    return queue;
  }

  // Retorna a coordenada x do mapa do fantasma
  getMapX() {
    let mapX = parseInt(this.x / oneBlockSize);
    return mapX;
  }

  // Retorna a coordenada y do mapa do fantasma
  getMapY() {
    let mapY = parseInt(this.y / oneBlockSize);
    return mapY;
  }

  // Retorna a coordenada x do mapa do lado direito do fantasma
  getMapXRightSide() {
    let mapX = parseInt((this.x * 0.99 + oneBlockSize) / oneBlockSize);
    return mapX;
  }

  // Retorna a coordenada y do mapa do lado direito do fantasma
  getMapYRightSide() {
    let mapY = parseInt((this.y * 0.99 + oneBlockSize) / oneBlockSize);
    return mapY;
  }

  getSpeed() {
    return this.speed;
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  // Desenha o fantasma no canvas
  draw() {
    canvasContext.save();
    canvasContext.drawImage(
      ghostFrames,
      this.imageX,
      this.imageY,
      this.imageWidth,
      this.imageHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
    canvasContext.restore();
    // Desenha um círculo de alcance de visão do fantasma no canvas
    canvasContext.beginPath();
    canvasContext.strokeStyle = "red";
    canvasContext.arc(
      this.x + oneBlockSize / 2,
      this.y + oneBlockSize / 2,
      this.range * oneBlockSize,
      0,
      2 * Math.PI
    );
    canvasContext.stroke();
  }
}

// Função para atualizar todos os fantasmas
let updateGhosts = () => {
  ghosts.forEach((ghost) => {
    ghost.updatePathToPacman(pacman);
    ghost.moveProcess();
  });
};

// Função para desenhar todos os fantasmas
let drawGhosts = () => {
  ghosts.forEach((ghost) => ghost.draw());
};
