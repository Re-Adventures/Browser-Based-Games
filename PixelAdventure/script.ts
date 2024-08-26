const SCALING_FACTOR = 2;

let canvas: any;
let ctx: CanvasRenderingContext2D;

let player: Player;
let platforms: Platform[];

let assets: Asset;

type PlayerSprite = {
    right: { img: HTMLImageElement; noOfFrames: number; };
    left:  { img: HTMLImageElement; noOfFrames: number; };
};

type TileDimensions = {
    x:     number;
    y:     number;
    width: number;
    height: number;
};

type PlatformSprite = {
    TopLeft:      TileDimensions;
    TopMiddle:    TileDimensions;
    TopRight:     TileDimensions;
    MiddleLeft:   TileDimensions;
    MiddleMiddle: TileDimensions;
    MiddleRight:  TileDimensions;
    BottomLeft:   TileDimensions;
    BottomMiddle: TileDimensions;
    BottomRight:  TileDimensions;
}

type StoneSprite = {
    HorizontalBar: {
        Left: TileDimensions;
        Middle: TileDimensions;
        Right: TileDimensions;
    };
    VerticalBar: {
        Top: TileDimensions;
        Middle: TileDimensions;
        Bottom: TileDimensions;
    };
    Small: TileDimensions;
    Large: {
        TopLeft: TileDimensions;
        TopRight: TileDimensions;
        BottomLeft: TileDimensions;
        BottomRight: TileDimensions;
    };
}

type PlatformDesign = {
    TopLeft: { x: number; y: number; width: number; height: number; };
    TopRight: { x: number; y: number; width: number; height: number; };
    BottomLeft: { x: number; y: number; width: number; height: number; };
    BottomRight: { x: number; y: number; width: number; height: number; };
}

type MovingPlatformSprite = {
    Left:   TileDimensions;
    Middle: TileDimensions;
    Right:  TileDimensions;
}

/// The possible moving states a player can have
enum Moves {
    Stopped,
    Up,
    Down,
    Left,
    Right,
};

document.addEventListener("DOMContentLoaded", Initialize);
document.addEventListener("keydown", MovePlayer);
document.addEventListener("keyup", StopPlayer);

class Asset {
    background: any;
    player: {
        idle: PlayerSprite;
        run:  PlayerSprite;
        jump: PlayerSprite;
    };
    tiles: {
        img: HTMLImageElement;
        GrayPlatform: PlatformSprite;
        GrayBrickDesign: PlatformDesign;

        GreenGrassPlatform: PlatformSprite;
        GreenGrassDesign: PlatformDesign;

        BrownStone: StoneSprite;

        MovingPlatform: {
            Gold: MovingPlatformSprite;
            Brown: MovingPlatformSprite;
            Gray: MovingPlatformSprite;
        }
        WoodPlatform: PlatformSprite;
        WoodDesign: PlatformDesign;
        BrownGrassPlatform: PlatformSprite;
        BrownGrassDesign: PlatformDesign;
        GrayStone: StoneSprite;
        BrickPlatform: PlatformSprite;
        BrickDesign: PlatformDesign;
        GreenPlatform: PlatformSprite;
        GreenDesign: PlatformDesign;
        PinkGrassPlatform: PlatformSprite;
        PinkDesign: PlatformDesign;
        BronzeStone: StoneSprite;
        GoldStone: StoneSprite;
    };


