    <template>
        <div class = "app">
            <slider direction = "rtl">
                <img :src="firstPic">
                <img :src="secondPic">
                <img :src="thirdPic">
            </slider>
        </div>
    </template>

    <script>
    import Slider from './Slider.vue'
    import firstPic from './asset/images/1.jpg'
    import secondPic from './asset/images/2.jpg'
    import thirdPic from './asset/images/3.jpg'

    export default {
        data () {
            return {
                firstPic,
                secondPic,
                thirdPic
            }
        },
        components: {
            Slider
        }    
    }
    </script>

    <style>
    .app {
        height: 100%;
        width: 100%;
    }
</style>


