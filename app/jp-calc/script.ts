
function input() {
    let str = (<HTMLInputElement>document.querySelector("#input")).value;
    
    let lexer = new Lexer(str);
    let tokens = lexer.generate_tokens();
    console.log("Lexer output:", tokens.toString());

    let parser = new Parser(tokens);
    let ast = parser.parse();
    console.log("Parser output:", ast);
    console.log("Eval output:", ast.eval());

    let resultDiv = document.createElement("div");
    resultDiv.classList.add("result");
    
    let inputDiv = document.createElement("div");
    console.log("ast", ast);
    if (typeof (ast as unknown as HtmlObj).html === 'function') {
        let list = (ast as unknown as HtmlObj).html([])
        list.forEach((elem) => {
            inputDiv.append(elem);
        });
    }
    
    let outputDiv = document.createElement("div");
    outputDiv.innerText = 漢数字形式変換(ast.eval());
    

    let resultsDiv = (<HTMLDivElement>document.querySelector("#results"));
    resultDiv.append(inputDiv);
    resultDiv.append(outputDiv);
    resultsDiv.prepend(resultDiv);    
}

function changeTextDir() {
    let main = (<HTMLElement>document.querySelector("main"));
    let checkbox = (<HTMLInputElement>document.querySelector("#checkbox-vertical"));
    if (checkbox.checked) {
        main.classList.add("vertical");
    } else {
        main.classList.remove("vertical");
    }
}

const 零 = 0;
const 一 = 1;
const 二 = 2;
const 三 = 3;
const 四 = 4;
const 五 = 5;
const 六 = 6;
const 七 = 7;
const 八 = 8;
const 九 = 9;
const 十 = 10;
const 百 = 100;
const 千 = 1000;
const 万 = 10000;
const 億 = 1_0000_0000;
const 兆 = 1_0000_0000_0000;

const kanjiDigits = "零一二三四五六七八九";
function kanjiToNumber(str: string) : number {
    
    if (str.length === 1 && str[0] === '零') {
        return 0;
    }

    // Does the count parsing rule.
    let count = function (): number {
        let n = 0;
        
        if (str[0] === '千' || str[1] === '千') {
            n += tens2() * 1000;
            str = str.substring(1, str.length);
        }
        if (str[0] === '百') {
            n += tens2() * 100;
            str = str.substring(1, str.length);
        }
        if (str[0] === '十') {
            n += tens2() * 10;
            str = str.substring(1, str.length);
        }
        if (tens1() > 0) {
            n += tens1();
            str = str.substring(1, str.length);
        }

        return n;
    };

    let tens2 = function(): number {
        let n = 0;

        n = kanjiDigits.indexOf(str[0]);
        if (n == 0 || n == 1) {
            throw new Error("Failed to parse number, got " + str[0] + ": " + str);
        }

        return n;
    }

    let tens1 = function (): number {
        let n = 0;

        n = kanjiDigits.indexOf(str[0]);
        if (n == 0) {
            throw new Error("Failed to parse number, got " + str[0] + ": " + str);
        }

        return n;
    }
    
    let n = 0;

    let nc = count();
    if (str[0] == '兆') {
        if (nc < 1) {
            throw new Error("Failed to parse 兆: " + str);
        }
        n += nc * 1_0000_0000_0000;
        str = str.substring(1, str.length);
        nc = count();
    }
    if (str[0] == '億') {
        if (nc < 1) {
            throw new Error("Failed to parse 億: " + str);
        }
        n += nc * 1_0000_0000_0000;
        str = str.substring(1, str.length);
        nc = count();
    }
    if (str[0] == '万') {
        if (nc < 1) {
            throw new Error("Failed to parse 万: " + str);
        }
        n += nc * 1_0000_0000_0000;
        str = str.substring(1, str.length);
        nc = count();
    }
    if (nc > 0) {
        n += nc;
    }

    if (str.length != 0) {
        throw new Error("Failed to parse, number longer than expected: " + str);   
    }

    return n;
}

