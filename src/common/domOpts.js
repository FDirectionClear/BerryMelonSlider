import { capitalize } from './tools'

let vendor = (() => {  // vender : String
	const div = document.createElement('div')
	const transformNames = {
		'webkit': 'webkitTransform',
		'Moz': 'MozTransform',
		'O': 'OTransform',
		'ms': 'msTransform',
		'standard' :'transform'
	}

	for(let key in transformNames) {
		if(typeof div.style[transformNames[key]] !== 'undefined'){
			return key
		}
	}

	return false // 如果返回false说明浏览器压根就不支持transform
})()

// 自动添加适配当前浏览器的厂商前缀
export function prefixStyle (style) { // style : String
	if(vendor === false) {
		return false // 浏览器可能不支持CSS3
	}
	if(vendor === 'standard') {
		return style
	}
	return vendor + capitalize(style)
}

export function isDom (el) {
	const res = 
		(typeof HTMLElement === 'object' ||
		typeof HTMLElement === 'function')
			? (function () {
				return el instanceof HTMLElement
			})()
			: (function () {
				return el &&
					typeof el === 'object' &&
					el.nodeType === 1 &&
					typeof el.nodeName === 'string'
			})()
	return res
}