    constructor() {
        this.background = {
            blue:   this.loadImage("Assets\\Pixel Adventure\\Background\\Blue.png"),
            brown:  this.loadImage("Assets\\Pixel Adventure\\Background\\Brown.png"),
            gray:   this.loadImage("Assets\\Pixel Adventure\\Background\\Gray.png"),
            green:  this.loadImage("Assets\\Pixel Adventure\\Background\\Green.png"),
            pink:   this.loadImage("Assets\\Pixel Adventure\\Background\\Pink.png"),
            purple: this.loadImage("Assets\\Pixel Adventure\\Background\\Purple.png"),
            yellow: this.loadImage("Assets\\Pixel Adventure\\Background\\Yellow.png"),
        };

        // All player assets are of size 32 X 32 pixels
        this.player = {
            idle:  {
                right: {
                    img: this.loadImage("Assets\\Pixel Adventure\\Main Characters\\Ninja Frog\\Idle.png"),
                    noOfFrames: 11,
                },
                left: {
                    img: this.loadImage("Assets\\Pixel Adventure\\Main Characters\\Ninja Frog\\IdleLeft.png"),
                    noOfFrames: 11,
                },
            },
            run: {
                right: {
                    img: this.loadImage("Assets\\Pixel Adventure\\Main Characters\\Ninja Frog\\Run.png"),
                    noOfFrames: 12,
                },
                left: {
                    img: this.loadImage("Assets\\Pixel Adventure\\Main Characters\\Ninja Frog\\RunLeft.png"),
                    noOfFrames: 12,
                },
            },
            jump: {
                right: {
                    img: this.loadImage("Assets\\Pixel Adventure\\Main Characters\\Ninja Frog\\Jump.png"),
                    noOfFrames: 1,
                },
                left: {
                    img: this.loadImage("Assets\\Pixel Adventure\\Main Characters\\Ninja Frog\\JumpLeft.png"),
                    noOfFrames: 1,
                }
            }
        };

        this.tiles = {
            img: this.loadImage("Assets\\Pixel Adventure\\Terrain\\Terrain.png"),
            GrayPlatform: {
                TopLeft: {x:0,y:0,width:16,height:16},
                TopMiddle: {x:16,y:0,width:16,height:16},
                TopRight: {x:32,y:0,width:16,height:16},
                MiddleLeft: {x:0,y:16,width:16,height:16},
                MiddleMiddle: {x:16,y:16,width:16,height:16},
                MiddleRight: {x:32,y:16,width:16,height:16},
                BottomLeft: {x:0,y:32,width:16,height:16},
                BottomMiddle: {x:16,y:32,width:16,height:16},
                BottomRight: {x:32,y:32,width:16,height:16},    
            },
            GrayBrickDesign: {
                TopLeft: {x:48,y:0,width:16,height:16},
                TopRight: {x:64,y:0,width:16,height:16},
                BottomLeft: {x:48,y:16,width:16,height:16},
                BottomRight: {x:64,y:16,width:16,height:16},
            },

            GreenGrassPlatform: {
                TopLeft: {x:96,y:0,width:16,height:16},
                TopMiddle: {x:112,y:0,width:16,height:16},
                TopRight: {x:128,y:0,width:16,height:16},
                MiddleLeft: {x:96,y:16,width:16,height:16},
                MiddleMiddle: {x:112-2,y:16,width:16,height:16},
                MiddleRight: {x:128,y:16,width:16,height:16},
                BottomLeft: {x:96,y:32,width:16,height:16},
                BottomMiddle: {x:112,y:32,width:16,height:16},
                BottomRight: {x:128,y:32,width:16,height:16},
            },
            GreenGrassDesign: {
                TopLeft: {x:144,y:0,width:16,height:16},
                TopRight: {x:160,y:0,width:16,height:16},
                BottomLeft: {x:144,y:16,width:16,height:16},
                BottomRight: {x:160,y:16,width:16,height:16},
            },
            BrownStone: {
                HorizontalBar: {
                    Left: {x:192,y:0,width:16,height:16},
                    Middle: {x:208,y:0,width:16,height:16},
                    Right: {x:224,y:0,width:16,height:16},
                },
                VerticalBar: {
                    Top: {x:240,y:0,width:16,height:16},
                    Middle: {x:240,y:16,width:16,height:16},
                    Bottom: {x:240,y:32,width:16,height:16},
                },
                Small: {
                    x:192,y:16,width:16,height:16
                },
                Large: {
                    TopLeft: {x:208,y:16,width:16,height:16},
                    TopRight: {x:224,y:16,width:16,height:16},
                    BottomLeft: {x:208,y:32,width:16,height:16},
                    BottomRight: {x:224,y:32,width:16,height:16},
                },
            },
            MovingPlatform: {
                Gold: {
                    Left: {x:272,y:0,width:16,height:16},
                    Middle: {x:288,y:0,width:16,height:16},
                    Right: {x:304,y:0,width:16,height:16},
                },
                Brown: {
                    Left: {x:272,y:16,width:16,height:16},
                    Middle: {x:288,y:16,width:16,height:16},
                    Right: {x:304,y:16,width:16,height:16},
                },
                Gray: {
                    Left: {x:272,y:32,width:16,height:16},
                    Middle: {x:288,y:32,width:16,height:16},
                    Right: {x:304,y:32,width:16,height:16},
                },
            },
            WoodPlatform: {
                TopLeft: {x:0,y:64,width:16,height:16},
                TopMiddle: {x:16,y:64,width:16,height:16},
                TopRight: {x:32,y:64,width:16,height:16},
                MiddleLeft: {x:0,y:80,width:16,height:16},
                MiddleMiddle: {x:16,y:80,width:16,height:16},
                MiddleRight: {x:32,y:80,width:16,height:16},
                BottomLeft: {x:0,y:96,width:16,height:16},
                BottomMiddle: {x:16,y:96,width:16,height:16},
                BottomRight: {x:32,y:96,width:16,height:16},    
            },
            WoodDesign: {
                TopLeft: {x:48,y:64,width:16,height:16},
                TopRight: {x:64,y:64,width:16,height:16},
                BottomLeft: {x:48,y:80,width:16,height:16},
                BottomRight: {x:64,y:80,width:16,height:16},
            },


            BrownGrassPlatform: {
                TopLeft: {x:96,y:64,width:16,height:16},
                TopMiddle: {x:112,y:64,width:16,height:16},
                TopRight: {x:128,y:64,width:16,height:16},
                MiddleLeft: {x:96,y:80,width:16,height:16},
                MiddleMiddle: {x:112,y:80,width:16,height:16},
                MiddleRight: {x:128,y:80,width:16,height:16},
                BottomLeft: {x:96,y:96,width:16,height:16},
                BottomMiddle: {x:112,y:96,width:16,height:16},
                BottomRight: {x:128,y:96,width:16,height:16},
            },
            BrownGrassDesign: {
                TopLeft: {x:144,y:64,width:16,height:16},
                TopRight: {x:160,y:64,width:16,height:16},
                BottomLeft: {x:144,y:80,width:16,height:16},
                BottomRight: {x:160,y:80,width:16,height:16},
            },
            GrayStone: {
                HorizontalBar: {
                    Left: {x:192,y:64,width:16,height:16},
                    Middle: {x:208,y:64,width:16,height:16},
                    Right: {x:224,y:64,width:16,height:16},
                },
                VerticalBar: {
                    Top: {x:240,y:64,width:16,height:16},
                    Middle: {x:240,y:80,width:16,height:16},
                    Bottom: {x:240,y:96,width:16,height:16},
                },
                Small: {
                    x:192,y:80,width:16,height:16
                },
                Large: {
                    TopLeft: {x:208,y:80,width:16,height:16},
                    TopRight: {x:224,y:80,width:16,height:16},
                    BottomLeft: {x:208,y:96,width:16,height:16},
                    BottomRight: {x:224,y:96,width:16,height:16},
                },
            },
            BrickPlatform: {
                TopLeft: {x:272,y:64,width:16,height:16},
                TopMiddle: {x:288,y:64,width:16,height:16},
                TopRight: {x:304,y:64,width:16,height:16},
                MiddleLeft: {x:272,y:80,width:16,height:16},
                MiddleMiddle: {x:288,y:80,width:16,height:16},
                MiddleRight: {x:304,y:80,width:16,height:16},
                BottomLeft: {x:272,y:96,width:16,height:16},
                BottomMiddle: {x:288,y:96,width:16,height:16},
                BottomRight: {x:304,y:96,width:16,height:16},
            },
            BrickDesign: {
                TopLeft: {x:320,y:64,width:16,height:16},
                TopRight: {x:336,y:64,width:16,height:16},
                BottomLeft: {x:320,y:80,width:16,height:16},
                BottomRight: {x:336,y:80,width:16,height:16},
            },
            GreenPlatform: {
                TopLeft: {x:0,y:128,width:16,height:16},
                TopMiddle: {x:16,y:128,width:16,height:16},
                TopRight: {x:32,y:128,width:16,height:16},
                MiddleLeft: {x:0,y:144,width:16,height:16},
                MiddleMiddle: {x:16,y:144,width:16,height:16},
                MiddleRight: {x:32,y:144,width:16,height:16},
                BottomLeft: {x:0,y:160,width:16,height:16},
                BottomMiddle: {x:16,y:160,width:16,height:16},
                BottomRight: {x:32,y:160,width:16,height:16},
            },
            GreenDesign: {
                TopLeft: {x:48,y:128,width:16,height:16},
                TopRight: {x:64,y:128,width:16,height:16},
                BottomLeft: {x:48,y:144,width:16,height:16},
                BottomRight: {x:64,y:144,width:16,height:16},
            },
            PinkGrassPlatform: {
                TopLeft: {x:96,y:128,width:16,height:16},
                TopMiddle: {x:112,y:128,width:16,height:16},
                TopRight: {x:128,y:128,width:16,height:16},
                MiddleLeft: {x:96,y:144,width:16,height:16},
                MiddleMiddle: {x:112,y:144,width:16,height:16},
                MiddleRight: {x:128,y:144,width:16,height:16},
                BottomLeft: {x:96,y:160,width:16,height:16},
                BottomMiddle: {x:112,y:160,width:16,height:16},
                BottomRight: {x:128,y:160,width:16,height:16},
            },
            PinkDesign: {
                TopLeft: {x:144,y:128,width:16,height:16},
                TopRight: {x:160,y:128,width:16,height:16},
                BottomLeft: {x:144,y:144,width:16,height:16},
                BottomRight: {x:160,y:144,width:16,height:16},
            },
            BronzeStone: {
                HorizontalBar: {
                    Left: {x:192,y:128,width:16,height:16},
                    Middle: {x:208,y:128,width:16,height:16},
                    Right: {x:224,y:128,width:16,height:16},
                },
                VerticalBar: {
                    Top: {x:240,y:128,width:16,height:16},
                    Middle: {x:240,y:144,width:16,height:16},
                    Bottom: {x:240,y:160,width:16,height:16},
                },
                Small: {
                    x:192,y:144,width:16,height:16,
                },
                Large: {
                    TopLeft: {x:208,y:144,width:16,height:16},
                    TopRight: {x:224,y:144,width:16,height:16},
                    BottomLeft: {x:208,y:160,width:16,height:16},
                    BottomRight: {x:224,y:160,width:16,height:16},
                },
            },
            GoldStone: {
                HorizontalBar: {
                    Left: {x:272,y:128,width:16,height:16},
                    Middle: {x:288,y:128,width:16,height:16},
                    Right: {x:304,y:128,width:16,height:16},
                },
                VerticalBar: {
                    Top: {x:320,y:128,width:16,height:16},
                    Middle: {x:320,y:144,width:16,height:16},
                    Bottom: {x:320,y:160,width:16,height:16},
                },
                Small: {
                    x:272,y:144,width:16,height:16
                },
                Large: {
                    TopLeft: {x:288,y:144,width:16,height:16},
                    TopRight: {x:304,y:144,width:16,height:16},
                    BottomLeft: {x:288,y:160,width:16,height:16},
                    BottomRight: {x:304,y:160,width:16,height:16},
                },
            },
        };
    }

