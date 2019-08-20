export function capitalize(str) {
	// 如果str是undefined返回空字符串
	if(typeof str === 'undefined') {
		return ''
	}
	// 如果str的第一个不是小写字母就返回str
	if(str.search(/^[a-z]/) === -1) {
		return str
	}
	return str.slice(0,1).toUpperCase() + str.slice(1)
}

export function handleError (msg) {
    throw new Error(msg)
}