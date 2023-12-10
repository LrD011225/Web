function redirectToCodePage() {
    window.location.href = "https://your-code-page-url"; // 将 "https://your-code-page-url" 替换为你想要跳转的代码网页的URL
}

if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', function () {
        /******************** 开始页逻辑 */
        var imgSrc= '',     // 拼图数据
            dealtime= 180,   // 总时长
            startDx= 0,     // 初始位移，用于返回上一页
            timer= null,    // 定时器
            pieces = $('.piece'),
            wrap = $('.wrap')[0],
            pool = generateMatrix(3, 28, 20);   //初始数组
        // 1.选择图片
        $('.img-wrap').on('click', function(e){
            var reg = /active/g;
            var $els = $('.img-wrap');
            for(var i=0,len = $els.length; i < len; i++){
                // 使用replace为了避免元素后期加入其他类名
                $els[i].className = $els[i].className.replace(' active', '');
            };
            !reg.test(this.className) && (this.className+= ' active');
            imgSrc = e.target.src;
        })
        // 2.文件上传解析
        var file = $('#file');
        file.on('change', function(e){
            var file = this.files[0];
            var fileReader = new FileReader();
            // 读取完成触发的事件
            fileReader.onload = function(e) {
                $('.file-wrap')[0].style.backgroundImage = 'url(' + fileReader.result + ')';
                imgSrc = fileReader.result;
            }

            file && fileReader.readAsDataURL(file);
        })

        // 3.开始
        $('#start').on('click', function(e){
            startDx = -100;
            
            if(imgSrc) {
                // 开始计时
                timer = setInterval(timeStart, 1000);

                transformX(wrap, startDx + 'vw');
                $('.piece').css('backgroundImage', 'url(' + imgSrc + ')');
                // 洗牌
                shuffle(pieces, pool);
            }else {
                alert('请选择图片')
            }
        })

        /******************** 游戏界面 */
        var wall = 0,
        prevEl = null;   // 上一个元素

        pieces.on('click', function(e){
            var reg = /active/g;
            if(!wall) {
                wall = 1;

                prevEl = this;
                for(var i=0,len = pieces.length; i < len; i++){
                    // 使用replace为了避免元素后期加入其他类名
                    pieces[i].className = pieces[i].className.replace(' active', '');
                };
                !reg.test(this.className) && (this.className+= ' active');
            }else {
                wall = 0;
                var prevIndex = +prevEl.getAttribute('index'),
                    curIndex = +this.getAttribute('index');
                // 置换数组
                swap(pool, prevIndex, curIndex);
                // 交换位置
                prevEl.style.transform = 'translate(' + pool[prevIndex].x + 'vw,' + pool[prevIndex].y + 'vh'+ ')';
                this.style.transform = 'translate(' + pool[curIndex].x + 'vw,' + pool[curIndex].y + 'vh'+ ')';
                // 清除样式
                prevEl.className= prevEl.className.replace(' active', '');
                // 校验是否成功
                if(isTestSuccess(pool)) {
                    // 清除计时器
                    clearInterval(timer);
                    startDx -= 100;
                    $('#playArea')[0].classList.add('active');
                    $('#use_time').html(180-dealtime);
                    setTimeout(function(){
                        transformX(wrap, startDx + 'vw');
                    }, 1200);
                }
            }
            
        })

        // 重新洗牌
        $('#change').on('click', function(){
            shuffle(pieces, pool);
        })

        // 返回
        $('#back').on('click', function() {
            clearInterval(timer);
            resetTime();
            startDx += 100;
            transformX(wrap, startDx + 'vw');
        })

    /*************** 结果页面 */

    // 1.生成海报
    $('#generate').on('click', function(){
        generateImg();
    })
    function generateImg() {
        var canvas = document.createElement("canvas");
        
        if(canvas.getContext) {
            var winW = window.innerWidth,
                winH = window.innerHeight,
            ctx = canvas.getContext('2d');
            canvas.width = winW;
            canvas.height = winH;

            // 绘制背景
            // ctx.fillStyle = '#06c';
            var linear = ctx.createLinearGradient(0, 0, 0, winH);
            linear.addColorStop(0, '#a1c4fd');
            linear.addColorStop(1, '#c2e9fb');
            ctx.fillStyle = linear;
            ctx.fillRect(0, 0, winW, winH);
            ctx.fill();

            // 绘制顶部图像
            var imgH = 0;
            img = new Image();
            img.src = imgSrc;
            img.onload = function(){
                // 绘制的图片宽为.7winW, 根据等比换算绘制的图片高度为 .7winW*imgH/imgW
                imgH = .6*winW*this.height/this.width;
                ctx.drawImage(img, .2*winW, .1*winH, .6*winW, imgH);

                drawText();
                drawTip();
                drawCode();
            }

            // 绘制文字
            function drawText() {
                ctx.save();
                ctx.fillStyle = '#fff';
                ctx.font = 20 + 'px Helvetica';
                ctx.textBaseline = 'hanging';
                ctx.textAlign = 'center';
                ctx.fillText('我只用了' + (180 -dealtime) + 's,' + '快来挑战！', winW/2, .15*winH + imgH);
                ctx.restore();
            }

            // 绘制提示文字
            function drawTip() {
                ctx.save();
                ctx.fillStyle = '#000';
                ctx.font = 14 + 'px Helvetica';
                ctx.textBaseline = 'hanging';
                ctx.textAlign = 'center';
                ctx.fillText('关注下方二维码开始游戏', winW/2, .25*winH + imgH);
                ctx.restore();
            }


            // 绘制二维码
            function drawCode() {
                var imgCode = new Image();
                imgCode.src = './images/logo.png';
                imgCode.onload = function(){
                    ctx.drawImage(imgCode, .35*winW, .3*winH + imgH, .3*winW, .3*winW);
    
                    // 生成预览图
                    var img = new Image();
                    img.src= convertCanvasToImage(canvas, 1).src;
                    img.className = 'previewImg';
                    img.onload = function(){
                        $('.preview-page')[0].appendChild(this);
                        startDx = startDx - 100;
                        transformX(wrap, startDx + 'vw');
                    }
                }
            }
            

            
            
        } else {
            alert('浏览器不支持canvas！')
        }
    }

    // 2.再来一次
    $('#again').on('click', function() {
        startDx = 0;
        resetTime();
        transformX(document.body, startDx + 'vw');
    })

    // 滑动元素
    function transformX(el, dx) {
        el.style.transform = 'translateX(' + dx + ')';
    }

    // 倒计时方法
    function timeStart() {
        --dealtime;
        $('#time').html(dealtime);
        if(dealtime < 1) {
            clearInterval(timer);
            alert('挑战失败，请返回重新开始')
        }
    }

    // 重置时间
    function resetTime() {
        dealtime = 180;
        $('#time').html(dealtime);
    }

    // 生成n维矩阵
    function generateMatrix(n, dx, dy) {
        var arr = [], index = 0;
        for(var i = 0; i< n; i++) {
            for(var j=0; j< n; j++) {
                arr.push({x: j*dx, y: i*dy, index: index});
                index++;
            }
        }
        return arr
    }

    // 数组置换
    function swap(arr, indexA, indexB) {
        var cache = arr[indexA];
        arr[indexA] = arr[indexB];
        arr[indexB] = cache;
    }

    // 洗牌方法
    function shuffle(els, arr) {
        upsetArr(arr);
        for(var i=0, len=els.length; i< len; i++) {
            var el = els[i];
            el.setAttribute('index', i);  // 将打乱后的数组索引缓存到元素中
            el.style.transform = 'translate(' + arr[i].x + 'vw,' + arr[i].y + 'vh'+ ')';
        }
    }

    // 数组乱序
    function upsetArr(arr) {
        arr.sort(function(a,b){
            return Math.random() > 0.5 ? -1 : 1
        })
    }

    // 校验是否成功方法
    function isTestSuccess(arr) {
        return arr.every(function(item, i){ return item.index === i })
    }

    // 将canvas转化为图片
    function convertCanvasToImage(canvas, quality) {
        var image = new Image();
        image.src = canvas.toDataURL("image/png", quality);
        return image;
    }

  })
} else {
    alert('请升级浏览器！')
}