    loadImage(imagePath: string) : HTMLImageElement {
        let img = new Image();
        img.src = imagePath;
        img.decode();
        return img;
    }
}

class Platform {
    position: { x: number; y: number; };
    width: number;
    height: number;

    // Determines if the platform is a single platform or a set of tiles,
    // i.e. a complete platform
    isTileSet: boolean;

    // A boolean indicating if the platform to be built is a incomplete platform
    // with the inner part of the platform hollow
    // The below diagram shows that if `isHollowPlatform` is set to true, only
    // its boundary will be blitted & the inside will just be invisible
    // +---------------+
    // |               |
    // |               |
    // |               |
    // |               |
    // +---------------+
    isHollowPlatform: boolean;

    // TODO: Correctly apply the tileType's type
    constructor(x: number,
            y: number,
            width: number,
            height: number,
            isHollowPlatform: boolean,
            isTileSet: boolean,
            tileType: Asset["tiles"]) {
        this.position = { x, y };


        // Detemines if this is a single tile, or a tileset
        this.isTileSet = isTileSet;
        // this.tileType = tileType;

        this.isHollowPlatform = isHollowPlatform;
        if (this.isTileSet === false) {
            // If the platform is not a tileset, we cannot have a hollow
            // platform
            this.isHollowPlatform = false;
        }


        // TODO: Properly set the width & height so that it is multiple of the
        // selected tile's width & height
        this.width = width;
        this.height = height;
    }

