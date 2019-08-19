<template>
    <div class = "container">
        <div class = "wrapper" ref = "wrapper">
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    created () {
        // 无需defineReactive，放在created中即可
        this.timer = 0
        this.moved = Promise.resolve(true)  // 当前wrapper的过渡状态，是一个promise实例
    },
    data () {
        return {
            index: 1 ,// 初始index为1
            autoPlaying: true
        }
    },
    props: {
        direction: {
            type: String,
            default: 'rtl'  // 轮播方向默认为从右到左
        },
        duration: {
            type: Number,
            default: 2500  // 轮播间隔时间默认为2500s
        }
    },
    methods: {
        init () {
            const wrapper = this.$refs.wrapper
            if(!wrapper) {
                // 如果当前wrapper还没有被挂载，就抛出错误
                this.wrapper = null
                this._handleError(`wrapper dosn't exit, init Slider Error`)
            }
            // 获取轮播图的滚动单位距离
            this.wrapper = wrapper
            this.gap = window.innerWidth  
           
            const children = wrapper.children
            if(!children.length <= 1) {
               // 如果当前图片大于1，则启动轮播，否则退化为简单的图片展示
                const clone_first = wrapper.firstElementChild.cloneNode(true),
                          clone_last = wrapper.lastElementChild.cloneNode(true)
                wrapper.insertBefore(clone_last, children[0])
                wrapper.appendChild(clone_first, children[children.length - 1])
                // 开始先瞬间滚动到索引为1的图片
                this.scrollTo(1, 0)
                // 由于传入的direction随时变化，并且计时器将多次执行，顾柯里化一次性选出合适的callback来减少多余判断。
                this._createAutoScrollCallBackFunction()
                this.autoScroll()
            }
            return true
        },
        scrollTo (index, time = .5) {
            if(typeof index !== 'number' || typeof time !== 'number') {
                this._handleError(
                    `scrollTo: ${index} or ${time} is a invalid param, please use Number value!`
                )
            }
            const wrapper = this.wrapper
            if(time !== 0) {
                this._setTranstion(undefined, undefined, time)
                wrapper.style['transform'] = `translateX(${-this.gap * index}px)`
                this.moved = new Promise(resolve => {
                    wrapper.addEventListener('transitionend', () => {
                        resolve(true) // 过渡结束，返回true
                    })
                })
            } else {
                // 如果无过渡时间，则瞬间滚动到索引位置
                this._clearTransition()
                wrapper.style['transform'] = `translateX(${-this.gap * index}px)`
                this.moved = Promise.resolve(true)
            }
        },
        autoScroll () {
            this.autoPlaying = true
            this.timer = setInterval(this.cb, this.duration)
        },
        _handleError (msg) {
            throw new Error(msg)
        },
        _setTranstion (el = this.wrapper, pro = `all`, time = .5) {
            if(!this._isDom(el)) {
                this._handleError(
                    `${el} is not a dom Element, please check if it is null ?`
                )
            }
            el.style.setProperty('transition', `${pro} ${time}s`)
        },
        _clearTransition (el = this.wrapper) {
            // 清除所有transition属性
            if(!this._isDom(el)) {
                this._handleError(
                    `${el} is not a dom Element, please check if it is null ?`
                )
            }
            el.style.setProperty('transition', '')
        },
        _isDom (el) {
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
        },
        // 明天实现createAutoScrollCallBackFunction的监听
        _createAutoScrollCallBackFunction () {
            if(this.direction === 'rtl') {
                this.cb = () => {
                    const oldIndex = this.index 
                    // const newIndex = this.index ++
                    console.log(this.wrapper.children.length)
                    if(oldIndex === this.wrapper.children.length - 2) {
                        // 说明是倒数第二张，滚动到下一张后需要进行’瞬移‘
                        this.scrollTo(++ this.index)
                        this.moved.then(res => {
                            console.log('最后一张过渡完成：' + res)
                            this.scrollTo(1, 0)
                            this.index = 1
                        })
                    } else {
                        this.scrollTo(++ this.index)
                    }
                }
            } else if (this.direction = 'ltr'){
                console.log('ltr')
                this.cb = () => {}
            } else {
                return false
            }
            // console.log(this.cb)
        }
    },
    mounted () {            
        setTimeout(() => {
            this.init()
        }, 20)
    }
}
</script>

<style>
.container {
    /* border: 2px red solid; */
    height: 25%;
    width: 100%;
    overflow: hidden;
}
.container > .wrapper {
    /* border: 1px blue solid; */
    height: 100%;
    width: 100%;
    font-size: 0;
    white-space: nowrap;
}
.wrapper > img {
    height: 100%;
    width: 100%;
}

</style>
