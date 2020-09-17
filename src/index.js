(function(){
    'use strict';
    let ctx;
    let ctxSub;

    let screenWrap = true;
    let canvasHeight, canvasWidth;
    let walkerList = [];
    let phylloList = [];
    let fps = 12;
    let updatePerSec = 10;
    let adjacentLimit = 3;
    let spawnTime = 2;
    let spawnLimit = 100;
    let playing = true;
    let playButton, pauseButton;
    let divergenceSlider;
    let divergence;

    class walker {
        constructor(x, y, width, color, timer = 0)
        {
            this.x = x;
            this.y = y;
            this.width = width;
            this.color = color;
            this.timer = timer;
            this.adjacents = 0;
            this.isDead = false;
        }

        move(){
            // Increment timer
            this.timer += 1/updatePerSec;

            if(flipWeightedCoin()){
                // Move horizontally
                this.x += flipWeightedCoin() ? -this.width : this.width;
            }else{
                // Move vertically
                this.y += flipWeightedCoin() ? -this.width : this.width;
            }

            this.spawn();

            // Screen wrap
            if(screenWrap)
            {
                if(this.x <= 0) this.x = canvasWidth - 1;
                else if(this.x > canvasWidth) this.x = 0;
                else if(this.y < 0) this.y = canvasHeight;
                else if(this.y > canvasHeight) this.y = 0;
            }
        }

        spawn()
        {
            // Spawn a new walker after period of time
            if(this.timer >= spawnTime && walkerList.length < spawnLimit)
            {
                let random = getRandomInt(0, 3);
                let x, y;

                // Spawning adjacent to current walker
                switch(random)
                {
                    case 0:
                        x = this.x - this.width;
                        y = this.y;
                        break;
                    case 1: 
                        x = this.x;
                        y = this.y - this.width;
                        break;
                    case 2:
                        x = this.x + this.width;
                        y = this.y;
                        break;
                    case 3:
                        x = this.x;
                        y = this.y + this.width;
                        break;
                }

                walkerList.push(new walker(x, y, 10, getRandomColor()));
                this.timer = 0;
            }
        }

        checkAdjacents(other)
        {
            if(other.x == this.x && other.y == this.y - this.width)
            {
                this.adjacents++;
            }
            if(other.x == this.x && other.y == this.y + this.width)
            {
                this.adjacents++;
            }
            if(other.x == this.x - this.width && other.y == this.y)
            {
                this.adjacents++;
            }
            if(other.x == this.x + this.width && other.y == this.y)
            {
                this.adjacents++;
            }
            if(other.x == this.x && other.y == this.y)
            {
                this.adjacents++;
            }

            if(this.adjacents >= adjacentLimit)
            {
                this.isDead = true;

                phylloList.push(new phyllo(this.x, this.y, 5));
            }
        }
    };
    
    class phyllo {
        constructor(x, y, c = 5, deltaC = 0, radius = 2)
        {
            this.x = x;
            this.y = y;
            this.c = c;
            this.radius;
            this.deltaC = deltaC;
            this.n = 0;
            this.timer = 0;
            this.isDead = false;
        }

        draw(ctx)
        {
            this.timer += 1/fps;

            let a = this.n * dtr(divergence);
            let r = this.c * Math.sqrt(this.n);
            let x = r * Math.cos(a) + this.x;
            let y = r * Math.sin(a) + this.y;

            drawCircle(ctx,x,y,3,`rgb(256, 256, 0)`);

            this.c += this.deltaC;
            this.n++;

            if(this.timer >= 2)
            {
                this.isDead = true;
            }
        }
    }

    // #1 call the init function after the pages loads
    window.onload = function(){
        console.log("page loaded!");
        // #2 Now that the page has loaded, start drawing!
        divergenceSlider = document.querySelector("#divertSlider");
        playButton = document.querySelector("#play");
        pauseButton = document.querySelector("#pause");

        playButton.addEventListener("click", () => playing = true);
        pauseButton.addEventListener("click", () => playing = false);
        divergence = divergenceSlider.value;
        divergenceSlider.addEventListener("change", () => {
            divergence = divergenceSlider.value;
            let divergenceLabel = document.querySelector("#divertLabel");
            divergenceLabel.innerHTML = `Divergence: ${divergence}`;
        })

        // A - canvas variable points at <canvas> tag
        let canvas = document.querySelector('#mainCanvas');
        let subCanvas = document.querySelector("#subCanvas");
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;


        // B - the ctx variable points at a "2D drawing context"
        ctx = canvas.getContext('2d');
        ctxSub = subCanvas.getContext('2d');

        // C - all fill operations are now in red
        ctx.fillStyle = 'green'; 
        ctxSub.fillStyle = 'black';

        // D - fill a rectangle with the current fill color
        ctx.fillRect(0,0,canvasWidth,canvasHeight); 
        ctxSub.fillRect(0, 0, canvasWidth, canvasWidth);
        
        walkerList.push(new walker(canvasWidth / 2, canvasHeight / 2, 10, "black"));

        setInterval(drawLoop, 1000/fps);
//		setInterval(cls,5000);
    }
    
    function drawLoop(){
        if(playing)
        {
            cls(ctx);

            // Phyllotaxis loop
            for(let i = 0; i < phylloList.length; i++)
            {
                phylloList[i].draw(ctx);
                phylloList[i].draw(ctxSub);

                if(phylloList[i].isDead)
                {
                    phylloList.splice(i, 1);
                }
            }

            // Walker loop
            for(let i = 0; i < walkerList.length; i++)
            {
                ctx.fillStyle = walkerList[i].color;
                ctx.fillRect(walkerList[i].x-walkerList[i].width/2,walkerList[i].y-walkerList[i].width/2,walkerList[i].width/2,walkerList[i].width/2);

                walkerList[i].move();

                // Check adjacency
                for(let k = 0; k < walkerList.length; k++)
                {
                    if(k == i)
                    {
                        continue;
                    }

                    walkerList[i].checkAdjacents(walkerList[k]);
                    
                    if(walkerList[i].isDead)
                    {
                        break;
                    }
                }

                walkerList[i].adjacents = 0;
            }
            
            for(let i = 0; i < walkerList.length; i++)
            {
                if(walkerList[i].isDead)
                {
                        walkerList.splice(i, 1);
                }
            }
        }
    }

    // UTILS
    function getRandomColor(){
        function getByte(){
            return 55 + Math.round(Math.random() * 200);
        }
        return "rgb(" + getByte() + "," + getByte() + "," + getByte() + ")";
    }
    
    function cls(ctx){
        // Fill screen with background color
        ctx.fillStyle = "rgba(0, 128, 0, 0.4)";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctxSub.fillStyle = "rgba(0, 0, 0, 0.1";
        ctxSub.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    
    function flipWeightedCoin(weight = 0.5){
        return Math.random() < weight;
    }

    function getRandomInt(min, max)
    {
        return Math.floor(Math.random() * (max - min) + min);
    }

    function drawCircle(ctx,x,y,radius,color){
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x,y,radius,0,Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function dtr(degrees){
    return degrees * (Math.PI/180);
    }
})()