    /// Creates a tile block
    createTile() {
        // let selectedTile = this.tileType
        
        // TODO: Properly implement this, atm we are using the green grass
        // platform
        let selectedTile = assets.tiles.PinkGrassPlatform;

        this.drawPlatformBoundary(selectedTile);

        //if (this.isHollowPlatform === false) {
            this.drawPlatformMiddle(selectedTile);
        //}

    }

    drawPlatformMiddle(selectedTile: PlatformSprite) {
        let leftEdge = this.position.x + selectedTile.MiddleMiddle.width;
        let rightEdge = this.position.x + this.width - selectedTile.MiddleMiddle.width;
        let remainingRowSpace = rightEdge - leftEdge;
        let rowLimit = Math.floor(remainingRowSpace / selectedTile.MiddleMiddle.width) + 1;

        let topEdge = this.position.y + selectedTile.MiddleMiddle.height;
        let bottomEdge = this.position.y + this.height - selectedTile.MiddleMiddle.height;
        let remainingColSpace = bottomEdge - topEdge;
        let colLimit = Math.floor(remainingColSpace / selectedTile.MiddleMiddle.height) + 1;


        for (let row = 1; row < rowLimit; row++) {
            for (let col = 1; col < colLimit; col++) {
                ctx.drawImage(assets.tiles.img,
                    selectedTile.MiddleMiddle.x,
                    selectedTile.MiddleMiddle.y,
                    selectedTile.MiddleMiddle.width,
                    selectedTile.MiddleMiddle.height,
                    this.position.x + selectedTile.MiddleMiddle.width * row,
                    this.position.y + selectedTile.MiddleMiddle.height * col,
                    selectedTile.MiddleMiddle.width,
                    selectedTile.MiddleMiddle.height,
                )
            }
        }
    }

