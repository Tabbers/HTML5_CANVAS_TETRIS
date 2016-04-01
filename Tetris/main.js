/*
    todo:

*/
$(document).ready(function()
{
    //HTML OBJECTS
    var Overlay = document.getElementById("gameOver");
    
    //AUDIO
    
    var audio = new Audio();
    audio.loop = true;
    //GLOBALS
    var lastFrameTimeMs = 0; // The last time the loop was run
    var maxFPS = 60; // The maximum FPS we want to allow
    var delta  = 0;
    
    
    var pause = false;
    var reset = false;
    
    var fc   = document.getElementById("fcanvas");
    var fctx = fc.getContext("2d");
    var bc   = document.getElementById("bcanvas");
    var bctx = bc.getContext("2d");
    //GameGLOBALS
    var drawFrame;
    //Houses frame time function
    var game;
    
    var end = false;
    var blocks = new Array(200);
    var currentBlock;
    var currentBlockXY  = [0,0];
    var currentRotation = 1;
    
    var blockGravity;
    var blocktimer = 1000;
    var collissionFloor  = false;
    var currentBlocktime = 0;
    var linesToClear = new Array(20);
    var fadeoutstage  = new Array(20);
    //Calls
    
    var KeyDown = false;
   
    Setup();
    Entrypoint();
    //===============================
    //MAINFUNCTIONS
    //===============================
    function Setup()
    {
        audio.src = "sound/tetris.mp3";
        audio.play();
        Overlay.className ="invisible"; 
        fc.clientWidth = 250;
        fc.clientWidth = 500;
        
        bc.clientWidth = 250;
        bc.clientWidth = 500;
       
        //ColorSettings
        bctx.strokeStyle = '#99e6ff';        
        for(var i =0; i < 200; i++)
        {
            blocks[i] = 0;
        }
        for(var i =0; i < 20; i++)
        {
            linesToClear[i] = false;
            fadeoutstage[i]  = 60;
        }
        console.log("Setup");
        SpawnBlock();
        DrawBackground();
    }
    function Entrypoint()
    {
        Setup();
        requestAnimationFrame(mainLoop);
    }
    function Reset()
    {
        collissionFloor = false;
        currentBlocktime = 1000;
        Overlay.className ="invisible"; 
        currentBlock = null;
        currentBlockXY = [0,0];
        for(var i =0; i < 200; i++)
        {
            blocks[i] = 0;
        }
        for(var i =0; i < 20; i++)
        {
            linesToClear[i] = false;
            fadeoutstage[i]  = 60;
        }
        RedrawAll();
        console.log("reset");
        SpawnBlock();
    }
    function mainLoop(timestamp) 
    {
        if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
            requestAnimationFrame(mainLoop);
            return;
        }
        if(reset)
        {
            Reset();
            reset = false;
        }
        if(!pause)
        {
            Update();
        }
        delta = (timestamp - lastFrameTimeMs);
        lastFrameTimeMs = timestamp;
        requestAnimationFrame(mainLoop)
    }

    function Update()
    {
        currentBlockXY[0] = currentBlock.getX();
        currentBlockXY[1] = currentBlock.getY();
        DrawBlockGrid();
        BlockGrid(false);
        if(KeyDown)
        {
           currentBlocktime -= 200;
        }
        MoveBlockDown();
        LineCheck(currentBlockXY[0], currentBlockXY[1]);
        currentBlock.setPosition(currentBlockXY[0],currentBlockXY[1]);  
        drawFrame = false;
    }
    function GameOver()
    {
        if(!pause)
        {
            for(var x = 0; x < 10; ++x)
            {
                if(blocks[x+10] > 0 && blocks[x+20] > 7)
                {
                    
                    console.log("gameover");
                    pause = true;
                    Overlay.className ="visible"; 
                } 
            }
        }
                  
    }
    //===============================
    //Input
    //===============================
    $(document).keydown(function(event)
    {
        switch(event.which)
        {
           case 40:
                if(!pause)
                {
                    KeyDown = true;
                    console.log("keydown");
                }
           break; 
        }    
    });
    $(document).keyup(function(event){
        switch(event.which)
        {
            //left
            case 37:
                if(!pause)
                {
                    console.log("left");
                    currentBlockXY[0]--;
                    if(CheckWalls(currentBlockXY[0],currentBlockXY[1]) == "wleft") currentBlockXY[0]++;
                    if(CheckBlocksLeft(currentBlockXY[0],currentBlockXY[1]) == "block") currentBlockXY[0]++;
                    currentBlock.setPosition(  currentBlockXY[0],  currentBlockXY[1]);
                }
            break;
            //Right
            case 39:
                if(!pause)
                {
                    console.log("right");
                    currentBlockXY[0]++;
                    if(CheckWalls(currentBlockXY[0],currentBlockXY[1]) == "wright")currentBlockXY[0]--;
                    if(CheckBlocksRight(currentBlockXY[0],currentBlockXY[1]) == "block") currentBlockXY[0]--;
                    currentBlock.setPosition(  currentBlockXY[0],  currentBlockXY[1]);
                }
            break;
            //Up - rotate
            case 38:  
                if(!pause && CheckCollision(currentBlockXY[0],currentBlockXY[1]) == "none")
                {
                    console.log("rotate"); 
                    currentRotation++;
                    if(currentRotation > 4) currentRotation = 1;
                    currentBlock.setPosition(  currentBlockXY[0],  currentBlockXY[1]);
                }
            break;
            //Down - move down
            case 40:
                if(!pause)
                {
                     KeyDown = false;
                    console.log("down");
                    currentBlocktime = 0;
                }
             break;
             case 13:
                if(pause)
                {
                    pause = !pause;
                    reset = true;
                }
            break;
        }
    });
    //===============================
    //GRIDFUNCTIONS
    //===============================
    function DrawTetrisGrid()
    {
        bctx.beginPath();
        for(var x =0; x < 10; ++x)
        {
            bctx.moveTo(25*x,0);
            bctx.lineTo(25*x,500);
        }
        for(var y = 0; y < 20;++y)
        {
            bctx.moveTo(0,25*y);
            bctx.lineTo(250,25*y);          
        }  
        bctx.stroke();   
    }
    function DrawBackground()
    {
        bctx.fillStyle = "#000000";
        bctx.fillRect(0,0,250,500);
        
        DrawTetrisGrid();
    }
    //===============================
    //BlockHandlers
    //===============================
    function RedrawLine(y,alpha)
    {
       fctx.clearRect(0,y*25,250,25);
       fctx.globalAlpha = alpha;
       for(var x = 0; x < 10; ++x)
       {
            switch(blocks[x + 10*y])
            {
                case 1:
                case 8:
                    fctx.fillStyle   = '#ff0000';
                    fctx.fillRect(x*25,y*25,25,25);  
                    break;
                case 2:
                case 9:
                    fctx.fillStyle   = '#00ff00'; 
                    fctx.fillRect(x*25,y*25,25,25); 
                    break;
                case 3:
                case 10:
                    fctx.fillStyle   = '#0000ff'; 
                    fctx.fillRect(x*25,y*25,25,25); 
                    break;
                case 4:
                case 11:
                    fctx.fillStyle   = '#ff00ff'; 
                    fctx.fillRect(x*25,y*25,25,25); 
                    break;
                case 5:
                case 12:
                    fctx.fillStyle   = '#ffff00'; 
                    fctx.fillRect(x*25,y*25,25,25); 
                    break;
                case 6:
                case 13:
                    fctx.fillStyle   = '#00ffff'; 
                    fctx.fillRect(x*25,y*25,25,25); 
                    break;
                case 7:
                case 14:
                    fctx.fillStyle   = '#ffffff';
                    fctx.fillRect(x*25,y*25,25,25);  
                    break;
            }           
       }
       fctx.globalAlpha = 1;
    }
    function RedrawAll()
    {
        fctx.clearRect(0,0,250,500);
        Draw(); 
    }
    function DrawBlockGrid()
    {
        fctx.clearRect(0,(currentBlock.getY()-2)*25,250,150);
        Draw();
    }
    function Draw()
    {
        for(var x =0; x < 10; ++x)
        {
            for(var y = 0; y < 20;++y)
            {
              switch(blocks[x + 10*y])
               {
                   case 1:
                   case 8:
                        fctx.fillStyle   = '#ff0000';
                        fctx.fillRect(x*25,y*25,25,25);  
                        break;
                   case 2:
                   case 9:
                        fctx.fillStyle   = '#00ff00'; 
                        fctx.fillRect(x*25,y*25,25,25); 
                        break;
                   case 3:
                   case 10:
                        fctx.fillStyle   = '#0000ff'; 
                        fctx.fillRect(x*25,y*25,25,25); 
                        break;
                   case 4:
                   case 11:
                        fctx.fillStyle   = '#ff00ff'; 
                        fctx.fillRect(x*25,y*25,25,25); 
                        break;
                   case 5:
                   case 12:
                        fctx.fillStyle   = '#ffff00'; 
                        fctx.fillRect(x*25,y*25,25,25); 
                        break;
                   case 6:
                   case 13:
                        fctx.fillStyle   = '#00ffff'; 
                        fctx.fillRect(x*25,y*25,25,25); 
                        break;
                   case 7:
                   case 14:
                        fctx.fillStyle   = '#ffffff';
                        fctx.fillRect(x*25,y*25,25,25);  
                        break;
               }         
            }         
        }   
    }
    //===============================
    //Scoring
    //===============================
    function LineCheck(_x, _y)
    {
        var blocksInLine = 10; 
        for(var y = 0; y < 20; y++ )
        {
            blocksInLine = 10;
            for(var x = 0; x < 10; x++ )
            {
                if(blocks[x+10*y] >7) blocksInLine--;
            }
            if(blocksInLine == 0)
            {
               linesToClear[y] = true;
            }           
        }
        ClearLine();
    }
    function ClearLine()
    {
        for(var i = 0; i < 20; i++)
        {
            if(linesToClear[i])
            {
                FadeOut(i)
                if(fadeoutstage[i]< 0.001)
                {
                    RemoveBlocksFormLine(i);
                    linesToClear[i] = false;
                    fadeoutstage[i]  = 60;
                    RedrawAll();
                }
            }
        }  
    }
    function FadeOut(y)
    {
        fadeoutstage[y]--;
        var alpha = fadeoutstage[y]/30;
        RedrawLine(y,alpha)
    }
    function RemoveBlocksFormLine(_y)
    {
         for(var x = 0; x < 10; x++)
         {
             blocks[x+10*_y] = 0;
         }
         for(var y = _y; y > 0; y--)
         {
              for(var x = 0; x < 10; x++)
              {
                  blocks[x+10*y]     = blocks[x+10*(y-1)];
                  blocks[x+10*(y-1)] = 0;
              }
              if(IsTopLine(y)) return;
         }
    }
    function IsTopLine(_y)
    {
        for(var x = 0; x < 10; x++)
        {
            if(blocks[x+10*_y] >7) return false;
        }
        return true;
    }
    //===============================
    //Collision
    //===============================
    function CheckCollision(_x, _y)
    {
        collision = CheckOtherBlocks(_x,_y);
        if(collision != "none")   return collision;      
        
        var collision = CheckFloorAndWalls(_x,_y);
        if(collision != "none") return collision;

        return "none";
    }
    function CheckFloor(_x,_y)
    {
        var blockstate   = 0;
        var index=0;
        for(var x = 0; x < 4; x++ )
        {
            index = (_x+x)+10*19;
            blockstate =  blocks[index];
            if(blockstate > 0 && blockstate < 8)
            { 
                console.log("floor");
                return "floor";
            }
        } 
        return "none";
    }
    function CheckWalls(_x,_y)
    {
        var blockstate = 0;
        var index      = 0;
        for(var y = 0; y < 4; y++ )
        {
            index = 0+10*(_y+y);
            blockstate =  blocks[index];
            if(blockstate > 0)
            { 
                console.log("left");
                return "wleft";
            }
        }
        //rightwallCheck
        for(var y = 0; y < 4; y++ )
        {
            index = 9+10*(_y+y);
            blockstate =  blocks[index];
            if(blockstate > 0)
            { 
                console.log("rights");
                return "wright";
            }
        }
        return "none";
    }
    function CheckFloorAndWalls(_x,_y)
    {
        var collision = CheckFloor(_x,_y); 
        if(collision != "none") return collision;
        
        collision = CheckWalls(_x,_y);       
        if(collision != "none") return collision;
        
        return "none";
    }
    
    function CheckOtherBlocks(_x,_y)
    {
        var collision = "none";
        
        collision = CheckBlocksDown(_x,_y);
        if(collision != "none") return collision;
        
        collision = CheckBlocksRight(_x,_y);
        if(collision != "none") return collision;
        
        collision = CheckBlocksLeft(_x,_y);
        if(collision != "none") return collision;
        
        return "none";
    }
    function CheckBlocksDown(_x,_y)
    {
         var blockstate = 0;
         var blockstate2 = 0;
         for(var y = 0; y < 4; y++ )
         {
            for(var x = 0; x < 4; x++ )
            {
                blockstate = blocks[(_x+x)+10*(_y+y)];
                blockstate2 = blocks[(_x+x)+10*(_y+(y+1))];
                if(blockstate2 > 7 && blockstate < 8 && blockstate > 0)
                { 
                    console.log("dblock");
                    return "block";
                }
 
            }
         }           
         return "none";
    }
    function CheckBlocksRight(_x,_y)
    {
         var blockstate  = 0;
         var blockstate2 = 0;
         for(var y = 0; y < 4; y++ )
         {
            for(var x = 0; x < 4; x++ )
            {
                blockstate = blocks[(_x+(x+1))+10*(_y+y)];
                blockstate2 = blocks[(_x+x)+10*(_y+y)];
                if(blockstate > 7 && blockstate2 < 8 && blockstate2 > 0)
                { 
                    console.log("rblock");
                    return "block";
                }
            }
         }
         return "none";
    }
    function CheckBlocksLeft(_x,_y)
    {
         var blockstate  = 0;
         var blockstate2 = 0;
         for(var y = 0; y < 4; y++ )
         {
            for(var x = 0; x < 4; x++ )
            {
                blockstate  = blocks[(_x+(x-1))+10*(_y+y)];
                blockstate2 = blocks[(_x+x)+10*(_y+y)];
                if(blockstate > 7 && blockstate2 < 8 && blockstate2 > 0)
                { 
                    console.log("lblock");
                    return "block";
                }
            }
         }
         return "none";   
    }
    //===============================
    //StonesFUNCTIONS
    //===============================
    function BlockGrid( passive)
    {         
         RemoveBlock();
         ApplyBlock(false);   
    }
    function RemoveBlock()
    {
          for(var x = 0; x < 10; x++ )
         {
            for(var y = -2; y < 6; y++ )
            {
               if(blocks[(currentBlockXY[0]+x)+10*(currentBlockXY[1]+y)] < 8) 
               {
                    blocks[(currentBlockXY[0]+x)+10*(currentBlockXY[1]+y)] = 0;
               }
            }
         }
    }
    function ApplyBlock(passive)
    {
         var arraytoApply = currentBlock.getGrid(currentRotation);
         for(var x = 0; x < 4; x++ )
         {
            for(var y = 0; y < 4; y++ )
            {
               if(!passive)
               {
                  if(blocks[(currentBlockXY[0]+x)+10*(currentBlockXY[1]+y)] < 8) 
                  {
                    blocks[(currentBlockXY[0]+x)+10*(currentBlockXY[1]+y)] = arraytoApply[x+4*y];
                  }
               } 
               else
               {
                   if(arraytoApply[x+4*y] != 0)
                        blocks[(currentBlockXY[0]+x)+10*(currentBlockXY[1]+y)] = arraytoApply[x+4*y]+7;
               }         
            }    
         }
    }
    function MoveBlockDown()
    {
        currentBlocktime -= delta;
        
        if(currentBlocktime <= 0)
        {            
            currentBlockXY[1]++; 
            if(collissionFloor == true)
            {
                currentBlockXY[1]--;
                collissionFloor = false;
                ApplyBlock(true);
                currentBlock = null;
                SpawnBlock();
                return;
            }
            
            if(CheckFloor(currentBlockXY[0],currentBlockXY[1]) == "floor" || 
               CheckBlocksDown(currentBlockXY[0],currentBlockXY[1]) == "block")
            { 
                currentBlockXY[1]--;
                collissionFloor = true;
            }
            currentBlocktime = blocktimer;
            GameOver(currentBlockXY[0],currentBlockXY[1]);
        }
    }
    function SpawnBlock()
    {
        if(currentBlock == null)
        {
            var stone = Math.floor((Math.random() * 7) + 1);
            switch (stone) {
                case 1:
                    currentBlock = new LineBlock(3,0,stone);
                    break;
                case 2:
                    currentBlock = new LBlock(3,0,stone);
                    break;
                case 3:
                    currentBlock = new ReverseLBlock(3,0,stone);
                    break;
                case 4:
                    currentBlock = new SquiggilyBlock(3,0,stone);
                    break;
                case 5:
                    currentBlock = new ReverseSquiggilyBlock(3,0,stone);
                    break;
                case 6:
                    currentBlock = new RectangleBlock(3,0,stone);
                    break;
                case 7:
                    currentBlock = new TBlock(3,0,stone);
                    break;
                default:
                    
            }
            currentBlockXY=[3,0];
            currentBlocktime = 1000; 
            console.log("SpawnBlock");
        }
    }
    // ====
    function LineBlock(x,y,color)
    {   
        var x = x;
        var y = y;
        var c = color;
        this.getColor = function()
        {
            return color;
        };
        this.getX = function()
        {
            return x;
        };
        this.getY = function()
        {
            return y;
        };
        this.setPosition = function(_x,_y)
        {
            x = _x;
            y = _y;
        }
        this.getGrid = function(rotation)
        {
            switch (rotation)
            {
                case 1:
                    return [0,c,0,0,
                            0,c,0,0,
                            0,c,0,0,
                            0,c,0,0];
                
                case 2:
                    return [0,0,0,0,
                            c,c,c,c,
                            0,0,0,0,
                            0,0,0,0];
                
                case 3:
                     return [0,0,c,0,
                             0,0,c,0,
                             0,0,c,0,
                             0,0,c,0];
                
                case 4:
                     return [0,0,0,0,
                             0,0,0,0,
                             c,c,c,c,
                             0,0,0,0];
                
            }
        }
    }
    //   =
    // ===
    function LBlock(x,y,color)
    {
       var x = x;
       var y = y;
       var c = color;
       this.getColor = function()
       {
           return color;
       };
       this.getX = function()
        {
            return x;
        };
        this.getY = function()
        {
            return y;
        };
        this.setPosition = function(_x,_y)
        {
            x = _x;
            y = _y;
        }
        this.getGrid = function(rotation)
        {
            switch (rotation)
            {
                case 1:
                    return [c,c,0,0,
                            0,c,0,0,
                            0,c,0,0,
                            0,0,0,0];
                
                case 2:
                    return [0,0,c,0,
                            c,c,c,0,
                            0,0,0,0,
                            0,0,0,0];
                
                case 3:
                     return [0,0,c,0,
                             0,0,c,0,
                             0,0,c,c,
                             0,0,0,0];
                
                case 4:
                     return [0,0,0,0,
                             c,c,c,0,
                             c,0,0,0,
                             0,0,0,0];
                
            }
        }
    }
    //   =
    // ===
    function ReverseLBlock(x,y,color)
    {
       var x = x;
       var y = y;
       var c = color;
       this.getColor = function()
       {
           return color;
       };
        this.getX = function()
        {
            return x;
        };
        this.getY = function()
        {
            return y;
        };
        this.setPosition = function(_x,_y)
        {
            x = _x;
            y = _y;
        }
        this.getGrid = function(rotation)
        {
            switch (rotation)
            {
                case 1:
                    return [0,c,c,0,
                            0,c,0,0,
                            0,c,0,0,
                            0,0,0,0];
                
                case 2:
                    return [0,0,0,0,
                            c,c,c,0,
                            0,0,c,0,
                            0,0,0,0];
                
                case 3:
                     return [0,c,0,0,
                             0,c,0,0,
                             c,c,0,0,
                             0,0,0,0];
                
                case 4:
                     return [c,0,0,0,
                             c,c,c,0,
                             0,0,0,0,
                             0,0,0,0];
                
            }
        }
    }
    // ==
    // ==
    function RectangleBlock(x,y,color)
    {
       var x = x;
       var y = y;
       var c = color;
       this.getColor = function()
       {
           return color;
       };
        this.getX = function()
        {
            return x;
        };
        this.getY = function()
        {
            return y;
        };
        this.setPosition = function(_x,_y)
        {
            x = _x;
            y = _y;
        }
        this.getGrid = function(rotation)
        {
            switch (rotation)
            {
                case 1:
                    return [0,0,0,0,
                            0,c,c,0,
                            0,c,c,0,
                            0,0,0,0];
                
                case 2:
                    return [0,0,0,0,
                            0,c,c,0,
                            0,c,c,0,
                            0,0,0,0];
                
                case 3:
                     return [0,0,0,0,
                             0,c,c,0,
                             0,c,c,0,
                             0,0,0,0];
                
                case 4:
                     return [0,0,0,0,
                             0,c,c,0,
                             0,c,c,0,
                             0,0,0,0];
                
            }
        }
    }
    //  ==
    // ==
    function SquiggilyBlock(x,y,color)
    {
       var x = x;
       var y = y;
       var c = color;
       this.getColor = function()
       {
           return color;
       };
        this.getX = function()
        {
            return x;
        };
        this.getY = function()
        {
            return y;
        };
        this.setPosition = function(_x,_y)
        {
            x = _x;
            y = _y;
        }
        this.getGrid = function(rotation)
        {
            switch (rotation)
            {
                case 1:
                    return [c,0,0,0,
                            c,c,0,0,
                            0,c,0,0,
                            0,0,0,0];
                
                case 2:
                    return [0,c,c,0,
                            c,c,0,0,
                            0,0,0,0,
                            0,0,0,0];
                
                case 3:
                     return [0,c,0,0,
                             0,c,c,0,
                             0,0,c,0,
                             0,0,0,0];
                
                case 4:
                     return [0,0,0,0,
                             0,c,c,0,
                             c,c,0,0,
                             0,0,0,0];
                
            }
        }
    }
    // ==
    //  ==
    function ReverseSquiggilyBlock(x,y,color)
    {
       var x = x;
       var y = y;
       var c = color;
       this.getColor = function()
       {
           return color;
       };
       this.getX = function()
        {
            return x;
        };
        this.getY = function()
        {
            return y;
        };
        this.setPosition = function(_x,_y)
        {
            x = _x;
            y = _y;
        }
        this.getGrid = function(rotation)
        {
            switch (rotation)
            {
                case 1:
                    return [0,c,0,0,
                            c,c,0,0,
                            c,0,0,0,
                            0,0,0,0];
                
                case 2:
                    return [c,c,0,0,
                            0,c,c,0,
                            0,0,0,0,
                            0,0,0,0];
                
                case 3:
                     return [0,0,c,0,
                             0,c,c,0,
                             0,c,0,0,
                             0,0,0,0];
                
                case 4:
                     return [0,0,0,0,
                             c,c,0,0,
                             0,c,c,0,
                             0,0,0,0];
                
            }
        }
    }
    //  =
    // ===
    function TBlock(x,y,color)
    {
       var x = x;
       var y = y;
       var c = color;
        this.getColor = function()
       {
           return color;
       };
       this.getX = function()
        {
            return x;
        };
        this.getY = function()
        {
            return y;
        };
        this.setPosition = function(_x,_y)
        {
            x = _x;
            y = _y;
        }
        this.getGrid = function(rotation)
        {
            switch (rotation)
            {
                case 1:
                    return [0,c,0,0,
                            c,c,c,0,
                            0,0,0,0,
                            0,0,0,0];
                
                case 2:
                    return [0,c,0,0,
                            0,c,c,0,
                            0,c,0,0,
                            0,0,0,0];
                
                case 3:
                     return [0,0,0,0,
                             c,c,c,0,
                             0,c,0,0,
                             0,0,0,0];
                
                case 4:
                     return [0,c,0,0,
                             c,c,0,0,
                             0,c,0,0,
                             0,0,0,0];
                
            }
        }
    }
});