function 漢数字形式変換(数) {
    let 文字列 = "";

    if (数 == 零) {
        return '零';
    }
    if (数 < 零) {
        文字列 += '-';
        数 = -数;
    }

    let 何兆 = Math.floor(数 / 兆);
    if (何兆 > 零) {
        文字列 += 漢数字形式変換(何兆) + '兆';
    }
    数 -= 兆 * 何兆;

    let 何億 = Math.floor(数 / 億);
    if (何億 > 零) {
        文字列 += 漢数字形式変換(何億) + '億';
    }
    数 -= 億 * 何億;

    let 何万 = Math.floor(数 / 万);
    if (何万 > 零) {
        文字列 += 漢数字形式変換(何万) + '万';
    }
    数 -= 万 * 何万;

    let 何千 = Math.floor(数 / 千);
    if (何千 > 一) {
        文字列 += 漢数字形式変換(何千) + '千';
    } else if (何千 == 一) {
        文字列 += '千';
    }
    数 -= 千 * 何千;

    let 何百 = Math.floor(数 / 百);
    if (何百 > 一) {
        文字列 += 漢数字形式変換(何百) + '百';
    } else if (何百 == 一) {
        文字列 += '百';
    }
    数 -= 百 * 何百;

    let 何十 = Math.floor(数 / 十);
    if (何十 > 一) {
        文字列 += 漢数字形式変換(何十) + '十';
    } else if (何十 == 一) {
        文字列 += '十';
    }
    数 -= 十 * 何十;

    if (数 > 零) {
        文字列 += kanjiDigits[数];
    }

    return 文字列;
}

/* ===== TOKENISER ===== */

enum TokenType {
    NUMBER,
    PLUS,
    MINUS,
    MULTIPLY,
    DIVIDE,
    LPAREN,
    RPAREN,
}

class Token {
    type: TokenType
    value: any

    constructor(type: TokenType, value: any = null) {
        this.type = type;
        this.value = value;
    }

    toString() {
        return `(${TokenType[this.type]}${this.value === null ? "" : ", " + this.value.toString()})`
    }
}

const WHITESPACE = " 　\n\t";
const DIGITS = "零一二三四五六七八九十百千万億兆";

class Lexer {
    private tokens: Token[];
    private index: number = 0;
    private src: string;
    private char: string;

    constructor(src: string) {
        this.src = src;
        this.next();
    }

    next() {
        this.char = this.src[this.index];
        this.index++;
    }

    generate_tokens() : Token[] {
        if (this.tokens != undefined) {
            return this.tokens;
        }
        
        this.tokens = [];
        while (this.char != undefined) {
            if (WHITESPACE.includes(this.char)) {
                this.next();
            } else if (DIGITS.includes(this.char)) {
                this.generate_number();
            } else if (this.char == "+" || this.char == "＋") {
                this.tokens.push(new Token(TokenType.PLUS));
                this.next();
            } else if (this.char == "-" || this.char == "ー") {
                this.tokens.push(new Token(TokenType.MINUS));
                this.next();
            } else if (this.char == "*" || this.char == "＊") {
                this.tokens.push(new Token(TokenType.MULTIPLY));
                this.next();
            } else if (this.char == "/" || this.char == "／") {
                this.tokens.push(new Token(TokenType.DIVIDE));
                this.next();
            } else if (this.char == "(" || this.char == "（") {
                this.tokens.push(new Token(TokenType.LPAREN));
                this.next();
            } else if (this.char == ")" || this.char == "）") {
                this.tokens.push(new Token(TokenType.RPAREN));
                this.next();
            } else {
                console.error("Unknown character:", this.char);
                return;
            }
        }

        return this.tokens;
    }

    generate_number() {
        let value = this.char;
        this.next()

        while (DIGITS.includes(this.char)) {
            value = value.concat(this.char);
            this.next();
        }

        this.tokens.push(new Token(TokenType.NUMBER, kanjiToNumber(value)))
    }
}

/* ===== ABSTRACT SYNTAX TREE ===== */

interface Eval {
    eval(): any;
}

interface EvalNumber {
    eval(): number | undefined;
}

interface HtmlObj {
    html(list: HTMLElement[]): HTMLElement[];
}

enum BinOp {
    PLUS,
    MINUS,
    MULTIPLY,
    DIVIDE,
}
class NodeBinOp implements EvalNumber, HtmlObj {
    left: EvalNumber;
    right: EvalNumber;
    op: BinOp;

    constructor(left: EvalNumber, right: EvalNumber, op: BinOp) {
        this.left = left;
        this.right = right;
        this.op = op;
    }

    eval(): number {
        let leftValue = this.left.eval();
        let rightValue = this.right.eval();
        switch (this.op) {
            case BinOp.PLUS:
                return leftValue + rightValue;
            case BinOp.MINUS:
                return leftValue - rightValue;
            case BinOp.MULTIPLY:
                return leftValue * rightValue;
            case BinOp.DIVIDE:
                return leftValue / rightValue;
        }
    }