    drawPlatformBoundary(selectedTile: PlatformSprite) {
        let limit: number = -1;

        limit = Math.ceil(this.width / selectedTile.TopMiddle.width);

        // The loop is starting from 1 because we need to account for the edges
        // which have different asset image
        for (let x = 1; x < limit; x++) {
            ctx.drawImage(assets.tiles.img,
                selectedTile.TopMiddle.x, selectedTile.TopMiddle.y,
                selectedTile.TopMiddle.width, selectedTile.TopMiddle.height,
    
                this.position.x + selectedTile.TopRight.width * x,
                this.position.y,
                // Setting the width & height of the platform to be size of the
                // sprite
                selectedTile.TopRight.width, selectedTile.TopRight.height,
            );
        }

        // First draw the TopLeft on the x,y point
        ctx.drawImage(assets.tiles.img,
            selectedTile.TopLeft.x, selectedTile.TopLeft.y,
            selectedTile.TopLeft.width, selectedTile.TopLeft.height,
            this.position.x, this.position.y,
            // Setting the width & height of the platform to be size of the
            // sprite
            selectedTile.TopLeft.width, selectedTile.TopLeft.height,
        );

        // Draw the TopRight at the end of the width
        ctx.drawImage(assets.tiles.img,
            selectedTile.TopRight.x, selectedTile.TopRight.y,
            selectedTile.TopRight.width, selectedTile.TopRight.height,
            this.position.x + this.width - selectedTile.TopRight.width,
            this.position.y,
            // Setting the width & height of the platform to be size of the
            // sprite
            selectedTile.TopRight.width, selectedTile.TopRight.height,
        );


        // Drawing the left boundary
        limit = Math.floor(this.height / selectedTile.MiddleLeft.height);
        for (let i = 1; i < limit; i++) {
            ctx.drawImage(assets.tiles.img,
                selectedTile.MiddleLeft.x,
                selectedTile.MiddleLeft.y,
                selectedTile.MiddleLeft.width,
                selectedTile.MiddleLeft.height,
                this.position.x,
                this.position.y + selectedTile.MiddleLeft.height * i,
                selectedTile.MiddleLeft.width,
                selectedTile.MiddleLeft.height,
            );
        }

        // Drawing the BottomLeft
        ctx.drawImage(assets.tiles.img,
            selectedTile.BottomLeft.x,
            selectedTile.BottomLeft.y,
            selectedTile.BottomLeft.width,
            selectedTile.BottomLeft.height,
            this.position.x,
            this.position.y + this.height - selectedTile.BottomLeft.height,
            selectedTile.BottomLeft.width,
            selectedTile.BottomLeft.height,
        );


        // Drawing Right Boundary
        limit = Math.floor(this.height / selectedTile.MiddleRight.height) - 1;
        for (let i = 1; i < limit; i++) {
            ctx.drawImage(assets.tiles.img,
                selectedTile.MiddleRight.x,
                selectedTile.MiddleRight.y,
                selectedTile.MiddleRight.width,
                selectedTile.MiddleRight.height,
                this.position.x + this.width - selectedTile.MiddleRight.width,
                this.position.y + selectedTile.MiddleRight.height * i,
                selectedTile.MiddleRight.width,
                selectedTile.MiddleRight.height,
            );
        }

        // Drawing the BottomRight
        ctx.drawImage(assets.tiles.img,
            selectedTile.BottomRight.x,
            selectedTile.BottomRight.y,
            selectedTile.BottomRight.width,
            selectedTile.BottomRight.height,
            this.position.x + this.width - selectedTile.BottomRight.width,
            this.position.y + this.height - selectedTile.BottomRight.height,
            selectedTile.BottomRight.width,
            selectedTile.BottomRight.height,
        );

        // Drawing Bottom Row
        limit = Math.floor(this.width / selectedTile.BottomMiddle.width) - 1;
        for (let i = 1; i < limit; i++) {
            ctx.drawImage(assets.tiles.img,
                selectedTile.BottomMiddle.x,
                selectedTile.BottomMiddle.y,
                selectedTile.BottomMiddle.width,
                selectedTile.BottomMiddle.height,
                this.position.x + selectedTile.BottomMiddle.width * i,
                this.position.y + this.height - selectedTile.BottomMiddle.height,
                selectedTile.BottomMiddle.width,
                selectedTile.BottomMiddle.height,
            )
        }
    }

