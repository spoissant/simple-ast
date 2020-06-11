export class Token {
    constructor(type, value) {
        this.type = type
        this.value = value
    }
}

function isComma(ch) {
    return (ch === ",")
}

function isOperator(ch) {
    return />|<|=|!|&|\|/.test(ch)
}

function isLeftParenthesis(ch) {
    return (ch === "(")
}

function isRightParenthesis(ch) {
    return (ch === ")")
}

function getTokenType(char) {
    if (isOperator(char)) {
        return "Operator"
    } else if (isLeftParenthesis(char)) {
        return "Left Parenthesis"
    } else if (isRightParenthesis(char)) {
        return "Right Parenthesis"
    } else if (isComma(char)) {
        return "Argument Separator"
    } else {
        return "Literal"
    }
}

export default function tokenize(str) {
    str = str.trim()

    let result = [] // array of tokens

    if(!str){ return result }

    // convert to array of characters
    str = str.split('')

    let previousType = null
    let buffer = ''

    str.forEach((char, idx) => {
        let currentType = getTokenType(char)

        if (previousType !== currentType || previousType === "Left Parenthesis" || previousType === "Right Parenthesis" || previousType === "Argument Separator") {
            const value = buffer.trim()
            if (value.length > 0) 
            { 
                result.push(new Token(previousType, value)) 
            }
            buffer = ''
        }

        buffer += char

        previousType = currentType
    })

    // If buffer is not empty, push the last token into the result
    if (buffer !== '') {
        result.push(new Token(previousType, buffer.trim()))
    }

    return result
}