    html(list: HTMLElement[]): HTMLElement[] {

        // Left parenthesis.
        let lspan = document.createElement("span");
        lspan.classList.add("lparen");
        lspan.classList.add("paren");
        lspan.innerHTML = "（";
        list.push(lspan);
        
        // Left operand.
        if (typeof (this.left as unknown as HtmlObj).html === 'function') {
            (this.left as unknown as HtmlObj).html(list);
        }

        // Operator.
        let span = document.createElement("span");
        span.classList.add("op");
        span.classList.add("bin-op");
        switch (this.op) {
            case BinOp.PLUS:
                span.innerHTML = "＋";
                break;
            case BinOp.MINUS:
                span.innerHTML = "ー";
                break;
            case BinOp.MULTIPLY:
                span.innerHTML = "＊";
                break;
            case BinOp.DIVIDE:
                span.innerHTML = "／";
                break;
        }
        list.push(span);

        // Right operand.
        if (typeof (this.right as unknown as HtmlObj).html === 'function') {
            (this.right as unknown as HtmlObj).html(list);
        }

        // Right parenthesis.
        let rspan = document.createElement("span");
        rspan.classList.add("rparen");
        rspan.classList.add("paren");
        rspan.innerHTML = "）";
        list.push(rspan);

        return list;
    }
}

enum UniOp {
    POSITIVE,
    NEGATIVE,
}
class NodeUniOp implements EvalNumber, HtmlObj {
    right: EvalNumber;
    op: UniOp;

    constructor(right: EvalNumber, op: UniOp) {
        this.right = right;
        this.op = op;
    }

    eval(): number {
        let rightValue = this.right.eval();
        switch (this.op) {
            case UniOp.POSITIVE:
                return +rightValue;
            case UniOp.NEGATIVE:
                return -rightValue;
        }
    }

    html(list: HTMLElement[]): HTMLElement[] {

        let span = document.createElement("span");
        span.classList.add("op");
        span.classList.add("uni-op");
        switch (this.op) {
            case UniOp.POSITIVE:
                span.innerHTML = "＋";
                break;
            case UniOp.NEGATIVE:
                span.innerHTML = "ー";
                break;
        }
        list.push(span);

        if (typeof (this.right as unknown as HtmlObj).html === 'function') {
            (this.right as unknown as HtmlObj).html(list);
        }

        return list;
    }
}

class NodeNumber implements EvalNumber, HtmlObj {
    value: number;
    
    constructor(value: number) {
        this.value = value;
    }

    eval(): number {
        return this.value;
    }

    html(list: HTMLElement[]): HTMLElement[] {

        let span = document.createElement("span");
        span.classList.add("number");
        span.innerText = 漢数字形式変換(this.value);
        list.push(span);

        return list;
    }
}

/* ===== PARSER ===== */

class Parser {
    private tokens: Token[];
    private index: number = 0;
    private token: Token;
    private ast: Eval;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.next();
    }

    next() {
        this.token = this.tokens[this.index];
        this.index++;
    }

    parse() : Eval {
        if (this.ast != undefined) {
            return this.ast;
        }

        this.ast = this.expr();

        if (this.token != undefined) {
            console.error(`Syntax error: Parser returned early, index (${this.index}).`)
            return null;
        }

        return this.ast;
    }

    expr() : EvalNumber {
        let ast = this.term();

        while (this.token != undefined && [TokenType.PLUS, TokenType.MINUS].includes(this.token.type)) {

            switch (this.token.type) {
                case TokenType.PLUS:
                    this.next();
                    ast = new NodeBinOp(ast, this.term(), BinOp.PLUS);
                    break;

                case TokenType.MINUS:
                    this.next();
                    ast = new NodeBinOp(ast, this.term(), BinOp.MINUS);
                    break;
            
                default:
                    break;
            }
        }

        return ast;
    }

    term() : EvalNumber {
        let ast = this.factor();

        while (this.token != undefined && [TokenType.MULTIPLY, TokenType.DIVIDE].includes(this.token.type)) {

            switch (this.token.type) {
                case TokenType.MULTIPLY:
                    this.next();
                    ast = new NodeBinOp(ast, this.factor(), BinOp.MULTIPLY);
                    break;

                case TokenType.DIVIDE:
                    this.next();
                    ast = new NodeBinOp(ast, this.factor(), BinOp.DIVIDE);
                    break;

                default:
                    break;
            }
        }

        return ast;
    }

    factor(): EvalNumber {
        let ast = null;
        let cur_token = this.token;

        switch (cur_token.type) {
            case TokenType.NUMBER:
                this.next();
                ast = new NodeNumber(cur_token.value);
                break;
                
            case TokenType.PLUS:
                this.next();
                ast = new NodeUniOp(this.factor(), UniOp.POSITIVE);
                break;

            case TokenType.MINUS:
                this.next();
                ast = new NodeUniOp(this.factor(), UniOp.NEGATIVE);
                break;

            case TokenType.LPAREN:
                this.next();
                ast = this.expr();
                if (this.token.type !== TokenType.RPAREN) {
                    console.error(`Syntax error: Right bracket expected at (${this.index})`);
                    return null;
                }
                this.next();
                break;
            
            default:
                break;
        }
        
        return ast;
    }
}