    update() {
        this.draw();
    }
    draw() {
        if (this.isTileSet) {
            this.createTile();
        }
        else {
            // TODO: Draw a single tile
        }
    }

}

class Player {
    velocity: { x: number; y: number; };
    position: { x: number; y: number; };
    width: number;
    height: number;
    gravity: number;
    moveXDirection: Moves.Left | Moves.Right | Moves.Stopped;
    jumpHeight: number;
    canJump: boolean;
    sprite: any;

    // The current frame number
    frameNumber: number;

    /// The number of frames to skip for slowing down the animation
    skipFrames: number;

    /// The number of frames skipped till now. This will act as a iterator
    /// variable which will tell when to change the sprite animation frame
    skippedFrames: number;

    constructor() {
        this.position = {
            x: 100,
            y: 100,
        };

        this.velocity = {
            x: 10,
            y: 5,
        };

        this.sprite = assets.player.idle.right;


        this.gravity = 1;

        this.width  = 32 * SCALING_FACTOR;
        this.height = 32 * SCALING_FACTOR;

        this.moveXDirection = Moves.Stopped;

        this.canJump = false;
        this.jumpHeight = 30;

        this.frameNumber   = 0;
        this.skipFrames    = 3;
        this.skippedFrames = 0;
    }

    update() {
        this.animate();
        this.draw();
    }

