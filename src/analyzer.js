import tokenize, { Token } from "./tokenizer"

class ASTNode {
    constructor(token, left, right) {
        this.token = token
        this.left = left
        this.right = right
    }
}

export default function analyze(str) {
    if (!str || !str.trim()) { return [] }

    const assoc = {
        ">": "left",
        ">=": "left",
        "<": "left",
        "<=": "left",
        "=": "left",
        "!=": "left",
        "==": "left",
        "&&": "left",
        "&": "left",
        "||": "left",
        "|": "left",
    }

    const prec = {
        ">": 10,
        ">=": 10,
        "<": 10,
        "<=": 10,
        "=": 10,
        "!=": 10,
        "==": 10,
        // "and": 5,
        "&&": 5,
        "&": 5,
        // 'or': 4,
        "||": 4,
        "|": 4,
    }

    Token.prototype.precedence = function () {
        return prec[this.value]
    }

    Token.prototype.associativity = function () {
        return assoc[this.value]
    }

    function peek(array) {
        return array.slice(-1)[0] //retrieve the last element of the array
    }

    function addNode(array, operatorToken) {
        let right = array.pop()
        let left = array.pop()
        array.push(new ASTNode(operatorToken.value, left, right))
    }

    var outStack = []
    var opStack = []
    var literalArray = []

    var tokens = tokenize(str)

    tokens.forEach(function (v) {
        //If the token is a Literal
        if (v.type === "Literal") {
            if (peek(opStack) && (peek(opStack).type === "Argument Separator" || peek(opStack).type === "Left Parenthesis")) {
                literalArray.push(v.value)
                if (peek(opStack).type === "Argument Separator") { opStack.pop() }
            }
            else {
                outStack.push(new ASTNode(v.value, null, null))
            }
        }
        //If the token is a argument separator 
        else if (v.type === "Argument Separator") {
            //Until the token at the top of the stack is a left parenthesis
            //pop operators off the stack onto the output queue.
            while (peek(opStack)
                && peek(opStack).type !== "Left Parenthesis") {
                addNode(outStack, opStack.pop())
            }
            if (opStack.length === 0) {
                console.log("Mismatched parentheses")
                return
            }

            opStack.push(v)
        }
        //If the token is an operator, o1, then:
        else if (v.type === "Operator") {
            // When we find a literal after a parenthesis we assume we're dealing with a list of
            // literals but if an operator follows we revert back to the default behavior
            if(literalArray.length > 0) {
                outStack.push(new ASTNode(literalArray[0], null, null))
                literalArray = []
            }

            //while there is an operator token o2, at the top of the operator stack and either
            while (peek(opStack) && (peek(opStack).type === "Operator")
                //o1 is left-associative and its precedence is less than or equal to that of o2, or
                && ((v.associativity() === "left" && v.precedence() <= peek(opStack).precedence())
                    //o1 is right associative, and has precedence less than that of o2,
                    || (v.associativity() === "right" && v.precedence() < peek(opStack).precedence()))) {
                addNode(outStack, opStack.pop())
            }
            //at the end of iteration push o1 onto the operator stack
            opStack.push(v)
        }

        //If the token is a left parenthesis (i.e. "("), then push it onto the stack.
        else if (v.type === "Left Parenthesis") {
            opStack.push(v)
            literalArray = []
        }
        //If the token is a right parenthesis (i.e. ")"):
        else if (v.type === "Right Parenthesis") {
            if (peek(opStack) && peek(opStack).type === "Argument Separator") {
                // Ignore lonely commas
                opStack.pop()
            }

            // Store the literal array
            if (literalArray.length > 0) {
                outStack.push(new ASTNode(literalArray, null, null))
                literalArray = []
            }

            //Until the token at the top of the stack is a left parenthesis, pop operators off the stack onto the output queue.
            while (peek(opStack)
                && peek(opStack).type !== "Left Parenthesis") {
                addNode(outStack, opStack.pop())
            }
            if (opStack.length === 0) {
                console.log("Unmatched parentheses")
                return
            }
            //Pop the left parenthesis from the stack, but not onto the output queue.
            opStack.pop()

            //If the token at the top of the stack is an operator token, pop it onto the output queue.
            if (peek(opStack) && peek(opStack).type === "Operator") {
                addNode(outStack, opStack.pop())
            }
        }
    })

    while (peek(opStack)) {
        addNode(outStack, opStack.pop())
    }

    return outStack.pop()
}

