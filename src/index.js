(function(){
    'use strict';
    let ctx;
    let ctxSub;

    let screenWrap = true;
    let canvasHeight, canvasWidth;
    let walkerList = [];
    let phylloList = [];
    let fps = 12;
    let adjacentLimit = 3, adjacentLimitSlider;
    let spawnTime = 2, spawnTimeSlider;
    let spawnLimit = 100, spawnLimitSlider;
    let playing = true;
    let playButton, pauseButton;
    let phylloLifeTime = 15, phylloLifeTimeSlider;
    let spawnWalkerButton;
    let divergenceMin, divergenceMax, divergenceMinSlider, divergenceMaxSlider;
    let deltaC = 0, deltaCInput;

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
            this.outlineWidth = 1;

            // Previous positions
            this.previousPosList = [];
            this.listMax = 5;
        }

        move(){
            // Increment timer
            this.timer += 1/fps;

            // Remember previous position
            this.savePosition();

            let altX;
            let altY;
            let isOldPos = false;

            do
            {
                altX = this.x;
                altY = this.y;

                if(lib.flipWeightedCoin()){
                    // Move horizontally
                    this.x += lib.flipWeightedCoin() ? -this.width : this.width;
                }else{
                    // Move vertically
                    this.y += lib.flipWeightedCoin() ? -this.width : this.width;
                }

                // Prevent walkers from going to the last 5 previous positions
                for(let i = 0; i < this.previousPosList.length; i++)
                {
                    if(this.x == this.previousPosList[i][0] && this.y == this.previousPosList[i][1])
                    {
                        isOldPos = true;
                        this.x = altX;
                        this.y = altY;
                    }
                    else
                    {
                        isOldPos = false;
                    }
                }
            } 
            while(isOldPos)
        
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
                let random = lib.getRandomInt(0, 3);
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

                walkerList.push(new walker(x, y, 10, lib.getRandomColor()));
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

                phylloList.push(new phyllo(this.x, this.y, lib.getByte(), lib.getByte(), lib.getByte(), lib.getRandomFloat(120, 360), 5));
            }
        }

        savePosition()
        {
            if(this.previousPosList.length < this.listMax)
            {
                this.previousPosList.push([this.x, this.y]);
            }
            else
            {
                this.previousPosList.shift();
                this.previousPosList.push([this.x, this.y]);
            }
        }

        draw(ctx)
        {
            ctx.fillStyle = "black";
            ctx.fillRect(this.x - this.width / 2 - this.outlineWidth,
                        this.y - this.width / 2 - this.outlineWidth,
                        this.width / 2 + this.outlineWidth * 2,
                        this.width / 2 + this.outlineWidth * 2);
            
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x - this.width / 2,this.y - this.width / 2,this.width / 2,this.width / 2);
        }
    };
    
    class phyllo {
        constructor(x, y, r, g, b, divergence, c = 5, radius = 2)
        {
            this.x = x;
            this.y = y;
            this.c = c;
            this.radius;
            this.n = 0;
            this.timer = 0;
            this.isDead = false;
            this.startingColor = {r, g, b};
            this.divergence = divergence;
        }

        draw(ctx, ctxSub)
        {
            this.timer += 1/fps;

            let a = this.n * lib.dtr(this.divergence);
            let r = this.c * Math.sqrt(this.n);
            let x = r * Math.cos(a) + this.x;
            let y = r * Math.sin(a) + this.y;

            let color = `rgb(${(this.n + this.startingColor.r) / 2 % 200 + 55}, 
                            ${(r + this.startingColor.g) / 2 % 200 + 55}, 
                            ${(a + this.startingColor.b) / 2 % 200 + 55})`;


            // Stop drawing on main canvas 2 seconds
            if(this.timer >= 2)
            {
                lib.drawCircle(ctx, x, y, 3, color);
            }

            lib.drawCircle(ctxSub, x, y, 3, color);

            this.c += deltaC;
            this.n++;

            if(this.timer >= phylloLifeTime)
            {
                this.isDead = true;
            }
        }
    }

    // #1 call the init function after the pages loads
    window.onload = function(){
        console.log("page loaded!");
        // #2 Now that the page has loaded, start drawing!
        playButton = document.querySelector("#play");
        pauseButton = document.querySelector("#pause");

        phylloLifeTimeSlider = document.querySelector("#phylloLifeTimeSlider");
        spawnTimeSlider = document.querySelector("#spawnTimeSlider");
        divergenceMinSlider = document.querySelector("#divertMinSlider");
        divergenceMaxSlider = document.querySelector("#divertMaxSlider");
        adjacentLimitSlider = document.querySelector("#adjacentLimitSlider");
        spawnWalkerButton = document.querySelector("#spawnWalkerButton");
        spawnLimitSlider = document.querySelector("#spawnLimitSlider");
        deltaCInput = document.querySelector("#deltaCInput");
        deltaCInput.value = deltaC;

        // Buttons
        playButton.addEventListener("click", () => playing = true);
        pauseButton.addEventListener("click", () => playing = false);
        spawnWalkerButton.addEventListener("click", () => walkerList.push(new walker(canvasWidth / 2, canvasHeight / 2, 10, "black")))

        // Sliders
        divergenceMin = parseFloat(divergenceMinSlider.value);
        divergenceMax = parseFloat(divergenceMaxSlider.value);
        divergenceMinSlider.addEventListener("input", () => {
            divergenceMin = parseFloat(divergenceMinSlider.value);
            let divergenceMinLabel = document.querySelector("#divertMinLabel");
            divergenceMinLabel.innerHTML = `Minimum Divergence: <span class="value">${divergenceMin}</span>`;
        });
        divergenceMaxSlider.addEventListener("input", () => {
            divergenceMax = parseFloat(divergenceMaxSlider.value);
            let divergenceMaxLabel = document.querySelector("#divertMaxLabel");
            divergenceMaxLabel.innerHTML = `Maximum Divergence: <span class="value">${divergenceMax}</span>`;
        });

        adjacentLimit = adjacentLimitSlider.value;
        adjacentLimitSlider.addEventListener("input", () => {
            adjacentLimit = adjacentLimitSlider.value;
            let adjacentLimitLabel = document.querySelector("#adjacentLimitLabel");
            adjacentLimitLabel.innerHTML = `Maximum number of adjacent walkers: <span class="value">${adjacentLimit}</span>`;
        });

        spawnTime = spawnTimeSlider.value;
        spawnTimeSlider.addEventListener("input", () => {
            spawnTime = spawnTimeSlider.value;
            let spawnTimeLabel = document.querySelector("#spawnTimeLabel");
            spawnTimeLabel.innerHTML = `Time between each spawns by each walker: <span class="value">${spawnTime}</span>`;
        });

        phylloLifeTime = phylloLifeTimeSlider.value;
        phylloLifeTimeSlider.addEventListener("input", () => {
            phylloLifeTime = phylloLifeTimeSlider.value;
            let phylloLifeTimeLabel = document.querySelector("#phylloLifeTimeLabel");
            phylloLifeTimeLabel.innerHTML = `Life time of each phyllotaxis (in seconds): <span class="value">${phylloLifeTime}</span>`;
        });

        spawnLimit = spawnLimitSlider.value;
        spawnLimitSlider.addEventListener("input", () => {
            spawnLimit = spawnLimitSlider.value;
            let spawnLimitLabel = document.querySelector("#spawnLimitLabel");
            spawnLimitLabel.innerHTML = `Maximum number of walkers: <span class="value">${spawnLimit}</span>`;
        });

        deltaCInput.addEventListener("input", () => {
            if(typeof parseFloat(deltaCInput.value) == 'number')
            {
                deltaC = parseFloat(deltaCInput.value);
            }
        });

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
            lib.cls(ctx, ctxSub, canvasWidth, canvasHeight);

            // Phyllotaxis loop
            for(let i = 0; i < phylloList.length; i++)
            {
                phylloList[i].draw(ctx, ctxSub);

                if(phylloList[i].isDead)
                {
                    phylloList.splice(i, 1);
                }
            }

            // Walker loop
            for(let i = 0; i < walkerList.length; i++)
            {
                walkerList[i].draw(ctx);
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
                    walkerList.splice(k, 1);
                }
            }
        }

        // Slider functions
        if(divergenceMax < divergenceMin)
        {
            divergenceMax = divergenceMin;
            divergenceMaxSlider.value = divergenceMax;
            let divergenceMaxLabel = document.querySelector("#divertMaxLabel");
            divergenceMaxLabel.innerHTML = `Maximum Divergence: ${divergenceMax}`;
        }
    }

})()