    detectCollision() {
        // If the player touches the ground, set its y velocity to be 0
        if (this.position.y + this.height >= canvas.height) {
            this.position.y = canvas.height - this.height;
            this.velocity.y = 0;

            this.canJump = true;
        }

        for (const platform of platforms) {
            if (this.position.x < platform.position.x + platform.width
                    && this.position.x + this.width > platform.position.x
                    && this.position.y < platform.position.y + platform.height
                    && this.position.y + this.height > platform.position.y) {
                // Calculate the overlap on both axes

                // Essentially we are calculating how deep is the intersection
                // between the two objects.
                // We would just calculate the edges which are closer to each
                // other. Meaning that if the player is on the left, ie the
                // platform is to the right, we calculate the distance between
                // player's right edge to the platform's left edge.
                let overlapX = (this.position.x + this.width) - platform.position.x;
                if (this.position.x > platform.position.x) {
                    overlapX = (platform.position.x + platform.width) - this.position.x;
                }

                let overlapY = (this.position.y + this.height) - platform.position.y;
                if (this.position.y > platform.position.y) {
                    overlapY = (platform.position.y + platform.height) - this.position.y;
                }

                // Determine the side of collision based on the smallest overlap
                if (overlapX < overlapY) {
                    if (this.position.x < platform.position.x) {
                        // Collision from the left
                        this.position.x = platform.position.x - this.width;
                    } else {
                        // Collision from the right
                        this.position.x = platform.position.x + platform.width;
                    }
                } else {
                    if (this.position.y < platform.position.y) {
                        // Collision from the top
                        this.position.y = platform.position.y - this.height;
                        this.velocity.y = 0;
                        this.canJump = true;

                        // HACK: If the player touches the top of the platform,
                        // we are changing the asset to be idle one.
                        // But this is not correct, if the player was shooting
                        // & landed on a platform, we probably dont want to
                        // change its sprite
                        this.changeSprite(assets.player.run);
                    } else {
                        // Collision from the bottom
                        this.position.y = platform.position.y + platform.height;
                        this.velocity.y = 0;  // Prevent sticking to the platform
                    }
                }
            }
        }

        



    }

    animate() {
        this.skippedFrames += 1;
        if (this.skippedFrames == this.skipFrames) {
            this.frameNumber += 1;
            this.frameNumber %= this.sprite.noOfFrames;
            this.skippedFrames = 0;
        }

        this.position.y += this.velocity.y;
        this.velocity.y += this.gravity;


        if (this.moveXDirection === Moves.Left) {
            this.position.x -= this.velocity.x;
        }
        else if (this.moveXDirection === Moves.Right) {
            this.position.x += this.velocity.x;
        }

        this.detectCollision();
    }

