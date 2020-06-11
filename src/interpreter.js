// **
// * This is a simplified version of the interpreter used in twwstats.com
// **

function isNumber(value) {
    return value === +value
}

const booleanOperators = [
    "&&",
    "&",
    "||",
    "|",
]

const comparisonOperators = [
    ">",
    ">=",
    "<",
    "<=",
    "<=",
    "=",
    "!=",
    "==",
]

const aggregateWithAndOperators = [
    ">",
    ">=",
    "<",
    "<=",
    "<=",
    "!=",
]

function getNodeType(node) {
    if (booleanOperators.indexOf(node.token) !== -1) { return 'boolean' }
    else if (comparisonOperators.indexOf(node.token) !== -1) { return 'comparison' }
    else if (Array.isArray(node.token)) { return 'literalArray' }
    return 'literal'
}

function booleanOperation(op, left, right, obj) {
    switch (op) {
        case "&&":
        case "&":
            return processNode(left, obj) && processNode(right, obj)
        case "||":
        case "|":
            return processNode(left, obj) || processNode(right, obj)
        default:
            return true
    }
}

function compareOperation(op, left, right, obj) {
    const field = left.token

    // Technically compareOperations are always leaves so assume left and right nodes are literals
    let val = obj[field]
    val = val === '' ? null : val

    if (Array.isArray(right.token)) {
        return right.token.reduce((result, t) => {
            if(aggregateWithAndOperators.indexOf(op) !== -1){
                return result && doCompare(op, val, t && t.toLowerCase())
            }
            else{
                return result || doCompare(op, val, t && t.toLowerCase())
            }
        }, aggregateWithAndOperators.indexOf(op) !== -1)
    }

    let target = right.token && right.token.toLowerCase()
    return doCompare(op, val, target)
}

function doCompare(op, val, target) {
    target = target === 'true' ? '1' : target === 'false' ? '0' : (target === 'null' || target === '') ? null : target

    if (isNumber(val)) {
        val = parseInt(val * 100, 10) / 100
        target = parseInt(target * 100, 10) / 100
    }

    switch (op) {
        case ">":
            return val > target
        case ">=":
            return val >= target
        case "<":
            return val < target
        case "<=":
            return val <= target
        case "=":
            if (val === null && target === null) { return true }
            if (isNumber(val)) { return val === target }
            else { return val && val.indexOf(target) !== -1 }
        case "==":
            if (val === null && target === null) { return true }
            if (isNumber(val)) { return val === target }
            else { return val === target }
        case "!=":
            if (isNumber(val)) { return val !== target }
            else if ((val === null && target !== null) || (val !== null && target === null)) { return true }
            else { return val && val.indexOf(target && target) === -1 }
        default:
            return true
    }
}

// This is a very basic filter that checks for instance of the provided text in ANY of the object's properties
function textFilter(text, obj) {
    let pass = false
    for(const prop in obj) {
        let val = obj[prop]
        if(typeof val === 'object') { pass != textFilter(text, val)}
        else {pass |= val.toLowerCase().includes(text.toLowerCase())}
    }

    return pass
}

// apply the ast to the provided object and return TRUE if it matches and FALSE if it does not
export default function filter(node, obj) {
    try {
        if (!node || node.error) { return false } // This node previously threw an execption meaning the user probably entered an invalid query so ignore it silently

        const nodeType = getNodeType(node)
        if (nodeType === 'boolean') { return booleanOperation(node.token, node.left, node.right, obj) }
        else if (nodeType === 'comparison') { return compareOperation(node.token, node.left, node.right, obj) }
        else if (nodeType === 'literalArray') { return node.token.reduce((result, t) => result || textFilter(t, obj), false) }
        else { return textFilter(node.token, obj) }
    }
    catch (error) {
        node.error = true
        console.log(`Node '${node.token}' with left: '${node.left && node.left.token}' and right: '${node.right && node.right.token}' error: ${error}`)
    }
}