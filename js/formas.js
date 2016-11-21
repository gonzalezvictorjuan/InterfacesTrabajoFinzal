	function Rectangle(x,y,w,h,color,id){
		this.posX = x;
		this.posY = y;
		this.width = w;
		this.height = h;
		this.color = color;
		this.id = id;
	}

	Rectangle.prototype.render = function(ctx){
		ctx.fillStyle = this.color;
		ctx.fillRect(this.posX,this.posY,this.width,this.height);
	}

	Rectangle.prototype.check = function(ptoX,ptoY){
		return(((ptoX >= this.posX)&&(ptoX <= (this.posX+this.width)))&&((ptoY >= this.posY)&&(ptoY <= (this.posY+this.height))));
	}
	
	Rectangle.prototype.checkContiene = function(forma){
		return((this.check(forma.posX,forma.posY))||
		(this.check(forma.posX+forma.width,forma.posY))||
		(this.check(forma.posX,forma.posY+forma.height))||
		(this.check(forma.posX+forma.width,forma.posY+forma.height)));
	}
