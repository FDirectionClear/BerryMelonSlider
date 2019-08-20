<template>
    <div class = "slider">
        <div class = "container">
            <div class = "wrapper" ref = "wrapper">
                <slot></slot>
            </div>
        </div>
        <div class = "else-content">
            <div class ="dotted-container" v-if = "length > 1">
                <div class = "dotted-wrapper">
                    <div v-for = "n in length" :key = "n" 
                        class ="dotted"
                        :class = "{'active': n === index}"></div>
                </div>
            </div>
            <div class = "btn-container" v-if = "length > 1">
                <div class = "btn" @click = "clickScrollTo(1)" :class = "{active: activeBtn === 1}">A</div>
                <div class = "btn" @click = "clickScrollTo(2)" :class = "{active: activeBtn === 2}">B</div>
                <div class = "btn" @click = "clickScrollTo(3)" :class = "{active: activeBtn === 3}">C</div>
                <div class = "btn" @click = "autoScroll(); activeBtn = 4" :class = "{active: activeBtn === 4}">AUTO</div>
            </div>
           <describe></describe>
        </div>
    </div>
</template>

<script>
import { prefixStyle, isDom } from './common/domOpts'
import { handleError } from './common/tools'
import Describe from './describe.vue'

const TRANSFORM = prefixStyle('transform') 

export default {
    created () {
        // 无需defineReactive，放在created中即可
        this.timer = undefined
        this.moved = Promise.resolve(true)  // 当前wrapper的过渡状态，是一个promise实例
    },
    data () {
        return {
            index: 1 ,// 初始index为1
            autoPlaying: true,
            length: 0, // 图片个数
            activeBtn: undefined // 当前按下的按钮
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
                this.handleError(`wrapper dosn't exit, init Slider Error`)
            }
            this.wrapper = wrapper
            // 获取单位滚动距离gap
            this._RefreshGap()

            const children = wrapper.children
            this.length = children.length

            if(children.length > 1) {
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
                this.handleError(
                    `scrollTo: ${index} or ${time} is a invalid param, please use Number value!`
                )
            }
            const wrapper = this.wrapper
            if(time !== 0) {
                this._setTranstion(undefined, undefined, time)
                wrapper.style[TRANSFORM] = `translateX(${-this.gap * index}px)`
                this.moved = new Promise(resolve => {
                    wrapper.addEventListener('transitionend', () => {
                        resolve(true) // 过渡结束，返回true
                    })
                })
            } else {
                // 如果无过渡时间，则瞬间滚动到索引位置
                this._clearTransition()
                wrapper.style[TRANSFORM] = `translateX(${-this.gap * index}px)`
                this.moved = Promise.resolve(true)
            }
        },
        autoScroll () {
            this.autoPlaying = true
            this.timer = setInterval(this.cb, this.duration)
        },
        clickScrollTo(index){
            this._clearInterval(this.timer)
            this.index =  this.activeBtn = index
            this.scrollTo(index)
        },
        _setTranstion (el = this.wrapper, pro = `all`, time = .5) {
            if(!isDom(el)) {
                this.handleError(
                    `${el} is not a dom Element, please check if it is null ?`
                )
            }
            el.style.setProperty('transition', `${pro} ${time}s`)
        },
        _clearInterval () {
            if(this.timer !== undefined) {
                clearInterval(this.timer)
                this.timer = undefined
            }
        },
        _clearTransition (el = this.wrapper) {
            // 清除所有transition属性
            if(!isDom(el)) {
                this.handleError(
                    `${el} is not a dom Element, please check if it is null ?`
                )
            }
            el.style.setProperty('transition', '')
        },
        _createAutoScrollCallBackFunction () {
            // 防止多次判断，柯里化得到当前direction参数下对应的callback
            this.autoPlaying = false
            if(this.direction === 'rtl') {
                this.cb = () => {
                    const oldIndex = this.index 
                    if(oldIndex === this.wrapper.children.length - 2) {
                        // 说明是倒数第二张，滚动到下一张后需要进行’瞬移‘至第二张
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
                this.cb = () => {
                    const oldIndex = this.index
                    if(oldIndex === 1) {
                        // 说明目前是第二张图片，滚动到第一张后需要进行’瞬移‘至倒数第二张
                        this.scrollTo(-- this.index)
                        this.moved.then(res => {
                            console.log('第一张过渡完成：' + res)
                            const len = this.wrapper.children.length
                            this.scrollTo(len - 2, 0)
                            this.index = len - 2
                        })
                    } else {
                        this.scrollTo(-- this.index)
                    }
                }
            } else {
                return false
            }
        },
        _RefreshGap (gap) {
            // 设置或获取单位滚动距离
            // gap未带入则获取最新gap
            if(gap !== undefined) {
                this.gap = 
                    typeof gap === 'number' || typeof gap === 'string' 
                        ? parseFloat(gap)
                        : window.innerWidth
            } else {
                this.gap = window.innerWidth
            }
        },
    },
    watch: {
        direction () {
            // 如果外部改变了滚动方向，就重新计算callback
            if(this.timer !== undefined) {
                this._clearInterval()
                this.moved.then(res => {
                    if(res === true) {
                        this._createAutoScrollCallBackFunction()
                        this.autoScroll()
                    }
                })
            }
        }
    },
    components: {
        Describe
    },
    mounted () {            
        setTimeout(() => {
            this.init()
            this.activeBtn = this.length + 1
        }, 20)
    },
    destroyed () {
        // 组件销毁，应清除计时器同时remove已经绑定的事件
        this._clearInterval()
    }
}
</script>

<style>
.slider {
    height: 25%;
    width: 100%;
}
.container {
    /* border: 2px red solid; */
    height: 100%;
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
.else-content > .dotted-container::after {
    /* 清除浮动  */
    content: '';
    display: block;
    clear: both;
}
.else-content >  .dotted-container > .dotted-wrapper {
    float: left;
    margin-left: 50%; /* 水平居中 */ 
    transform: translateX(-50%);
}
.else-content >  .dotted-container >  .dotted-wrapper > .dotted {
    display: inline-block;
    height: 10px;
    width: 10px;
    margin: 10px;
    background: gray;
    border-radius: 100%;
}
.else-content >  .dotted-container >  .dotted-wrapper > .dotted.active {
    background: skyblue;
}
.else-content > .btn-container {
    display: flex;
    justify-content: space-between;
}
.else-content > .btn-container > .btn{
    border: 1.5px gray solid;
    border-radius: 5px;
    flex-basis: 80px;
    text-align: center;
}
.else-content > .btn-container > .btn.active {
    border-color:orangered;
    color: orangered;
}
</style>