    move(moveDirection: Moves) {
        switch (moveDirection) {
            case Moves.Left:
                this.moveXDirection = Moves.Left;
                this.changeSprite(assets.player.run);
                break;

            case Moves.Right:
                this.moveXDirection = Moves.Right;
                this.changeSprite(assets.player.run);
                break;

            case Moves.Up:
                this.jump();
                break;
            
            case Moves.Stopped:
                // If the player was moving to the right & now it stopped,
                // display the idle animation
                this.changeSprite(assets.player.idle);
                this.moveXDirection = Moves.Stopped;
                break;
        }
    }

    changeSprite(newSprite: PlayerSprite) {
        // Changing the sprite only if 
        if (this.sprite !== newSprite.left && this.sprite !== newSprite.right) {
            if (this.moveXDirection === Moves.Left) {
                this.sprite = newSprite.left;
            }
            else if (this.moveXDirection === Moves.Right) {
                this.sprite = newSprite.right;
            }
            else {
                // TODO: Decide what to do when the player is stopped
            }
            this.frameNumber = 0;
            this.skippedFrames = 0;
        }
    }

    jump() {
        if (this.canJump) {
            this.canJump = false;
            this.velocity.y = -this.jumpHeight;
            this.changeSprite(assets.player.jump);
        }
    }


    draw() {
        ctx.drawImage(this.sprite.img,
            32 * this.frameNumber, 0,
            32, 32,
            this.position.x, this.position.y,
            this.width, this.height);

        // ctx.fillStyle = "red";
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

}

/// Runs the initialization procedure as soon as the page loads up
function Initialize() {
    // HACK: This is done first, so that when we are using the images, it is
    // already loaded
    LoadImages();

    SetupCanvas();
    InitializeObjects();

    Draw();
    GameLoop();
}

/// Setups the canvas so that we can draw on it
function SetupCanvas() {
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    canvas = document.querySelector("canvas");
    if (canvas === null) {
        throw new Error("Canvas not found in html page");
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx = canvas.getContext("2d");
}

function LoadImages() {
    assets = new Asset();
}

/// Creates objects like player, platforms, etc. which will be eventually drawn
/// on the screen.
function InitializeObjects() {
    player = new Player();

    platforms = new Array();
    CreateLevel1()


}

function CreateLevel1() {
    platforms.push(new Platform(
        200, canvas.height - 300, 16 * 30, 16 * 8, true, true, assets.tiles));

    platforms.push(new Platform(
        800, canvas.height - 500, 16 * 30, 16 * 8, true, true, assets.tiles));
    
}

/// The function where all the animation & drawing will happen
function Draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ctx.fillStyle = "black";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Drawing the background
    DrawBackground(assets.background.yellow);

    player.update();
    for (let platform of platforms) {
        platform.update();
    }
}

/// Draws the background with the image tile provided
function DrawBackground(image: HTMLImageElement) {
    let totalRows = Math.ceil(canvas.width / 64);
    let totalCols = Math.ceil(canvas.height / 64);
    
    // TODO: Scroll the backgrond downwards
    for (let row = 0; row < totalRows; row++) {
        for (let col = 0; col < totalCols; col++) {
            ctx.drawImage(image, row * image.width, col * image.height);
        }
    }
}


function GameLoop() {
    Draw();

    window.requestAnimationFrame(GameLoop);
}

/// Event handler function triggered on press of a button, which will take care
/// of moving the player
function MovePlayer(this: Document, event: KeyboardEvent) {
    switch(event.key) {
        case "ArrowLeft":
            player.move(Moves.Left);
            break;
        case "ArrowRight":
            player.move(Moves.Right);
            break;
        case "ArrowUp":
            player.move(Moves.Up);
            break;
    }
}

/// Event handler function triggered on release of a button, which will take
/// care of stopping the player
function StopPlayer(this: Document, event: KeyboardEvent) {
    // TODO: Properly implement this
    switch(event.key) {
        case "ArrowLeft":
            player.move(Moves.Stopped);
            break;
        case "ArrowRight":
            player.move(Moves.Stopped);
            break;
    }
}

