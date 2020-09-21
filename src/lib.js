(function(){
    "use strict"
    let lib =
    {
        getRandomColor(){
            function getByte(){
                return 55 + Math.round(Math.random() * 200);
            }
            return "rgb(" + getByte() + "," + getByte() + "," + getByte() + ")";
        },
        
        cls(ctx, ctxSub, canvasWidth, canvasHeight){
            // Fill screen with background color
            ctx.fillStyle = "rgba(0, 128, 0, 0.4)";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
            ctxSub.fillStyle = "rgba(0, 0, 0, 0.03";
            ctxSub.fillRect(0, 0, canvasWidth, canvasHeight);
        },
        
        flipWeightedCoin(weight = 0.5){
            return Math.random() < weight;
        },
    
        getRandomInt(min, max)
        {
            return Math.floor(Math.random() * (max - min) + min);
        },
    
        drawCircle(ctx,x,y,radius,color){
            ctx.save();
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x,y,radius,0,Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        },
    
        dtr(degrees){
        return degrees * (Math.PI/180);
        }
    }

    if(window)
    {
    window["lib"] = lib;
    }
    else
    {
        throw "'window' is not defined!";
    }
})()