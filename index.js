class Lexer {
  get patterns() {
    return {
      'whitespace': '\\s+',
      'type': 'int',
      'assign': '=',
      'identity': '[a-z]+',
      'value': '[0-9]+'
    };
  }
  
  analyse(code = '') {
    const tokens = [];
    
    let length = code.length;
    while (true) {
      for (let key in this.patterns) {
        const pattern = new RegExp(`^(${this.patterns[key]})`);

        const matches = code.match(pattern);
      
        if (matches) {
          tokens.push([
            key, matches[1]
          ]);
        
          code = code.substring(matches[1].length);
        }
      }
      
      if (length === code.length) {
        break;
      }
    }
    
    return {
      tokens,
      code
    };
  }
}

const lexer = new Lexer();
const { tokens } = lexer.analyse(`
int minutes = 90;
`);

class Definition {
  constructor(type, identity, value) {
    this.type = type;
    this.identity = identity;
    this.value = value;
  }
  
  applyTo(context = {}) {
    if (context[this.identity]) {
      throw new Error(`${this.identity} is already defined`);
    }
    if (!(this.type === 'int' && this.value.match(/[0-9]+/))) {
      throw new Error(`${this.identity} cannot be ${this.value}`);
    } else {
      context[this.identity] = parseInt(this.value, 10);
    }
    return context;
  }
}

class Parser {
  
  analyse(tokens = []) {
    tokens = tokens.filter(token => token[0] !== 'whitespace');
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token[0] === 'assign') {
        if (i > 1 && tokens[i - 2][0] === 'type') {
          tokens.splice(i - 2, 4, [
            'definition', [
              tokens[i - 2][1],
              tokens[i - 1][1],
              tokens[i + 1][1],
            ]
          ]);
          i = 0;
        } else {
          throw new Error('Syntax error, type not defined');
        }
      }
      
      if (tokens[i][0] === 'definition') {
        tokens.splice(i, 1, new Definition(...tokens[i][1]));
        i = 0;
      }
    }
    return tokens;
  }
}

const parser = new Parser();
const objects = parser.analyse(tokens);


class Interpreter {
  analyse(objects = [], context = {}) {
    for (let i = 0; i < objects.length; i++) {
      context = objects[i].applyTo(context);
    }
    
    return context;
  }
}

const interpreter = new Interpreter();
const result = interpreter.analyse(objects);

console.log(objects, result);
