/*
    todo:

*/
$(document).ready(function()
{
    //GLOBALS
    var fc = document.getElementById("fcanvas");
    var fctx = fc.getContext("2d");
    var bc = document.getElementById("bcanvas");
    var bctx = bc.getContext("2d");
    var date = new Date();
    //GameGLOBALS
    var drawFrame;
    //Houses frame time function
    var game;
    
    var end = false;
    var blocks = new Array(200);
    var currentBlock;
    var currentBlockXY = [0,0];
    var currentRotation = 1;
    
    var blockGravity;
    var blocktimer = 1000;
    
    //Calls
   
    Setup();
    game = setInterval(Update,16); 
    //===============================
    //MAINFUNCTIONS
    //===============================
    function Setup()
    {
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
        SpawnBlock();
        DrawBackground();
    }
    function Update()
    {
        DrawBlockGrid();
        BlockGrid();
        drawFrame = false;
        
        if(end)
        {
            clearInterval(game);
            clearInterval(blockGravity);
        }     
    }
    //===============================
    //Input
    //===============================
    $(document).keyup(function(event){
        
       
        
        currentBlockXY[0] = currentBlock.getX();
        currentBlockXY[1] = currentBlock.getY();
        console.log("pos: "+currentBlockXY[0] + currentBlockXY[1]);
        switch(event.which)
        {
            //left
            case 37:
                console.log("left");
                if(!CheckCollision())currentBlockXY[0]--;
                currentBlock.setPosition(  currentBlockXY[0],  currentBlockXY[1]);
            break;
            //Right
            case 39:
                console.log("right");
               if(!CheckCollision()) currentBlockXY[0]++;
                currentBlock.setPosition(  currentBlockXY[0],  currentBlockXY[1]);
            break;
            //Up - rotate
            case 38:  
                console.log("rotate"); 
                currentRotation++;
                if(currentRotation > 4) currentRotation = 1;
            break;
            //Down - move down
            case 40:
                console.log("down");
                if(!CheckCollision()) currentBlockXY[1]++;
                currentBlock.setPosition(  currentBlockXY[0],  currentBlockXY[1]);
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
     function DrawBlockGrid()
    {
        
        fctx.clearRect((currentBlock.getX()-1)*25,(currentBlock.getY()-1)*25,150,150);
        for(var x =0; x < 10; ++x)
        {
            for(var y = 0; y < 20;++y)
            {
              switch(blocks[x + 10*y])
               {
                   case 1:
                        fctx.fillStyle   = '#ff0000';
                        fctx.fillRect(x*25,y*25,25,25);  
                        break;
                   case 2:
                        fctx.fillStyle   = '#00ff00'; 
                        fctx.fillRect(x*25,y*25,25,25); 
                        break;
                   case 3:
                        fctx.fillStyle   = '#0000ff'; 
                        fctx.fillRect(x*25,y*25,25,25); 
                        break;
                   case 4:
                        fctx.fillStyle   = '#ff00ff'; 
                        fctx.fillRect(x*25,y*25,25,25); 
                        break;
                   case 5:
                        fctx.fillStyle   = '#ffff00'; 
                        fctx.fillRect(x*25,y*25,25,25); 
                        break;
                   case 6:
                        fctx.fillStyle   = '#00ffff'; 
                        fctx.fillRect(x*25,y*25,25,25); 
                        break;
                   case 7:
                        fctx.fillStyle   = '#ffffff';
                        fctx.fillRect(x*25,y*25,25,25);  
                        break;
               }         
            }         
        }   
    }
    //===============================
    //Collision
    //===============================
    function CheckFloorAndWalls()
    {
        //Wallcheck
        for(var y = 0; y < 19; y++ )
        {
           if(blocks[0 + 10*y] != 0) return true; 
           if(blocks[9 + 10*y] != 0) return true; 
        }
        for(var x=0; x <10; x++)
        {
           if(blocks[x + 10*19] != 0) return true; 
        }
        return false;
    }
    
    function CheckOtherBlocks()
    {
         return false;
    }
    //===============================
    //StonesFUNCTIONS
    //===============================
    function BlockGrid()
    {
         var arraytoApply = currentBlock.getGrid(currentRotation);
         
         for(var x = -1; x < 5; x++ )
         {
            for(var y = -1; y < 5; y++ )
            {
                blocks[(currentBlock.getX()+x)+10*(currentBlock.getY()+y)] = 0;
            }
         }
         
         for(var x = 0; x < 4; x++ )
         {
            for(var y = 0; y < 4; y++ )
            {
                blocks[(currentBlock.getX()+x)+10*(currentBlock.getY()+y)] =arraytoApply[x+4*y];
            }    
         }
    }
    
    function MoveBlockDown()
    {
        //var collision = CheckCollision();
        currentBlockXY[0] = currentBlock.getX();
        currentBlockXY[1] = currentBlock.getY();
        
        if(!CheckCollision()) currentBlockXY[1]++;
        currentBlock.setPosition(currentBlockXY[0],currentBlockXY[1]);
        
      
    }
    function CheckCollision()
    {
        if(CheckFloorAndWalls()) return true;
        if(CheckOtherBlocks())   return true;  
        return false;
    }
    function SpawnBlock()
    {
        if(currentBlock == null)
        {
            var stone = Math.floor((Math.random() * 7) + 1);
            switch (stone) {
                case 1:
                    currentBlock = new LineBlock(6,0,stone);
                    break;
                case 2:
                    currentBlock = new LBlock(6,0,stone);
                    break;
                case 3:
                    currentBlock = new ReverseLBlock(6,0,stone);
                    break;
                case 4:
                    currentBlock = new SquiggilyBlock(6,0,stone);
                    break;
                case 5:
                    currentBlock = new ReverseSquiggilyBlock(6,0,stone);
                    break;
                case 6:
                    currentBlock = new RectangleBlock(6,0,stone);
                    break;
                case 7:
                    currentBlock = new TBlock(6,0,stone);
                    break;
                default:
                    
            } 
        }
        blockGravity = setInterval(MoveBlockDown,blocktimer);
    }
    // ====
    function LineBlock(x,y,color)
    {    
        var x = x;
        var y = y;
        var c = color;
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

