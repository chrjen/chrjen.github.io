function input() {
    let str = document.querySelector("#input").value;
    let lexer = new Lexer(str);
    lexer.generate_tokens();
    console.log("Lexer output:", lexer.tokens.toString());
}
/* ===== TOKENISER ===== */
var TokenType;
(function (TokenType) {
    TokenType[TokenType["NUMBER"] = 0] = "NUMBER";
    TokenType[TokenType["PLUS"] = 1] = "PLUS";
    TokenType[TokenType["MINUS"] = 2] = "MINUS";
    TokenType[TokenType["MULTIPLY"] = 3] = "MULTIPLY";
    TokenType[TokenType["DIVIDE"] = 4] = "DIVIDE";
    TokenType[TokenType["LPAREN"] = 5] = "LPAREN";
    TokenType[TokenType["RPAREN"] = 6] = "RPAREN";
})(TokenType || (TokenType = {}));
class Token {
    constructor(type, value = null) {
        this.type = type;
        this.value = value;
    }
    toString() {
        return `(${TokenType[this.type]}${this.value === null ? "" : ", " + this.value.toString()})`;
    }
}
const WHITESPACE = " 　\n\t";
const DIGITS = "零一二三四五六七八九十百千万億兆";
class Lexer {
    constructor(src) {
        this.tokens = [];
        this.index = 0;
        this.src = src;
        this.next();
    }
    next() {
        this.char = this.src[this.index];
        this.index++;
    }
    generate_tokens() {
        while (this.char != undefined) {
            if (WHITESPACE.includes(this.char)) {
                this.next();
            }
            else if (DIGITS.includes(this.char)) {
                this.generate_number();
            }
            else if (this.char == "+" || this.char == "＋") {
                this.tokens.push(new Token(TokenType.PLUS));
                this.next();
            }
            else if (this.char == "-" || this.char == "ー") {
                this.tokens.push(new Token(TokenType.MINUS));
                this.next();
            }
            else if (this.char == "*" || this.char == "＊") {
                this.tokens.push(new Token(TokenType.MULTIPLY));
                this.next();
            }
            else if (this.char == "/" || this.char == "／") {
                this.tokens.push(new Token(TokenType.DIVIDE));
                this.next();
            }
            else if (this.char == "(" || this.char == "（") {
                this.tokens.push(new Token(TokenType.LPAREN));
                this.next();
            }
            else if (this.char == ")" || this.char == "）") {
                this.tokens.push(new Token(TokenType.RPAREN));
                this.next();
            }
            else {
                console.error("Unknown character:", this.char);
                return;
            }
        }
    }
    generate_number() {
        let value = this.char;
        this.next();
        while (DIGITS.includes(this.char)) {
            value = value.concat(this.char);
            this.next();
        }
        this.tokens.push(new Token(TokenType.NUMBER, value));
    }
}
//# sourceMappingURL=script.js.map